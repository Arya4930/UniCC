export type EffectiveGrade = {
  basketTitle: string;
  distributionType: string;
  creditsRequired: string;
  creditsEarned: string;
}

export type CurriculumItem = {
  basketTitle: string;
  creditsRequired: string;
  creditsEarned: string;
}

type GradeCounts = {
  S?: number;
  A?: number;
  B?: number;
  C?: number;
  D?: number;
  E?: number;
  F?: number;
  N?: number;
}

export type CGPA = {
  grades?: GradeCounts;
}
