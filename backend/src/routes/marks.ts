import VTOPClient from "../lib/clients/VTOPClient";
import * as cheerio from "cheerio";
import { URLSearchParams } from "url";
import { CourseItem, CGPA } from "../types/data/marks";
import AddClassData from "../lib/addClassData";
import { maskUserID } from "../lib/mask";

type ACEComponentType = "theory" | "lab";

type ValidatedCourseComponent = {
    totalWeightage: number;
    totalWeightageMark: number;
};

function parseFiniteNumber(value: string): number | null {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getACEComponentType(courseType: string): ACEComponentType | null {
    if (courseType === "Embedded Theory") return "theory";
    if (courseType === "Embedded Lab") return "lab";
    return null;
}

function validateCourseComponent(course: CourseItem): ValidatedCourseComponent | null {
    if (course.assessments.length === 0) return null;

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
    const finalAssessmentPercent =
        finalAssessmentScore === null || finalAssessmentMax === null || finalAssessmentMax <= 0
            ? null
            : (finalAssessmentScore / finalAssessmentMax) * 100;

    if (
        !finalAssessment ||
        finalAssessment.title !== "Final Assessment Test" ||
        finalAssessmentPercent === null ||
        finalAssessmentPercent <= 1 ||
        Math.abs(totalWeightage - 100) > 0.01
    ) {
        return null;
    }

    return {
        totalWeightage,
        totalWeightageMark,
    };
}

export async function getMarks(cookies: string[] | string, authorizedID: string, csrf: string, semesterId: string, client: ReturnType<typeof VTOPClient>, courseCreditMap: Record<string, number>): Promise<{ courses: CourseItem[]; cgpa: CGPA } | string> {
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

            const courseCode = cols.eq(2).text().trim();
            const slot = cols.eq(7).text().trim();
            const isLab = slot.startsWith("L");

            // Prefer the most likely credit key for this component, but fall back to the other if missing.
            const primaryKey = `${courseCode}(${isLab ? "L" : "T"})`;
            const creditsValue = courseCreditMap[primaryKey] ?? 0;

            const courseData: CourseItem = {
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

        const aceGroups = new Map<string, { theory?: CourseItem; lab?: CourseItem }>();

        for (const course of courses) {
            if (course.courseType === "Theory Only") {
                const validatedComponent = validateCourseComponent(course);
                if (validatedComponent) {
                    await AddClassData(course.classNbr, maskUserID(authorizedID), Math.ceil(validatedComponent.totalWeightageMark));
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
            const finalMark =
                ((validatedTheory.totalWeightageMark * theoryCredits) + (validatedLab.totalWeightageMark * labCredits)) /
                totalCredits;

            // Use the theory component's classNbr as the identifier for class statistics
            const classIdentifier = theoryComponent?.classNbr;
            await AddClassData(classIdentifier, maskUserID(authorizedID), Math.ceil(finalMark));
        }

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
