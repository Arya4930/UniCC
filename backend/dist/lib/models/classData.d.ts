import mongoose, { Document } from 'mongoose';
export interface IClassData extends Document {
    classID: string;
    includesUsers: string[];
    count: number;
    mean: number;
    m2: number;
}
declare const ClassData: mongoose.Model<IClassData, {}, {}, {}, mongoose.Document<unknown, {}, IClassData, {}, mongoose.DefaultSchemaOptions> & IClassData & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IClassData>;
export default ClassData;
//# sourceMappingURL=classData.d.ts.map