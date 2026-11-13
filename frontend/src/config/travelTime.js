// Development assumptions, not official timetable or live traffic data.
export const AVERAGE_WALKING_SPEED_KMH = 4.8;
export const AVERAGE_BUS_SPEED_KMH = 18;
export const STOP_DELAY_SECONDS = 30;
export const TRANSFER_TIME_MINUTES = 5;

export const TRAVEL_TIME_CONFIG = Object.freeze({
  averageWalkingSpeedKmh: AVERAGE_WALKING_SPEED_KMH,
  averageBusSpeedKmh: AVERAGE_BUS_SPEED_KMH,
  stopDelaySeconds: STOP_DELAY_SECONDS,
  transferTimeMinutes: TRANSFER_TIME_MINUTES,
});
