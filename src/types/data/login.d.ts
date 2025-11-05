export type CaptchaType = "GRECAPTCHA" | "DEFAULT";

export type CaptchaResponse = {
    captchaType: CaptchaType;
    captchaBase64: string;
    cookies: string[];
    csrf: string;
}

export type CaptchaResponseError = {
    error: string;
}

export type CaptchaResult = CaptchaResponse | CaptchaResponseError;