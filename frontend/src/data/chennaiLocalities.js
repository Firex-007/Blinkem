import { CITIES, findClosestLocalityGlobal } from './cities';

const chennai = CITIES.find((c) => c.id === 'chennai') || CITIES[0];
export const CHENNAI_LOCALITIES = chennai.localities.map((loc) => ({
  ...loc,
  city: 'Chennai',
}));

export function findClosestLocality(lat, lng) {
  return findClosestLocalityGlobal(lat, lng);
}
