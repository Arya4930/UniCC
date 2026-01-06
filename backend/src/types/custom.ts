declare module 'cheerio';

export interface RequestBody {
    cookies: string[] | string;
    authorizedID: string;
    csrf: string;
    semesterId?: string;
}