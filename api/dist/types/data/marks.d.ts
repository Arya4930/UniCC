export type CourseItem = {
    slNo: string;
    classNbr: string;
    courseCode: string;
    courseTitle: string;
    courseType: string;
    courseSystem: string;
    faculty: string;
    slot: string;
    courseMode: string;
    assessments: AssessmentItem[];
};
export type AssessmentItem = {
    slNo: string;
    title: string;
    maxMark: string;
    weightagePercent: string;
    status: string;
    scoredMark: string;
    weightageMark: string;
};
export type CGPA = {
    creditsRequired?: string;
    creditsEarned?: string;
    cgpa?: string;
    nonGradedRequirement?: string;
};
//# sourceMappingURL=marks.d.ts.map