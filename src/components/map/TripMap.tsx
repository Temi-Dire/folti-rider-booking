"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { LAGOS_CENTER } from "@/lib/places";
import type { Place } from "@/lib/types";

export interface MapPadding {
  topLeft: [number, number];
  bottomRight: [number, number];
}

interface Props {
  pickup?: Place;
  destination?: Place;
  /** Show a few simulated cars near the pickup. */
  showCars?: boolean;
  padding: MapPadding;
}

const pinIcon = (label: string, kind: "pickup" | "destination") =>
  L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div style="position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;gap:8px;width:max-content">
      ${
        kind === "pickup"
          ? `<span style="width:20px;height:20px;border-radius:50%;background:#f3efe6;display:grid;place-items:center;box-shadow:0 0 0 4px rgba(243,239,230,.18)"><span style="width:8px;height:8px;border-radius:50%;background:#12131c"></span></span>`
          : `<span style="width:20px;height:20px;border-radius:5px;background:#f2c230;display:grid;place-items:center;box-shadow:0 0 0 4px rgba(242,194,48,.2)"><span style="width:7px;height:7px;background:#17140e"></span></span>`
      }
      <span class="pin-label">${label}</span></div>`,
  });

const carIcon = (rotate: number) =>
  L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div style="transform:translate(-50%,-50%) rotate(${rotate}deg);width:12px;height:22px;border-radius:5px;background:#f3efe6;box-shadow:0 2px 6px rgba(0,0,0,.5)"><div style="margin:5px 2px 0;height:5px;border-radius:2px;background:#12131c;opacity:.6"></div></div>`,
  });

/** Gentle curve between two points so the route reads as a trip, not a ruler line. */
function curve(a: Place, b: Place, steps = 40): [number, number][] {
  const mx = (a.lat + b.lat) / 2;
  const my = (a.lng + b.lng) / 2;
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const cx = mx + dx * 0.18;
  const cy = my - dy * 0.18;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * cx + t ** 2 * b.lat;
    const lng = (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * cy + t ** 2 * b.lng;
    pts.push([lat, lng]);
  }
  return pts;
}

/** Deterministic "nearby cars" around the pickup. */
function nearbyCars(p: Place): { pos: [number, number]; rot: number }[] {
  const offsets = [
    [0.006, -0.004, 30],
    [-0.005, 0.007, -60],
    [0.009, 0.006, 80],
    [-0.008, -0.006, 10],
  ];
  return offsets.map(([a, b, r]) => ({ pos: [p.lat + a, p.lng + b], rot: r }));
}

function FitView({ pickup, destination, padding }: Omit<Props, "showCars">) {
  const map = useMap();
  const key = `${pickup?.id}|${destination?.id}|${padding.topLeft}|${padding.bottomRight}`;
  useEffect(() => {
    const opts = { paddingTopLeft: padding.topLeft, paddingBottomRight: padding.bottomRight, maxZoom: 15, animate: true };
    if (pickup && destination) {
      map.flyToBounds(L.latLngBounds([pickup.lat, pickup.lng], [destination.lat, destination.lng]), { ...opts, duration: 0.8 });
    } else if (pickup || destination) {
      const p = (pickup ?? destination)!;
      const pad = L.latLngBounds([p.lat - 0.012, p.lng - 0.012], [p.lat + 0.012, p.lng + 0.012]);
      map.flyToBounds(pad, { ...opts, duration: 0.8 });
    } else {
      map.flyTo(LAGOS_CENTER, 12, { duration: 0.6 });
    }
    // `key` captures every input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function TripMap({ pickup, destination, showCars, padding }: Props) {
  const route = useMemo(() => (pickup && destination ? curve(pickup, destination) : null), [pickup, destination]);

  return (
    <MapContainer
      center={LAGOS_CENTER}
      zoom={12}
      zoomControl={false}
      className="absolute inset-0 z-0"
      attributionControl
      aria-label="Map of the trip"
    >
      <TileLayer
        // Standard OpenStreetMap tiles (free, no key), recoloured to night mode in globals.css.
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        className="night-tiles"
        maxZoom={19}
      />
      {route && (
        <>
          <Polyline positions={route} pathOptions={{ color: "#000", weight: 9, opacity: 0.35 }} />
          <Polyline positions={route} pathOptions={{ color: "#f2c230", weight: 5, opacity: 1 }} />
        </>
      )}
      {showCars && pickup && nearbyCars(pickup).map((c, i) => <Marker key={i} position={c.pos} icon={carIcon(c.rot)} interactive={false} />)}
      {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pinIcon(pickup.name, "pickup")} interactive={false} />}
      {destination && <Marker position={[destination.lat, destination.lng]} icon={pinIcon(destination.name, "destination")} interactive={false} />}
      <FitView pickup={pickup} destination={destination} padding={padding} />
    </MapContainer>
  );
}
