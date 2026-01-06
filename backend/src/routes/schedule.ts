import express, { Request, Response, Router } from "express";
import VTOPClient from "../lib/clients/VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import { RequestBody } from "../types/custom";
import { ExamItem, Schedule } from "../types/data/schedule";

/**
 * @openapi
 * /api/schedule:
 *   post:
 *     tags:
 *       - Academics
 *     summary: Fetch examination schedule for a semester
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
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 semester:
 *                   type: string
 *                 Schedule:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         courseCode:
 *                           type: string
 *                         courseTitle:
 *                           type: string
 *                         classId:
 *                           type: string
 *                         slot:
 *                           type: string
 *                         examDate:
 *                           type: string
 *                         examSession:
 *                           type: string
 *                         reportingTime:
 *                           type: string
 *                         examTime:
 *                           type: string
 *                         venue:
 *                           type: string
 *                         seatLocation:
 *                           type: string
 *                         seatNo:
 *                           type: string
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { cookies, authorizedID, csrf, semesterId }: RequestBody = req.body;

        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        if (!csrf || !authorizedID)
            throw new Error("Cannot find _csrf or authorizedID");

        const client = VTOPClient();
        const ScheduleRes = await client.post(
            "/vtop/examinations/doSearchExamScheduleForStudent",
            new URLSearchParams({
                authorizedID: String(authorizedID),
                semesterSubId: semesterId ?? "",
                _csrf: String(csrf)
            }).toString(),
            {
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
                },
            }
        );

        const $$$ = cheerio.load(ScheduleRes.data);
        const Schedule: Schedule = {};
        let currentExamType: string | null = null;

        $$$("table.customTable tr").each((i, row) => {
            const tds = $$$(row).find("td");

            if (tds.length === 1 && $$$(tds[0]).attr("colspan") === "13") {
                currentExamType = $$$(tds[0]).text().trim();
                return;
            }

            if ($$$(row).hasClass("tableHeader")) return;
            if(!currentExamType) return;

            if ($$$(row).hasClass("tableContent") && tds.length > 1) {
                const item: ExamItem = {
                    courseCode: $$$(tds[1]).text().trim(),
                    courseTitle: $$$(tds[2]).text().trim(),
                    classId: $$$(tds[4]).text().trim(),
                    slot: $$$(tds[5]).text().trim(),
                    examDate: $$$(tds[6]).text().trim(),
                    examSession: $$$(tds[7]).text().trim(),
                    reportingTime: $$$(tds[8]).text().trim(),
                    examTime: $$$(tds[9]).text().trim(),
                    venue: $$$(tds[10]).text().trim(),
                    seatLocation: $$$(tds[11]).text().trim(),
                    seatNo: $$$(tds[12]).text().trim(),
                };

                if (!Schedule[currentExamType]) {
                    Schedule[currentExamType] = [];
                }
                (Schedule[currentExamType] as ExamItem[]).push(item);
            }
        });

        return res.status(200).json({
            semester: semesterId,
            Schedule: Schedule
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
