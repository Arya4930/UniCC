"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VTOPClient_1 = __importDefault(require("../../lib/clients/VTOPClient"));
const captcha_1 = require("./captcha");
const solveCaptcha_1 = require("./solveCaptcha");
const cheerio = __importStar(require("cheerio"));
const router = express_1.default.Router();
/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate user via VTOP and return session credentials
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
 *                   description: Session cookies required for authenticated requests
 *                   example: JSESSIONID=abc123; Path=/; HttpOnly
 *                 csrf:
 *                   type: string
 *                   description: CSRF token required for future form submissions
 *                   example: 533aba0b-ca27-489c-9c78-d0e117a3e2c7
 *                 authorizedID:
 *                   type: string
 *                   description: Authorized VTOP user ID extracted after login
 *                   example: 24BCE1234
 *       401:
 *         description: Authentication failed due to invalid captcha or credentials
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
router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        const captchaRes = await (0, captcha_1.getCaptcha)();
        if ("error" in captchaRes) {
            return res.status(500).json({ success: false, error: captchaRes.error });
        }
        const { captchaBase64, cookies, csrf } = captchaRes;
        const captcha = await (0, solveCaptcha_1.solveCaptcha)(captchaBase64);
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
        const $ = cheerio.load(dashboardHtml);
        const new_csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();
        return res.status(200).json({
            success: true,
            message: "Login successful!",
            cookies: allCookies,
            csrf: new_csrf,
            authorizedID,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=login.js.map