"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const LaundryLinks = {
    Male: {
        A: "https://kanishka-developer.github.io/unmessify/json/en/VITC-A-L.json",
        C: "https://kanishka-developer.github.io/unmessify/json/en/VITC-CB-L.json",
        D1: "https://kanishka-developer.github.io/unmessify/json/en/VITC-D1-L.json",
        D2: "https://kanishka-developer.github.io/unmessify/json/en/VITC-D2-L.json",
        E: "https://kanishka-developer.github.io/unmessify/json/en/VITC-E-L.json",
    },
    Female: {
        B: "https://kanishka-developer.github.io/unmessify/json/en/VITC-B-L.json",
        C: "https://kanishka-developer.github.io/unmessify/json/en/VITC-CG-L.json",
    },
}

export default function LaundrySchedule({ hostelData }) {
    if (!hostelData.hostelInfo?.isHosteller) {
        return <p className="text-center text-gray-600">You are not a hosteller. / Reload Data</p>
    }
    const [gender, setGender] = useState("")
    const [hostel, setHostel] = useState("")
    const [schedule, setSchedule] = useState([])

    const hostelOptions = {
        Male: ["A", "C", "D1", "D2", "E"],
        Female: ["B", "C"],
    }

    const today = new Date().getDate()

    useEffect(() => {
        if (!hostelData.hostelInfo) return

        const normalizedGender =
            hostelData.hostelInfo.gender?.toLowerCase() === "female" ? "Female" : "Male"
        const blockName = hostelData.hostelInfo.blockName?.split(" ")[0] || "A"

        setGender(normalizedGender)
        setHostel(blockName)
    }, [hostelData.hostelInfo])

    useEffect(() => {
        if (!hostelData.hostelInfo) return
        if (LaundryLinks[gender] && LaundryLinks[gender][hostel]) {
            fetch(LaundryLinks[gender][hostel])
                .then((res) => res.json())
                .then((data) => setSchedule(data.list || []))
                .catch((err) => console.error("Error loading laundry schedule:", err))
        }
    }, [gender, hostel, hostelData.hostelInfo])

    return (
        <div>
            <h1 className="text-xl font-bold mb-2 text-center">Laundry Dates</h1>
            <h2 className="text-md font-bold mb-2 text-center">( Data taken from <a href="http://kaffeine.tech/unmessify" target="_blank" rel="noopener noreferrer" className="underline">Unmessify</a> )</h2>
            {gender && (
                <div className="flex flex-wrap gap-4 justify-center mb-6">
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="border rounded-lg p-2 shadow-sm hover:cursor-pointer"
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <select
                        value={hostel}
                        onChange={(e) => setHostel(e.target.value)}
                        className="border rounded-lg p-2 shadow-sm hover:cursor-pointer"
                    >
                        {hostelOptions[gender]?.map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </select>
                </div>
            )}


            {schedule.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Room Number Range</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map((item) => {
                                const isToday = parseInt(item.Date, 10) === today
                                return (
                                    <TableRow
                                        key={item.Id}
                                        className={isToday ? "bg-yellow-200 font-semibold" : ""}
                                    >
                                        <TableCell className="text-center">{item.Date}</TableCell>
                                        <TableCell className="text-center">{item.RoomNumber}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-gray-600">No laundry schedule available.</p>
            )}
        </div>
    )
}