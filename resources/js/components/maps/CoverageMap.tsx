import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ─── NE Nigeria LGA coordinates for the coverage map ─── */
const NE_LGAS: { name: string; state: string; lat: number; lng: number }[] = [
  // Borno
  { name: "Maiduguri", state: "Borno", lat: 11.846, lng: 13.16 },
  { name: "Jere", state: "Borno", lat: 11.88, lng: 13.12 },
  { name: "Bama", state: "Borno", lat: 11.52, lng: 13.69 },
  { name: "Gwoza", state: "Borno", lat: 11.08, lng: 13.7 },
  { name: "Monguno", state: "Borno", lat: 12.67, lng: 13.61 },
  { name: "Damboa", state: "Borno", lat: 11.15, lng: 12.76 },
  { name: "Dikwa", state: "Borno", lat: 12.03, lng: 13.92 },
  { name: "Ngala", state: "Borno", lat: 12.34, lng: 14.19 },
  { name: "Konduga", state: "Borno", lat: 11.65, lng: 13.27 },
  { name: "Biu", state: "Borno", lat: 10.61, lng: 12.2 },
  { name: "Kala/Balge", state: "Borno", lat: 12.01, lng: 14.45 },
  { name: "Magumeri", state: "Borno", lat: 12.11, lng: 12.83 },
  { name: "Mafa", state: "Borno", lat: 11.93, lng: 13.54 },
  // Adamawa
  { name: "Yola North", state: "Adamawa", lat: 9.23, lng: 12.46 },
  { name: "Yola South", state: "Adamawa", lat: 9.18, lng: 12.48 },
  { name: "Mubi North", state: "Adamawa", lat: 10.27, lng: 13.27 },
  { name: "Mubi South", state: "Adamawa", lat: 10.18, lng: 13.25 },
  { name: "Michika", state: "Adamawa", lat: 10.62, lng: 13.39 },
  { name: "Madagali", state: "Adamawa", lat: 10.87, lng: 13.64 },
  { name: "Hong", state: "Adamawa", lat: 10.23, lng: 12.93 },
  { name: "Gombi", state: "Adamawa", lat: 10.17, lng: 12.73 },
  // Yobe
  { name: "Damaturu", state: "Yobe", lat: 11.75, lng: 11.96 },
  { name: "Potiskum", state: "Yobe", lat: 11.71, lng: 11.07 },
  { name: "Geidam", state: "Yobe", lat: 12.9, lng: 11.93 },
  { name: "Gujba", state: "Yobe", lat: 11.5, lng: 12.26 },
  { name: "Gulani", state: "Yobe", lat: 11.49, lng: 11.96 },
  { name: "Nguru", state: "Yobe", lat: 12.88, lng: 10.45 },
  { name: "Bade", state: "Yobe", lat: 12.83, lng: 10.23 },
];

type Location = {
  lat: number;
  lng: number;
  label: string;
  total?: number;
  state?: string;
};

interface Props {
  locations: Location[];
}

const stateColor: Record<string, string> = {
  Borno: "#12707E",
  Adamawa: "#C1722F",
  Yobe: "#2E7D47",
};

export default function CoverageMap({ locations }: Props) {
  // If no report locations are provided, use the NE Nigeria LGA fallback set
  const markers: Location[] = useMemo(() => {
    if (locations.length > 0) return locations;
    return NE_LGAS.map((l) => ({
      lat: l.lat,
      lng: l.lng,
      label: `${l.name} LGA, ${l.state}`,
      state: l.state,
    }));
  }, [locations]);

  // Center on NE Nigeria (Maiduguri area)
  const center: [number, number] = [11.5, 12.8];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md">
      {/* Header bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #061B20 0%, #0B3C46 100%)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4EAAB6" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span
            style={{
              color: "#fff",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            NE Nigeria Coverage Map
          </span>
          <span
            style={{
              background: "rgba(78,170,182,0.2)",
              border: "1px solid rgba(78,170,182,0.4)",
              color: "#4EAAB6",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 6,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {markers.length} LOCATIONS
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {Object.entries(stateColor).map(([state, color]) => (
            <span
              key={state}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "rgba(255,255,255,0.85)",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                }}
              />
              {state}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: 420, width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((loc, idx) => {
          const color = loc.state ? stateColor[loc.state] || "#12707E" : "#12707E";
          return (
            <CircleMarker
              key={idx}
              center={[loc.lat, loc.lng]}
              radius={8}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 12 }}>
                  {loc.label}
                </span>
                {loc.total !== undefined && (
                  <span style={{ display: "block", fontSize: 11, color: "#485B60" }}>
                    {loc.total.toLocaleString()} beneficiaries
                  </span>
                )}
              </Tooltip>
              <Popup>
                <div style={{ fontFamily: "'Outfit', sans-serif", minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0B3C46", marginBottom: 4 }}>
                    {loc.label}
                  </div>
                  {loc.total !== undefined && (
                    <div style={{ fontSize: 12, color: "#485B60" }}>
                      Beneficiaries reached: <strong>{loc.total.toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
