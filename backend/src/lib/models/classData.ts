import mongoose, { Schema, model, Document } from 'mongoose';

export interface IClassData extends Document {
    classID: string;
    includesUsers: string[];
    count: number;
    mean: number;
    m2: number;
}

const ClassDataSchema: Schema<IClassData> = new Schema(
    {
        classID: {
            type: String,
            required: true,
            unique: true,
        },
        includesUsers: {
            type: [String],
            default: [],
        },
        count: {
            type: Number,
            default: 0,
            min: 0,
        },
        mean: {
            type: Number,
            default: 0,
        },
        m2: {
            type: Number,
            default: 0,
            min: 0,
        }
    },
    {
        timestamps: true,
    }
);

const ClassData =
    (mongoose.models.ClassData as mongoose.Model<IClassData>) ||
    model<IClassData>('ClassData', ClassDataSchema);

export default ClassData;
