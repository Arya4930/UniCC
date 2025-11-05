declare module 'cheerio';
declare module 'p-limit';

export interface RequestBody {
    cookies: string[] | string;
    dashboardHtml: string,
    campus: string
}