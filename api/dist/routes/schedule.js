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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VTOPClient_1 = __importDefault(require("../VTOPClient"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        const { cookies, dashboardHtml, semesterId } = req.body;
        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();
        if (!csrf || !authorizedID)
            throw new Error("Cannot find _csrf or authorizedID");
        const client = (0, VTOPClient_1.default)();
        const ScheduleRes = await client.post("/vtop/examinations/doSearchExamScheduleForStudent", new url_1.URLSearchParams({
            authorizedID,
            semesterSubId: semesterId,
            _csrf: csrf,
            x: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        });
        const $$$ = cheerio.load(ScheduleRes.data);
        const Schedule = {};
        let currentExamType = null;
        $$$("table.customTable tr").each((i, row) => {
            const tds = $$$(row).find("td");
            if (tds.length === 1 && $$$(tds[0]).attr("colspan") === "13") {
                currentExamType = $$$(tds[0]).text().trim();
                return;
            }
            if ($$$(row).hasClass("tableHeader"))
                return;
            if ($$$(row).hasClass("tableContent") && tds.length > 1) {
                const item = {
                    courseCode: $$$(tds[1]).text().trim(),
                    courseTitle: $$$(tds[2]).text().trim(),
                    classId: $$$(tds[4]).text().trim(),
                    slot: $$$(tds[5]).text().trim(),
                    examDate: $$$(tds[6]).text().trim(),
                    examSession: $$$(tds[7]).text().trim(),
                    reportingTime: $$$(tds[8]).text().trim(),
                    examTime: $$$(tds[9]).text().trim(),
                    venue: $$$(tds[10]).text().trim(),
                    seatLocation: $$$(tds[11]).text().trim(),
                    seatNo: $$$(tds[12]).text().trim(),
                };
                if (!Schedule[currentExamType]) {
                    Schedule[currentExamType] = [];
                }
                Schedule[currentExamType].push(item);
            }
        });
        return res.status(200).json({
            semester: semesterId,
            Schedule: Schedule
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=schedule.js.map