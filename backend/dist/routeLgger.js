"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeLogger = routeLogger;
const RouteLog_1 = require("./models/RouteLog");
async function routeLogger(req, res, next) {
    res.on("finish", async () => {
        try {
            if (req.originalUrl === "/favicon.ico")
                return;
            await RouteLog_1.RouteLog.create({
                method: req.method,
                route: req.originalUrl,
            });
        }
        catch (err) {
            console.error("Route log failed:", err);
        }
    });
    next();
}
//# sourceMappingURL=routeLgger.js.map