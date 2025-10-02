"use client";

import { useEffect, useState } from "react";

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

export default function MessDisplay({ hostelData }) {
  if (!hostelData.hostelInfo?.isHosteller) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-300 midnight:text-gray-300">
        You are not a hosteller. / Reload Data
      </p>
    );
  }

  const normalizeGender = (g) =>
    g?.toLowerCase() === "male" ? "Male" : "Female";

  const normalizeType = (t) => {
    const map = {
      VEG: "Veg",
      "NON VEG": "Non Veg",
      SPECIAL: "Special",
    };
    return map[t?.toUpperCase()] || "Veg";
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const [gender, setGender] = useState(
    normalizeGender(hostelData.hostelInfo?.gender) || "Male"
  );
  const [type, setType] = useState(
    normalizeType(hostelData.hostelInfo?.messInfo) || "Veg"
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
    <div>
      <h1 className="text-xl font-bold mb-2 text-center dark:text-white midnight:text-white">
        Mess Menu
      </h1>
      <h2 className="text-md font-bold mb-2 text-center text-gray-700 dark:text-gray-300 midnight:text-gray-300">
        ( Data taken from{" "}
        <a
          href="http://kaffeine.tech/unmessify"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 dark:text-blue-400 midnight:text-blue-400"
        >
          Unmessify
        </a>{" "}
        )
      </h2>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border rounded-lg p-2 shadow-sm hover:cursor-pointer bg-white dark:bg-slate-700 midnight:bg-black text-gray-900 dark:text-gray-100 midnight:text-gray-100"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg p-2 shadow-sm hover:cursor-pointer bg-white dark:bg-slate-700 midnight:bg-black text-gray-900 dark:text-gray-100 midnight:text-gray-100"
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
              ? "bg-blue-600 text-white dark:bg-blue-500 midnight:bg-blue-700 dark:text-gray-100 midnight:text-gray-100"
              : "bg-gray-200 text-gray-700 hover:bg-blue-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 midnight:bg-black midnight:text-gray-200 midnight:hover:bg-gray-800 midnight:outline midnight:outline-1 midnight:outline-gray-800"
              }`}
          >
            {short}
          </button>
        ))}
      </div>

      {todayMenu ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white midnight:text-white">
            {todayMenu.Day}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-2xl shadow bg-white dark:bg-gray-900 dark:text-gray-200 midnight:text-gray-200 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800">
              <h3 className="text-lg font-bold mb-2">🍳 Breakfast</h3>
              <p className="whitespace-pre-line">{todayMenu.Breakfast}</p>
            </div>

            <div className="p-4 border rounded-2xl shadow bg-white dark:bg-gray-900 dark:text-gray-200 midnight:text-gray-200 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800">
              <h3 className="text-lg font-bold mb-2">🍲 Lunch</h3>
              <p className="whitespace-pre-line">{todayMenu.Lunch}</p>
            </div>

            <div className="p-4 border rounded-2xl shadow bg-white dark:bg-gray-900 dark:text-gray-200 midnight:text-gray-200 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800">
              <h3 className="text-lg font-bold mb-2">☕ Snacks</h3>
              <p className="whitespace-pre-line">{todayMenu.Snacks}</p>
            </div>

            <div className="p-4 border rounded-2xl shadow bg-white dark:bg-gray-900 dark:text-gray-200 midnight:text-gray-200 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800">
              <h3 className="text-lg font-bold mb-2">🍽️ Dinner</h3>
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
