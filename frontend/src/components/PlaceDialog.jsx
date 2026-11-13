import { useEffect, useRef, useState } from 'react';
import StopAutocomplete from './StopAutocomplete.jsx';
import { networkStops } from '../data/network.js';
import { searchAddress } from '../services/geocodingService.js';
import { nearestStopForAddress } from '../services/savedPlacesService.js';

export default function PlaceDialog({ place, onSave, onClose, returnFocus }) {
  const dialog = useRef(null);
  const request = useRef(null);
  const [label, setLabel] = useState(place?.label || '');
  const [type, setType] = useState(place?.type || 'bus_stop');
  const [stopId, setStopId] = useState(place?.stopId || '');
  const [query, setQuery] = useState(place?.displayAddress || '');
  const [address, setAddress] = useState(place?.type === 'address' ? place : null);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const opener = returnFocus || document.activeElement;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    dialog.current.querySelector('#place-label').focus();
    return () => { request.current?.abort(); dialog.current?.close(); document.body.style.overflow = overflow; opener?.focus(); };
  }, []);
  function close() { request.current?.abort(); dialog.current.close(); onClose(); }
  function changeType(value) {
    request.current?.abort(); setStatus(''); setError(''); setType(value); setResults([]);
  }
  async function search() {
    if (query.trim().length < 3) { setError('Please enter an address of at least 3 characters.'); return; }
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setError(''); setAddress(null); setResults([]); setStatus('Searching address...');
    try {
      const found = await searchAddress(query, { signal: controller.signal });
      if (!controller.signal.aborted) { setResults(found); setStatus('Choose the matching address below.'); }
    } catch (failure) {
      if (!controller.signal.aborted) { setError(failure.message || 'We could not find that address.'); setStatus(''); }
    }
  }
  function chooseAddress(item) {
    setError(''); setStatus('Finding nearby bus stops...');
    try {
      const stop = nearestStopForAddress(item);
      setAddress({ displayAddress: item.displayName, latitude: item.latitude, longitude: item.longitude,
        nearestStopId: stop.id, nearestStopName: stop.name });
      setResults([]); setStatus('');
    } catch (failure) { setAddress(null); setError(failure.message); setStatus(''); }
  }
  function save(event) {
    event.preventDefault(); setError('');
    if (!label.trim()) { setError('Please enter a place label.'); return; }
    if (type === 'bus_stop' && !stopId) { setError('Please select a supported bus stop.'); return; }
    if (type === 'address' && !address) { setError('Search for and select an address within Nepal.'); return; }
    try { onSave({ label, type, ...(type === 'bus_stop' ? { stopId } : address) }); close(); }
    catch (failure) { setError(failure.message || 'Unable to save this place.'); }
  }
  return <dialog ref={dialog} className="place-dialog" aria-labelledby="place-dialog-title" onCancel={event => { event.preventDefault(); close(); }}>
    <div className="place-dialog-heading"><h2 id="place-dialog-title">{place ? 'Edit place' : 'Add place'}</h2><button type="button" onClick={close} aria-label="Close saved place dialog">×</button></div>
    <p className="form-hint">Save a location you use often.</p>
    <form onSubmit={save} noValidate>
      <label htmlFor="place-label">Place label</label>
      <input id="place-label" autoFocus maxLength={50} value={label} onChange={event => setLabel(event.target.value)} placeholder="Home, Work or College" required />
      <fieldset><legend>Location type</legend>{[['bus_stop', 'Bus stop'], ['address', 'Address']].map(([value, text]) => <label key={value}><input type="radio" name="place-type" value={value} checked={type === value} onChange={() => changeType(value)}/>{text}</label>)}</fieldset>
      {type === 'bus_stop' ? <StopAutocomplete label="Search bus stop" value={stopId} onChange={setStopId} stops={networkStops} placeholder="Type a supported bus stop"/> : <div>
        <label htmlFor="place-address">Nepal address</label>
        <div className="address-search-row"><input id="place-address" maxLength={300} value={query} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); search(); } }} onChange={event => { request.current?.abort(); setStatus(''); setQuery(event.target.value); setAddress(null); setResults([]); setError(''); }} placeholder="New Baneshwor, Kathmandu"/><button type="button" disabled={status === 'Searching address...'} onClick={search}>Search address</button></div>
        {results.length > 0 && <ul className="address-results" aria-label="Matching addresses">{results.map((item, index) => <li key={index}><button type="button" onClick={() => chooseAddress(item)}>{item.displayName}</button></li>)}</ul>}
        {address && <div className="selected-address"><strong>{address.displayAddress}</strong><p>Nearest supported bus stop: <strong>{address.nearestStopName}</strong></p><small>The address is separate from this bus stop. A walking connection is added when you use it.</small></div>}
        <p className="form-hint">Address search: openrouteservice / OpenStreetMap contributors.</p>
      </div>}
      {status && <p className="form-hint" role="status">{status}</p>}
      {error && <p className="place-error" role="alert">{error}</p>}
      <div className="place-dialog-actions"><button type="button" onClick={close}>Cancel</button><button className="primary-button" type="submit" disabled={status === 'Searching address...'}>Save place</button></div>
    </form>
  </dialog>;
}
