import express, { Request, Response } from "express";
import VTOPClient from "../lib/clients/VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import fetchTimetable from "./fetchTimeTable";
import { RequestBody } from "../types/custom";
import { attendanceItem, courseItem } from "../types/data/attendance";
import type { Router } from "express";
import { getMarks } from "./marks";
import { fetchClassStatistics } from "../lib/addClassData";

const router: Router = express.Router();

/**
 * @openapi
 * /api/attendance:
 *   post:
 *     tags:
 *       - Academics
 *     summary: Fetch merged attendance, timetable, and marks for a semester
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
 *                 attRes:
 *                   type: object
 *                   properties:
 *                     semester:
 *                       type: string
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseCode:
 *                             type: string
 *                           courseTitle:
 *                             type: string
 *                           slotName:
 *                             type: string
 *                           faculty:
 *                             type: string
 *                             nullable: true
 *                           attendedClasses:
 *                             type: number
 *                             nullable: true
 *                           totalClasses:
 *                             type: number
 *                             nullable: true
 *                           attendancePercentage:
 *                             type: string
 *                             nullable: true
 *                           credits:
 *                             type: string
 *                             nullable: true
 *                           slotVenue:
 *                             type: string
 *                             nullable: true
 *                           category:
 *                             type: string
 *                             nullable: true
 *                           viewLink:
 *                             oneOf:
 *                               - type: string
 *                               - type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     date:
 *                                       type: string
 *                                     status:
 *                                       type: string
 *                 marksRes:
 *                   type: object
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

function mergeAttendanceWithTimetable(attendance: attendanceItem[], timetable: courseItem[]): attendanceItem[] {
    const merged: attendanceItem[] = [];

    timetable.forEach(tt => {
        const ttCourseCode = tt.courseCode.trim();
        const attEntry = attendance.find(att =>
            (att?.courseCode?.split(" ")[0] ?? "").trim() === ttCourseCode
        );

        const cleanedVenue = tt.slotVenue
            ? (() => {
                const cleaned = tt.slotVenue.replace(/\s+/g, " ").trim();
                const matches = cleaned.match(/[A-Z]+\d*\s*-\s*\d+\s*[A-Z]?/g);
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

router.post("/", async (req: Request, res: Response) => {
    try {
        const { cookies, authorizedID, csrf, semesterId }: RequestBody = req.body;

        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        if (!csrf || !authorizedID)
            throw new Error("Cannot find _csrf or authorizedID");

        const client = VTOPClient();

        const ttRes = await client.post(
            "/vtop/processViewStudentAttendance",
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
                maxRedirects: 0,
                validateStatus: (s) => s < 400 || s === 302,
            }
        );

        const courseInfo: courseItem[] = await fetchTimetable(
            cookieHeader,
            authorizedID,
            csrf,
            (semesterId as string)
        );
        const courseCreditMap: Record<string, number> = {};
        courseInfo.forEach(course => {
            courseCreditMap[course.courseCode.trim()] = parseFloat(course.LTPJC?.split(" ")[4] || "0");
        });

        const marksRes = await getMarks(
            cookieHeader,
            authorizedID,
            csrf,
            semesterId as string,
            client,
            courseCreditMap
        );

        const $$$ = cheerio.load(ttRes.data);
        const attendance: attendanceItem[] = [];

        $$$("#getStudentDetails table#AttendanceDetailDataTable tbody tr").each((i, row) => {
            const cols = $$$(row).find("td");

            if (cols.length < 8) return;

            const courseDetail = cols.eq(2).text().replace(/\s+/g, " ").trim();
            const classDetail = cols.eq(3).text().replace(/\s+/g, " ").trim();
            const courseMatch = courseDetail.match(/^([A-Z0-9]+)\s*-\s*(.+)$/) || "";
            const classMatch = classDetail.match(/^([^-]+)\s*-\s*(.*?)\s*-\s*(.+)$/);
            const onclick = cols.eq(9).find("a").attr("onclick") || null;

            attendance.push({
                slNo: cols.eq(0).text().trim(),
                courseCode: courseMatch
                    ? courseMatch[1] + (courseDetail.includes("Lab Only") ? "(L)" : "(T)")
                    : courseDetail,
                courseTitle: courseMatch?.[2]
                    ?.replace(/\s*-\s*(Theory Only|Lab Only|Soft Skill)$/, "")
                    .trim() || courseDetail,
                courseType: courseDetail.match(/-\s*(Theory Only|Lab Only|Soft Skill)$/)?.[1] || null,
                slotName: classMatch?.[2] || "NILL",
                faculty: cols.eq(4).text().replace(/\s+/g, " ").trim(),
                attendedClasses: parseInt(cols.eq(5).text().trim()) || 0,
                totalClasses: parseInt(cols.eq(6).text().trim()) || 0,
                attendancePercentage: cols.eq(7).text().replace("%", "").trim(),
                viewLink: onclick,

            });
        });

        const mergedAttendance: attendanceItem[] =
            mergeAttendanceWithTimetable(attendance, courseInfo);

        async function fetchDetail(course: attendanceItem): Promise<attendanceItem> {
            if (!course.viewLink || typeof course.viewLink !== "string") return course;

            const match = course.viewLink.match(
                /callStudentAttendanceDetailDisplay\('([^']+)','([^']+)','([^']+)','([^']+)'\)/
            );

            if (!match) return course;

            const [, semesterSubId, studentId, classId, slotName] = match;

            try {
                const attendanceRes = await client.post(
                    "/vtop/processViewAttendanceDetail",
                    new URLSearchParams({
                        _csrf: String(csrf),
                        semesterSubId: String(semesterSubId),
                        registrationNumber: String(studentId),
                        authorizedID: String(authorizedID),
                        x: Date.now().toString(),
                        courseId: String(classId),
                        courseType: String(slotName),
                    }).toString(),
                    {
                        headers: {
                            Cookie: cookieHeader,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        maxRedirects: 0,
                        validateStatus: (s) => s < 400 || s === 302,
                    }
                );

                const $$$ = cheerio.load(attendanceRes.data);
                const detailed: any[] = [];

                $$$("table#StudentAttendanceDetailDataTable tbody tr").each((i, row) => {
                    const cols = $$$(row).find("td");
                    if (cols.length < 5) return;

                    detailed.push({
                        date: cols.eq(1).text().trim(),
                        status: cols.eq(4).text().trim(),
                    });
                });

                course.viewLink = detailed;
            } catch (err: any) {
                console.error(
                    `Failed fetching detail for ${course.courseCode}`,
                    err.message
                );
            }

            return course;
        }

        const detailedAttendance: attendanceItem[] = await Promise.all(
            mergedAttendance.map(fetchDetail)
        );

        return res.status(200).json({ attRes: { semester: semesterId, attendance: detailedAttendance }, marksRes: marksRes });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

router.get("/marks", async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const stats = await fetchClassStatistics(classId);

        if (!stats || stats.mean === undefined) {
            return res.status(404).json({ error: "Class statistics not found" });
        }
        return res.status(200).json(stats);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
