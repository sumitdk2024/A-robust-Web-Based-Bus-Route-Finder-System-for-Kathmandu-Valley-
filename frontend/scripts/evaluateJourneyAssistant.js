import { parseJourneyIntentLocal, recommendJourney } from '../src/services/aiJourneyAssistant.js';
import { stopsById } from '../src/data/network.js';
const queries = [
 'I want to go from Bouddha to Kapan',
 'Go from Thankot to the airport',
 'I am near Baluwatar and want to go to Ratna Park',
 'Take me to Balaju from Gongabu',
 'Take me from Lagankhel to Balaju',
 'Find a route from Ratna Park to Kapan',
 'Find a route from Lagankhel to Bhaktapur',
];
const results = queries.map(message => {
 const intent = parseJourneyIntentLocal(message);
 const unresolved = Object.values(intent.suggestions).some(items=>items.length);
 const answer = unresolved ? null : recommendJourney(intent, {location:intent.useCurrentLocation ? stopsById.baluwatar : null});
 return {message,intent, locationFixture:intent.useCurrentLocation ? 'Baluwatar dataset coordinate (test only)' : null,
  status:unresolved ? 'Clarification required' : !intent.origin && !intent.useCurrentLocation ? 'Starting point required' : answer?.selected ? 'Journey recommended' : answer?.message,
  evaluation:answer?.report};
});
console.log(JSON.stringify(results,null,2));
