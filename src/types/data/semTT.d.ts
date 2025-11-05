import { RequestBody } from "../custom";

export type CalendarType =
    | "ALL"
    | "ALL02"
    | "ALL03"
    | "ALL05"
    | "ALL06"
    | "ALL08"
    | "ALL11"
    | "WEI";

export interface CalendarEvent {
    type: "Instructional Day" | "Holiday" | "Other";
    text: string;
    color?: string;
    category: string;
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
    color: string;
    category?: string;
}

export type ParsedCalendarFn = (html: string) => Promise<CalendarMonth>;

export type AddHolidayFn = (
    calendar: CalendarMonth,
    dayNum: number,
    eventObj: HolidayEvent
) => void;

export interface CalendarRequestBody extends RequestBody {
    type: CalendarType;
}
