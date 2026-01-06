import VTOPClient from "../lib/clients/VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import { CourseItem, CGPA } from "../types/data/marks";

export async function getMarks(cookies: string[] | string, authorizedID: string, csrf: string, semesterId: string, client: ReturnType<typeof VTOPClient>): Promise<{ courses: CourseItem[]; cgpa: CGPA } | string> {
    try {
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const marksRes = await client.post(
            "/vtop/examinations/doStudentMarkView",
            new URLSearchParams({
                authorizedID: String(authorizedID),
                semesterSubId: semesterId ?? "",
                _csrf: String(csrf),
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

        const $$$ = cheerio.load(marksRes.data);
        const courses: CourseItem[] = [];

        $$$("table.customTable > tbody > tr.tableContent").each((i, row) => {
            const cols = $$$(row).find("td");
            if (cols.length < 9) return;

            const courseData: CourseItem = {
                slNo: cols.eq(0).text().trim(),
                classNbr: cols.eq(1).text().trim(),
                courseCode: cols.eq(2).text().trim(),
                courseTitle: cols.eq(3).text().trim(),
                courseType: cols.eq(4).text().trim(),
                courseSystem: cols.eq(5).text().trim(),
                faculty: cols.eq(6).text().trim().replace(/\s+/g, " "),
                slot: cols.eq(7).text().trim(),
                courseMode: cols.eq(8).text().trim(),
                assessments: [],
            };

            const nestedTableRow = $$$(row).next("tr.tableContent");

            nestedTableRow
                .find("table.customTable-level1 > tbody > tr.tableContent-level1")
                .each((j, assessmentRow) => {
                    const assessmentCols = $$$(assessmentRow).find("td");

                    courseData.assessments.push({
                        slNo: assessmentCols.eq(0).find("output").text().trim(),
                        title: assessmentCols.eq(1).find("output").text().trim(),
                        maxMark: assessmentCols.eq(2).find("output").text().trim(),
                        weightagePercent: assessmentCols.eq(3).find("output").text().trim(),
                        status: assessmentCols.eq(4).find("output").text().trim(),
                        scoredMark: assessmentCols.eq(5).find("output").text().trim(),
                        weightageMark: assessmentCols.eq(6).find("output").text().trim(),
                    });
                });

            if (courseData.assessments.length > 0) {
                courses.push(courseData);
            }
        });

        const creditsRes = await client.post(
            "/vtop/get/dashboard/current/cgpa/credits",
            new URLSearchParams({
                authorizedID,
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

        const $$$$ = cheerio.load(creditsRes.data);
        const cgpa: CGPA = {};

        $$$$(".list-group-item").each((_, el) => {
            const label = $$$$("span.card-title", el).text().trim();
            const value = $$$$("span.fontcolor3 span", el).text().trim();

            if (label.includes("Total Credits Required")) cgpa.creditsRequired = value;
            else if (label.includes("Earned Credits")) cgpa.creditsEarned = value;
            else if (label.includes("Current CGPA")) cgpa.cgpa = value;
            else if (label.includes("Non-graded Core Requirement"))
                cgpa.nonGradedRequirement = value;
        });

        return { courses, cgpa };
    } catch (err: any) {
        console.error(err);
        return err.message;
    }
}
