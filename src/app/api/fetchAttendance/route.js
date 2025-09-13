import { client } from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { URLSearchParams } from "url";
import fetchTimetable from "./fetchTimeTable";

function mergeAttendanceWithTimetable(attendance, timetable) {
    return attendance.map(att => {
        const attCourseCode = att.courseCode.split(" ")[0].trim();

        const ttEntry = timetable.find(tt => {
            const ttCourseCode = tt.course.split(" ")[0].trim();
            return ttCourseCode === attCourseCode;
        });

        if (ttEntry) {
            return {
                ...att,
                classId: ttEntry.classId,
                credits: ttEntry.LTPJC?.split(" ")[4] || null,
                slotVenue: ttEntry.slotVenue
                    ? ttEntry.slotVenue.replace(/\s+/g, " ").trim().match(/[A-Z]+\d*-\d+/)?.[0] || null
                    : null,
                category: ttEntry.category,
            };
        } else {
            return att;
        }
    });
}

export async function POST(req) {
    try {
        const { cookies, dashboardHtml } = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        // Get semesters
        const semRes = await client.post(
            "/vtop/academics/common/StudentAttendance",
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

        const semesterId = semesters[0].id;
        const ttRes = await client.post(
            "/vtop/processViewStudentAttendance",
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
        const tt = await fetchTimetable(cookieHeader, dashboardHtml);

        // --- Parse Attendance Table ---
        const $$$ = cheerio.load(ttRes.data);
        const attendance = [];

        $$$("#getStudentDetails table tbody tr").each(async (i, row) => {
            const cols = $$$(row).find("td");

            if (cols.length < 10) return; // skip invalid rows

            attendance.push({
                slNo: cols.eq(0).text().trim(),
                courseCode: cols.eq(1).text().trim(),
                courseTitle: cols.eq(2).text().trim(),
                courseType: cols.eq(3).text().trim(),
                slotName: cols.eq(4).text().trim(),
                faculty: cols.eq(5).text().replace(/\s+/g, " ").trim(),
                registrationDate: cols.eq(7).text().trim(),
                attendanceDate: cols.eq(8).text().trim(),
                attendedClasses: cols.eq(9).text().trim(),
                totalClasses: cols.eq(10).text().trim(),
                attendancePercentage: cols.eq(11).text().trim(),
                viewLink: cols.eq(13).find("a").attr("onclick") || null,
            });
        });
        const mergedAttendance = mergeAttendanceWithTimetable(attendance, tt.courseInfo);
        for (const course of mergedAttendance) {
            if (!course.viewLink) continue;

            const match = course.viewLink.match(/processViewAttendanceDetail\('([^']+)','([^']+)'\)/);
            if (!match) continue;

            const [, classId, slotName] = match;

            const attendanceRes = await client.post(
                "/vtop/processViewAttendanceDetail",
                new URLSearchParams({
                    _csrf: csrf,
                    authorizedID,
                    x: Date.now().toString(),
                    classId,
                    slotName,
                }).toString(),
                { headers: { Cookie: cookieHeader, "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const $$$ = cheerio.load(attendanceRes.data);
            const detailed = [];

            $$$("table.table tr").each((i, row) => {
                if (i === 0) return;
                const cols = $$$(row).find("td");
                if (cols.length < 5) return;

                detailed.push({
                    date: cols.eq(1).text().trim(),
                    status: cols.eq(4).text().trim(),
                });
            });

            course.viewLinkData = detailed;
        }

        return NextResponse.json({ semester: semesters[0], attendance: mergedAttendance });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
