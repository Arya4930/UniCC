import VTOPClient from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";
import config from "@/app/config.json";
import { AddHolidayFn, CalendarDay, CalendarEvent, CalendarRequestBody } from "@/types/data/semTT";

// Types of calenders
// ALL - Default General semester
// ALL02 - General Flexible
// ALL03 - General Freshers
// ALL05 - General LAW
// ALL06 - Fliexible Freshers
// ALL08 - Cohort LAW
// ALL11 - Flexible Research
// WEI - Weekend Intra Semester

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { cookies, dashboardHtml, type, semesterId }: CalendarRequestBody = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        let months: string[];

        const semCode = semesterId?.slice(-2);
        const startYear = parseInt(semesterId.slice(2, 6));
        const nextYear = startYear + 1;

        if (semCode === "01") {
            months = [
                `01-JUL-${startYear + 1}`,
                `01-AUG-${startYear + 1}`,
                `01-SEP-${startYear + 1}`,
                `01-OCT-${startYear + 1}`,
                `01-NOV-${startYear + 1}`,
            ];
        } else if (semCode === "05") {
            months = [
                `01-DEC-${startYear}`,
                `01-JAN-${nextYear}`,
                `01-FEB-${nextYear}`,
                `01-MAR-${nextYear}`,
                `01-APR-${nextYear}`,
            ];
        } else {
            months = [
                `01-JUN-${nextYear}`,
                `01-JUL-${nextYear}`,
                `01-AUG-${nextYear}`,
            ];
        }

        const allCalendars = [];

        const client = VTOPClient();

        for (const calDate of months) {
            const ttRes = await client.post(
                "/vtop/processViewCalendar",
                new URLSearchParams({
                    authorizedID,
                    semSubId: semesterId,
                    calDate,
                    classGroupId: type,
                    _csrf: csrf,
                    x: Date.now().toString(),
                }).toString(),
                {
                    headers: {
                        Cookie: cookieHeader,
                        "Content-Type": "application/x-www-form-urlencoded",
                        Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
                    },
                }
            );

            const parsed = await parseCalendar(ttRes.data);
            allCalendars.push(parsed);
        }
        const addCustomEvent = {
            text: "Crystal GuruVITa",
            type: "Holiday",
            color: "#B22222",
            category: "Crystal GuruVITa"
        };
        allCalendars.forEach((cal, idx) => {
            const calDate = months[idx] || "";
            if (typeof calDate === "string" && calDate.toUpperCase().includes("-NOV-")) {
                addHolidayToCalendar(cal, 8, addCustomEvent);
            }
        });

        return NextResponse.json({
            semesterId,
            calendars: allCalendars,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// helper function
function addHolidayToCalendar(calendar, dayNum, eventObj): AddHolidayFn {
    if (!calendar || !Array.isArray(calendar.days)) return;

    const day = calendar.days.find(d => Number(d.date) === Number(dayNum));

    if (day) {
        if (Array.isArray(day.events)) {
            day.events = day.events.filter(
                e => (e.text || "").toLowerCase() !== "instructional day"
            );
        } else {
            day.events = [];
        }

        const exists = day.events.some(
            e => (e.text || "").toLowerCase() === (eventObj.text || "").toLowerCase()
        );
        if (!exists) {
            day.events.push(eventObj);
        }

    } else {
        calendar.days.push({
            date: Number(dayNum),
            events: [eventObj],
        });
    }
}

async function parseCalendar(html) {
    const $ = cheerio.load(html);
    const month = $("h4").first().text().trim();
    const data: CalendarDay[] = [];

    $("table.calendar-table tbody tr td").each((_, td) => {
        const cell = $(td);
        const dateText = cell.find("span").first().text().trim();
        if (!dateText) return;

        const date = parseInt(dateText, 10);
        const events: CalendarEvent[] = [];

        cell.find("span").slice(1).each((__, span) => {
            const text = $(span).text().trim();
            if (!text) return;

            const style = $(span).attr("style") || "";
            const colorMatch = style.match(/color:\s*([^;]+)/);
            const color = colorMatch ? colorMatch[1].trim() : "";

            const isInstructional = text.toLowerCase().includes("instructional");
            const isHoliday = text.toLowerCase().includes("holiday");

            events.push({
                text,
                type: isInstructional ? "Instructional Day" : isHoliday ? "Holiday" : "Other",
                color,
                category: "",
            });
        });

        const structured = events.map((e) => {
            const match = e.text.match(/\(([^)]+)\)/);
            return {
                ...e,
                category: match ? match[1].trim() : "General",
            };
        });

        if (events.length !== 0) {
            data.push({ date, events: structured });
        }
    });

    return { month, days: data };
}