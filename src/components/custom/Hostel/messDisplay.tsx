"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

const messLinks = {
  Male: {
    "Non Veg":
      "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-N.json",
    Veg: "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-V.json",
    Special:
      "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-S.json",
  },
  Female: {
    "Non Veg":
      "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-N.json",
    Veg: "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-V.json",
    Special:
      "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-S.json",
  },
};

const fullToShortDay = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

const shortToFullDay = Object.fromEntries(
  Object.entries(fullToShortDay).map(([full, short]) => [short, full])
);

export default function MessDisplay({ hostelData, handleHostelDetailsFetch }) {
  if (!hostelData.hostelInfo?.isHosteller) {
    return (
      <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400">
        <p>You are not a hosteller.</p>
        <button onClick={handleHostelDetailsFetch} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
          <RefreshCcw className="w-4 h-4" />
          Reload data
        </button>
      </div>
    )
  }

  const normalizeGender = (g) =>
    g?.toLowerCase() === "male" ? "Male" : "Female";

  const normalizeType = (t) => {
    const map = {
      VEG: "Veg",
      NON: "Non Veg",
      SPECIAL: "Special",
    };
    return map[t?.toUpperCase()] || "Veg";
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const [gender, setGender] = useState(
    normalizeGender(hostelData.hostelInfo?.gender.toUpperCase()) || "Male"
  );
  const [type, setType] = useState(
    normalizeType(hostelData.hostelInfo?.messInfo.toUpperCase()) || "Veg"
  );
  const [menu, setMenu] = useState([]);
  const [activeDay, setActiveDay] = useState(today);

  const shortDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  async function fetchMenuWithCache(gender, type, setMenu) {
    const fileName = `VITC-${gender[0].toUpperCase()}-${type[0].toUpperCase()}.json`;
    const localUrl = `/mess/${fileName}`;
    const remoteUrl = messLinks[gender][type];

    try {
      const cached = localStorage.getItem(fileName);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMenu(parsed.list || []);
      }
    } catch (err) {
      console.warn("LocalStorage read failed:", err);
    }

    if (!localStorage.getItem(fileName)) {
      try {
        const res = await fetch(localUrl);
        const data = await res.json();
        setMenu(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      } catch (err) {
        console.error("Error loading from public folder:", err);
      }
    }

    fetch(remoteUrl, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setMenu(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      })
      .catch(err => {
        console.warn("Remote fetch failed, keeping cached:", err);
      });
  }

  useEffect(() => {
    fetchMenuWithCache(gender, type, setMenu);
  }, [gender, type]);

  const todayMenu = menu.find((day) => day.Day === activeDay);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">Mess menu</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Data sourced from{" "}
          <a
            href="http://kaffeine.tech/unmessify"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Unmessify
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="Veg">Veg</option>
          <option value="Non Veg">Non Veg</option>
          <option value="Special">Special</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {shortDays.map((short) => (
          <button
            key={short}
            onClick={() => setActiveDay(shortToFullDay[short])}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeDay === shortToFullDay[short]
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 midnight:bg-black border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
          >
            {short}
          </button>
        ))}
      </div>

      {todayMenu ? (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {todayMenu.Day}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 text-gray-800 dark:text-gray-200">
              <h4 className="text-sm font-semibold mb-2">Breakfast</h4>
              <p className="whitespace-pre-line">{todayMenu.Breakfast}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 text-gray-800 dark:text-gray-200">
              <h4 className="text-sm font-semibold mb-2">Lunch</h4>
              <p className="whitespace-pre-line">{todayMenu.Lunch}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 text-gray-800 dark:text-gray-200">
              <h4 className="text-sm font-semibold mb-2">Snacks</h4>
              <p className="whitespace-pre-line">{todayMenu.Snacks}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 text-gray-800 dark:text-gray-200">
              <h4 className="text-sm font-semibold mb-2">Dinner</h4>
              <p className="whitespace-pre-line">{todayMenu.Dinner}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300 midnight:text-gray-300">
          No menu found for {activeDay}.
        </p>
      )}
    </div>
  );
}
