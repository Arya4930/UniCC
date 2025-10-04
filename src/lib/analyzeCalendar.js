import { eachDayOfInterval, endOfMonth, getDay } from "date-fns";

const HOLIDAY_KEYWORDS = [
    "holiday", "pooja", "puja", "ayudha", "diwali", "pongal", "eid", "christmas", "good friday",
    "independence", "republic", "onam", "holi", "ramadan", "ganesh", "maha shivaratri", "vesak",
    "vacation", "term end", "no instructional", "noinstructional",
];

function normalize(str = "") {
    return String(str).toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function isHolidayEvent(e) {
    if (!e) return false;
    const type = String(e.type || "").toLowerCase();
    const text = normalize(e.text || "");
    const cat = normalize(e.category || "");
    if (type.includes("holiday")) return true;
    if (type.includes("no instructional")) return true;
    if (cat.includes("no instructional")) return true;
    for (const kw of HOLIDAY_KEYWORDS) {
        if (text.includes(kw) || cat.includes(kw)) return true;
    }
    return false;
}

function isInstructionalEvent(e) {
    if (!e) return false;
    const type = String(e.type || "").toLowerCase();
    const cat = normalize(e.category || "");
    if (type === "instructional day") return true;
    if (cat.includes("working")) return true;
    return false;
}

const MONTH_NAME_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function analyzeCalendar(calendar = {}) {
    const now = new Date();

    // ---- YEAR ----
    let year = Number(calendar.year);
    if (!Number.isFinite(year)) year = now.getFullYear();

    // ---- MONTH ----
    let monthIndex;
    try {
        const mRaw = calendar.month;
        if (mRaw == null) monthIndex = now.getMonth();
        else if (typeof mRaw === "number") {
            if (mRaw >= 1 && mRaw <= 12) monthIndex = mRaw - 1;
            else if (mRaw >= 0 && mRaw <= 11) monthIndex = mRaw;
            else monthIndex = now.getMonth();
        } else {
            const s = String(mRaw).trim();
            const n = Number(s);
            if (!Number.isNaN(n)) {
                monthIndex = n >= 1 && n <= 12 ? n - 1 : now.getMonth();
            } else {
                const parsed = Date.parse(`${s} 1, ${year}`);
                monthIndex = !Number.isNaN(parsed)
                    ? new Date(parsed).getMonth()
                    : MONTH_NAME_MAP[s.toLowerCase().slice(0, 3)] ?? now.getMonth();
            }
        }
    } catch {
        monthIndex = now.getMonth();
    }

    // ---- DATES ----
    let monthStart = new Date(year, monthIndex, 1);
    let daysInMonth = [];
    try {
        const monthEnd = endOfMonth(monthStart);
        daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    } catch {
        const totalDays = Number(calendar.totalDays) || 31;
        daysInMonth = Array.from({ length: totalDays }, (_, i) => new Date(year, monthIndex, i + 1));
    }

    // ---- DAY LABELS ----
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // ---- OUTPUT ----
    const result = {
        month: calendar.month ?? monthStart.toLocaleString(undefined, { month: "long" }),
        year,
        days: [],
        summary: {
            total: daysInMonth.length,
            working: 0,
            holiday: 0,
            other: 0,
        },
    };

    for (const dateObj of daysInMonth) {
        const date = dateObj.getDate();
        const dayName = weekdayNames[dateObj.getDay()];
        const dayInfo = Array.isArray(calendar.days)
            ? calendar.days.find((d) => Number(d.date) === date)
            : undefined;

        const events = dayInfo?.events || [];

        const hasHoliday = events.some(isHolidayEvent);
        const hasInstructional = events.some(isInstructionalEvent);
        const isEmpty = events.length === 0;

        let dayType = "other";
        if (hasHoliday || isEmpty || (!hasInstructional && events.length > 0)) dayType = "holiday";
        else if (hasInstructional) dayType = "working";

        result.days.push({
            date,
            weekday: dayName,
            type: dayType,
            events,
        });

        result.summary[dayType]++;
    }

    return result;
}

export function analyzeAllCalendars(calendars) {
    if (!calendars) return [];
    if (Array.isArray(calendars)) return calendars.map(analyzeCalendar);
    if (calendars.calendars) return calendars.calendars.map(analyzeCalendar);
    return [analyzeCalendar(calendars)];
}
