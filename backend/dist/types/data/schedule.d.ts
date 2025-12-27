export interface ExamItem {
    courseCode: string;
    courseTitle: string;
    classId: string;
    slot: string;
    examDate: string;
    examSession: string;
    reportingTime: string;
    examTime: string;
    venue: string;
    seatLocation: string;
    seatNo: string;
}
export type Schedule = Record<string, ExamItem[]>;
//# sourceMappingURL=schedule.d.ts.map