import express, { Request, Response, Router } from "express";
import * as cheerio from "cheerio";
import LMSClient from "../lib/clients/LMSClient";
import getVitolClient from "../lib/clients/VitolClient";
import axios from "axios";
import { maskUserID } from "../lib/mask";
import User from "../lib/models/Users";

const router: Router = express.Router();

interface Assingment {
    name: string;
    opens: string;
    done: boolean;
    day: number;
    month: number;
    year: number;
    url: string;
}

/**
 * @openapi
 * /api/vitol-data:
 *   post:
 *     tags:
 *       - Academics
 *     security: []
 *     summary: Fetch upcoming and completed Vitol Tests for current and next month
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - pass
 *             properties:
 *               username:
 *                 type: string
 *                 example: 24BCE1234
 *               pass:
 *                 type: string
 *                 example: myLMSPassword
 *               vitolSite:
 *                 type: string
 *                 example: vitolcc
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   opens:
 *                     type: string
 *                   done:
 *                     type: boolean
 *                   day:
 *                     type: number
 *                   month:
 *                     type: number
 *                   year:
 *                     type: number
 *                   url:
 *                     type: string
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post("/", async (req: Request, res: Response) => {
    try {
        const { username, pass, vitolSite } = req.body;
        if (!username || !pass || !vitolSite) {
            return res.status(400).json({ error: "Username, password and vitolSite are required." });
        }

        const result = await ScrapeVitolData(username, pass, vitolSite);

        const maskedID = maskUserID(username.toUpperCase());
        const user = await User.findOne({ UserID: maskedID });

        if (
            user?.notifications?.enabled &&
            user.notifications.sources.vitol?.enabled
        ) {
            const existing = user.notifications.sources.vitol.data

            const merged = result
                .filter(a => !a.done)
                .map(a => {
                    const prev = existing.find(e => e.url === a.url)

                    return {
                        name: a.name,
                        opens: a.opens,
                        done: a.done,
                        day: a.day,
                        month: a.month,
                        year: a.year,
                        url: a.url,
                        hidden: prev?.hidden ?? false,
                        reminders: prev?.reminders ?? {},
                    }
                })

            user.notifications.sources.vitol.data = merged
            await user.save()
        }

        return res.status(200).json(result);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
})

export default router;

async function ScrapeVitolData(username: string, password: string, vitolSite: string): Promise<Assingment[]> {
    try {
        const VitolClient = getVitolClient(vitolSite);
        const getRes = await VitolClient.get("/login/index.php");
        const cookies = getRes.headers["set-cookie"]?.join("; ") || "";

        const $ = cheerio.load(getRes.data);
        const token = $('input[name="logintoken"]').val() || "";

        const formData = new URLSearchParams();
        formData.append("logintoken", token.toString());
        formData.append("username", username);
        formData.append("password", password);

        const postRes = await VitolClient.post("/login/index.php", formData.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookies
            },
            maxRedirects: 0,
            validateStatus: () => true
        });

        const loginCookies = postRes.headers["set-cookie"]?.join("; ") || cookies;
        const redirectUrl = postRes.headers.location;

        const redirectRes = await VitolClient.get(redirectUrl, {
            headers: {
                Cookie: loginCookies
            }
        });

        const sesskeyMatch = redirectRes.data.match(/"sesskey":"([^"]+)"/);
        const sesskey = sesskeyMatch?.[1];

        if (!sesskey) {
            throw new Error("Cannot find sesskey");
        }

        const now = new Date();

        let currentMonth = now.getMonth() + 1;
        let currentYear = now.getFullYear();

        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;

        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear--;
        }

        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;

        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
        }

        const calendarEventsCurrent = extractCalendarEvents(redirectRes.data);

        // const prevMonthHTML = await fetchCalendarMonthHTML(
        //     sesskey,
        //     prevYear,
        //     prevMonth,
        //     loginCookies
        // );

        const nextMonthHTML = await fetchCalendarMonthHTML(
            sesskey,
            nextYear,
            nextMonth,
            loginCookies,
            VitolClient
        );

        // const calendarEventsPrev = extractCalendarEvents(prevMonthHTML);
        const calendarEventsNext = extractCalendarEvents(nextMonthHTML);

        const allEvents = [
            // ...calendarEventsPrev,
            ...calendarEventsCurrent,
            ...calendarEventsNext
        ];

        const urlSet = new Set<string>();
        const finalResults: Assingment[] = [];

        for (const dayData of allEvents) {
            for (const ev of dayData.events) {
                try {
                    const eventRes = await VitolClient.get(ev.link, {
                        headers: {
                            Cookie: loginCookies
                        }
                    });

                    const $ = cheerio.load(eventRes.data);

                    const courseLink = $("ol.breadcrumb li.breadcrumb-item a")
                        .first()
                        .attr("href");

                    if (courseLink) {
                        const courseId = new URL(courseLink).searchParams.get("id");
                        const moduleId = new URL(ev.link).searchParams.get("id");

                        if (courseId && moduleId) {
                            const courseRes = await VitolClient.get(
                                `/course/view.php?id=${courseId}`,
                                { headers: { Cookie: loginCookies } }
                            );
                        }
                    }

                    const courseCodeFull = $("ol.breadcrumb li.breadcrumb-item a")
                        .first()
                        .text()
                        .trim();
                    const courseNameFull = $("ol.breadcrumb li.breadcrumb-item a")
                        .first()
                        .attr("title") || "";
                    const assignmentName = $("h1.h2").first().text().trim();
                    const name = `${courseCodeFull}/${courseNameFull}/${assignmentName}`;

                    const opensText = $('div.activity-dates strong')
                        .filter((_, el) => {
                            const text = $(el).text()
                            return text.includes('Opens:') || text.includes('Opened:')
                        })
                        .parent()
                        .text()
                        .replace(/Opens:|Opened:/, '')
                        .trim()

                    const isDone = $('table.quizattemptsummary:contains("Finished")').length > 0;

                    if (!urlSet.has(ev.link)) {
                        urlSet.add(ev.link);

                        finalResults.push({
                            name,
                            opens: opensText,
                            done: isDone,
                            day: dayData.day,
                            month: dayData.month,
                            year: dayData.year,
                            url: ev.link
                        });
                    }

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

async function fetchCalendarMonthHTML(sesskey: string, year: number, month: number, cookies: string, VitolClient: axios.AxiosInstance): Promise<string> {
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

    const res = await VitolClient.post(
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
