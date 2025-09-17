import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function GradesDisplay({ data }) {
    if (!data || !data.cgpa) return <p>No grades data available.</p>

    // Separate out Total Credits basket
    const totalCredits = data.curriculum.find(c =>
        c.basketTitle.toLowerCase().includes("total credits")
    )
    const otherCurriculum = data.curriculum.filter(
        c => !c.basketTitle.toLowerCase().includes("total credits")
    )

    return (
        <div className="grid gap-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-2 text-center text-sm">
                    {Object.entries(data.cgpa.grades).map(([grade, count]) => (
                        <div key={grade} className="p-2 rounded-lg bg-gray-100">
                            <p className="font-bold">{grade}</p>
                            <p className="text-gray-600">{count}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <BookOpen size={20} /> Curriculum Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {totalCredits && (() => {
                        const earned = parseFloat(totalCredits.creditsEarned)
                        const required = parseFloat(totalCredits.creditsRequired)
                        const progress = Math.round((earned / required) * 100)
                        return (
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <p className="text-lg font-bold text-blue-700">
                                    {totalCredits.basketTitle}
                                </p>
                                <Progress value={progress} className="h-3" />
                                <p className="text-sm text-blue-600 font-medium mt-1">
                                    {totalCredits.creditsEarned}/{totalCredits.creditsRequired} credits earned
                                </p>
                            </div>
                        )
                    })()}

                    {/* Render other curriculum normally */}
                    {otherCurriculum.map((c, idx) => {
                        const earned = parseFloat(c.creditsEarned)
                        const required = parseFloat(c.creditsRequired)
                        const progress = Math.round((earned / required) * 100)

                        return (
                            <div key={idx}>
                                <p className="font-semibold">{c.basketTitle}</p>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-gray-500">
                                    {c.creditsEarned}/{c.creditsRequired} credits earned
                                </p>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
