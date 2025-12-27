import { RequestBody } from "../../../src/types/custom";
export type CalendarType = "ALL" | "ALL02" | "ALL03" | "ALL05" | "ALL06" | "ALL08" | "ALL11" | "WEI";
export interface CalendarEvent {
    type: "Instructional Day" | "Holiday" | "Other";
    text: string;
    color?: string;
    category?: string;
}
export interface CalendarDay {
    date: number;
    events: CalendarEvent[];
}
export interface CalendarMonth {
    month: string;
    days: CalendarDay[];
}
export interface HolidayEvent extends CalendarEvent {
    text: string;
    type: "Holiday";
    color?: string;
    category?: string;
}
export type ParsedCalendarFn = (html: string) => Promise<CalendarMonth>;
export type AddHolidayFn = (calendar: CalendarMonth, dayNum: number, eventObj: HolidayEvent) => void;
export interface CalendarRequestBody extends RequestBody {
    type: CalendarType;
}
export type CalendarInput = {
    year?: number | string;
    month?: number | string;
    totalDays?: number;
    days?: CalendarDay[];
};
export type AnalyzedDay = {
    date: number;
    weekday: string;
    type: "working" | "holiday" | "other";
    events: CalendarEvent[];
};
export type CalendarSummary = {
    total: number;
    working: number;
    holiday: number;
    other: number;
};
export type CalendarResult = {
    month: string | number;
    year: number;
    days: AnalyzedDay[];
    summary: CalendarSummary;
};
export type ImportantEvent = {
    event: string;
    date: number;
    weekday: string;
    month: string | number;
    year: number;
    formattedDate: Date;
};
export type AnalyzeCalendarReturn = {
    result: CalendarResult;
    importantEvents: Map<string, ImportantEvent>;
};
export type AnalyzeAllCalendarsReturn = {
    results: CalendarResult[];
    importantEvents: Map<string, ImportantEvent>;
};
//# sourceMappingURL=semTT.d.ts.map