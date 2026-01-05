"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.initDB = initDB;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
exports.sequelize = new sequelize_1.Sequelize({
    host: "localhost",
    dialect: "sqlite",
    storage: path_1.default.join(process.cwd(), "route-logs.sqlite"),
    logging: false,
});
async function initDB() {
    try {
        await exports.sequelize.authenticate();
        await exports.sequelize.sync();
        console.log("✅ SQLite connected");
    }
    catch (error) {
        console.error("❌ Unable to connect to SQLite:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=sequalize.js.map