import { formatEstimatedTimeRange } from '../utils/travelTime.js';
export default function JourneyRecommendation({ recommendation, destinationWalking, originPlace, destinationPlace }) {
  if (!recommendation?.selected) return null;
  const selected = recommendation.selected;
  return <section className="recommendation-card" aria-labelledby="recommendation-title">
    <h2 id="recommendation-title">{originPlace?.type === 'address' ? originPlace.label : selected.origin.name} &rarr; {destinationPlace?.type === 'address' ? destinationPlace.label : selected.destination.name}</h2>
    <div className="journey-summary"><span>Estimated travel time: {formatEstimatedTimeRange(selected.estimate.estimatedMinutes + (destinationWalking?.walkingMinutes || 0))}</span>
      <span>{selected.estimate.transferCount} {selected.estimate.transferCount === 1 ? 'transfer' : 'transfers'}</span>
      <span>{selected.result.stopCount} stops</span></div>
    <button type="button" className="primary-button" onClick={() => { const result = document.querySelector('.result'); result?.scrollIntoView({ behavior: 'smooth', block: 'start' }); result?.focus({ preventScroll: true }); }}>View Journey</button>
  </section>;
}
