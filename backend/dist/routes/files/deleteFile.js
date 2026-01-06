"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("../../lib/clients/mongodb");
const Users_1 = __importDefault(require("../../lib/models/Users"));
const s3_1 = require("../../lib/clients/s3");
const mask_1 = require("../../lib/mask");
const router = express_1.default.Router({ mergeParams: true });
/**
 * @openapi
 * /api/files/delete/{userID}/{fileID}:
 *   delete:
 *     tags:
 *       - Files
 *     security: []
 *     summary: Delete a file belonging to a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *           example: 24BCE1234
 *       - in: path
 *         name: fileID
 *         required: true
 *         schema:
 *           type: string
 *           example: file_abc123
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *                 storageUsed:
 *                   type: number
 *                   example: 5242880
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found
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
router.delete("/:userID/:fileID", async (req, res) => {
    try {
        await (0, mongodb_1.connectDB)();
        const { userID, fileID } = req.params;
        const maskedID = (0, mask_1.maskUserID)(userID.toUpperCase());
        const user = await Users_1.default.findOne({ UserID: maskedID });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const file = user.files.find((f) => f.fileID === fileID);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        try {
            await (0, s3_1.DeleteFromS3)(fileID);
        }
        catch (error) {
            console.error("Error deleting file from S3:", error);
            return res.status(500).json({ error: "Failed to delete file from storage" });
        }
        user.files = user.files.filter((f) => f.fileID !== fileID);
        await user.save();
        const storageUsed = user.files.reduce((acc, f) => acc + f.size, 0);
        res.json({
            message: "File deleted successfully",
            storageUsed,
        });
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=deleteFile.js.map