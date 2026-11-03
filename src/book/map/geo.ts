/** Map projection for the India journey: simple equirectangular, in table units. */
import * as THREE from "three";

export const MAP = {
  lon0: 64,
  lon1: 100,
  lat0: 4,
  lat1: 40,
  /** Table units per degree. */
  K: 0.55,
  /** Projection centre (sits at the table origin when the map is not sliding). */
  lonC: 82,
  latC: 22,
};

/** [longitude, latitude] of every city named in `travels`. */
export const CITY_COORDS: Record<string, [number, number]> = {
  Kanpur: [80.33, 26.45],
  "Greater Noida": [77.5, 28.47],
  Noida: [77.39, 28.54],
  Bengaluru: [77.59, 12.97],
};

export function toMap([lon, lat]: [number, number]) {
  return new THREE.Vector3((lon - MAP.lonC) * MAP.K, 0, -(lat - MAP.latC) * MAP.K);
}
