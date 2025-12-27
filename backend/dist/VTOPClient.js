"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VTOPClient;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const agent = new https_1.default.Agent({ rejectUnauthorized: false });
const ChennaiClient = axios_1.default.create({
    baseURL: "https://vtopcc.vit.ac.in",
    headers: {
        "User-Agent": "Mozilla/5.0 ...",
        Accept: "text/html,application/xhtml+xml",
    },
    httpsAgent: agent,
    withCredentials: true,
});
function VTOPClient() {
    return ChennaiClient;
}
//# sourceMappingURL=VTOPClient.js.map