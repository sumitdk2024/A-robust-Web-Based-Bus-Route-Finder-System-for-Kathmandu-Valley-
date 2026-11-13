import { calculateTotalJourneyTime } from './travelTime.js';

// The bus/origin estimate remains unchanged. Add a saved destination's final
// walking connection as a separate integration step, never as a bus stop.
export function completeJourneyTime(result, walking, destinationWalking) {
  const estimate = calculateTotalJourneyTime(result, walking);
  if (!estimate || !destinationWalking) return estimate;
  if (destinationWalking.stopId !== result.legs.at(-1).stops.at(-1)
    || !Number.isFinite(destinationWalking.walkingMinutes) || destinationWalking.walkingMinutes < 0) return null;
  return { ...estimate, walkingMinutes: estimate.walkingMinutes + destinationWalking.walkingMinutes,
    estimatedMinutes: estimate.estimatedMinutes + destinationWalking.walkingMinutes };
}
