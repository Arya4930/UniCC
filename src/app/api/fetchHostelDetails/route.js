// https://vtopcc.vit.ac.in/vtop/studentsRecord/StudentProfileAllView
// https://vtopcc.vit.ac.in/vtop/hostels/student/leave/6
import { client } from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function POST(req) {
    try {
        const { cookies, dashboardHtml } = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        const hostelRes = await client.post(
            "/vtop/studentsRecord/StudentProfileAllView",
            new URLSearchParams({
                verifyMenu: "true",
                authorizedID,
                _csrf: csrf,
                nocache: Date.now().toString(),
            }).toString(),
            {
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
                },
            }
        );

        await client.post(
            "/vtop/hostels/student/leave/1",
            new URLSearchParams({
                verifyMenu: "true",
                authorizedID,
                _csrf: csrf,
                nocache: Date.now().toString(),
            }).toString(),
            {
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
                },
            }
        );

        const leaveRes = await client.post(
            "/vtop/hostels/student/leave/6",
            new URLSearchParams({
                history: "",
                authorizedID,
                _csrf: csrf,
                form: "undefined",
                control: "history",
                x: Date.now().toString(),
            }).toString(),
            {
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://vtopcc.vit.ac.in/vtop/hostels/student/leave/1",
                },
            }
        );
        const $$ = cheerio.load(hostelRes.data);
        const $$$ = cheerio.load(leaveRes.data);
        const leaveRows = $$$("#LeaveHistoryTable tbody tr");

        let hostelInfo = {};
        const leaveHistory = [];

        $$("table tr").each((_, row) => {
            const cols = $$(row).find("td");
            if (cols.length < 2) return;

            const label = cols.eq(0).text().trim();
            const value = cols.eq(1).text().trim();

            if (label.includes("GENDER")) {
                hostelInfo.gender = value;
            } else if (label.includes("HOSTELLER")) {
                hostelInfo.isHosteller = value === "HOSTELLER" ? true : false;
            }
            if (label.includes("Block Name")) {
                hostelInfo.blockName = value.split(' ')[0];
            } else if (label.includes("Room No")) {
                hostelInfo.roomNo = value;
            } else if (label.includes("Mess Information")) {
                hostelInfo.messInfo = value.split(' ')[0];
                if (hostelInfo.length > 7) {
                    if (hostelInfo.messInfo === "NON") {
                        hostelInfo.messInfo = "NON VEG";
                    } else if (hostelInfo.messInfo === "FOOD") {
                        hostelInfo.messInfo = "FOOD PARK"
                    } else {
                        hostelInfo.messInfo = "NOT ALLOTED"
                    }
                }
            }
        });

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
                leaveHistory.push(leave);
            }
        });

        return NextResponse.json({ hostelInfo, leaveHistory });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
