"use client";

import React from "react";

export function RowsPerPage({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50],
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-300 text-sm">Filas por página:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="bg-zinc-800 border border-zinc-700 rounded px-10 py-1 text-white text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
