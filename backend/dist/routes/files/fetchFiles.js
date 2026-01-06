"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../lib/models/Users"));
const mongodb_1 = require("../../lib/clients/mongodb");
const mask_1 = require("../../lib/mask");
const router = express_1.default.Router({ mergeParams: true });
/**
 * @openapi
 * /api/files/fetch/{userID}:
 *   get:
 *     tags:
 *       - Files
 *     security: []
 *     summary: Fetch all active files for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *           example: 24BCE1234
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fileID:
 *                     type: string
 *                     example: file_abc123
 *                   name:
 *                     type: string
 *                     example: notes.pdf
 *                   size:
 *                     type: number
 *                     example: 245760
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-01-20T12:00:00.000Z
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/:userID", async (req, res) => {
    try {
        await (0, mongodb_1.connectDB)();
        const { userID } = req.params;
        const maskedID = (0, mask_1.maskUserID)(userID.toUpperCase());
        let user = await Users_1.default.findOne({ UserID: maskedID });
        if (!user) {
            return res.json([]);
        }
        const now = new Date();
        user.files = user.files.filter(file => file.expiresAt > now);
        await user.save();
        res.json(user.files);
    }
    catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=fetchFiles.js.map