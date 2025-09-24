import { client } from "@/lib/VTOPClient";
import * as cheerio from "cheerio";

export async function getCaptchaType($) {
    return $('input#gResponse').length === 1 ? "GRECAPTCHA" : "DEFAULT";
}

export default async function getCaptcha() {
    const MAX_RETRIES = 10;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Step 1: Start a new session on each attempt
            const setupRes = await client.get("/vtop/prelogin/setup");
            const cookies = setupRes.headers["set-cookie"];
            const $ = cheerio.load(setupRes.data);

            const csrf = $("#stdForm input[name=_csrf]").val();
            if (!csrf) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            await client.post(
                "/vtop/prelogin/setup",
                new URLSearchParams({ _csrf: csrf, flag: "VTOP" }),
                { headers: { Cookie: cookies.join("; "), "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const loginPage = await client.get("/vtop/login", { headers: { Cookie: cookies.join("; ") } });
            const $$ = cheerio.load(loginPage.data);

            const captchaType = await getCaptchaType($$);

            if (captchaType === "DEFAULT") {
                const imgSrc = $$("#captchaBlock img").attr("src");
                if (!imgSrc) throw new Error("Captcha image source not found.");

                let base64;
                if (imgSrc.startsWith("data:image")) {
                    base64 = imgSrc;
                } else {
                    const imgRes = await client.get(imgSrc, {
                        responseType: "arraybuffer",
                        headers: { Cookie: cookies.join("; ") },
                    });
                    base64 = "data:image/jpeg;base64," + Buffer.from(imgRes.data, "binary").toString("base64");
                }
                
                return { captchaType, captchaBase64: base64, cookies, csrf };
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (err) {
            if (attempt === MAX_RETRIES) {
                return { error: `Failed after ${MAX_RETRIES} attempts. Last error: ${err.message}` };
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return { error: `Failed to get a DEFAULT captcha after ${MAX_RETRIES} attempts.` };
}
