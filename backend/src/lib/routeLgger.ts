import { Request, Response, NextFunction } from "express";
import { RouteLog } from "./models/RouteLog";

function normalizeRoute(url: string) {
    const path = url.split("?")[0] || "undefined";

    if (path.startsWith("/api/files/")) {
        const parts = path.split("/").filter(Boolean);
        // parts example:
        // ["api","files","download","userID","fileID"]

        if (parts.length === 4) {
            return `/api/files/${parts[2]}/:userID`;
        }

        if (parts.length === 5) {
            return `/api/files/${parts[2]}/:userID/:fileID`;
        }

        return `/api/files/${parts[2]}`;
    }

    return path
        // Mongo ObjectId / hashes
        .replace(/[a-f0-9]{24}/gi, ":id")
        // numeric IDs
        .replace(/\b\d+\b/g, ":id")
        // user IDs like 24BCE5274
        .replace(/\b[A-Z]{2}\d{5,}\b/g, ":userID");
}

function getSourceDomain(req: Request): string {
    const origin = req.headers.origin;
    if (typeof origin === "string") {
        try {
            return new URL(origin).hostname;
        } catch {}
    }

    const referer = req.headers.referer;
    if (typeof referer === "string") {
        try {
            return new URL(referer).hostname;
        } catch {}
    }

    return "unknown";
}

const routes = ["/api/calendar", "/api/login", "/api/hostel", "/api/grades", "/api/schedule", "/api/attendance", 
    "/api/all-grades", "/api/files/upload/:userID", "/api/files/delete/:userID/:fileID", "/api/files/download/:userID/:fileID", 
    "/api/lms-data", "/api/files/mail/send"];

export async function routeLogger(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.on("finish", async () => {
        try {
            if (req.originalUrl === "/favicon.ico") return;

            let normalizedRoute = normalizeRoute(req.originalUrl);
            const sourceDomain = getSourceDomain(req);

            if (!routes.includes(normalizedRoute)) {
                normalizedRoute = "unknown"
            }

            await RouteLog.create({
                method: req.method,
                route: normalizedRoute,
                source: sourceDomain,
            });
        } catch (err) {
            console.error("Route log failed:", err);
        }
    });

    next();
}