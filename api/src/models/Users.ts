import mongoose, { Schema, model } from 'mongoose';

const FileSchema = new Schema(
  {
    fileID: { type: String, required: true },
    extension: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const UserSchema = new Schema(
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

const User = mongoose.models?.User || model('User', UserSchema);
export default User;
