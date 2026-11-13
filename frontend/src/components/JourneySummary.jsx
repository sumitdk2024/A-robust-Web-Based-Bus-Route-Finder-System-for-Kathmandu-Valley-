import { completeJourneyTime } from '../utils/completeJourneyTime.js';
import { getJourneyStops } from '../utils/journeyStops.js';
import { formatEstimatedTimeRange, formatWalkingTime } from '../utils/travelTime.js';
export default function JourneySummary({ result, walking, destinationWalking }) {
  const estimate = completeJourneyTime(result, walking, destinationWalking);
  const transfers = result.legs.length - 1;
  return <div><dl className="journey-summary" aria-label="Journey summary">
    <div><dt>Estimated travel time</dt><dd>{estimate ? formatEstimatedTimeRange(estimate.estimatedMinutes) : 'Estimate unavailable'}</dd></div>
    <div><dt>Stops</dt><dd>{getJourneyStops(result).length} stops</dd></div>
    <div><dt>Bus changes</dt><dd>{transfers} {transfers === 1 ? 'transfer' : 'transfers'}</dd></div>
    <div><dt>Approximate bus distance</dt><dd>{estimate ? `Approx. ${estimate.distanceKm.toFixed(1)} km` : 'Distance unavailable'}</dd></div>
  </dl><details className="estimate-details"><summary>About this estimate</summary>{(walking || destinationWalking) && estimate && <dl className="time-breakdown" aria-label="Estimated time breakdown"><div><dt>Walking</dt><dd>{formatWalkingTime(estimate.walkingMinutes)}</dd></div><div><dt>Bus (including stops)</dt><dd>~{Math.max(1, Math.round(estimate.busMinutes))} min</dd></div><div><dt>Transfers</dt><dd>{estimate.transferCount} {estimate.transferCount === 1 ? 'transfer' : 'transfers'} &middot; ~{Math.round(estimate.transferMinutes)} min</dd></div><div><dt>Total</dt><dd>{formatEstimatedTimeRange(estimate.estimatedMinutes)}</dd></div></dl>}<p className="estimate-note">Travel time is estimated from route distance, stops and transfer time. Actual journey time may vary due to traffic and waiting time.</p><p className="estimate-note">Bus distance follows straight-line connections between stops, not exact road geometry.</p>{(walking || destinationWalking) && <p className="estimate-note">{[walking, destinationWalking].filter(Boolean).every(item => item.source === 'pedestrian') ? 'Walking distance and time come from pedestrian routing directions. Actual conditions may vary.' : 'Approximate walking connections use geographic distance and average speed when pedestrian directions are unavailable. Each connection is labelled separately.'}</p>}</details></div>;
}
