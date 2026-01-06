import express, { Request, Response } from "express";
import VTOPClient from "../../lib/clients/VTOPClient";
import { LoginRequestBody } from "../../types/data/login";
import type { Router } from "express";
import { getCaptcha } from "./captcha";
import { solveCaptcha } from "./solveCaptcha";

const router: Router = express.Router();

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate a user via VTOP and return session credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: 24BCE1234
 *               password:
 *                 type: string
 *                 example: mySecretPassword
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful!
 *                 cookies:
 *                   type: string
 *                   description: Session cookies for authenticated requests
 *                 csrf:
 *                   type: string
 *                   description: CSRF token required for subsequent requests
 *                 dashboardHtml:
 *                   type: string
 *                   description: Raw HTML of the authenticated dashboard page
 *       401:
 *         description: Authentication failed (invalid captcha or credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid Username / Password
 *       500:
 *         description: Internal server error or captcha fetch failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to get captcha
 */

router.post("/", async (req: Request, res: Response) => {
    try {
        const { username, password }: LoginRequestBody = req.body;
        const captchaRes = await getCaptcha();
        if("error" in captchaRes){
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
        const allCookies = [...(cookies || []), ...(loginCookies || [])].join("; ");

        let dashboardRes: any;
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
            return res.status(401).json({ success: false, message: "Invalid Captcha" });
        } else if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Invalid Username / Password" });
        }

        if (!isAuthorized) {
            return res.status(500).json({
                success: false,
                message: "Login failed for an unknown reason.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            cookies: allCookies,
            csrf,
            dashboardHtml,
        });

    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
