import { useId, useState } from 'react';
export default function StopList({ stops, activeStop, onHighlight, onFocusStop }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const longList = stops.length > 4;
  const visibleStops = longList && !expanded ? stops.filter((stop, index) => index === 0 || index === stops.length - 1 || stop.role === 'transfer') : stops;
  return <div className="ordered-journey"><h3>Journey stops</h3><p className="form-hint">Select a stop to focus the map.</p>
    <ol id={listId} className="stop-list">{visibleStops.map((stop, index) => <li key={`${index}-${stop.id}`} value={stops.indexOf(stop) + 1}>
      <button type="button" className={`stop-button stop-button--${stop.role}${activeStop === stop.id ? ' is-active' : ''}`} onMouseEnter={() => onHighlight(stop.id)} onMouseLeave={() => onHighlight(null)} onFocus={() => onHighlight(stop.id)} onBlur={() => onHighlight(null)} onClick={() => onFocusStop(stop.id)} aria-label={`${stop.name}, ${stop.role}. Focus on map`}><span>{stop.name}</span><small>{stop.role === 'transfer' ? 'Transfer · Change bus here' : stop.role === 'destination' ? 'Final destination' : stop.role === 'origin' ? 'Origin' : 'Intermediate stop'}</small></button>
    </li>)}</ol>
    {longList && <button className="text-button" type="button" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show fewer stops' : `Show all stops (${stops.length})`}</button>}
  </div>;
}
