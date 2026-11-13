import { useEffect, useId, useRef, useState } from 'react';
import { matchStops } from '../utils/matchStops.js';
import Icon from './Icon.jsx';

export default function StopAutocomplete({ label, caption, value, onChange, stops, placeholder }) {
  const id = useId();
  const [query, setQuery] = useState(() => stops.find(stop => stop.stop_id === value)?.stop_name || '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const list = useRef(null);
  const matches = matchStops(stops, query);
  const invalid = Boolean(query.trim() && !value);

  useEffect(() => {
    if (value) setQuery(stops.find(stop => stop.stop_id === value)?.stop_name || '');
  }, [value, stops]);
  useEffect(() => {
    if (open && active >= 0) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function choose(stop) {
    setQuery(stop.stop_name);
    onChange(stop.stop_id);
    setOpen(false);
    setActive(-1);
  }

  function keyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive(previous => !matches.length ? -1 : !open || previous < 0 ? (event.key === 'ArrowDown' ? 0 : matches.length - 1) : (previous + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (active >= 0 && matches[active]) choose(matches[active]);
    }
  }

  return <div className="stop-autocomplete">
    <label htmlFor={id}><span aria-hidden="true">{caption || label}</span><span className="sr-only">{label}</span></label>
    <input id={id} type="text" role="combobox" aria-autocomplete="list" aria-expanded={open}
      aria-controls={`${id}-list`} aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
      aria-invalid={invalid} aria-describedby={`${id}-hint search-hint`} autoComplete="off" spellCheck={false}
      value={query} placeholder={placeholder} required
      onFocus={() => { setOpen(true); setActive(-1); }} onBlur={() => { setOpen(false); setActive(-1); }}
      onKeyDown={keyDown} onChange={event => {
        const text = event.target.value;
        setQuery(text); setOpen(true); setActive(-1);
        // A typed exact name is valid; partial/unknown text immediately clears the selected ID.
        const exact = stops.find(stop => stop.stop_name.toLocaleLowerCase() === text.trim().toLocaleLowerCase());
        onChange(exact?.stop_id || '');
      }} />
    <ul ref={list} id={`${id}-list`} role="listbox" aria-label={`${label} bus stops`} className="stop-suggestions" hidden={!open}>
      {matches.map((stop, index) => <li id={`${id}-option-${index}`} key={stop.stop_id} role="option" aria-selected={index === active}
        className={index === active ? 'active' : ''} onPointerDown={event => event.preventDefault()}
        onClick={() => choose(stop)}><Icon name="pin"/>{stop.stop_name}</li>)}
    </ul>
    <p id={`${id}-hint`} className="form-hint" role="status">{invalid ? 'Please select a valid bus stop from the suggestions.' : open ? `${matches.length} suggestions shown. Use arrow keys and Enter to select.` : ''}</p>
  </div>;
}
