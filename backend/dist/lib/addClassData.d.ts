export interface IClassStatistics {
    mean: number;
    variance: number;
    sd: number;
    count: number;
}
export default function AddClassData(classID: string, userId: string, marks: number): Promise<IClassStatistics | undefined>;
export declare const fetchClassStatistics: (classID: string) => Promise<IClassStatistics>;
//# sourceMappingURL=addClassData.d.ts.map