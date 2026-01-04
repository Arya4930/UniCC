import { Request, Response, NextFunction } from "express";
import { RouteLog } from "./models/RouteLog";

export async function routeLogger(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.on("finish", async () => {
        try {
            if (req.originalUrl === "/favicon.ico") return;
            await RouteLog.create({
                method: req.method,
                route: req.originalUrl,
            });
        } catch (err) {
            console.error("Route log failed:", err);
        }
    });

    next();
}
