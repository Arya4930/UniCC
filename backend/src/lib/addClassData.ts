import ClassData, { IClassData } from './models/classData';
import { connectDB } from './clients/mongodb';

export interface IClassStatistics {
    mean: number;
    variance: number;
    sd: number;
    count: number;
}

type LegacyClassData = IClassData & {
    sd?: number;
};

function getStatistics(data: Pick<IClassData, 'count' | 'mean' | 'm2'>): IClassStatistics {
    const variance = data.count > 0 ? data.m2 / data.count : 0;

    return {
        mean: data.mean,
        variance,
        sd: Math.sqrt(variance),
        count: data.count,
    };
}

export default async function AddClassData(classID: string, userId: string, marks: number) {
    if (!classID.trim()) {
        throw new Error('classID is required.');
    }

    if (!userId.trim()) {
        throw new Error('userId is required.');
    }

    if (!Number.isFinite(marks)) {
        throw new Error('marks must be a finite number.');
    }

    try {
        await connectDB();

        const existingClassData = await ClassData.findOne({ classID });

        if (!existingClassData) {
            const newClassData = await ClassData.create({
                classID,
                includesUsers: [userId],
                count: 1,
                mean: marks,
                m2: 0,
            });

            return getStatistics(newClassData);
        }

        // Prevent duplicate users from mutating class statistics.
        if (existingClassData.includesUsers.includes(userId)) {
            return getStatistics(existingClassData);
        }

        const legacyExistingClassData = existingClassData as LegacyClassData;

        // Backfill count/m2 for records created before the Welford refactor.
        if (!Number.isFinite(existingClassData.count) || existingClassData.count < 0) {
            existingClassData.count = existingClassData.includesUsers.length;
        }

        if (!Number.isFinite(existingClassData.m2) || existingClassData.m2 < 0) {
            const legacySd = Number.isFinite(legacyExistingClassData.sd) ? legacyExistingClassData.sd : 0;
            existingClassData.m2 = ((legacySd || 0) ** 2) * existingClassData.count;
        }

        const oldCount = existingClassData.count;
        const newCount = oldCount + 1;

        // Welford's online update keeps running mean/variance numerically stable.
        const delta = marks - existingClassData.mean;
        const updatedMean = existingClassData.mean + delta / newCount;
        const delta2 = marks - updatedMean;
        const updatedM2 = existingClassData.m2 + delta * delta2;

        existingClassData.includesUsers.push(userId);
        existingClassData.count = newCount;
        existingClassData.mean = updatedMean;
        existingClassData.m2 = updatedM2;

        await existingClassData.save();
    } catch (error) {
        throw new Error(
            `Failed to add class data for classID "${classID}": ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

export const fetchClassStatistics = async (classID: string): Promise<IClassStatistics> => {
    if (!classID.trim()) {
        throw new Error('classID is required.');
    }
    try {
        await connectDB();

        const classData = await ClassData.findOne({ classID });

        if (!classData) {
            throw new Error(`No data found for classID "${classID}".`);
        }
        return getStatistics(classData);
    } catch (error) {
        throw new Error(
            `Failed to fetch class statistics for classID "${classID}": ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};