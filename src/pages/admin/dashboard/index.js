"use client";

import DashboardLayout from "..";
import { useState } from "react";
import { BanknotesIcon, FlagIcon, HandRaisedIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";

const tabs = ["General", "Risk"];
const timeframes = [
  "This Week",
  "This Month",
  "Last 3 Months",
  "Last 6 Months",
  "All History",
];

const stats = [
  { label: "0.00", subLabel: "from 0 Challenge" },
  { label: "625.00K", subLabel: "from 1 Challenge" },
  { label: "0.00", subLabel: "from 0 Challenge" },
];

const cohortStats = [
  { label: "Total Sales", value: "$0.00" },
  { label: "New Challenges", value: "0" },
  { label: "Number of Prev. Active Challenges", value: "164" },
  { label: "Winning Challenges", value: "1" },
  { label: "Drop Challenges", value: "0" },
  { label: "% Recurrent Users", value: "0" },
  { label: "Most Broken Rules", value: "-" },
];

export default function Index() {
  const [selectedTab, setSelectedTab] = useState("General");
  const [selectedTimeframe, setSelectedTimeframe] = useState("This Week");

  return (
    <DashboardLayout>
      <div className="p-8 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <Button
                key={tab}
                className={`px-4 py-2 rounded-lg ${
                  selectedTab === tab ? "bg-[var(--app-secondary)]" : "bg-zinc-800"
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <select
            className="bg-zinc-700 text-white px-4 py-2 rounded-lg"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe} value={timeframe}>
                {timeframe}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[BanknotesIcon, FlagIcon, HandRaisedIcon].map((Icon, index) => (
            <div key={index} className="bg-zinc-800 p-6 rounded-lg text-center">
              <Icon className="w-11 text-[var(--app-secondary)] text-sm mx-auto" />
              <p className="text-xl font-bold mt-2">{stats[index].label}</p>
              <p className="text-zinc-400">{stats[index].subLabel}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-8">Cohort Stats</h2>
        <div className="rounded-lg mt-4 border-zinc-800">
          <table className="w-full text-left text-zinc-300 border border-zinc-800">
            <thead>
              <tr className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-b border-zinc-800">
                <th className="p-3 border border-zinc-800">Metric</th>
                <th className="p-3 border border-zinc-800">Value</th>
              </tr>
            </thead>
            <tbody>
              {cohortStats.map((stat, index) => (
                <tr key={index} className="border-b border-zinc-600 bg-[var(--app-primary)]">
                  <td className="p-3 font-semibold text-black border border-zinc-800">
                    {stat.label}
                  </td>
                  <td className="p-3 font-bold text-black border border-zinc-800">
                    {stat.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}