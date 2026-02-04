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
    notifications: {
        enabled: boolean;
        sources: {
            vitol?: {
                enabled: boolean;
                data: IVitolItem[];
            };
            moodle?: {
                enabled: boolean;
                data: IMoodleItem[];
            };
        };
    };
}
type ReminderMap = Map<string, boolean>;
interface IVitolItem {
    name: string;
    opens: string;
    done: boolean;
    day: number;
    month: number;
    year: number;
    url: string;
    hidden: boolean;
    reminders: ReminderMap;
}
interface IMoodleItem {
    name: string;
    due: string;
    done: boolean;
    day: number;
    month: number;
    year: number;
    hidden: boolean;
    reminders: ReminderMap;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IUser>;
export default User;
//# sourceMappingURL=Users.d.ts.map