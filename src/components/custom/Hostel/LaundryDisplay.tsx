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
import { RefreshCcw } from "lucide-react";

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

export default function LaundrySchedule({ hostelData, handleHostelDetailsFetch }) {
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
      hostelData.hostelInfo.gender?.toLowerCase() === "female"
        ? "Female"
        : "Male";
    const blockName = hostelData.hostelInfo.blockName?.split(" ")[0] || "A";

    setGender(normalizedGender);
    setHostel(blockName);
  }, [hostelData.hostelInfo]);

  async function fetchLaundryWithCache(gender, hostel, setSchedule) {
    if (!LaundryLinks[gender] || !LaundryLinks[gender][hostel]) return;

    const fileName = `VITC-${hostel}-${gender[0]}-L.json`;
    const localUrl = `/laundry/${fileName}`;
    const remoteUrl = LaundryLinks[gender][hostel];

    try {
      const cached = localStorage.getItem(fileName);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSchedule(parsed.list || []);
      }
    } catch (err) {
      console.warn("LocalStorage read failed:", err);
    }

    if (!localStorage.getItem(fileName)) {
      try {
        const res = await fetch(localUrl);
        const data = await res.json();
        setSchedule(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      } catch (err) {
        console.error("Error loading laundry from public folder:", err);
      }
    }

    fetch(remoteUrl, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      })
      .catch((err) => {
        console.warn("Remote fetch failed, keeping cached:", err);
      });
  }

  useEffect(() => {
    if (!gender || !hostel) return;
    fetchLaundryWithCache(gender, hostel, setSchedule);
  }, [gender, hostel]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">Laundry schedule</h2>
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

      {gender && (
        <div className="flex flex-wrap gap-3">
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setHostel(hostelOptions[e.target.value][0]) }}
            className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            value={hostel}
            onChange={(e) => setHostel(e.target.value)}
            className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
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
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
          <table className="min-w-full border-collapse table-auto bg-white dark:bg-slate-900/60 midnight:bg-black/60 text-gray-900 dark:text-gray-100">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Room Number Range
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => {
                const isToday = parseInt(item.Date, 10) === today;
                return (
                  <tr
                    key={item.Id}
                    className={`${isToday
                      ? "bg-yellow-100 dark:bg-yellow-700/40 font-semibold"
                      : "odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900/50 dark:even:bg-slate-800/60"
                      }`}
                  >
                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                      {item.Date}
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                      {item.RoomNumber}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 midnight:text-gray-400">
          No laundry schedule available.
        </p>
      )}
    </div>
  );
}
