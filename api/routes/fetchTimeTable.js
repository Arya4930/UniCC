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
exports.default = fetchTimetable;
const cheerio = __importStar(require("cheerio"));
const VTOPClient_1 = __importDefault(require("../VTOPClient"));
const url_1 = require("url");
const attendance_1 = require("../types/data/attendance");
async function fetchTimetable(cookieHeader, dashboardHtml, semesterId) {
    const $ = cheerio.load(dashboardHtml);
    const csrf = $('input[name="_csrf"]').val();
    const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();
    if (!csrf || !authorizedID)
        throw new Error("Cannot find _csrf or authorizedID");
    const client = (0, VTOPClient_1.default)();
    const ttRes = await client.post("/vtop/processViewTimeTable", new url_1.URLSearchParams({
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
    const $$$ = cheerio.load(ttRes.data);
    // === 1. Parse Course Info Table ===
    const courseInfo = [];
    $$$('table.table').each((i, table) => {
        $$$(table)
            .find('tbody tr')
            .each((j, row) => {
            const cells = $$$(row).find('td');
            if (cells.length === 0)
                return;
            courseInfo.push({
                slNo: $$$(cells[0]).text().trim(),
                course: $$$(cells[2]).text().trim(),
                courseCode: $$$(cells[7]).text().trim().startsWith("L") ? $$$(cells[2]).text().trim().split(" ")[0] + "(L)" : $$$(cells[2]).text().trim().split(" ")[0] + "(T)",
                LTPJC: $$$(cells[3]).text().trim(),
                category: $$$(cells[4]).text().trim(),
                classId: $$$(cells[6]).text().trim(),
                slotVenue: $$$(cells[7]).text().trim(),
                facultyDetails: $$$(cells[8]).text().trim(),
            });
        });
    });
    return courseInfo;
}
//# sourceMappingURL=fetchTimeTable.js.map