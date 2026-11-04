/** Map projection for the India journey: simple equirectangular, in SVG units. */
import { INDIA_OUTLINE } from "../map/indiaOutline";

export const MAP = {
  lon0: 67,
  lon1: 98,
  lat0: 6,
  lat1: 37.5,
  /** SVG units per degree. */
  K: 20,
};

export const MAP_W = (MAP.lon1 - MAP.lon0) * MAP.K;
export const MAP_H = (MAP.lat1 - MAP.lat0) * MAP.K;

/** [longitude, latitude] of every city named in `travels`. */
export const CITY_COORDS: Record<string, [number, number]> = {
  Kanpur: [80.33, 26.45],
  "Greater Noida": [77.5, 28.47],
  Noida: [77.39, 28.54],
  Bengaluru: [77.59, 12.97],
};

export function toMap([lon, lat]: [number, number]): [number, number] {
  return [(lon - MAP.lon0) * MAP.K, (MAP.lat1 - lat) * MAP.K];
}

/** India's outline as an SVG path in map units. */
export const INDIA_PATH = `${INDIA_OUTLINE.map((pt, i) => {
  const [x, y] = toMap(pt);
  return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ")} Z`;
