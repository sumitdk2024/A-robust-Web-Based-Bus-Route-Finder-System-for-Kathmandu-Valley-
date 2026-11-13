import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import boundary from '../data/nepalBoundary.json' with { type: 'json' };
import { hasValidCoordinates } from './distance.js';

export const OUTSIDE_NEPAL_MESSAGE = 'Live location is available only within Nepal. Please select a starting bus stop manually.';

// GeoJSON uses longitude first. Turf handles rings, holes and MultiPolygons;
// boundary points are included. No rectangular approximation is used.
export function isInsideNepal(latitude, longitude) {
  return hasValidCoordinates(latitude, longitude)
    && booleanPointInPolygon([longitude, latitude], boundary);
}
