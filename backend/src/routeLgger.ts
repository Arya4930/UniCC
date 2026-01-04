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

export async function routeLogger(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.on("finish", async () => {
        try {
            if (req.originalUrl === "/favicon.ico") return;

            const normalizedRoute = normalizeRoute(req.originalUrl);

            await RouteLog.create({
                method: req.method,
                route: normalizedRoute,
            });
            // temp code will remove later
            const logs = await RouteLog.findAll();

            for (const log of logs) {
                const normalized = normalizeRoute(log.route);
                if (log.route !== normalized) {
                    log.route = normalized;
                    await log.save();
                }
            }
        } catch (err) {
            console.error("Route log failed:", err);
        }
    });

    next();
}
