"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../lib/models/Users"));
const mask_1 = require("../../lib/mask");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { UserID, source, enabled, data } = req.body;
    const maskedID = (0, mask_1.maskUserID)(UserID?.toUpperCase() || '');
    if (!['vitol', 'moodle'].includes(source)) {
        return res.status(400).json({ error: 'Invalid source' });
    }
    const update = {
        'notifications.enabled': true,
        [`notifications.sources.${source}.enabled`]: enabled,
    };
    if (enabled && Array.isArray(data)) {
        update[`notifications.sources.${source}.data`] = data;
    }
    if (!enabled) {
        update[`notifications.sources.${source}.data`] = [];
    }
    await Users_1.default.updateOne({ UserID: maskedID }, { $set: update }, { upsert: true });
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=config.js.map