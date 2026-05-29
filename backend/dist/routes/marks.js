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
exports.getMarks = getMarks;
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const addClassData_1 = __importDefault(require("../lib/addClassData"));
const mask_1 = require("../lib/mask");
function parseFiniteNumber(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}
function getACEComponentType(courseType) {
    if (courseType === "Embedded Theory")
        return "theory";
    if (courseType === "Embedded Lab")
        return "lab";
    return null;
}
function validateCourseComponent(course) {
    if (course.assessments.length === 0)
        return null;
    let totalWeightage = 0;
    let totalWeightageMark = 0;
    for (const assessment of course.assessments) {
        const weightagePercent = parseFiniteNumber(assessment.weightagePercent);
        const weightageMark = parseFiniteNumber(assessment.weightageMark);
        if (weightagePercent === null || weightageMark === null) {
            return null;
        }
        totalWeightage += weightagePercent;
        totalWeightageMark += weightageMark;
    }
    const finalAssessment = course.assessments[course.assessments.length - 1];
    const finalAssessmentScore = parseFiniteNumber(finalAssessment?.scoredMark ?? "");
    const finalAssessmentMax = parseFiniteNumber(finalAssessment?.maxMark ?? "");
    // Keep the original FAT gating, but make the comparisons safe for floating-point input.
    // Use 40% of the final assessment's max marks as the gate instead of an absolute 40 points.
    const finalAssessmentPercent = finalAssessmentScore === null || finalAssessmentMax === null || finalAssessmentMax <= 0
        ? null
        : (finalAssessmentScore / finalAssessmentMax) * 100;
    if (!finalAssessment ||
        finalAssessment.title !== "Final Assessment Test" ||
        finalAssessmentPercent === null ||
        finalAssessmentPercent <= 40 ||
        Math.abs(totalWeightage - 100) > 0.01) {
        return null;
    }
    return {
        totalWeightage,
        totalWeightageMark,
    };
}
async function getMarks(cookies, authorizedID, csrf, semesterId, client, courseCreditMap) {
    try {
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        const marksRes = await client.post("/vtop/examinations/doStudentMarkView", new url_1.URLSearchParams({
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
        const $$$ = cheerio.load(marksRes.data);
        const courses = [];
        $$$("table.customTable > tbody > tr.tableContent").each((i, row) => {
            const cols = $$$(row).find("td");
            if (cols.length < 9)
                return;
            const courseCode = cols.eq(2).text().trim();
            const slot = cols.eq(7).text().trim();
            const isLab = slot.startsWith("L");
            // Prefer the most likely credit key for this component, but fall back to the other if missing.
            const primaryKey = `${courseCode}(${isLab ? "L" : "T"})`;
            const creditsValue = courseCreditMap[primaryKey] ?? 0;
            const courseData = {
                slNo: cols.eq(0).text().trim(),
                classNbr: cols.eq(1).text().trim(),
                courseCode,
                credits: creditsValue,
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
        const aceGroups = new Map();
        for (const course of courses) {
            if (course.courseSystem === "CBCS" && course.courseType === "Theory Only") {
                const validatedComponent = validateCourseComponent(course);
                if (validatedComponent) {
                    await (0, addClassData_1.default)(course.classNbr, (0, mask_1.maskUserID)(authorizedID), Math.ceil(validatedComponent.totalWeightageMark));
                }
                continue;
            }
            if (course.courseSystem !== "ACE") {
                continue;
            }
            const componentType = getACEComponentType(course.courseType);
            if (!componentType) {
                continue;
            }
            const groupedCourse = aceGroups.get(course.courseCode) ?? {};
            groupedCourse[componentType] = course;
            aceGroups.set(course.courseCode, groupedCourse);
        }
        for (const [courseCode, groupedCourse] of aceGroups) {
            const theoryComponent = groupedCourse.theory;
            const labComponent = groupedCourse.lab;
            if (!theoryComponent || !labComponent) {
                continue;
            }
            const validatedTheory = validateCourseComponent(theoryComponent);
            const validatedLab = validateCourseComponent(labComponent);
            if (!validatedTheory || !validatedLab) {
                continue;
            }
            const theoryCredits = courseCreditMap[`${courseCode}(T)`] ?? 0;
            const labCredits = courseCreditMap[`${courseCode}(L)`] ?? 0;
            const totalCredits = theoryCredits + labCredits;
            if (totalCredits <= 0) {
                continue;
            }
            // Weighted aggregation combines the validated theory and lab marks using their separate credits.
            const finalMark = ((validatedTheory.totalWeightageMark * theoryCredits) + (validatedLab.totalWeightageMark * labCredits)) /
                totalCredits;
            // Use the theory component's classNbr as the identifier for class statistics
            const classIdentifier = theoryComponent?.classNbr;
            await (0, addClassData_1.default)(classIdentifier, (0, mask_1.maskUserID)(authorizedID), Math.ceil(finalMark));
        }
        const creditsRes = await client.post("/vtop/get/dashboard/current/cgpa/credits", new url_1.URLSearchParams({
            authorizedID,
            _csrf: csrf,
            x: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        });
        const $$$$ = cheerio.load(creditsRes.data);
        const cgpa = {};
        $$$$(".list-group-item").each((_, el) => {
            const label = $$$$("span.card-title", el).text().trim();
            const value = $$$$("span.fontcolor3 span", el).text().trim();
            if (label.includes("Total Credits Required"))
                cgpa.creditsRequired = value;
            else if (label.includes("Earned Credits"))
                cgpa.creditsEarned = value;
            else if (label.includes("Current CGPA"))
                cgpa.cgpa = value;
            else if (label.includes("Non-graded Core Requirement"))
                cgpa.nonGradedRequirement = value;
        });
        return { courses, cgpa };
    }
    catch (err) {
        console.error(err);
        return err.message;
    }
}
//# sourceMappingURL=marks.js.map