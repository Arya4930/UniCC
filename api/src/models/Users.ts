import mongoose, { Schema, model } from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

const User = (mongoose.models.User as mongoose.Model<IUser>) || model<IUser>('User', UserSchema);
export default User;
