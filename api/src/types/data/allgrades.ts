export type GradeBreakdown = {
    slNo: string;
    component: string;
    maxMark: string;
    weightagePercent: string;
    status: string;
    scoredMark: string;
    weightageMark: string;
};

export type GradeRange = {
    S: string;
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
} | null;

export type GradeItem = {
    slNo: string;
    courseCode: string;
    courseTitle: string;
    courseType: string;
    grandTotal: string;
    grade: string;
    courseId: string | null;
    details?: GradeBreakdown[] | null;
    range?: GradeRange;
};

export type SemesterGradeResult = {
    gpa: string | null;
    grades: GradeItem[];
} | null;

export type GradeResultsMap = Record<string, SemesterGradeResult>;

export type SettledSemesterResult =
    | { status: "fulfilled"; value: SemesterGradeResult }
    | { status: "rejected"; reason: any };

export type AllGradesRes = {
    semesterId?: string;
    grades?: GradeResultsMap;
    error?: string;
};