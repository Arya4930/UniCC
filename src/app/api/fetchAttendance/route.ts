import VTOPClient from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";
import fetchTimetable from "./fetchTimeTable";
import config from "@/app/config.json"
import { RequestBody } from "@/types/custom";
import { attendanceItem, courseItem } from "@/types/data/attendance";

function mergeAttendanceWithTimetable(attendance: attendanceItem[], timetable: courseItem[]): attendanceItem[] {
    const merged: attendanceItem[] = [];

    timetable.forEach(tt => {
        const ttCourseCode = tt.courseCode.trim();
        const attEntry = attendance.find(att =>
            att.courseCode.split(" ")[0].trim() === ttCourseCode
        );

        const cleanedVenue = tt.slotVenue
            ? (() => {
                const cleaned = tt.slotVenue.replace(/\s+/g, " ").trim();
                const matches = cleaned.match(/[A-Z]+\d*\s*-\s*\d+/g);
                return matches ? matches[matches.length - 1] : null;
            })()
            : null;

        if (attEntry) {
            merged.push({
                ...attEntry,
                classId: tt.classId,
                credits: tt.LTPJC?.split(" ")[4] || null,
                slotVenue: cleanedVenue,
                category: tt.category || null,
            });
        } else {
            merged.push({
                slNo: null,
                courseCode: tt.courseCode,
                courseTitle: tt.course,
                courseType: null,
                slotName: "NILL",
                faculty: tt.facultyDetails || null,
                registrationDate: null,
                attendanceDate: null,
                attendedClasses: null,
                totalClasses: null,
                attendancePercentage: null,
                viewLink: null,
                classId: tt.classId,
                credits: tt.LTPJC?.split(" ")[4] || null,
                slotVenue: cleanedVenue,
                category: tt.category || null,
            });
        }
    });
    return merged;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { cookies, dashboardHtml, semesterId }: RequestBody = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        const client = VTOPClient();

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
        const courseInfo: courseItem[] = await fetchTimetable(cookieHeader, dashboardHtml, semesterId);

        // --- Parse Attendance Table ---
        const $$$ = cheerio.load(ttRes.data);
        const attendance: attendanceItem[] = [];

        $$$("#getStudentDetails table tbody tr").each((i, row) => {
            const cols = $$$(row).find("td");

            if (cols.length < 10) return; // skip invalid rows

            attendance.push({
                slNo: cols.eq(0).text().trim(),
                courseCode: cols.eq(4).text().trim().startsWith("L") ? cols.eq(1).text().trim() + "(L)" : cols.eq(1).text().trim() + "(T)",
                courseTitle: cols.eq(2).text().trim(),
                courseType: cols.eq(3).text().trim(),
                slotName: cols.eq(4).text().trim(),
                faculty: cols.eq(5).text().replace(/\s+/g, " ").trim(),
                registrationDate: cols.eq(7).text().trim(),
                attendanceDate: cols.eq(8).text().trim(),
                attendedClasses: parseInt(cols.eq(9).text().trim()),
                totalClasses: parseInt(cols.eq(10).text().trim()),
                attendancePercentage: cols.eq(11).text().trim(),
                viewLink: cols.eq(13).find("a").attr("onclick") || null,
            });
        });
        const mergedAttendance: attendanceItem[] = mergeAttendanceWithTimetable(attendance, courseInfo);

        async function fetchDetail(course: attendanceItem): Promise<attendanceItem> {
            if (!course.viewLink || typeof course.viewLink !== "string") return course;

            const match = course.viewLink.match(/processViewAttendanceDetail\('([^']+)','([^']+)'\)/);
            if (!match) return course;

            const [, classId, slotName] = match;

            try {
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

                course.viewLink = detailed;
            } catch (err) {
                console.error(`Failed fetching detail for ${course.courseCode}`, err.message);
            }

            return course;
        }

        const detailedAttendance: attendanceItem[] = await Promise.all(mergedAttendance.map(fetchDetail));


        return NextResponse.json({ semester: semesterId, attendance: detailedAttendance });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
