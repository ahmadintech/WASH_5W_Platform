import React, { useState } from "react";

interface CountryMapProps {
  mapColor?: string;
}

interface RegionHotspot {
  id: string;
  name: string;
  state: "Borno" | "Adamawa" | "Yobe";
  x: number;
  y: number;
  beneficiaries: string;
  partners: number;
  status: "High Need" | "Medium" | "Stable";
}

const REGION_HOTSPOTS: RegionHotspot[] = [
  { id: "mmc", name: "Maiduguri (MMC)", state: "Borno", x: 62, y: 35, beneficiaries: "14,250", partners: 18, status: "High Need" },
  { id: "jere", name: "Jere LGA", state: "Borno", x: 66, y: 38, beneficiaries: "9,420", partners: 14, status: "High Need" },
  { id: "gwoza", name: "Gwoza LGA", state: "Borno", x: 74, y: 55, beneficiaries: "6,810", partners: 8, status: "High Need" },
  { id: "monguno", name: "Monguno LGA", state: "Borno", x: 70, y: 22, beneficiaries: "8,100", partners: 11, status: "High Need" },
  { id: "yola", name: "Yola North & South", state: "Adamawa", x: 42, y: 78, beneficiaries: "12,850", partners: 14, status: "Medium" },
  { id: "mubi", name: "Mubi North", state: "Adamawa", x: 65, y: 68, beneficiaries: "5,340", partners: 7, status: "Medium" },
  { id: "damaturu", name: "Damaturu LGA", state: "Yobe", x: 32, y: 32, beneficiaries: "10,240", partners: 12, status: "Stable" },
  { id: "bade", name: "Bade (Gashua)", state: "Yobe", x: 22, y: 18, beneficiaries: "4,150", partners: 6, status: "Stable" },
];

export default function CountryMap({ mapColor = "#12707E" }: CountryMapProps) {
  const [activeHotspot, setActiveHotspot] = useState<RegionHotspot | null>(REGION_HOTSPOTS[0]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-2 select-none">
      {/* Interactive SVG Vector Graphic representing BAY States Vector Footprint */}
      <div className="relative w-full h-[160px] flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-h-[160px] drop-shadow-xs"
          style={{ filter: "drop-shadow(0 4px 12px rgba(18, 112, 126, 0.15))" }}
        >
          {/* Decorative Regional Grids */}
          <path
            d="M5,5 L95,5 L95,95 L5,95 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            className="text-gray-200 dark:text-gray-800"
            strokeDasharray="1,1"
          />

          {/* Yobe State Vector Boundary (Left Top) */}
          <path
            d="M 12 10 L 42 12 L 40 45 L 18 42 Z"
            fill="#10B981"
            fillOpacity="0.18"
            stroke="#10B981"
            strokeWidth="0.8"
            className="transition-all hover:fill-opacity-35 cursor-pointer"
          />
          <text x="25" y="28" fontSize="3.2" fontWeight="bold" fill="#047857" className="font-mono">
            YOBE
          </text>

          {/* Borno State Vector Boundary (Right Top & East) */}
          <path
            d="M 42 12 L 90 15 L 85 68 L 55 58 L 40 45 Z"
            fill="#12707E"
            fillOpacity="0.22"
            stroke="#12707E"
            strokeWidth="0.9"
            className="transition-all hover:fill-opacity-40 cursor-pointer"
          />
          <text x="62" y="32" fontSize="3.5" fontWeight="bold" fill="#0B3C46" className="font-mono">
            BORNO
          </text>

          {/* Adamawa State Vector Boundary (South / Bottom) */}
          <path
            d="M 32 45 L 55 58 L 78 72 L 45 92 L 28 75 Z"
            fill="#C1722F"
            fillOpacity="0.20"
            stroke="#C1722F"
            strokeWidth="0.8"
            className="transition-all hover:fill-opacity-35 cursor-pointer"
          />
          <text x="44" y="72" fontSize="3.2" fontWeight="bold" fill="#9A4E13" className="font-mono">
            ADAMAWA
          </text>

          {/* Vector Hotspot Pulse Markers */}
          {REGION_HOTSPOTS.map((h) => {
            const isActive = activeHotspot?.id === h.id;
            const dotColor = h.state === "Borno" ? "#12707E" : h.state === "Adamawa" ? "#C1722F" : "#10B981";

            return (
              <g
                key={h.id}
                transform={`translate(${h.x}, ${h.y})`}
                onClick={() => setActiveHotspot(h)}
                className="cursor-pointer group"
              >
                {/* Outer pulse */}
                <circle
                  r={isActive ? "4.5" : "3"}
                  fill={dotColor}
                  fillOpacity="0.25"
                  className={isActive ? "animate-ping" : "group-hover:scale-125 transition-all"}
                />
                {/* Core dot */}
                <circle
                  r={isActive ? "2.5" : "1.8"}
                  fill={dotColor}
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Hotspot Inspector Card */}
      {activeHotspot && (
        <div className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeHotspot.state === "Borno"
                  ? "bg-teal-600"
                  : activeHotspot.state === "Adamawa"
                  ? "bg-amber-600"
                  : "bg-emerald-600"
              }`}
            />
            <div>
              <span className="font-bold text-gray-900 dark:text-white block leading-tight">
                {activeHotspot.name}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {activeHotspot.state} State · {activeHotspot.partners} Reporting Partners
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono font-bold text-teal-800 dark:text-teal-300 block leading-tight">
              {activeHotspot.beneficiaries}
            </span>
            <span className="text-[10px] text-gray-400">Reached</span>
          </div>
        </div>
      )}
    </div>
  );
}
