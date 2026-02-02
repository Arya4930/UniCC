import mongoose, { Document } from 'mongoose';
interface IFile {
    fileID: string;
    extension: string;
    name: string;
    size: number;
    expiresAt: Date;
}
interface IPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    createdAt: Date;
}
interface IUser extends Document {
    UserID: string;
    files: IFile[];
    pushSubscriptions: IPushSubscription[];
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IUser>;
export default User;
//# sourceMappingURL=Users.d.ts.map