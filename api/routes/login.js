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
const express_1 = __importStar(require("express"));
const VTOPClient_1 = __importDefault(require("../VTOPClient"));
const login_1 = require("../types/data/login");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        const { username, password, captcha, cookies, csrf } = req.body;
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