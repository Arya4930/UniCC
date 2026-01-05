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
exports.getCaptcha = getCaptcha;
const VTOPClient_1 = __importDefault(require("../../VTOPClient"));
const cheerio = __importStar(require("cheerio"));
async function getCaptcha() {
    const MAX_RETRIES = 10;
    const client = (0, VTOPClient_1.default)();
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const setupRes = await client.get("/vtop/prelogin/setup");
            const cookies = setupRes.headers["set-cookie"];
            const $ = cheerio.load(setupRes.data);
            const csrfValue = $("#stdForm input[name=_csrf]").val();
            const csrf = Array.isArray(csrfValue) ? csrfValue[0] : csrfValue;
            if (!csrf) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            await client.post("/vtop/prelogin/setup", new URLSearchParams({ _csrf: csrf, flag: "VTOP" }).toString(), {
                headers: {
                    Cookie: cookies.join("; "),
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            const loginPage = await client.get("/vtop/login", {
                headers: { Cookie: cookies.join("; ") }
            });
            const $$ = cheerio.load(loginPage.data);
            const captchaType = $('input#gResponse').length === 1 ? "GRECAPTCHA" : "DEFAULT";
            if (captchaType === "DEFAULT") {
                const imgSrc = $$("#captchaBlock img").attr("src");
                if (!imgSrc)
                    throw new Error("Captcha image source not found.");
                let base64;
                if (imgSrc.startsWith("data:image")) {
                    base64 = imgSrc;
                }
                else {
                    const imgRes = await client.get(imgSrc, {
                        responseType: "arraybuffer",
                        headers: { Cookie: cookies.join("; ") }
                    });
                    base64 =
                        "data:image/jpeg;base64," +
                            Buffer.from(imgRes.data, "binary").toString("base64");
                }
                return { captchaBase64: base64, cookies, csrf };
            }
            else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        catch (err) {
            if (attempt === MAX_RETRIES) {
                return {
                    error: `Failed after ${MAX_RETRIES} attempts. Last error: ${err.message}`
                };
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return {
        error: `Failed to get a DEFAULT captcha after ${MAX_RETRIES} attempts.`
    };
}
//# sourceMappingURL=captcha.js.map