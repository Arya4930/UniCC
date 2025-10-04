import { client } from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { URLSearchParams } from "url";
import config from "@/app/config.json";

// Types of calenders
// ALL - Default General semester
// ALL02 - General Flexible
// ALL03 - General Freshers
// ALL05 - General LAW
// ALL06 - Fliexible Freshers
// ALL08 - Cohort LAW
// ALL11 - Flexible Research
// WEI - Weekend Intra Semester

async function parseCalendar(html) {
    const $ = cheerio.load(html);
    const month = $("h4").first().text().trim();
    const data = [];

    $("table.calendar-table tbody tr td").each((_, td) => {
        const cell = $(td);
        const dateText = cell.find("span").first().text().trim();
        if (!dateText) return;

        const date = parseInt(dateText, 10);
        const events = [];

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

export async function POST(req) {
    try {
        const { cookies, dashboardHtml, type } = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        const semesterId = config.currSemID;
        let months;

        if (semesterId.toString().endsWith("1")) {
            months = ["01-JUL-2025", "01-AUG-2025", "01-SEP-2025", "01-OCT-2025", "01-NOV-2025"];
        } else {
            months = ["01-JAN-2026", "01-FEB-2026", "01-MAR-2026", "01-APR-2026", "01-MAY-2026"];
        }

        const allCalendars = [];

        for (const calDate of months) {
            const ttRes = await client.post(
                "/vtop/processViewCalendar",
                new URLSearchParams({
                    authorizedID,
                    semSubId: semesterId,
                    calDate,
                    classGroupId: type || "ALL",
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

        return NextResponse.json({
            semesterId,
            calendars: allCalendars,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}