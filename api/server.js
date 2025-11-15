"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map