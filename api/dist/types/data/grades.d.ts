export type EffectiveGrade = {
    basketTitle: string;
    distributionType: string;
    creditsEarned: string;
    grade: string;
};
export type CurriculumItem = {
    basketTitle: string;
    creditsRequired: string;
    creditsEarned: string;
};
type GradeCounts = {
    S?: number;
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    E?: number;
    F?: number;
    N?: number;
};
export type CGPA = {
    grades?: GradeCounts;
};
type feedbackCategoryStatus = {
    Curriculum: boolean;
    Course: boolean;
};
export type FeedbackStatus = {
    MidSem: feedbackCategoryStatus;
    EndSem: feedbackCategoryStatus;
};
export {};
//# sourceMappingURL=grades.d.ts.map