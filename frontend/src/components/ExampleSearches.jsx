import { stopsById } from '../data/network.js';
const examples = [['thankot', 'airport'], ['kapan', 'balaju'], ['godawari', 'jamal']];
export default function ExampleSearches({ onSelect }) {
  return <section className="examples" aria-labelledby="examples-title"><h3 id="examples-title">Try an Example Journey</h3><div className="example-buttons">{examples.map(([origin, destination]) => <button type="button" key={origin + destination} onClick={() => onSelect(origin, destination)}>{stopsById[origin].name} → {stopsById[destination].name}</button>)}</div></section>;
}
