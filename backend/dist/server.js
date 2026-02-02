"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cleanupExpiredFiles_1 = require("./lib/cleanupExpiredFiles");
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
const FetchVitoldata_1 = __importDefault(require("./routes/FetchVitoldata"));
const subscribe_1 = __importDefault(require("./routes/notifications/subscribe"));
const unsubscribe_1 = __importDefault(require("./routes/notifications/unsubscribe"));
const send_1 = __importDefault(require("./routes/notifications/send"));
const mail_1 = __importDefault(require("./routes/files/mail"));
const nodemailer_1 = require("./lib/clients/nodemailer");
const sequalize_1 = require("./lib/clients/sequalize");
const Logger_1 = require("./lib/Logger");
const stats_1 = __importDefault(require("./routes/stats"));
const web_push_1 = __importDefault(require("web-push"));
const VitolReminder_1 = require("./lib/VitolReminder");
const swagger_1 = require("./lib/clients/swagger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
app.use("/api/status", Logger_1.visitorLogger);
app.use("/api/status", status_1.default);
app.use("/stats", stats_1.default);
app.use("/api/files/fetch", fetchFiles_1.default);
app.use("/api", Logger_1.routeLogger);
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
app.use("/api/vitol-data", FetchVitoldata_1.default);
app.use("/api/notifications/subscribe", subscribe_1.default);
app.use("/api/notifications/unsubscribe", unsubscribe_1.default);
app.use("/api/notifications/send", send_1.default);
app.use("/api/files/mail/send", mail_1.default);
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
const PORT = process.env.PORT || 3000;
web_push_1.default.setVapidDetails(process.env.VAPID_SUBJECT, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
app.listen(PORT, async () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
    await (0, sequalize_1.initDB)();
    (0, cleanupExpiredFiles_1.startCleanupCron)();
    await (0, nodemailer_1.verifyMailer)();
    (0, VitolReminder_1.vitolReminder)();
});
//# sourceMappingURL=server.js.map