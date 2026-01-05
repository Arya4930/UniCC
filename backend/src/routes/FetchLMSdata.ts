import express, { Request, Response, Router } from "express";
import * as cheerio from "cheerio";
import LMSClient from "../lib/clients/LMSClient";

const router: Router = express.Router();

interface Assingment {
    name: string;
    due: string;
    done: boolean;
    day: number;
    month: number;
    year: number;
    url: string;
}

router.post("/", async (req: Request, res: Response) => {
    try {
        const { username, pass } = req.body;
        if (!username || !pass) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        const result = await ScrapeLMS(username, pass);
        return res.status(200).json(result);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
})

export default router;

async function ScrapeLMS(username: string, password: string): Promise<Assingment[]> {
    try {
        const getRes = await LMSClient.get("/login/index.php");
        const cookies = getRes.headers["set-cookie"]?.join("; ") || "";

        const $ = cheerio.load(getRes.data);
        const token = $('input[name="logintoken"]').val() || "";

        const formData = new URLSearchParams();
        formData.append("logintoken", token.toString());
        formData.append("username", username);
        formData.append("password", password);

        const postRes = await LMSClient.post("/login/index.php", formData.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookies
            },
            maxRedirects: 0,
            validateStatus: () => true
        });

        const loginCookies = postRes.headers["set-cookie"]?.join("; ") || cookies;
        const redirectUrl = postRes.headers.location;

        const redirectRes = await LMSClient.get(redirectUrl, {
            headers: {
                Cookie: loginCookies
            }
        });

        const sesskeyMatch = redirectRes.data.match(/"sesskey":"([^"]+)"/);
        const sesskey = sesskeyMatch?.[1];

        if (!sesskey) {
            throw new Error("Cannot find sesskey");
        }

        let now = new Date();
        let nextMonth = now.getMonth() + 2;
        let nextYear = now.getFullYear();

        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
        }

        const calendarEventsCurrent = extractCalendarEvents(redirectRes.data);
        const nextMonthHTML = await fetchCalendarMonthHTML(sesskey, nextYear, nextMonth, loginCookies);
        const calendarEventsNext = extractCalendarEvents(nextMonthHTML);

        const allEvents = [...calendarEventsCurrent, ...calendarEventsNext];
        const finalResults = [];

        for (const dayData of allEvents) {
            for (const ev of dayData.events) {
                try {
                    const eventRes = await LMSClient.get(ev.link, {
                        headers: {
                            Cookie: loginCookies
                        }
                    });

                    const $ = cheerio.load(eventRes.data);

                    const courseCodeFull = $("ol.breadcrumb li.breadcrumb-item a")
                        .first()
                        .text()
                        .trim();
                    const courseNameFull = $("ol.breadcrumb li.breadcrumb-item a")
                        .first()
                        .attr("title") || "";
                    const assignmentName = $("h1.h2").first().text().trim();
                    const name = `${courseCodeFull}/${courseNameFull}/${assignmentName}`;

                    const dueText = $('div.activity-dates strong:contains("Due:")')
                        .parent()
                        .text()
                        .replace("Due:", "")
                        .trim();

                    const isDone = $('[data-region="completion-info"] button.btn-success').length > 0;

                    finalResults.push({
                        name,
                        due: dueText,
                        done: isDone,
                        day: dayData.day,
                        month: dayData.month,
                        year: dayData.year,
                        url: ev.link
                    });
                } catch (err: any) {
                    console.error("❌ Failed parsing:", ev.link, err.message);
                }
            }
        }
        return finalResults;
    } catch (err: any) {
        console.error("Error:", err.message);
        throw err;
    }
}

function extractCalendarEvents(html: string) {
    const $ = cheerio.load(html);
    const events: any[] = [];

    $("td.day.hasevent").each((i, el) => {
        const day = $(el).data("day");
        const month = $(el).find("a[data-day]").data("month") || null;
        const year = $(el).find("a[data-day]").data("year") || null;

        const dayEvents: any[] = [];

        $(el)
            .find('[data-region="event-item"] a[data-action="view-event"]')
            .each((j, ev) => {
                const title = $(ev).find(".eventname").text().trim();
                const link = $(ev).attr("href");
                dayEvents.push({ title, link });
            });

        events.push({ day, month, year, events: dayEvents });
    });

    return events;
}

async function fetchCalendarMonthHTML(sesskey: string, year: number, month: number, cookies: string): Promise<string> {
    const body = [
        {
            index: 0,
            methodname: "core_calendar_get_calendar_monthly_view",
            args: {
                year: String(year),
                month: String(month),
                courseid: 1,
                day: 1,
                view: "monthblock"
            }
        }
    ];

    const res = await LMSClient.post(
        `/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}&info=core_calendar_get_calendar_monthly_view`,
        JSON.stringify(body),
        {
            headers: {
                "Content-Type": "application/json",
                Cookie: cookies
            }
        }
    );
    return res.data[0]?.data?.html || "";
}
