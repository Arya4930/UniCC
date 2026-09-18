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
const mergeCookies = (...cookieGroups) => {
    const jar = new Map();
    for (const group of cookieGroups) {
        for (const setCookie of group ?? []) {
            const cookie = setCookie.split(";", 1)[0]?.trim();
            if (!cookie)
                continue;
            const separatorIndex = cookie.indexOf("=");
            if (separatorIndex > 0) {
                jar.set(cookie.slice(0, separatorIndex), cookie);
            }
        }
    }
    return [...jar.values()].join("; ");
};
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
        }
        else if (/invalid\s*captcha/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Invalid Captcha" });
        }
        else if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Invalid Username / Password" });
        }
        else if (/months/i.test(dashboardHtml)) {
            return res.status(401).json({ success: false, message: "Please visit VTOP and change your password, it has expired after the usual 3 month period" });
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