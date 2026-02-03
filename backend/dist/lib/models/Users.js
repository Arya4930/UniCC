"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const VitolItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    opens: { type: String, required: true },
    done: { type: Boolean, required: true },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    url: { type: String, required: true }
}, { _id: false });
const MoodleItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    due: { type: String, required: true },
    done: { type: Boolean, required: true },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
}, { _id: false });
const FileSchema = new mongoose_1.Schema({
    fileID: { type: String, required: true },
    extension: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
}, { _id: false });
const PushSubscriptionSchema = new mongoose_1.Schema({
    endpoint: { type: String, required: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    UserID: {
        type: String,
        required: true,
        unique: true,
    },
    files: {
        type: [FileSchema],
        default: [],
    },
    pushSubscriptions: {
        type: [PushSubscriptionSchema],
        default: [],
    },
    notifications: {
        enabled: {
            type: Boolean,
            default: false,
        },
        sources: {
            vitol: {
                enabled: { type: Boolean, default: false },
                data: { type: [VitolItemSchema], default: [] },
            },
            moodle: {
                enabled: { type: Boolean, default: false },
                data: { type: [MoodleItemSchema], default: [] },
            },
        },
    },
}, {
    timestamps: true,
});
const User = mongoose_1.default.models.User ||
    (0, mongoose_1.model)('User', UserSchema);
exports.default = User;
//# sourceMappingURL=Users.js.map