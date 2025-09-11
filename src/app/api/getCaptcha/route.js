import { client } from "@/app/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function getCaptchaType($) {
    return $('input#gResponse').length === 1 ? "GRECAPTCHA" : "DEFAULT";
}

export async function GET() {
    try {
        // Step 1: prelogin/setup for session cookies
        const setupRes = await client.get("/vtop/prelogin/setup");
        const cookies = setupRes.headers["set-cookie"];
        const $ = cheerio.load(setupRes.data);

        const csrf = $("#stdForm input[name=_csrf]").val();
        if (!csrf) throw new Error("CSRF token not found");

        await client.post(
            "/vtop/prelogin/setup",
            new URLSearchParams({ _csrf: csrf, flag: "VTOP" }),
            { headers: { Cookie: cookies.join("; "), "Content-Type": "application/x-www-form-urlencoded" } }
        );

        // Step 2: get login page
        const loginPage = await client.get("/vtop/login", { headers: { Cookie: cookies.join("; ") } });
        const $$ = cheerio.load(loginPage.data);

        const captchaType = await getCaptchaType($$);

        if (captchaType === "DEFAULT") {
            const imgSrc = $$("#captchaBlock img").attr("src");
            if (!imgSrc) throw new Error("Captcha not found");

            let base64;
            if (imgSrc.startsWith("data:image")) {
                base64 = imgSrc; // already base64
            } else {
                const imgRes = await client.get(imgSrc, {
                    responseType: "arraybuffer",
                    headers: { Cookie: cookies.join("; ") },
                });
                base64 = "data:image/jpeg;base64," + Buffer.from(imgRes.data, "binary").toString("base64");
            }

            return NextResponse.json({ captchaType, captchaBase64: base64, cookies, csrf });
        } else {
            // GRECAPTCHA
            const siteKey = $$('div.g-recaptcha').attr('data-sitekey');
            if (!siteKey) throw new Error("GRECAPTCHA site key not found");

            return NextResponse.json({ captchaType, siteKey, cookies, csrf });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
