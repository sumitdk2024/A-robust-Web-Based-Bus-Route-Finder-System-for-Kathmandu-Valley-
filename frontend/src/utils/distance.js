// Coordinates must be finite numbers in the geographic latitude/longitude ranges.
export function hasValidCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && Math.abs(latitude) <= 90
    && Number.isFinite(longitude) && Math.abs(longitude) <= 180;
}

// Great-circle distance in metres; this does not calculate a walking route.
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (!hasValidCoordinates(lat1, lon1) || !hasValidCoordinates(lat2, lon2)) return NaN;
  const radians = degrees => degrees * Math.PI / 180;
  const a = Math.sin(radians(lat2 - lat1) / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2))
    * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

export function findNearestStops(stops, latitude, longitude, limit = 3) {
  if (!hasValidCoordinates(latitude, longitude)) return [];
  return stops.filter(stop => hasValidCoordinates(stop.latitude, stop.longitude))
    .map(stop => ({ ...stop, distance: haversineDistance(latitude, longitude, stop.latitude, stop.longitude) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export function formatDistance(metres) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}
