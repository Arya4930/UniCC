"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const agent = new https_1.default.Agent({ rejectUnauthorized: false });
const LMSClient = axios_1.default.create({
    baseURL: "https://lms.vit.ac.in",
    httpsAgent: agent,
    withCredentials: true,
});
exports.default = LMSClient;
//# sourceMappingURL=LMSClient.js.map