"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cleanupExpiredFiles_1 = require("./cleanupExpiredFiles");
const status_1 = __importDefault(require("./routes/status"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const login_1 = __importDefault(require("./routes/login/login"));
const hostel_1 = __importDefault(require("./routes/hostel"));
const grades_1 = __importDefault(require("./routes/grades"));
const schedule_1 = __importDefault(require("./routes/schedule"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const allGrades_1 = __importDefault(require("./routes/allGrades"));
const UploadFile_1 = __importDefault(require("./routes/files/UploadFile"));
const fetchFiles_1 = __importDefault(require("./routes/files/fetchFiles"));
const deleteFile_1 = __importDefault(require("./routes/files/deleteFile"));
const downloadFile_1 = __importDefault(require("./routes/files/downloadFile"));
const FetchLMSdata_1 = __importDefault(require("./routes/FetchLMSdata"));
const mail_1 = __importDefault(require("./routes/files/mail"));
const nodemailer_1 = require("./nodemailer");
const sequalize_1 = require("./sequalize");
const routeLgger_1 = require("./routeLgger");
const stats_1 = __importDefault(require("./routes/stats"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    if (req.path.startsWith("/.") ||
        req.path.includes(".git") ||
        req.path.includes(".env")) {
        return res.sendStatus(404);
    }
    next();
});
app.get("/", (req, res) => {
    res.send("Express TypeScript API is running!");
});
app.use("/api/status", status_1.default);
app.use("/stats", stats_1.default);
app.use("/api/files/fetch", fetchFiles_1.default);
app.use("/api", routeLgger_1.routeLogger);
app.use("/api/calendar", calendar_1.default);
app.use("/api/login", login_1.default);
app.use("/api/hostel", hostel_1.default);
app.use("/api/grades", grades_1.default);
app.use("/api/schedule", schedule_1.default);
app.use("/api/attendance", attendance_1.default);
app.use("/api/all-grades", allGrades_1.default);
app.use("/api/files/upload", UploadFile_1.default);
app.use("/api/files/delete", deleteFile_1.default);
app.use("/api/files/download", downloadFile_1.default);
app.use("/api/lms-data", FetchLMSdata_1.default);
app.use("/api/files/mail", mail_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
    await (0, sequalize_1.initDB)();
    (0, cleanupExpiredFiles_1.startCleanupCron)();
    await (0, nodemailer_1.verifyMailer)();
});
//# sourceMappingURL=server.js.map