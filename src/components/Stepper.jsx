import React from "react";
export default function Stepper({ current, labels }) {
  return (
    <ol className="flex items-center gap-2 text-xs text-gray-600">
      {labels.map((label, idx) => {
        const n = idx + 1;
        const active = n <= current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={
              "inline-flex items-center justify-center rounded-full w-5 h-5 border " +
              (active ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-300")
            }>{n}</span>
            <span className={active ? "text-gray-900 font-medium" : ""}>{label}</span>
            {idx < labels.length - 1 && <span className="mx-1 text-gray-400">→</span>}
          </li>
        );
      })}
    </ol>
  );
}
