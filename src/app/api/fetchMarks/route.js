import { client } from "@/app/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function POST(req) {
    try {
        const { cookies, dashboardHtml } = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        // Get available semesters
        const semRes = await client.post(
            "/vtop/examinations/StudentMarkView",
            new URLSearchParams({
                verifyMenu: "true",
                authorizedID,
                _csrf: csrf,
                nocache: Date.now().toString(),
            }).toString(),
            {
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
                },
            }
        );

        const $$ = cheerio.load(semRes.data);
        const semesters = [];
        $$("#semesterSubId option").each((i, opt) => {
            if (!opt.attribs.value) return;
            semesters.push({ name: $$(opt).text().trim(), id: opt.attribs.value });
        });

        if (semesters.length === 0) throw new Error("No semesters found!");

        const semesterId = semesters[1].id; // As per your code

        // Fetch the marks data for the selected semester
        const marksRes = await client.post(
            "/vtop/examinations/doStudentMarkView",
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

        // --- Parse Marks Table ---
        const $$$ = cheerio.load(marksRes.data);
        const courses = [];

        $$$("table.customTable > tbody > tr.tableContent").each((i, row) => {
            const cols = $$$(row).find("td");
            if (cols.length < 9) return;

            const courseData = {
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

            const nestedTableRow = $$$(row).next('tr.tableContent');
            
            nestedTableRow.find('table.customTable-level1 > tbody > tr.tableContent-level1').each((j, assessmentRow) => {
                const assessmentCols = $$$(assessmentRow).find('td');
                
                courseData.assessments.push({
                    slNo: assessmentCols.eq(0).find('output').text().trim(),
                    title: assessmentCols.eq(1).find('output').text().trim(),
                    maxMark: assessmentCols.eq(2).find('output').text().trim(),
                    weightagePercent: assessmentCols.eq(3).find('output').text().trim(),
                    status: assessmentCols.eq(4).find('output').text().trim(),
                    scoredMark: assessmentCols.eq(5).find('output').text().trim(),
                    weightageMark: assessmentCols.eq(6).find('output').text().trim(),
                });
            });

            // *** CHANGE IS HERE ***
            // Only add the course to our results if it has actual assessments
            if (courseData.assessments.length > 0) {
                courses.push(courseData);
            }
        });

        return NextResponse.json({ semester: semesters[1], marks: courses });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}