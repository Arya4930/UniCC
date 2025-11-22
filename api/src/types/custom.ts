declare module 'cheerio';

export interface RequestBody {
    cookies: string[] | string;
    dashboardHtml: string,
    semesterId?: string;
}