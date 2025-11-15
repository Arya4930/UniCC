import express, { Request, Response } from "express";
import VTOPClient from "../VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import { RequestBody } from "../types/custom";
import { ExamItem, Schedule } from "../types/data/schedule";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { cookies, dashboardHtml, semesterId }: RequestBody = req.body;

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf: any = $('input[name="_csrf"]').val();
        const authorizedID: any =
            $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID)
            throw new Error("Cannot find _csrf or authorizedID");

        const client = VTOPClient();

        const ScheduleRes = await client.post(
            "/vtop/examinations/doSearchExamScheduleForStudent",
            new URLSearchParams({
                authorizedID,
                semesterSubId: semesterId,
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
                Schedule[currentExamType].push(item);
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
