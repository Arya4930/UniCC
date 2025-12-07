"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VTOPClient_1 = __importDefault(require("../../VTOPClient"));
const captcha_1 = require("../captcha");
const solveCaptcha_1 = require("../solveCaptcha");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { captchaBase64, cookies, csrf, error } = await (0, captcha_1.getCaptcha)();
        const captcha = await (0, solveCaptcha_1.solveCaptchaServer)(captchaBase64);
        const client = (0, VTOPClient_1.default)();
        const loginRes = await client.post("/vtop/login", new URLSearchParams({
            _csrf: csrf,
            username,
            password,
            captchaStr: captcha,
        }).toString(), {
            headers: {
                Cookie: cookies.join("; "),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            maxRedirects: 0,
            validateStatus: (s) => s < 400 || s === 302,
        });
        const loginCookies = loginRes.headers["set-cookie"];
        const allCookies = [...(cookies || []), ...(loginCookies || [])].join("; ");
        let dashboardRes;
        if (loginRes.status === 302 && loginRes.headers.location) {
            dashboardRes = await client.get(loginRes.headers.location, {
                headers: { Cookie: allCookies },
            });
        }
        else {
            dashboardRes = await client.get("/vtop/open/page", {
                headers: { Cookie: allCookies },
            });
        }
        const dashboardHtml = dashboardRes.data;
        let isAuthorized = false;
        if (/authorizedidx/i.test(dashboardHtml)) {
            isAuthorized = true;
        }
        else if (/invalid\s*captcha/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Invalid Captcha" });
        }
        else if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(dashboardHtml)) {
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=login.js.map