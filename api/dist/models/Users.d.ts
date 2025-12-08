import mongoose from 'mongoose';
interface IFile {
    fileID: string;
    extension: string;
    name: string;
    size: number;
    expiresAt: Date;
}
interface IUser extends Document {
    UserID: string;
    files: IFile[];
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any, IUser>;
export default User;
//# sourceMappingURL=Users.d.ts.map