"use client"

import { useEffect, useState } from "react"

const messLinks = {
    Male: {
        "Non Veg": "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-N.json",
        Veg: "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-V.json",
        Special: "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-S.json",
    },
    Female: {
        "Non Veg": "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-N.json",
        Veg: "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-V.json",
        Special: "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-S.json",
    },
}

const fullToShortDay = {
    Monday: "MON",
    Tuesday: "TUE",
    Wednesday: "WED",
    Thursday: "THU",
    Friday: "FRI",
    Saturday: "SAT",
    Sunday: "SUN",
}

const shortToFullDay = Object.fromEntries(
    Object.entries(fullToShortDay).map(([full, short]) => [short, full])
)

export default function MessDisplay({ hostelData }) {
    if (!hostelData.hostelInfo?.isHosteller) {
        return <p className="text-center text-gray-600">You are not a hosteller. / Reload Data</p>
    }

    const normalizeGender = (g) =>
        g?.toLowerCase() === "male" ? "Male" : "Female"

    const normalizeType = (t) => {
        const map = {
            VEG: "Veg",
            "NON VEG": "Non Veg",
            SPECIAL: "Special",
        }
        return map[t?.toUpperCase()] || "Veg"
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })

    const [gender, setGender] = useState(normalizeGender(hostelData.hostelInfo?.gender) || "Male")
    const [type, setType] = useState(normalizeType(hostelData.hostelInfo?.messInfo) || "Veg")
    const [menu, setMenu] = useState([])
    const [activeDay, setActiveDay] = useState(today)

    const shortDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

    useEffect(() => {
        const url = messLinks[gender][type]
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setMenu(data.list || [])
            })
            .catch((err) => console.error("Error loading menu:", err))
    }, [gender, type])

    const todayMenu = menu.find((day) => day.Day === activeDay)

    return (
        <div >
            <h1 className="text-xl font-bold mb-2 text-center">Mess Menu</h1>
            <h2 className="text-md font-bold mb-2 text-center">( Data taken from <a href="http://kaffeine.tech/unmessify" target="_blank" rel="noopener noreferrer" className="underline">Unmessify</a> )</h2>

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
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border rounded-lg p-2 shadow-sm hover:cursor-pointer"
                >
                    <option value="Veg">Veg</option>
                    <option value="Non Veg">Non Veg</option>
                    <option value="Special">Special</option>
                </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {shortDays.map((short) => (
                    <button
                        key={short}
                        onClick={() => setActiveDay(shortToFullDay[short])}
                        className={`px-4 py-2 rounded-lg transition-colors hover:cursor-pointer duration-200 shadow-sm ${activeDay === shortToFullDay[short]
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-blue-300"
                            }`}
                    >
                        {short}
                    </button>
                ))}
            </div>

            {todayMenu ? (
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        {todayMenu.Day}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 border rounded-2xl shadow bg-white">
                            <h3 className="text-lg font-semibold mb-2">🍳 Breakfast</h3>
                            <p className="text-gray-800 whitespace-pre-line">
                                {todayMenu.Breakfast}
                            </p>
                        </div>

                        <div className="p-4 border rounded-2xl shadow bg-white">
                            <h3 className="text-lg font-semibold mb-2">🍲 Lunch</h3>
                            <p className="text-gray-800 whitespace-pre-line">
                                {todayMenu.Lunch}
                            </p>
                        </div>

                        <div className="p-4 border rounded-2xl shadow bg-white">
                            <h3 className="text-lg font-semibold mb-2">☕ Snacks</h3>
                            <p className="text-gray-800 whitespace-pre-line">
                                {todayMenu.Snacks}
                            </p>
                        </div>

                        <div className="p-4 border rounded-2xl shadow bg-white">
                            <h3 className="text-lg font-semibold mb-2">🍽️ Dinner</h3>
                            <p className="text-gray-800 whitespace-pre-line">
                                {todayMenu.Dinner}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600">
                    No menu found for {activeDay}.
                </p>
            )}
        </div>
    )
}
