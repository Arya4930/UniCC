import express, { Request, Response } from "express";
import VTOPClient from "../../lib/clients/VTOPClient";
import { LoginRequestBody } from "../../types/data/login";
import type { Router } from "express";
import { getCaptcha } from "./captcha";
import { solveCaptcha } from "./solveCaptcha";
import * as cheerio from "cheerio";

const router: Router = express.Router();

const mergeCookies = (...cookieGroups: Array<string[] | undefined>): string => {
    const jar = new Map<string, string>();

    for (const group of cookieGroups) {
        for (const setCookie of group ?? []) {
            const cookie = setCookie.split(";", 1)[0]?.trim();
            if (!cookie) continue;
            const separatorIndex = cookie.indexOf("=");

            if (separatorIndex > 0) {
                jar.set(cookie.slice(0, separatorIndex), cookie);
            }
        }
    }

    return [...jar.values()].join("; ");
};

router.post("/", async (req: Request, res: Response) => {
    try {
        const { username, password }: LoginRequestBody = req.body;
        const captchaRes = await getCaptcha();
        if ("error" in captchaRes) {
            return res.status(500).json({ success: false, error: captchaRes.error });
        }

        const { captchaBase64, cookies, csrf } = captchaRes;
        const captcha = await solveCaptcha(captchaBase64);

        const client = VTOPClient();

        const loginRes = await client.post(
            "/vtop/login",
            new URLSearchParams({
                _csrf: csrf,
                username,
                password,
                captchaStr: captcha,
            }).toString(),
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
        const allCookies = mergeCookies(cookies, loginCookies);

        const dashboardRes = await client.get(loginRes.headers.location, {
            headers: {
                Cookie: allCookies,
            },
            maxRedirects: 3,
        });

        const dashboardHtml = dashboardRes.data;

        let isAuthorized = false;

        if (/authorizedidx/i.test(dashboardHtml)) {
            isAuthorized = true;
        } else if (/invalid\s*captcha/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Invalid Captcha" });
        } else if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Invalid Username / Password" });
        } else if (/months/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Please visit VTOP and change your password, it has expired after the usual 3 month period" })
        }

        if (!isAuthorized) {
            return res.status(500).json({
                success: false,
                message: "Login failed for an unknown reason.",
            });
        }

        const $ = cheerio.load(dashboardHtml);
        const new_csrf: any = $('input[name="_csrf"]').val();
        const authorizedID: any =
            $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            cookies: allCookies,
            csrf: new_csrf,
            authorizedID,
        });

    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
