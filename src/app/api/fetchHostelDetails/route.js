// https://vtopcc.vit.ac.in/vtop/studentsRecord/StudentProfileAllView
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

        const $$ = cheerio.load(hostelRes.data);

        let hostelInfo = {};

        $$("table tr").each((_, row) => {
            const cols = $$(row).find("td");
            if (cols.length < 2) return;

            const label = cols.eq(0).text().trim();
            const value = cols.eq(1).text().trim();

            if(label.includes("GENDER")) {
                hostelInfo.gender = value;
            } else if(label.includes("HOSTELLER")) {
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

        return NextResponse.json({ hostelInfo });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
