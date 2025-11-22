import express, { Request, Response } from "express";
import VTOPClient from "../VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import { RequestBody } from "../types/custom";
import { GradeItem, GradeResultsMap } from "../types/data/allgrades";
import type { Router } from "express";

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { cookies, dashboardHtml }: RequestBody = req.body;

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf: any = $('input[name="_csrf"]').val();
        const authorizedID: any =
            $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        let startYear: number = 2024;
        if (typeof authorizedID === "string") {
            startYear = parseInt(authorizedID.slice(0, 2), 10) + 2000;
        }

        const currentYear = new Date().getFullYear();
        const semesters: string[] = [];

        for (let year = startYear; year <= currentYear; year++) {
            const next = (year + 1).toString().slice(-2);
            semesters.push(`CH${year}${next}01`);
            semesters.push(`CH${year}${next}05`);
        }

        const client = VTOPClient();

        async function fetchGradeDetail(
            grade: GradeItem,
            semId: string
        ): Promise<GradeItem> {
            if (!grade.courseId) {
                grade.details = null;
                return grade;
            }

            try {
                const form = new URLSearchParams({
                    authorizedID,
                    semesterSubId: semId,
                    courseId: grade.courseId,
                    _csrf: csrf,
                    x: new Date().toUTCString(),
                }).toString();

                const detailRes = await client.post(
                    "/vtop/examinations/examGradeView/getGradeViewDetails",
                    form,
                    {
                        headers: {
                            Cookie: cookieHeader,
                            "Content-Type": "application/x-www-form-urlencoded",
                            Referer:
                                "https://vtopcc.vit.ac.in/vtop/examinations/examGradeView/StudentGradeView",
                        },
                    }
                );

                const $$$ = cheerio.load(detailRes.data);

                const rangeTable = $$$("table.table-striped")
                    .filter((_, el) => $$$(el).text().includes("Range of Grades"))
                    .first();

                if (rangeTable.length) {
                    const cells = rangeTable.find("tr").eq(2).find("td span");

                    if (cells.length >= 7) {
                        grade.range = {
                            S: $$$(cells[0]).text().trim(),
                            A: $$$(cells[2]).text().trim(),
                            B: $$$(cells[3]).text().trim(),
                            C: $$$(cells[4]).text().trim(),
                            D: $$$(cells[5]).text().trim(),
                            E: $$$(cells[6]).text().trim(),
                            F: $$$(cells[7]).text().trim(),
                        };
                    }
                }

                const detailTable = $$$("table.table-striped")
                    .filter((_, el) => $$$(el).text().includes("Mark Title"))
                    .first();

                const breakdown: any[] = [];

                detailTable.find("tr").slice(2, -1).each((_, row) => {
                    const tds = $$$(row).find("td, output");
                    if (tds.length < 7) return;

                    const clean = (i: number) =>
                        $$$(tds[i]).text().replace(/\s+/g, " ").trim();

                    breakdown.push({
                        slNo: clean(0),
                        component: clean(2),
                        maxMark: clean(4),
                        weightagePercent: clean(6),
                        status: clean(8),
                        scoredMark: clean(10),
                        weightageMark: clean(12),
                    });
                });

                grade.details = breakdown.length ? breakdown : null;
            } catch {
                grade.details = null;
            }

            return grade;
        }

        async function fetchSemester(semId: string) {
            try {
                const form = new URLSearchParams({
                    authorizedID,
                    semesterSubId: semId,
                    _csrf: csrf,
                    x: Date.now().toString(),
                }).toString();

                const resGrades = await client.post(
                    "/vtop/examinations/examGradeView/doStudentGradeView",
                    form,
                    {
                        headers: {
                            Cookie: cookieHeader,
                            "Content-Type": "application/x-www-form-urlencoded",
                            Referer:
                                "https://vtopcc.vit.ac.in/vtop/examinations/examGradeView/StudentGradeView",
                        },
                    }
                );

                const $$ = cheerio.load(resGrades.data);
                const rows = $$("table.table-bordered tr").slice(2);

                if (rows.length === 0) return null;

                let gpa = null;
                const grades: GradeItem[] = [];

                rows.each((_, row) => {
                    const cols = $$(row).find("td");

                    if ($$(row).attr("align") === "center") {
                        const txt = $$(row).text().trim();
                        const match = txt.match(/GPA\s*:\s*([\d.]+)/i);
                        if (match) gpa = match[1];
                        return;
                    }

                    if (cols.length < 11) return;

                    const btn = cols
                        .eq(11)
                        .find('button[onclick^="javascript:getGradeViewDetails"]');
                    const onclick = btn.attr("onclick");
                    const courseId =
                        onclick?.match(/getGradeViewDetails\('([^']+)'\)/)?.[1] || null;

                    grades.push({
                        slNo: cols.eq(0).text().trim(),
                        courseCode: cols.eq(1).text().trim(),
                        courseTitle: cols.eq(2).text().trim(),
                        courseType: cols.eq(3).text().trim(),
                        grandTotal: cols.eq(9).text().trim(),
                        grade: cols.eq(10).text().trim(),
                        courseId,
                    });
                });

                const detailed = await Promise.all(grades.map((g) => fetchGradeDetail(g, semId)));

                return { gpa, grades: detailed };
            } catch (err) {
                console.warn(`Error fetching semester ${semId}:`, err);
                return null;
            }
        }

        const resultsArray = await Promise.all(semesters.map(fetchSemester));

        const output: GradeResultsMap = {};
        semesters.forEach((semId, i) => {
            output[semId] = resultsArray[i];
        });

        return res.status(200).json({ grades: output });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
