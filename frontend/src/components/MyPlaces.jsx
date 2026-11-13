import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import PlaceDialog from './PlaceDialog.jsx';
import { getSavedPlaces, addSavedPlace, updateSavedPlace, deleteSavedPlace, MAX_SAVED_PLACES } from '../services/savedPlacesService.js';

export default function MyPlaces({ onSelect, onPlaceChange }) {
  const [places, setPlaces] = useState([]);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const addButton = useRef(null);
  useEffect(() => { try { setPlaces(getSavedPlaces()); } catch { setError('Unable to load saved places.'); } }, []);
  function save(value) {
    const rows = editor.place ? updateSavedPlace(editor.place.id, value) : addSavedPlace(value);
    setPlaces(rows); setError('');
    if (editor.place) onPlaceChange(editor.place.id, rows.find(item => item.id === editor.place.id));
  }
  function remove(place) {
    try { setPlaces(deleteSavedPlace(place.id)); setError(''); onPlaceChange(place.id, null); addButton.current?.focus(); }
    catch { setError('Unable to save this place.'); }
  }
  return <section className="my-places" aria-labelledby="my-places-title">
    <div className="my-places-heading"><div><h3 id="my-places-title">My Places</h3><p lang="ne">मेरो स्थानहरू</p></div><button ref={addButton} type="button" className="add-place" onClick={event => { if (places.length >= MAX_SAVED_PLACES) setError('You can save up to 10 places.'); else setEditor({ place: null, opener: event.currentTarget }); }}>+ Add place</button></div>
    {!places.length && <p className="form-hint">Save a bus stop or address for faster journey searches.</p>}
    {places.length > 0 && <ul className="saved-place-list">{places.map(place => <li className="saved-place-card" key={place.id}>
      <div className="saved-place-info"><strong><Icon name={place.type === 'address' ? 'pin' : 'bus'}/>{place.label}</strong><small title={place.type === 'address' ? place.displayAddress : place.stopName}>{place.type === 'address' ? place.displayAddress : place.stopName}</small></div>
      <button type="button" aria-label={`Use ${place.label} as origin`} onClick={() => onSelect('origin', place)}>From</button>
      <button type="button" aria-label={`Use ${place.label} as destination`} onClick={() => onSelect('destination', place)}>To</button>
      <details className="saved-place-menu" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); } }}><summary role="button" aria-label={`Manage ${place.label}`}>⋯</summary><div><button type="button" onClick={event => { const details = event.currentTarget.closest('details'); const opener = details.querySelector('summary'); details.open = false; setEditor({ place, opener }); }}>Edit</button><button type="button" onClick={() => remove(place)}>Delete</button></div></details>
    </li>)}</ul>}
    {places.length >= MAX_SAVED_PLACES && <p className="form-hint">You can save up to 10 places.</p>}
    {error && <p className="place-error" role="alert">{error}</p>}
    {editor && <PlaceDialog place={editor.place} returnFocus={editor.opener} onSave={save} onClose={() => setEditor(null)}/>}
  </section>;
}
