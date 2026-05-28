"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchClassStatistics = void 0;
exports.default = AddClassData;
const classData_1 = __importDefault(require("./models/classData"));
const mongodb_1 = require("./clients/mongodb");
function getStatistics(data) {
    const variance = data.count > 0 ? data.m2 / data.count : 0;
    return {
        mean: data.mean,
        variance,
        sd: Math.sqrt(variance),
        count: data.count,
    };
}
async function AddClassData(classID, userId, marks) {
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
        await (0, mongodb_1.connectDB)();
        const existingClassData = await classData_1.default.findOne({ classID });
        if (!existingClassData) {
            const newClassData = await classData_1.default.create({
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
        const legacyExistingClassData = existingClassData;
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
    }
    catch (error) {
        throw new Error(`Failed to add class data for classID "${classID}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
const fetchClassStatistics = async (classID) => {
    if (!classID.trim()) {
        throw new Error('classID is required.');
    }
    try {
        await (0, mongodb_1.connectDB)();
        const classData = await classData_1.default.findOne({ classID });
        if (!classData) {
            throw new Error(`No data found for classID "${classID}".`);
        }
        return getStatistics(classData);
    }
    catch (error) {
        throw new Error(`Failed to fetch class statistics for classID "${classID}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.fetchClassStatistics = fetchClassStatistics;
//# sourceMappingURL=addClassData.js.map