import { formatDistance } from '../utils/distance.js';
import { formatWalkingTime } from '../utils/travelTime.js';
export default function WalkingSegment({ walking, arrival = false }) {
  const routed = walking.source === 'pedestrian';
  return <li className={`walking-segment${arrival ? ' walking-segment--destination' : ''}`}><div className="segment-company"><strong>Walk to {walking.endLabel || walking.stopName}</strong><span className="route-id">{routed ? 'Pedestrian route' : 'Approximate walking estimate'}</span></div><div className="segment-timeline"><div className="timeline-stop"><small>{arrival ? 'Alight at bus stop' : 'Start'}</small><strong>{walking.startLabel || 'Your location'}</strong></div><p className="walking-connection">{formatWalkingTime(walking.walkingMinutes)} &middot; Approx. {formatDistance(walking.distanceMetres)}</p><div className="timeline-stop timeline-stop--exit"><small>{arrival ? 'Saved destination' : 'Starting bus stop'}</small><strong>{walking.endLabel || walking.stopName}</strong></div></div></li>;
}
