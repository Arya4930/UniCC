"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeLogger = routeLogger;
const RouteLog_1 = require("./models/RouteLog");
function normalizeRoute(url) {
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
async function routeLogger(req, res, next) {
    res.on("finish", async () => {
        try {
            if (req.originalUrl === "/favicon.ico")
                return;
            const normalizedRoute = normalizeRoute(req.originalUrl);
            await RouteLog_1.RouteLog.create({
                method: req.method,
                route: normalizedRoute,
            });
            const logs = await RouteLog_1.RouteLog.findAll();
            for (const log of logs) {
                const normalized = normalizeRoute(log.route);
                if (log.route !== normalized) {
                    log.route = normalized;
                    await log.save();
                }
            }
        }
        catch (err) {
            console.error("Route log failed:", err);
        }
    });
    next();
}
//# sourceMappingURL=routeLgger.js.map