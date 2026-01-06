import * as cheerio from "cheerio";
import VTOPClient from "../lib/clients/VTOPClient";
import { URLSearchParams } from "url";
import { courseItem } from "../types/data/attendance";

export default async function fetchTimetable(cookieHeader: string | string[], authorizedID: string, csrf: string, semesterId: string): Promise<courseItem[]> {
    const client = VTOPClient();
    const ttRes = await client.post(
        "/vtop/processViewTimeTable",
        new URLSearchParams({
            authorizedID,
            semesterSubId: semesterId,
            _csrf: csrf,
            x: Date.now().toString(),
        }).toString(),
        {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        }
    );

    const $$$ = cheerio.load(ttRes.data);

    // === 1. Parse Course Info Table ===
    const courseInfo: courseItem[] = [];
    $$$('table.table').each((i, table) => {
        $$$(table)
            .find('tbody tr')
            .each((j, row) => {
                const cells = $$$(row).find('td');
                if (cells.length === 0) return;

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