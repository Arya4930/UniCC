import VTOPClient from "../lib/clients/VTOPClient";
import { CourseItem, CGPA } from "../types/data/marks";
export declare function getMarks(cookies: string[] | string, dashboardHtml: string, semesterId: string, client: ReturnType<typeof VTOPClient>): Promise<{
    courses: CourseItem[];
    cgpa: CGPA;
} | string>;
//# sourceMappingURL=marks.d.ts.map