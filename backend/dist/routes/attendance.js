"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VTOPClient_1 = __importDefault(require("../VTOPClient"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const fetchTimeTable_1 = __importDefault(require("./fetchTimeTable"));
const marks_1 = require("./marks");
const router = express_1.default.Router();
function mergeAttendanceWithTimetable(attendance, timetable) {
    const merged = [];
    timetable.forEach(tt => {
        const ttCourseCode = tt.courseCode.trim();
        const attEntry = attendance.find(att => (att?.courseCode?.split(" ")[0] ?? "").trim() === ttCourseCode);
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
        }
        else {
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
router.post("/", async (req, res) => {
    try {
        const { cookies, dashboardHtml, semesterId } = req.body;
        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();
        if (!csrf || !authorizedID)
            throw new Error("Cannot find _csrf or authorizedID");
        const client = (0, VTOPClient_1.default)();
        const marksRes = await (0, marks_1.getMarks)(cookieHeader, dashboardHtml, semesterId, client);
        const ttRes = await client.post("/vtop/processViewStudentAttendance", new url_1.URLSearchParams({
            authorizedID: String(authorizedID),
            semesterSubId: semesterId ?? "",
            _csrf: String(csrf),
            x: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        });
        const courseInfo = await (0, fetchTimeTable_1.default)(cookieHeader, dashboardHtml, semesterId);
        const $$$ = cheerio.load(ttRes.data);
        const attendance = [];
        $$$("#getStudentDetails table tbody tr").each((i, row) => {
            const cols = $$$(row).find("td");
            if (cols.length < 10)
                return;
            attendance.push({
                slNo: cols.eq(0).text().trim(),
                courseCode: cols.eq(4).text().trim().startsWith("L")
                    ? cols.eq(1).text().trim() + "(L)"
                    : cols.eq(1).text().trim() + "(T)",
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
        const mergedAttendance = mergeAttendanceWithTimetable(attendance, courseInfo);
        async function fetchDetail(course) {
            if (!course.viewLink || typeof course.viewLink !== "string")
                return course;
            const match = course.viewLink.match(/processViewAttendanceDetail\('([^']+)','([^']+)'\)/);
            if (!match)
                return course;
            const [, classId, slotName] = match;
            try {
                const attendanceRes = await client.post("/vtop/processViewAttendanceDetail", new url_1.URLSearchParams({
                    _csrf: String(csrf),
                    authorizedID: String(authorizedID),
                    x: Date.now().toString(),
                    classId: String(classId),
                    slotName: String(slotName),
                }).toString(), {
                    headers: {
                        Cookie: cookieHeader,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                const $$$ = cheerio.load(attendanceRes.data);
                const detailed = [];
                $$$("table.table tr").each((i, row) => {
                    if (i === 0)
                        return;
                    const cols = $$$(row).find("td");
                    if (cols.length < 5)
                        return;
                    detailed.push({
                        date: cols.eq(1).text().trim(),
                        status: cols.eq(4).text().trim(),
                    });
                });
                course.viewLink = detailed;
            }
            catch (err) {
                console.error(`Failed fetching detail for ${course.courseCode}`, err.message);
            }
            return course;
        }
        const detailedAttendance = await Promise.all(mergedAttendance.map(fetchDetail));
        return res.status(200).json({ attRes: { semester: semesterId, attendance: detailedAttendance }, marksRes: marksRes });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map