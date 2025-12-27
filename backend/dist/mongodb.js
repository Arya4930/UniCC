"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const connectDB = async () => {
    try {
        const { connection } = await mongoose_1.default.connect(process.env.MONGODB_URI);
        if (connection.readyState === 1) {
            return Promise.resolve(true);
        }
    }
    catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=mongodb.js.map