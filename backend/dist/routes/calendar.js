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
const VTOPClient_1 = __importDefault(require("../lib/clients/VTOPClient"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const router = express_1.default.Router();
/**
 * @openapi
 * /api/calendar:
 *   post:
 *     tags:
 *       - Academics
 *     summary: Fetch semester academic calendar with events grouped by month
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cookies
 *               - authorizedID
 *               - csrf
 *               - semesterId
 *             properties:
 *               cookies:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *               authorizedID:
 *                 type: string
 *                 example: 24BCE1234
 *               csrf:
 *                 type: string
 *               semesterId:
 *                 type: string
 *                 example: CH20242501
 *               type:
 *                 type: string
 *                 example: ALL
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 semesterId:
 *                   type: string
 *                 calendars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: JULY 2024
 *                       days:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             date:
 *                               type: number
 *                               example: 12
 *                             events:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   text:
 *                                     type: string
 *                                   type:
 *                                     type: string
 *                                     example: Instructional Day
 *                                   color:
 *                                     type: string
 *                                   category:
 *                                     type: string
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
        let { cookies, authorizedID, csrf, type, semesterId } = req.body;
        if (semesterId?.toString().endsWith("05")) {
            if (type !== "ALL" && type !== "ALL02" && type !== "ALL05") {
                type = "ALL";
            }
        }
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        if (!csrf || !authorizedID)
            throw new Error("Cannot find _csrf or authorizedID");
        let months = [];
        const semCode = semesterId?.slice(-2);
        const startYear = parseInt(semesterId?.slice(2, 6) || "2024");
        const nextYear = startYear + 1;
        if (semCode === "01") {
            months = [
                `01-JUL-${startYear}`,
                `01-AUG-${startYear}`,
                `01-SEP-${startYear}`,
                `01-OCT-${startYear}`,
                `01-NOV-${startYear}`,
            ];
        }
        else if (semCode === "05") {
            months = [
                `01-DEC-${startYear}`,
                `01-JAN-${nextYear}`,
                `01-FEB-${nextYear}`,
                `01-MAR-${nextYear}`,
                `01-APR-${nextYear}`,
            ];
        }
        else {
            months = [
                `01-JUN-${nextYear}`,
                `01-JUL-${nextYear}`,
                `01-AUG-${nextYear}`,
            ];
        }
        const allCalendars = [];
        const client = (0, VTOPClient_1.default)();
        // Fetch for each month
        for (const calDate of months) {
            const ttRes = await client.post("/vtop/processViewCalendar", new url_1.URLSearchParams({
                authorizedID: String(authorizedID),
                semSubId: semesterId ?? "",
                calDate: calDate,
                classGroupId: type,
                _csrf: String(csrf),
                x: Date.now().toString(),
            }).toString(), {
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
                },
            });
            const parsed = await parseCalendar(ttRes.data);
            allCalendars.push(parsed);
        }
        // Add your custom event (Nov 8)
        // const addCustomEvent = {
        //     text: "Crystal GuruVITa",
        //     type: "Holiday",
        //     color: "#B22222",
        //     category: "Crystal GuruVITa",
        // };
        // allCalendars.forEach((cal, idx) => {
        //     const calDate = months[idx] || "";
        //     if (
        //         typeof calDate === "string" &&
        //         calDate.toUpperCase().includes("-NOV-")
        //     ) {
        //         addHolidayToCalendar(cal, 8, addCustomEvent);
        //     }
        // });
        return res.status(200).json({
            semesterId,
            calendars: allCalendars,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
function addHolidayToCalendar(calendar, dayNum, eventObj) {
    if (!calendar || !Array.isArray(calendar.days))
        return;
    const day = calendar.days.find((d) => Number(d.date) === Number(dayNum));
    if (day) {
        if (Array.isArray(day.events)) {
            day.events = day.events.filter((e) => (e.text || "").toLowerCase() !== "instructional day");
        }
        else {
            day.events = [];
        }
        const exists = day.events.some((e) => (e.text || "").toLowerCase() ===
            (eventObj.text || "").toLowerCase());
        if (!exists) {
            day.events.push(eventObj);
        }
    }
    else {
        calendar.days.push({
            date: Number(dayNum),
            events: [eventObj],
        });
    }
}
async function parseCalendar(html) {
    const $ = cheerio.load(html);
    const month = $("h4").first().text().trim();
    const data = [];
    $("table.calendar-table tbody tr td").each((_, td) => {
        const cell = $(td);
        const dateText = cell.find("span").first().text().trim();
        if (!dateText)
            return;
        const date = parseInt(dateText, 10);
        const events = [];
        cell.find("span").slice(1).each((__, span) => {
            const text = $(span).text().trim();
            if (!text)
                return;
            const style = $(span).attr("style") || "";
            const colorMatch = style.match(/color:\s*([^;]+)/);
            const color = colorMatch ? (colorMatch[1] || " ").trim() : "";
            const isInstructional = text.toLowerCase().includes("instructional");
            const isHoliday = text.toLowerCase().includes("holiday");
            events.push({
                text,
                type: isInstructional
                    ? "Instructional Day"
                    : isHoliday
                        ? "Holiday"
                        : "Other",
                color,
                category: "",
            });
        });
        const structured = events.map((e) => {
            const match = e.text.match(/\(([^)]+)\)/);
            return {
                ...e,
                category: match ? (match[1] || " ").trim() : "General",
            };
        });
        if (events.length !== 0) {
            data.push({ date, events: structured });
        }
    });
    return { month, days: data };
}
exports.default = router;
//# sourceMappingURL=calendar.js.map