import { useRef, useState } from 'react';
import { parseJourneyIntent } from '../services/aiJourneyAssistant.js';

export default function AIJourneyAssistant({ onIntent, onRequest, busy, status }) {
  const [message, setMessage] = useState('');
  const [intent, setIntent] = useState(null);
  const [parsing, setParsing] = useState(false);
  const revision = useRef(0);
  const hasChoices = value => Object.values(value.suggestions || {}).some(items => items.length);
  async function ask(event) {
    event.preventDefault();
    const request = ++revision.current;
    onRequest();
    setIntent(null);
    setParsing(true);
    try {
      const parsed = await parseJourneyIntent(message);
      if (request !== revision.current) return;
      const next = parsed;
      setIntent(next);
      if (!next.error && !hasChoices(next)) onIntent(next);
    } finally {
      if (request === revision.current) setParsing(false);
    }
  }
  function resolve(field, option) {
    const next = { ...intent, [field]: option.id,
      ...(field === 'destination' ? { destinationType: option.type } : {}),
      suggestions: { ...intent.suggestions, [field]: [] } };
    setIntent(next);
    if (!next.error && !hasChoices(next)) onIntent(next);
  }
  return <section className="assistant-card" aria-labelledby="assistant-title">
    <h2 id="assistant-title">Ask Route Assistant</h2>
    <p className="assistant-nepali" lang="ne">यात्रा सहायक</p>
    <p className="muted">Describe where you want to go.</p>
    <form className="assistant-form" onSubmit={ask}>
      <label htmlFor="assistant-message">Your journey request</label>
      <textarea id="assistant-message" maxLength={2000} rows={2} value={message}
        onChange={event => { revision.current++; setParsing(false); setIntent(null); setMessage(event.target.value); onRequest(); }}
        placeholder="I want to go from Bouddha to Kapan" required />
      <button className="primary-button" disabled={busy || parsing}>{parsing || busy ? 'Finding journey...' : 'Find Route'}</button>
    </form>
    {intent && Object.entries(intent.suggestions || {}).map(([field, options]) => options.length > 0 &&
      <div key={field} className="intent-suggestions"><h3>{field === 'origin' ? 'Which starting point?' : 'Did you mean?'}</h3>
        {options.map(option => <button key={option.type + option.id} type="button" disabled={busy || parsing} onClick={() => resolve(field, option)}>
          <strong>{option.name}</strong><small>Bus stop</small>
        </button>)}
      </div>)}
    {intent?.error && <p role="alert">{intent.error}</p>}
    <p className="assistant-status" role="status" aria-live="polite">{status}</p>
  </section>;
}
