import VTOPClient from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { type NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";
import config from '@/app/config.json'
import { RequestBody } from "@/types/custom";
import { ExamItem, Schedule } from "@/types/data/schedule";

export async function POST(req: NextRequest) {
    try {
        const { cookies, dashboardHtml, campus }: RequestBody = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        const semesterId = config.currSemID;
        const client = VTOPClient(campus);

        // Fetch the marks data for the selected semester
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

        // --- Parse Marks Table ---
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

        return NextResponse.json({ semester: semesterId, Schedule: Schedule });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}