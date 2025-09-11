import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import fs from "fs";
import dotenv from "dotenv";
import PromptSync from "prompt-sync";
import fetchTimetable from "./fetchTimetable.js";
import fetchAttendance from "./fetchAttendance.js";

const prompt = PromptSync({ sigint: true });

dotenv.config({ path: "./.env" });

const agent = new https.Agent({ rejectUnauthorized: false });

export const client = axios.create({
    baseURL: "https://vtopcc.vit.ac.in",
    httpsAgent: agent,
    withCredentials: true,
});

async function solveCaptcha(buffer) {
    fs.writeFileSync("captcha.jpg", buffer);
    console.log("Captcha saved as captcha.jpg — open it and type the text.");

    const captchaText = prompt("Enter captcha: ").trim();
    return captchaText;
}

async function getCaptchaType($) {
    return $('input#gResponse').length === 1 ? "GRECAPTCHA" : "DEFAULT";
}

async function getCaptchaImage($, cookies) {
    const imgSrc = $('#captchaBlock img').attr('src');
    if (!imgSrc) throw new Error("Captcha not found!");

    let buffer;
    if (imgSrc.startsWith("data:image")) {
        const base64 = imgSrc.split(",")[1];
        buffer = Buffer.from(base64, "base64");
    } else {
        const res = await client.get(imgSrc, {
            responseType: "arraybuffer",
            headers: { Cookie: cookies.join("; ") },
        });
        buffer = Buffer.from(res.data, "binary");
    }

    return buffer;
}

async function login() {
    const res = await client.get("/vtop/prelogin/setup");
    const cookies = res.headers["set-cookie"];
    const $ = cheerio.load(res.data);

    const csrf = $("#stdForm input[name=_csrf]").val();
    if (!csrf) throw new Error("CSRF token not found");

    await client.post(
        "/vtop/prelogin/setup",
        new URLSearchParams({ _csrf: csrf, flag: "VTOP" }),
        { headers: { Cookie: cookies.join("; "), "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const loginPage = await client.get("/vtop/login", { headers: { Cookie: cookies.join("; ") } });
    const $$ = cheerio.load(loginPage.data);

    const csrfLogin = $$("input[name=_csrf]").val();
    const captchaType = await getCaptchaType($$);
    if (captchaType !== "DEFAULT") throw new Error("GRECAPTCHA not supported");

    const captchaBuffer = await getCaptchaImage($$, cookies);
    const captchaText = await solveCaptcha(captchaBuffer);

    const username = process.env.VTOP_USERNAME;
    const password = process.env.VTOP_PASSWORD;

    const loginRes = await client.post(
        "/vtop/login",
        new URLSearchParams({
            _csrf: csrfLogin,
            username,
            password,
            captchaStr: captchaText,
        }),
        {
            headers: {
                Cookie: cookies.join("; "),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            maxRedirects: 0,
            validateStatus: (s) => s < 400 || s === 302,
        }
    );

    const loginCookies = loginRes.headers["set-cookie"];
    const allCookies = [...(cookies || []), ...(loginCookies || [])].join("; ");

    let dashboardRes;
    if (loginRes.status === 302 && loginRes.headers.location) {
        dashboardRes = await client.get(loginRes.headers.location, {
            headers: { Cookie: allCookies },
        });
    } else {
        dashboardRes = await client.get("/vtop/open/page", {
            headers: { Cookie: allCookies },
        });
    }

    const html = dashboardRes.data.toLowerCase();
    let response = { authorised: false, error_message: null, error_code: 0 };

    if (html.includes("authorizedidx")) {
        response.authorised = true;
    } else if (/invalid\s*captcha/.test(html)) {
        response.error_message = "Invalid Captcha";
        response.error_code = 1;
    } else if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/.test(html)) {
        response.error_message = "Invalid Username / Password";
        response.error_code = 2;
    } else if (/account\s*is\s*locked/.test(html)) {
        response.error_message = "Your Account is Locked";
        response.error_code = 3;
    } else if (/maximum\s*fail\s*attempts\s*reached/.test(html)) {
        response.error_message =
            "Maximum login attempts reached, open VTOP in your browser to reset your password";
        response.error_code = 4;
    } else {
        response.error_message = "Unknown error";
        response.error_code = 5;
    }

    console.log("Login result:", response);
    return { cookies: allCookies, dashboardHtml: dashboardRes.data, loginResponse: response };
}

(async () => {
    try {
        const { cookies, dashboardHtml } = await login();

        await fetchTimetable(cookies, dashboardHtml);
        await fetchAttendance(cookies, dashboardHtml);
    } catch (err) {
        console.error(err);
    }
})();