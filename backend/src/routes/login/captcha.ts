import { CaptchaResult, CaptchaType } from "../../types/data/login";
import VTOPClient from "../../lib/clients/VTOPClient";
import * as cheerio from "cheerio";

export async function getCaptcha(): Promise<CaptchaResult> {
    const MAX_RETRIES = 10;
    const client = VTOPClient();

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const setupRes = await client.get("/vtop/prelogin/setup");
            const cookies: any = setupRes.headers["set-cookie"];
            const $ = cheerio.load(setupRes.data);

            const csrfValue = $("#stdForm input[name=_csrf]").val();
            const csrf = Array.isArray(csrfValue) ? csrfValue[0] : csrfValue;

            if (!csrf) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            await client.post(
                "/vtop/prelogin/setup",
                new URLSearchParams({ _csrf: csrf, flag: "VTOP" }).toString(),
                {
                    headers: {
                        Cookie: cookies.join("; "),
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            const loginPage = await client.get("/vtop/login", {
                headers: { Cookie: cookies.join("; ") }
            });

            const $$ = cheerio.load(loginPage.data);

            const captchaType: CaptchaType =
                $('input#gResponse').length === 1 ? "GRECAPTCHA" : "DEFAULT";

            if (captchaType === "DEFAULT") {
                const imgSrc = $$("#captchaBlock img").attr("src");
                if (!imgSrc) throw new Error("Captcha image source not found.");

                let base64: string;

                if (imgSrc.startsWith("data:image")) {
                    base64 = imgSrc;
                } else {
                    const imgRes = await client.get(imgSrc, {
                        responseType: "arraybuffer",
                        headers: { Cookie: cookies.join("; ") }
                    });

                    base64 =
                        "data:image/jpeg;base64," +
                        Buffer.from(imgRes.data, "binary").toString("base64");
                }

                return { captchaBase64: base64, cookies, csrf };
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (err: any) {
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
