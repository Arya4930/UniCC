// https://vtopcc.vit.ac.in/vtop/examinations/examGradeView/StudentGradeHistory
import VTOPClient from "@/lib/VTOPClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function POST(req) {
    try {
        const { cookies, dashboardHtml, campus } = await req.json();

        const $ = cheerio.load(dashboardHtml);
        const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

        const csrf = $('input[name="_csrf"]').val();
        const authorizedID = $('#authorizedID').val() || $('input[name="authorizedid"]').val();

        if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

        const client = VTOPClient(campus);

        const gradeRes = await client.post(
            "/vtop/examinations/examGradeView/StudentGradeHistory",
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

        const $$ = cheerio.load(gradeRes.data);
        const effectiveGrades = [];
        $$("#fixedTableContainer table")
            .eq(1)
            .find("tr.tableContent")
            .each((_, el) => {
                const tds = $$(el).find("td");
                effectiveGrades.push({
                    basketTitle: $$(tds[0]).text().trim(),
                    distributionType: $$(tds[1]).text().trim(),
                    creditsRequired: $$(tds[2]).text().trim(),
                    creditsEarned: $$(tds[3]).text().trim(),
                });
            });
        const curriculum = [];
        $$("#fixedTableContainer table")
            .eq(3)
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
            .eq(4)
            .find("tr.tableContent")
            .each((_, el) => {
                const tds = $$(el).find("td");
                curriculum.push({
                    basketTitle: $$(tds[0]).text().trim(),
                    creditsRequired: $$(tds[2]).text().trim(),
                    creditsEarned: $$(tds[3]).text().trim(),
                });
            });
        // --- CGPA Details ---
        const cgpa = {};
        const cgpaRow = $$("table.table.table-hover.table-bordered tbody tr").first();
        if (cgpaRow.length) {
            const tds = cgpaRow.find("td");
            cgpa.grades = {
                S: $$(tds[3]).text().trim(),
                A: $$(tds[4]).text().trim(),
                B: $$(tds[5]).text().trim(),
                C: $$(tds[6]).text().trim(),
                D: $$(tds[7]).text().trim(),
                E: $$(tds[8]).text().trim(),
                F: $$(tds[9]).text().trim(),
                N: $$(tds[10]).text().trim(),
            };
        }

        return NextResponse.json({
            effectiveGrades,
            curriculum,
            cgpa,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
