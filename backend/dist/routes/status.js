"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/**
 * @openapi
 * /api/status:
 *   get:
 *     tags:
 *       - System
 *     summary: Check API health status
 *     description: >
 *       Simple health check endpoint used to verify that the API server
 *       is running and reachable.
 *     responses:
 *       200:
 *         description: API is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   example: API is working
 */
router.get("/", (req, res) => {
    res.status(200).json({ text: "API is working" });
});
exports.default = router;
//# sourceMappingURL=status.js.map