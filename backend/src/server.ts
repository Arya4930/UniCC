import express, { Application } from "express";
import cors from "cors";
import { startCleanupCron } from "./lib/cleanupExpiredFiles";

import statusRoutes from "./routes/status";
import calendarRoutes from "./routes/calendar";
import loginRoutes from "./routes/login/login";
import hostelRoutes from "./routes/hostel";
import gradesRoutes from "./routes/grades";
import scheduleRoutes from "./routes/schedule";
import attendanceRoutes from "./routes/attendance";
import allGradesRoutes from "./routes/allGrades";
import UploadFile from "./routes/files/UploadFile";
import fetchFiles from "./routes/files/fetchFiles";
import deleteFile from "./routes/files/deleteFile";
import downloadFile from "./routes/files/downloadFile";
import fetchLMSdata from "./routes/FetchLMSdata";
import fetchVitoldata from "./routes/FetchVitoldata";
import subscribe from "./routes/notifications/subscribe";
import unsubscribe from "./routes/notifications/unsubscribe";
import send from "./routes/notifications/send";
import mail from "./routes/files/mail";
import { verifyMailer } from "./lib/clients/nodemailer";
import { initDB } from "./lib/clients/sequalize";
import { routeLogger, visitorLogger } from "./lib/Logger";
import stats from "./routes/stats";
import webpush from 'web-push'
import { vitolReminder } from "./lib/VitolReminder";

import { swaggerSpec } from "./lib/clients/swagger";
import swaggerUi from "swagger-ui-express";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (
        req.path.startsWith("/.") ||
        req.path.includes(".git") ||
        req.path.includes(".env")
    ) {
        return res.sendStatus(404);
    }
    next();
});

app.get("/", (req, res) => {
    res.send("Express TypeScript API is running!");
});

app.use("/api/status", visitorLogger);
app.use("/api/status", statusRoutes);
app.use("/stats", stats);
app.use("/api/files/fetch", fetchFiles);

app.use("/api", routeLogger);

app.use("/api/calendar", calendarRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/all-grades", allGradesRoutes);
app.use("/api/files/upload", UploadFile);
app.use("/api/files/delete", deleteFile);
app.use("/api/files/download", downloadFile);
app.use("/api/lms-data", fetchLMSdata);
app.use("/api/vitol-data", fetchVitoldata);
app.use("/api/notifications/subscribe", subscribe);
app.use("/api/notifications/unsubscribe", unsubscribe);
app.use("/api/notifications/send", send);
app.use("/api/files/mail/send", mail);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

app.listen(PORT, async () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
    await initDB();
    startCleanupCron();
    await verifyMailer();
    vitolReminder();
});
