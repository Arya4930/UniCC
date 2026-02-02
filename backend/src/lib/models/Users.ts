import mongoose, { Schema, model, Document } from 'mongoose';

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

const FileSchema: Schema<IFile> = new Schema(
  {
    fileID: { type: String, required: true },
    extension: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    UserID: {
      type: String,
      required: true,
      unique: true,
    },
    files: {
      type: [FileSchema],
      default: [],
    },
    pushSubscriptions: {
      type: [PushSubscriptionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  model<IUser>('User', UserSchema);

export default User;
