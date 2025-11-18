import express, { Application } from "express";
import cors from "cors";
import path from "path";

import statusRoutes from "./routes/status";
import calendarRoutes from "./routes/calendar";
import loginRoutes from "./routes/login";
import captchaRoutes from "./routes/captcha";
import marksRoutes from "./routes/marks";
import hostelRoutes from "./routes/hostel";
import gradesRoutes from "./routes/grades";
import scheduleRoutes from "./routes/schedule";
import attendanceRoutes from "./routes/attendance";
import allGradesRoutes from "./routes/allGrades";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Express TypeScript API is running!");
});

app.use("/api/status", statusRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/all-grades", allGradesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
});
