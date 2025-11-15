import express, { Request, Response } from "express";
import VTOPClient from "../VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import pLimit from "p-limit";
import { RequestBody } from "../types/custom";
import { GradeItem, GradeResultsMap } from "../types/data/allgrades";

const router = express.Router();
const limit = pLimit(4);

router.post("/", async (req: Request, res: Response) => {
    try {
        const { cookies, dashboardHtml }: RequestBody = req.body;

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf: any = $('input[name="_csrf"]').val();
        const authorizedID: any =
            $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        let startYear: number = 2024;
        if (typeof authorizedID === "string")
            startYear = parseInt(authorizedID.slice(0, 2), 10) + 2000;

        const currentYear = new Date().getFullYear();
        const semesters: string[] = [];

        for (let year = startYear; year <= currentYear; year++) {
            semesters.push(`CH${year}${(year + 1).toString().slice(-2)}01`);
            semesters.push(`CH${year}${(year + 1).toString().slice(-2)}05`);
        }

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        const client = VTOPClient();

        const fetchSemesterGrades = async (semId: string) => {
            try {
                const form = new URLSearchParams({
                    authorizedID,
                    semesterSubId: semId,
                    _csrf: csrf,
                    x: Date.now().toString(),
                }).toString();

                const resGrades = await client.post(
                    "/vtop/examinations/examGradeView/doStudentGradeView",
                    form.toString(),
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

                const grades: GradeItem[] = [];
                let gpa = null;

                rows.each((i, row) => {
                    const cols = $$(row).find("td");

                    if ($$(row).attr("align") === "center") {
                        const text = $$(row).text().trim();
                        const match = text.match(/GPA\s*:\s*([\d.]+)/i);
                        if (match) gpa = match[1];
                        return;
                    }

                    if (cols.length < 11) return;

                    const button = cols
                        .eq(11)
                        .find('button[onclick^="javascript:getGradeViewDetails"]');
                    const onclick = button.attr("onclick");
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

                const detailedGrades = await Promise.allSettled(
                    grades.map((grade) =>
                        limit(async () => {
                            if (!grade.courseId) {
                                grade.details = null;
                                return grade;
                            }

                            try {
                                const detailsForm = new URLSearchParams({
                                    authorizedID,
                                    semesterSubId: semId,
                                    courseId: grade.courseId,
                                    _csrf: csrf,
                                    x: new Date().toUTCString(),
                                }).toString();

                                const detailRes = await client.post(
                                    "/vtop/examinations/examGradeView/getGradeViewDetails",
                                    detailsForm.toString(),
                                    {
                                        headers: {
                                            Cookie: cookieHeader,
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            Referer:
                                                "https://vtopcc.vit.ac.in/vtop/examinations/examGradeView/StudentGradeView",
                                        },
                                    }
                                );

                                const $$$$ = cheerio.load(detailRes.data);

                                const rangeTable = $$$$("table.table-striped")
                                    .filter((_, el) =>
                                        $$$$(el).text().includes("Range of Grades")
                                    )
                                    .first();

                                let gradeRange = null;

                                if (rangeTable.length) {
                                    const rows = rangeTable.find("tr");
                                    const cells = rows.eq(2).find("td span");

                                    if (cells.length >= 7) {
                                        gradeRange = {
                                            S: $$$$(cells[0]).text().trim(),
                                            A: $$$$(cells[2]).text().trim(),
                                            B: $$$$(cells[3]).text().trim(),
                                            C: $$$$(cells[4]).text().trim(),
                                            D: $$$$(cells[5]).text().trim(),
                                            E: $$$$(cells[6]).text().trim(),
                                            F: $$$$(cells[7]).text().trim(),
                                        };
                                    }
                                }

                                const detailTable = $$$$("table.table-striped")
                                    .filter((_, el) =>
                                        $$$$(el).text().includes("Mark Title")
                                    )
                                    .first();

                                const breakdown: any[] = [];

                                detailTable
                                    .find("tr")
                                    .slice(2, -1)
                                    .each((_, row) => {
                                        const tds = $$$$(row).find("td, output");
                                        if (tds.length < 7) return;

                                        const clean = (i: number) =>
                                            $$$$(tds[i])
                                                .text()
                                                .replace(/\s+/g, " ")
                                                .trim();

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
                                grade.range = gradeRange;
                                return grade;
                            } catch {
                                grade.details = null;
                                return grade;
                            }
                        })
                    )
                );

                return {
                    gpa,
                    grades: detailedGrades
                        .map((r) => (r.status === "fulfilled" ? r.value : null))
                        .filter(Boolean),
                };
            } catch (err: any) {
                console.warn(`Error fetching ${semId}:`, err.message);
                return null;
            }
        };

        const semesterResults = await Promise.allSettled(
            semesters.map((semId) => limit(() => fetchSemesterGrades(semId)))
        );

        const results: GradeResultsMap = {};
        semesters.forEach((semId, i) => {
            results[semId] =
                semesterResults[i].status === "fulfilled"
                    ? semesterResults[i].value
                    : null;
        });

        return res.status(200).json({ grades: results });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
