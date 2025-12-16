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
        const { cookies, dashboardHtml } = req.body;
        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();
        if (!csrf || !authorizedID) {
            throw new Error("Cannot find _csrf or authorizedID");
        }
        const client = (0, VTOPClient_1.default)();
        const hostelRes = await client.post("/vtop/studentsRecord/StudentProfileAllView", new url_1.URLSearchParams({
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
        await client.post("/vtop/hostels/student/leave/1", new url_1.URLSearchParams({
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
        const leaveRes = await client.post("/vtop/hostels/student/leave/6", new url_1.URLSearchParams({
            history: "",
            authorizedID,
            _csrf: csrf,
            form: "undefined",
            control: "history",
            x: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/hostels/student/leave/1",
            },
        });
        const activeLeaveRes = await client.post("/vtop/hostels/student/leave/4", new url_1.URLSearchParams({
            status: "",
            authorizedID,
            _csrf: csrf,
            form: "undefined",
            control: "status",
            x: Date.now().toString(),
        }).toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/hostels/student/leave/1",
            },
        });
        const $$ = cheerio.load(hostelRes.data);
        const $$$ = cheerio.load(leaveRes.data);
        const $$$_ = cheerio.load(activeLeaveRes.data);
        const leaveRows = $$$("#LeaveHistoryTable tbody tr");
        const appliedLeaveRows = $$$_("#LeaveAppliedTable tbody tr");
        let hostelInfo = {};
        $$("table tr").each((_, row) => {
            const cols = $$(row).find("td");
            if (cols.length < 2)
                return;
            const label = cols.eq(0).text().trim();
            const value = cols.eq(1).text().trim();
            if (label.includes("GENDER")) {
                hostelInfo.gender = value;
            }
            else if (label.includes("HOSTELLER")) {
                hostelInfo.isHosteller = value === "HOSTELLER";
            }
            if (label.includes("Block Name")) {
                hostelInfo.blockName = value.split(" ")[0] || "NOT ALLOTED";
            }
            else if (label.includes("Room No")) {
                hostelInfo.roomNo = value;
            }
            else if (label.includes("Mess Information")) {
                hostelInfo.messInfo = value.split(" ")[0] || "NOT ALLOTED";
                if (hostelInfo.messInfo.length > 7) {
                    if (hostelInfo.messInfo === "NON")
                        hostelInfo.messInfo = "NON VEG";
                    else if (hostelInfo.messInfo === "FOOD")
                        hostelInfo.messInfo = "FOOD PARK";
                    else
                        hostelInfo.messInfo = "NOT ALLOTED";
                }
            }
        });
        const leaveMap = new Map();
        leaveRows.each((_, row) => {
            const cells = $$$(row).find("td");
            if (cells.length >= 8) {
                const leave = {
                    leaveId: $$$(cells[1]).text().trim(),
                    visitPlace: $$$(cells[2]).text().trim(),
                    reason: $$$(cells[3]).text().trim(),
                    leaveType: $$$(cells[4]).text().trim(),
                    from: $$$(cells[5]).text().trim(),
                    to: $$$(cells[6]).text().trim(),
                    status: $$$(cells[7]).text().trim(),
                    remarks: $$$(cells[8]).text().trim(),
                };
                leaveMap.set(leave.leaveId, leave);
            }
        });
        appliedLeaveRows.each((_, row) => {
            const cells = $$$_(row).find("td");
            if (cells.length >= 9) {
                const leave = {
                    leaveId: $$$_(cells[2]).text().trim(),
                    visitPlace: $$$_(cells[3]).text().trim(),
                    reason: $$$_(cells[4]).text().trim(),
                    leaveType: $$$_(cells[5]).text().trim(),
                    from: $$$_(cells[6]).text().trim(),
                    to: $$$_(cells[7]).text().trim(),
                    status: $$$_(cells[8]).text().trim(),
                    remarks: $$$_(cells[9]).text().trim(),
                };
                leaveMap.set(leave.leaveId, leave);
            }
        });
        const leaveHistory = Array.from(leaveMap.values());
        return res.status(200).json({ hostelInfo, leaveHistory });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=hostel.js.map