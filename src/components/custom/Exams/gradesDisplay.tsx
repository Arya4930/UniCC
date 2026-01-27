import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import NoContentFound from "../NoContentFound";

export default function GradesDisplay({ data, handleFetchGrades, marksData, attendance }) {
  if (!data || !marksData.cgpa) {
    return (
      <div>
        <p className="text-center text-gray-600 dark:text-gray-300 midnight:text-gray-200">
          No Grades Data Available.{" "}
          <button onClick={handleFetchGrades} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
            <RefreshCcw className={`w-4 h-4`} />
          </button>
        </p>
        <NoContentFound />
      </div>
    );
  }

  const ongoingCreditsByCategory = attendance.reduce((acc, item) => {
    let category = item.category || "Uncategorized";
    const credits = parseFloat(item.credits) || 0;
    if (category === "Foundation Core - Humanities, Social Sciences and Management (LANGUAGE Basket)") {
      category = "Foreign Language";
    } else if (category === "Foundation Core - Humanities, Social Sciences and Management (GENERAL Basket)") {
      category = "HSM Elective";
    } else if (category === "Foundation Core - Humanities, Social Sciences and Management (EXTRA CURRICULAR Basket)") {
      category = "Extra curricular activities";
    }
    acc[category] = (acc[category] || 0) + credits;

    const hssm = "Foundation Core - Humanities, Social Sciences and Management";
    const ngcr = "Non-graded Core Requirement";

    if (category === "Foreign Language" || category === "HSM Elective") {
      acc[hssm] = (acc[hssm] || 0) + credits;
    }
    if (category === "Extra curricular activities") {
      acc[ngcr] = (acc[ngcr] || 0) + credits;
    }

    return acc;
  }, {});

  const totalCredits = data.curriculum.find(c =>
    c.basketTitle.toLowerCase().includes("total credits")
  );

  const Curriculum = data.curriculum.filter(
    c => !c.basketTitle.toLowerCase().includes("total credits")
  );
  let effectiveGrades = data.effectiveGrades || [];
  effectiveGrades = effectiveGrades.filter(
    eg => !isNaN(parseFloat(eg.creditsEarned))
  );

  const specialBaskets = ["Extra curricular activities", "HSM Elective", "Foreign Language"];

  const normalCurriculum = Curriculum.filter(
    (c) => !specialBaskets.some((b) => c.basketTitle.toLowerCase().includes(b.toLowerCase()))
  );

  const specialCurriculum = Curriculum.filter(
    (c) => specialBaskets.some((b) => c.basketTitle.toLowerCase().includes(b.toLowerCase()))
  );

  const totalInProgressRaw = Object.values(ongoingCreditsByCategory).reduce(
    (a, b) => a + b,
    0
  );

  const specialInProgress = specialBaskets.reduce((sum, basket) => {
    return sum + (ongoingCreditsByCategory[basket] || 0);
  }, 0);

  const totalInProgress = totalInProgressRaw - specialInProgress;

  return (
    <div>
      <Card className="bg-white dark:bg-slate-800 midnight:bg-black border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100">Grade Distribution <button onClick={handleFetchGrades} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
            <RefreshCcw className={`w-4 h-4`} />
          </button></CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center text-sm">
          {Object.entries(data.cgpa.grades as Record<string, number>).map(([grade, count]) => (
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

      <Card className="bg-white dark:bg-slate-800 midnight:bg-black border-0">
        <CardContent className="space-y-6">
          {totalCredits && (() => {
            const earned = parseFloat(totalCredits.creditsEarned);
            const required =
              parseFloat(totalCredits.creditsRequired) +
              Curriculum.filter((c) =>
                c.basketTitle.toLowerCase().includes("non-graded core requirement")
              ).reduce((acc, c) => acc + parseFloat(c.creditsRequired), 0);

            const isComplete = earned >= required;
            const effectiveTotal = isComplete ? earned : earned + totalInProgress;

            const progressEarned = Math.min((earned / required) * 100, 100);
            const progressWithOngoing = Math.min((effectiveTotal / required) * 100, 100);

            return (
              <div className="space-y-4 border-b-2 pb-6">
                <p className="text-lg font-bold">
                  Total Credits
                </p>
                <div className="relative h-3 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                  {!isComplete && (
                    <div
                      className="absolute left-0 top-0 h-full bg-yellow-400/60"
                      style={{ width: `${progressWithOngoing}%` }}
                    />
                  )}
                  <div
                    className={`absolute left-0 top-0 h-full ${isComplete ? "bg-green-500" : "bg-blue-500 dark:bg-blue-600"
                      }`}
                    style={{ width: `${progressEarned}%` }}
                  />
                </div>
                <p className="text-sm font-medium mt-1">
                  {earned.toFixed(1)}
                  {!isComplete && totalInProgress > 0
                    ? ` + ${totalInProgress.toFixed(1)} → ${effectiveTotal.toFixed(1)}`
                    : ""}{" "}
                  / {required.toFixed(1)} total credits
                </p>
              </div>
            );
          })()}

          <div className="space-y-4 border-b-2 pb-6">
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-300 dark:bg-gray-700 midnight:bg-gray-800 transform -translate-x-1/2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {normalCurriculum.map((c, idx) => {
                  const earned = parseFloat(c.creditsEarned);
                  const required = parseFloat(c.creditsRequired);
                  const inProgress = ongoingCreditsByCategory[c.basketTitle] || 0;

                  const isComplete = earned >= required;
                  const effectiveTotal = isComplete ? earned : earned + inProgress;

                  const progressEarned = Math.min((earned / required) * 100, 100);
                  const progressWithOngoing = Math.min((effectiveTotal / required) * 100, 100);


                  return (
                    <div key={idx} className="p-2 space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                        {c.basketTitle}
                      </p>

                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                        {!isComplete && (
                          <div
                            className="absolute left-0 top-0 h-full bg-yellow-400/60"
                            style={{ width: `${progressWithOngoing}%` }}
                          />
                        )}
                        <div
                          className={`absolute left-0 top-0 h-full ${isComplete ? "bg-green-500" : "bg-blue-500 dark:bg-blue-600"
                            }`}
                          style={{ width: `${progressEarned}%` }}
                        />
                      </div>


                      <p className="text-xs font-medium">
                        {earned.toFixed(1)}
                        {!isComplete && inProgress > 0
                          ? ` + ${inProgress.toFixed(1)} → ${effectiveTotal.toFixed(1)}`
                          : ""}{" "}
                        / {required.toFixed(1)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {specialCurriculum.length > 0 && (
            <div className="space-y-4 border-b-2 pb-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                Basket
              </h3>
              {specialCurriculum.map((c, idx) => {
                const earned = parseFloat(c.creditsEarned);
                const required = parseFloat(c.creditsRequired);
                const inProgress = ongoingCreditsByCategory[c.basketTitle] || 0;

                const isComplete = earned >= required;
                const effectiveTotal = isComplete ? earned : earned + inProgress;

                const progressEarned = Math.min((earned / required) * 100, 100);
                const progressWithOngoing = Math.min((effectiveTotal / required) * 100, 100);


                return (
                  <div key={idx}>
                    <p className="font-medium text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                      {c.basketTitle}
                    </p>
                    <div className="relative h-2 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                      {!isComplete && (
                        <div
                          className="absolute left-0 top-0 h-full bg-yellow-400/60"
                          style={{ width: `${progressWithOngoing}%` }}
                        />
                      )}
                      <div
                        className={`absolute left-0 top-0 h-full ${isComplete ? "bg-green-500" : "bg-blue-500 dark:bg-blue-600"
                          }`}
                        style={{ width: `${progressEarned}%` }}
                      />
                    </div>

                    <p className="text-xs font-medium">
                      {earned.toFixed(1)}
                      {!isComplete && inProgress > 0
                        ? ` + ${inProgress.toFixed(1)} → ${effectiveTotal.toFixed(1)}`
                        : ""}{" "}
                      / {required.toFixed(1)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {effectiveGrades.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                Grades
              </h4>

              <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {effectiveGrades.map(
                  ({ basketTitle, creditsEarned, distributionType, grade }, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b
                       text-gray-900 dark:text-gray-100 midnight:text-gray-100"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium truncate max-w-[16rem]">
                          {basketTitle || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-300 midnight:text-gray-400">
                          {distributionType || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold">
                        <span>{grade || "—"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-300 midnight:text-gray-400">
                          {Number.isFinite(Number(creditsEarned))
                            ? `${Number(creditsEarned).toFixed(1)} cr`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
