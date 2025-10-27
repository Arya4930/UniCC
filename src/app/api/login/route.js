import VTOPClient from "@/lib/VTOPClient";
import { NextResponse } from "next/server";
import solveCaptcha from "./solveCaptcha";
import getCaptcha from "./getCaptcha";

export async function POST(req) {
    try {
        const { username, password, campus } = await req.json();
        const { captchaBase64, cookies, csrf } = await getCaptcha(campus);
        const captcha = await solveCaptcha(captchaBase64);

        if (!csrf) throw new Error("CSRF token not found");

        const client = VTOPClient(campus);

        const loginRes = await client.post(
            "/vtop/login",
            new URLSearchParams({
                _csrf: csrf,
                username,
                password,
                captchaStr: captcha,
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

        const dashboardHtml = dashboardRes.data;
        let isAuthorized = false;

        if (/authorizedidx/i.test(dashboardHtml)) {
            isAuthorized = true;
        } else if (/invalid\s*captcha/i.test(dashboardHtml)) {
            return NextResponse.json({ success: false, message: "Invalid Captcha" }, { status: 401 });
        } else if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(dashboardHtml)) {
            return NextResponse.json({ success: false, message: "Invalid Username / Password" }, { status: 401 });
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, message: "Login failed for an unknown reason." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Login successful!",
            cookies: allCookies,
            csrf,
            dashboardHtml,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}