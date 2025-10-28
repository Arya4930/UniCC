import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import NoContentFound from "../NoContentFound";

export default function GradesDisplay({ data }) {
  if (!data || !data.cgpa){
    return (
      <NoContentFound />
    );
  }

  const totalCredits = data.curriculum.find(c =>
    c.basketTitle.toLowerCase().includes("total credits")
  );

  const otherCurriculum = data.curriculum.filter(
    c => !c.basketTitle.toLowerCase().includes("total credits")
  );

  return (
    <div className="grid gap-2">

      <Card className="bg-white dark:bg-slate-800 midnight:bg-black">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100">Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-2 text-center text-sm">
          {Object.entries(data.cgpa.grades).map(([grade, count]) => (
            <div
              key={grade}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 midnight:bg-gray-800 text-gray-900 dark:text-gray-100 midnight:text-gray-100 font-bold"
            >
              <p>{grade}</p>
              <p className="text-gray-600 dark:text-gray-300 midnight:text-gray-300 font-medium">{count}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 midnight:bg-black">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
            <BookOpen size={20} /> Curriculum Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalCredits && (() => {
            const earned = parseFloat(totalCredits.creditsEarned);
            const required = parseFloat(totalCredits.creditsRequired);
            const progress = Math.round((earned / required) * 100);

            return (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900 midnight:bg-blue-950 border border-blue-200 dark:border-blue-700 midnight:border-blue-800">
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400 midnight:text-blue-300">
                  {totalCredits.basketTitle}
                </p>
                <Progress value={progress} className="h-3" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300 midnight:text-blue-200 mt-1">
                  {totalCredits.creditsEarned}/{totalCredits.creditsRequired} credits earned
                </p>
              </div>
            );
          })()}

          {otherCurriculum.map((c, idx) => {
            const earned = parseFloat(c.creditsEarned);
            const required = parseFloat(c.creditsRequired);
            const progress = Math.round((earned / required) * 100);

            return (
              <div key={idx}>
                <p className="font-semibold text-gray-900 dark:text-gray-100 midnight:text-gray-100">{c.basketTitle}</p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-300 font-medium">
                  {c.creditsEarned}/{c.creditsRequired} credits earned
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
