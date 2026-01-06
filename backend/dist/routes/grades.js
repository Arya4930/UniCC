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
const VTOPClient_1 = __importDefault(require("../lib/clients/VTOPClient"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const router = express_1.default.Router();
/**
 * @openapi
 * /api/grades:
 *   post:
 *     tags:
 *       - Academics
 *     summary: Fetch grade summary, curriculum progress, CGPA distribution, and feedback status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cookies
 *               - authorizedID
 *               - csrf
 *               - semesterId
 *             properties:
 *               cookies:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *               authorizedID:
 *                 type: string
 *                 example: 24BCE1234
 *               csrf:
 *                 type: string
 *               semesterId:
 *                 type: string
 *                 example: CH20242501
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 effectiveGrades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       basketTitle:
 *                         type: string
 *                       distributionType:
 *                         type: string
 *                       creditsEarned:
 *                         type: string
 *                       grade:
 *                         type: string
 *                 curriculum:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       basketTitle:
 *                         type: string
 *                       creditsRequired:
 *                         type: string
 *                       creditsEarned:
 *                         type: string
 *                 cgpa:
 *                   type: object
 *                   properties:
 *                     grades:
 *                       type: object
 *                       properties:
 *                         S: { type: number }
 *                         A: { type: number }
 *                         B: { type: number }
 *                         C: { type: number }
 *                         D: { type: number }
 *                         E: { type: number }
 *                         F: { type: number }
 *                         N: { type: number }
 *                 feedback:
 *                   type: object
 *                   properties:
 *                     MidSem:
 *                       type: object
 *                       properties:
 *                         Curriculum: { type: boolean }
 *                         Course: { type: boolean }
 *                     EndSem:
 *                       type: object
 *                       properties:
 *                         Curriculum: { type: boolean }
 *                         Course: { type: boolean }
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/", async (req, res) => {
    try {
        const { cookies, authorizedID, csrf, semesterId } = req.body;
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        if (!csrf || !authorizedID) {
            throw new Error("Cannot find _csrf or authorizedID");
        }
        const client = (0, VTOPClient_1.default)();
        const gradeRes = await client.post("/vtop/examinations/examGradeView/StudentGradeHistory", new url_1.URLSearchParams({
            verifyMenu: "true",
            authorizedID,
            _csrf: csrf,
            nocache: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        });
        const $$ = cheerio.load(gradeRes.data);
        const effectiveGrades = [];
        $$("#fixedTableContainer table")
            .eq(1)
            .find("tr.tableContent")
            .each((_, el) => {
            const tds = $$(el).find("td");
            effectiveGrades.push({
                basketTitle: $$(tds[2]).text().trim(),
                distributionType: $$(tds[3]).text().trim(),
                creditsEarned: $$(tds[4]).text().trim(),
                grade: $$(tds[5]).text().trim(),
            });
        });
        const curriculum = [];
        $$("#fixedTableContainer table")
            .eq(4)
            .find("tr.tableContent")
            .each((_, el) => {
            const tds = $$(el).find("td");
            curriculum.push({
                basketTitle: $$(tds[0]).text().trim(),
                creditsRequired: $$(tds[1]).text().trim(),
                creditsEarned: $$(tds[2]).text().trim(),
            });
        });
        $$("#fixedTableContainer table")
            .eq(5)
            .find("tr.tableContent")
            .each((_, el) => {
            const tds = $$(el).find("td");
            curriculum.push({
                basketTitle: $$(tds[0]).text().trim(),
                creditsRequired: $$(tds[2]).text().trim(),
                creditsEarned: $$(tds[3]).text().trim(),
            });
        });
        const cgpa = {};
        const cgpaRow = $$("table.table.table-hover.table-bordered tbody tr").first();
        if (cgpaRow.length) {
            const tds = cgpaRow.find("td");
            cgpa.grades = {
                S: parseInt($$(tds[3]).text().trim()),
                A: parseInt($$(tds[4]).text().trim()),
                B: parseInt($$(tds[5]).text().trim()),
                C: parseInt($$(tds[6]).text().trim()),
                D: parseInt($$(tds[7]).text().trim()),
                E: parseInt($$(tds[8]).text().trim()),
                F: parseInt($$(tds[9]).text().trim()),
                N: parseInt($$(tds[10]).text().trim()),
            };
        }
        const feedbackRes = await client.post("/vtop/processViewFeedBackStatus", new url_1.URLSearchParams({
            authorizedID: String(authorizedID),
            semesterSubId: semesterId ?? "",
            _csrf: String(csrf),
            x: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        });
        const $$$ = cheerio.load(feedbackRes.data);
        const isGiven = (text) => !text.toLowerCase().includes("not");
        const feedback = {
            MidSem: {
                Curriculum: isGiven($$$("tbody tr").eq(0).find("td").eq(1).text()),
                Course: isGiven($$$("tbody tr").eq(1).find("td").eq(1).text()),
            },
            EndSem: {
                Curriculum: isGiven($$$("tbody tr").eq(0).find("td").eq(2).text()),
                Course: isGiven($$$("tbody tr").eq(1).find("td").eq(2).text()),
            },
        };
        return res.status(200).json({
            effectiveGrades,
            curriculum,
            cgpa,
            feedback,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=grades.js.map