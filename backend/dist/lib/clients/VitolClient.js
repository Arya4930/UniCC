"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getVitolClient;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const agent = new https_1.default.Agent({ rejectUnauthorized: false });
const VitolClient = axios_1.default.create({
    baseURL: "https://vitolcc.vit.ac.in/",
    httpsAgent: agent,
    withCredentials: true,
});
const VitolClient2 = axios_1.default.create({
    baseURL: "https://vitolcc1.vit.ac.in/",
    httpsAgent: agent,
    withCredentials: true,
});
function getVitolClient(site) {
    if (site === "vitolcc1") {
        return VitolClient2;
    }
    return VitolClient;
}
//# sourceMappingURL=VitolClient.js.map