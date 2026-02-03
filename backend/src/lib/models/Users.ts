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

interface IVitolItem {
  name: string;
  opens: string;
  done: boolean;
  day: number;
  month: number;
  year: number;
  url: string;
  hidden: boolean;
}

interface IMoodleItem {
  name: string;
  due: string;
  done: boolean;
  day: number;
  month: number;
  year: number;
}


const VitolItemSchema: Schema<IVitolItem> = new Schema(
  {
    name: { type: String, required: true },
    opens: { type: String, required: true },
    done: { type: Boolean, required: true },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const MoodleItemSchema: Schema<IMoodleItem> = new Schema(
  {
    name: { type: String, required: true },
    due: { type: String, required: true },
    done: { type: Boolean, required: true },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

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
    notifications: {
      enabled: {
        type: Boolean,
        default: false,
      },
      sources: {
        vitol: {
          enabled: { type: Boolean, default: false },
          data: { type: [VitolItemSchema], default: [] },
        },
        moodle: {
          enabled: { type: Boolean, default: false },
          data: { type: [MoodleItemSchema], default: [] },
        },
      },
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
