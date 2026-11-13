import { networkStops } from '../data/network.js';
import StopAutocomplete from './StopAutocomplete.jsx';
import Icon from './Icon.jsx';
export default function SearchForm({ origin, destination, onChange, onSwap, onSearch, onReset, loading, onLocate, locating, locationMessage, originPlace, destinationPlace, pendingSavedWalking }) {
  const hint = origin && destination && origin === destination ? 'Starting location and destination cannot be the same.' : 'Select a bus stop from the suggestions.';
  return <form noValidate onSubmit={event => { event.preventDefault(); if (!loading && !pendingSavedWalking) onSearch(); }}>
    <div className="form-heading"><div><Icon name="bus"/><h2>Plan your journey</h2></div><span className="muted">Kathmandu Valley</span></div>
    <div className="search-fields">
      <div className="origin-field"><StopAutocomplete label="Origin" caption="From" value={origin} onChange={value => onChange('origin', value)} stops={networkStops} placeholder="Type your starting stop" />{originPlace && <p className="saved-endpoint-hint">{originPlace.label}{originPlace.type === 'address' ? ' · Saved address; walk to this bus stop.' : ' · Saved bus stop'}</p>}</div>

      <div className="destination-field"><StopAutocomplete label="Destination" caption="To" value={destination} onChange={value => onChange('destination', value)} stops={networkStops} placeholder="Type your destination" />{destinationPlace && <p className="saved-endpoint-hint">{destinationPlace.label}{destinationPlace.type === 'address' ? ' · Saved address; walk from this bus stop.' : ' · Saved bus stop'}</p>}</div>
    </div>
    <p id="location-status" className="form-hint" role="status" aria-live="polite">{locationMessage}</p>
    <p id="search-hint" className="form-hint" role="status">{hint}</p>
    {pendingSavedWalking && <p className="form-hint" role="status">Calculating walking route...</p>}
    <div className="search-actions"><button className="primary-button" type="submit" disabled={loading || pendingSavedWalking}>{pendingSavedWalking ? 'Calculating walking route...' : loading ? 'Finding the best connection\u2026' : 'Find Routes'}<Icon name="arrow"/></button><button type="button" className="location-button" onClick={onLocate} disabled={locating} aria-describedby="location-status"><Icon name="locate"/>{locating ? (locationMessage.startsWith('Finding walking') ? 'Finding walking route...' : 'Finding your location...') : 'Use my location'}</button><button className="compact-swap" type="button" onClick={onSwap} aria-label="Swap origin and destination" title="Swap stops"><Icon name="swap"/></button><button type="button" className="reset-button" onClick={onReset}>Reset</button></div>
  </form>;
}
