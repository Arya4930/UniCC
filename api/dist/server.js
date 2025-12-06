"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const status_1 = __importDefault(require("./routes/status"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const login_1 = __importDefault(require("./routes/login"));
const captcha_1 = __importDefault(require("./routes/captcha"));
const marks_1 = __importDefault(require("./routes/marks"));
const hostel_1 = __importDefault(require("./routes/hostel"));
const grades_1 = __importDefault(require("./routes/grades"));
const schedule_1 = __importDefault(require("./routes/schedule"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const allGrades_1 = __importDefault(require("./routes/allGrades"));
const UploadFile_1 = __importDefault(require("./routes/files/UploadFile"));
const fetchFiles_1 = __importDefault(require("./routes/files/fetchFiles"));
const deleteFile_1 = __importDefault(require("./routes/files/deleteFile"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Express TypeScript API is running!");
});
app.use("/api/status", status_1.default);
app.use("/api/calendar", calendar_1.default);
app.use("/api/login", login_1.default);
app.use("/api/captcha", captcha_1.default);
app.use("/api/marks", marks_1.default);
app.use("/api/hostel", hostel_1.default);
app.use("/api/grades", grades_1.default);
app.use("/api/schedule", schedule_1.default);
app.use("/api/attendance", attendance_1.default);
app.use("/api/all-grades", allGrades_1.default);
app.use("/api/files/upload/:userID", UploadFile_1.default);
app.use("/api/files/fetch/:userID", fetchFiles_1.default);
app.use("/api/files/delete/:userID/:fileID", deleteFile_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map