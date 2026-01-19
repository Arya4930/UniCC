"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cheerio = __importStar(require("cheerio"));
const LMSClient_1 = __importDefault(require("../lib/clients/LMSClient"));
const router = express_1.default.Router();
/**
 * @openapi
 * /api/lms-data:
 *   post:
 *     tags:
 *       - Academics
 *     security: []
 *     summary: Fetch upcoming and completed LMS assignments for current and next month
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
 *                   due:
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
router.post("/", async (req, res) => {
    try {
        const { username, pass } = req.body;
        if (!username || !pass) {
            return res.status(400).json({ error: "Username and password are required." });
        }
        const result = await ScrapeLMS(username, pass);
        return res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
async function ScrapeLMS(username, password) {
    try {
        const getRes = await LMSClient_1.default.get("/login/index.php");
        const cookies = getRes.headers["set-cookie"]?.join("; ") || "";
        const $ = cheerio.load(getRes.data);
        const token = $('input[name="logintoken"]').val() || "";
        const formData = new URLSearchParams();
        formData.append("logintoken", token.toString());
        formData.append("username", username);
        formData.append("password", password);
        const postRes = await LMSClient_1.default.post("/login/index.php", formData.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookies
            },
            maxRedirects: 0,
            validateStatus: () => true
        });
        const loginCookies = postRes.headers["set-cookie"]?.join("; ") || cookies;
        const redirectUrl = postRes.headers.location;
        const redirectRes = await LMSClient_1.default.get(redirectUrl, {
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
        const nextMonthHTML = await fetchCalendarMonthHTML(sesskey, nextYear, nextMonth, loginCookies);
        // const calendarEventsPrev = extractCalendarEvents(prevMonthHTML);
        const calendarEventsNext = extractCalendarEvents(nextMonthHTML);
        const allEvents = [
            // ...calendarEventsPrev,
            ...calendarEventsCurrent,
            ...calendarEventsNext
        ];
        const finalResults = [];
        for (const dayData of allEvents) {
            for (const ev of dayData.events) {
                try {
                    const eventRes = await LMSClient_1.default.get(ev.link, {
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
                }
                catch (err) {
                    console.error("❌ Failed parsing:", ev.link, err.message);
                }
            }
        }
        return finalResults;
    }
    catch (err) {
        console.error("Error:", err.message);
        throw err;
    }
}
function extractCalendarEvents(html) {
    const $ = cheerio.load(html);
    const events = [];
    $("td.day.hasevent").each((i, el) => {
        const day = $(el).data("day");
        const month = $(el).find("a[data-day]").data("month") || null;
        const year = $(el).find("a[data-day]").data("year") || null;
        const dayEvents = [];
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
async function fetchCalendarMonthHTML(sesskey, year, month, cookies) {
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
    const res = await LMSClient_1.default.post(`/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}&info=core_calendar_get_calendar_monthly_view`, JSON.stringify(body), {
        headers: {
            "Content-Type": "application/json",
            Cookie: cookies
        }
    });
    return res.data[0]?.data?.html || "";
}
//# sourceMappingURL=FetchLMSdata.js.map