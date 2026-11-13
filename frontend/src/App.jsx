import Icon from './components/Icon.jsx';
import AIJourneyAssistant from './components/AIJourneyAssistant.jsx';
import JourneyRecommendation from './components/JourneyRecommendation.jsx';
import { recommendJourney } from './services/aiJourneyAssistant.js';
import { NEARBY_CANDIDATE_COUNT } from './config/journeyRecommendation.js';
import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import { HeroSection, AboutProject, Footer } from './components/HomeSections.jsx';
import MyPlaces from './components/MyPlaces.jsx';
import { useSavedPlaceWalking } from './services/useSavedPlaceWalking.js';
import NearestStops from './components/NearestStops.jsx';
import ExampleSearches from './components/ExampleSearches.jsx';
import SearchForm from './components/SearchForm.jsx';
import RouteResult from './components/RouteResult.jsx';
import RouteMap from './components/RouteMap.jsx';
import { networkStops, stopsById } from './data/network.js';
import { estimateWalkingTime } from './utils/travelTime.js';
import { findJourney } from './utils/findJourney.js';
import { findNearestStops, hasValidCoordinates } from './utils/distance.js';
import { isInsideNepal, OUTSIDE_NEPAL_MESSAGE } from './utils/nepal.js';
import { routeNearbyStops, MAX_NEARBY_DISTANCE_METRES, NO_NEARBY_MESSAGE, WALKING_UNAVAILABLE_MESSAGE } from './services/walkingRoutes.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('journey');
  const isAbout = window.location.pathname.replace(/\/$/, '') === '/about';
  const [recommendation, setRecommendation] = useState(null);
  const [assistantRevision, setAssistantRevision] = useState(0);
  const [assistantStatus, setAssistantStatus] = useState('');
  const [recommendNearby, setRecommendNearby] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const { walking: originAddressWalking, busy: originAddressBusy } = useSavedPlaceWalking(originPlace, 'to-stop');
  const { walking: destinationWalking, busy: destinationAddressBusy } = useSavedPlaceWalking(destinationPlace, 'from-stop');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStop, setActiveStop] = useState(null);
  const [focusedStop, setFocusedStop] = useState(null);
  const [inputRevision, setInputRevision] = useState(0);
  const timer = useRef(null);
  const locationRequest = useRef(0);
  const walkingRequest = useRef(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationOrigin, setLocationOrigin] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const walking = originPlace?.type === 'address' ? originAddressWalking : locationOrigin === origin ? nearbyStops.find(stop => stop.id === origin)?.walking || estimateWalkingTime(userLocation, stopsById[origin]) : null;
  useEffect(() => () => { clearTimeout(timer.current); locationRequest.current += 1; walkingRequest.current?.abort(); }, []);

  function cancelLocationRequest() {
    locationRequest.current += 1;
    walkingRequest.current?.abort();
    setLocating(false);
    setLocationMessage('');
  }

  function locateUser(intent = null) {
    setOriginPlace(null);
    walkingRequest.current?.abort();
    const controller = new AbortController();
    walkingRequest.current = controller;
    const request = ++locationRequest.current;
    const current = () => request === locationRequest.current && !controller.signal.aborted;
    setLocationOrigin(null);
    setRecommendNearby(false);
    clearResult();
    setUserLocation(null);
    setNearbyStops([]);
    const showLocationMessage = message => {
      setLocationMessage(message);
      if (intent) setAssistantStatus(message);
    };
    if (!navigator.geolocation) {
      showLocationMessage('Location is unavailable in this browser. You can still select a stop manually.');
      return;
    }
    setLocating(true);
    showLocationMessage('Finding your location...');
    const fail = error => {
      if (!current()) return;
      setLocating(false);
      showLocationMessage(error.code === 1
        ? 'Location access was denied. Please select a starting bus stop manually.'
        : error.code === 3 ? 'Location request timed out. Try again or select a stop manually.'
          : 'Unable to obtain your location. Try again or select a stop manually.');
    };
    try {
      navigator.geolocation.getCurrentPosition(async position => {
        if (!current()) return;
        const { latitude, longitude, accuracy } = position.coords;
        if (!hasValidCoordinates(latitude, longitude)) { fail({ code: 2 }); return; }
        // Reject foreign locations before finding candidates, storing a user
        // marker, requesting walking directions or creating any journey.
        if (!isInsideNepal(latitude, longitude)) {
          setLocating(false);
          showLocationMessage(OUTSIDE_NEPAL_MESSAGE);
          return;
        }
        const nearest = findNearestStops(networkStops, latitude, longitude, NEARBY_CANDIDATE_COUNT)
          .filter(stop => stop.distance <= MAX_NEARBY_DISTANCE_METRES);
        if (!nearest.length) {
          setLocating(false);
          showLocationMessage(NO_NEARBY_MESSAGE);
          return;
        }
        const location = { latitude, longitude, accuracy };
        setUserLocation(location);
        showLocationMessage('Finding walking route to the bus stop...');
        try {
          const candidates = await routeNearbyStops(location, nearest, { signal: controller.signal });
          if (!current()) return;
          setNearbyStops(candidates);
          setLocating(false);
          setOrigin(candidates[0].id);
          setLocationOrigin(candidates[0].id);
          setRecommendNearby(true);
          setInputRevision(value => value + 1);
          if (intent || destination) {
            runRecommendation(intent || { origin: null, destination,
              destinationType: 'stop', useCurrentLocation: true }, location, candidates);
          }
          showLocationMessage(candidates.some(stop => stop.walking.source !== 'pedestrian')
            ? WALKING_UNAVAILABLE_MESSAGE
            : 'Nearby stops are ready. Walking times follow pedestrian routes.');
        } catch {
          // Abort on reset/manual editing. Never restore an obsolete location.
          if (current()) fail({ code: 2 });
        }
      }, fail, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } catch (error) { fail(error); }
  }

  function clearResult() {
    clearTimeout(timer.current);
    setLoading(false);
    setResult(null);
    setActiveStop(null);
    setFocusedStop(null);
    setRecommendation(null);
  }

  function search(from = origin, to = destination, useRecommendation = true) {
    setActiveTab('journey');
    if (useRecommendation && recommendNearby && locationOrigin === from && userLocation && to) {
      runRecommendation({ origin: null, destination: to,
        destinationType: 'stop',
        useCurrentLocation: true });
      return;
    }
    clearResult();
    if (!from || !to || from === to) { setResult(findJourney(from, to)); return; }
    setLoading(true);
    timer.current = setTimeout(() => {
      setResult(findJourney(from, to));
      setLoading(false);
    }, 450);
  }

  function resetSearch() {
    setOriginPlace(null); setDestinationPlace(null);
    setAssistantRevision(value => value + 1);
    setAssistantStatus('');
    setRecommendNearby(false);
    setLocationOrigin(null);
    cancelLocationRequest();
    setUserLocation(null);
    setNearbyStops([]);
    setInputRevision(value => value + 1);
    clearResult();
    setOrigin('');
    setDestination('');
  }

  function chooseExample(from, to) {
    setOriginPlace(null); setDestinationPlace(null);
    setAssistantStatus('');
    setRecommendNearby(false);
    setLocationOrigin(null);
    cancelLocationRequest();
    setInputRevision(value => value + 1);
    setOrigin(from);
    setDestination(to);
    search(from, to, false);
  }

  function changeStop(field, value) {
    cancelLocationRequest();
    setAssistantStatus('');
    if (field === 'origin') { setOriginPlace(null); setOrigin(value); setLocationOrigin(null); setRecommendNearby(false); }
    else { setDestinationPlace(null); setDestination(value); }
    clearResult();
  }

  function swapStops() {
    if (destinationPlace?.type === 'address') { setUserLocation(null); setNearbyStops([]); }
    setOriginPlace(destinationPlace); setDestinationPlace(originPlace);
    setRecommendNearby(false);
    setAssistantStatus('');
    setLocationOrigin(null);
    cancelLocationRequest();
    setInputRevision(value => value + 1);
    setOrigin(destination);
    setDestination(origin);
    clearResult();
  }

  function runRecommendation(intent, location = userLocation, candidates = nearbyStops) {
    setActiveTab('journey');
    clearResult();
    const answer = recommendJourney(intent, { location, walkingByStop: Object.fromEntries(candidates.map(stop => [stop.id, stop.walking])), candidateStopIds: candidates.map(stop => stop.id) });
    if (!answer.selected) { setAssistantStatus(answer.message); setResult({ type: 'message', message: answer.message }); return; }
    const option = answer.selected;
    setRecommendation(answer);
    setOrigin(option.origin.id);
    setDestination(option.destination.id);
    setLocationOrigin(intent.useCurrentLocation ? option.origin.id : null);
    setRecommendNearby(intent.useCurrentLocation);
    setInputRevision(value => value + 1);
    setResult(option.result);
    setAssistantStatus('');
  }

  function handleAssistantIntent(intent) {
    setOriginPlace(null); setDestinationPlace(null);
    cancelLocationRequest();
    clearResult();
    if (!intent.destination) {
      setAssistantStatus('I could not match that destination to a supported bus stop.');
      return;
    }
    if (intent.useCurrentLocation) {
      if (userLocation) runRecommendation(intent);
      else { setAssistantStatus('Finding nearby starting stops using your browser location.'); locateUser(intent); }
      return;
    }
    if (!intent.origin) {
      if (intent.destination) {
        setDestination(intent.destination);
        setInputRevision(value => value + 1);
        const name = stopsById[intent.destination].name;
        setAssistantStatus(`To reach ${name}, please select your starting point or use your current location.`);
      } else setAssistantStatus('Please select your starting point or use your current location.');
      return;
    }
    setRecommendNearby(false);
    runRecommendation(intent);
  }

  function chooseSavedPlace(field, place) {
    cancelLocationRequest(); clearResult(); setAssistantStatus('');
    const stop = place.type === 'address' ? place.nearestStopId : place.stopId;
    if (field === 'origin') {
      setOriginPlace(place); setOrigin(stop); setLocationOrigin(null);
      setRecommendNearby(false); setUserLocation(null); setNearbyStops([]);
    } else { setDestinationPlace(place); setDestination(stop); }
    setInputRevision(value => value + 1);
  }

  function savedPlaceChanged(id, place) {
    for (const [field, selected] of [['origin', originPlace], ['destination', destinationPlace]]) {
      if (selected?.id !== id) continue;
      if (place) chooseSavedPlace(field, place);
      else {
        if (field === 'origin') setOriginPlace(null); else setDestinationPlace(null);
        clearResult();
      }
    }
  }

  return (
    <div className={`app-shell${result?.legs ? ' app-shell--results' : ''}`} id="home">
      <a className="skip-link" href="#journey">Skip to journey planner</a>
      <Header />
      <main>
        {isAbout ? <AboutProject /> : <>
        <HeroSection />
        <div id="journey" className="planner">
          <div className="planner-top">
          <div className="search-card">
            <SearchForm key={inputRevision} origin={origin} destination={destination} onChange={changeStop} onSwap={swapStops} onSearch={() => search()} onReset={resetSearch} loading={loading} onLocate={() => locateUser()} locating={locating} locationMessage={locationMessage} originPlace={originPlace} destinationPlace={destinationPlace} pendingSavedWalking={originAddressBusy || destinationAddressBusy} />
            <MyPlaces onSelect={chooseSavedPlace} onPlaceChange={savedPlaceChanged} />
          </div>
            <RouteMap originPlace={originPlace} destinationPlace={destinationPlace} destinationWalking={destinationWalking} walking={walking} result={result} activeStop={activeStop} focusedStop={focusedStop} userLocation={userLocation} nearestStop={nearbyStops[0]} nearbyOrigin={walking ? nearbyStops.find(stop => stop.id === locationOrigin) : null} />
          </div>
          <div className={`workspace${!result?.legs && !userLocation ? ' workspace--initial' : ''}`}>
            <RouteResult originPlace={originPlace} destinationPlace={destinationPlace} destinationWalking={destinationWalking} walking={walking} result={result} loading={loading} activeStop={activeStop} onHighlight={setActiveStop} onFocusStop={id => { setActiveStop(id); setFocusedStop({ id }); }} />
          </div>
          <div className="secondary-tabs" role="tablist" aria-label="Planner content">{[['journey', 'Journey Details'], ['nearby', 'Nearby Stops']].map(([id, label]) => <button type="button" key={id} id={`tab-${id}`} role="tab" aria-selected={activeTab === id} aria-controls={`panel-${id}`} tabIndex={activeTab === id ? 0 : -1} onClick={() => setActiveTab(id)} onKeyDown={event => { const ids = ['journey', 'nearby']; const index = ids.indexOf(id); const next = event.key === 'ArrowRight' ? ids[(index + 1) % 2] : event.key === 'ArrowLeft' ? ids[(index + 1) % 2] : event.key === 'Home' ? ids[0] : event.key === 'End' ? ids[1] : null; if (next) { event.preventDefault(); setActiveTab(next); document.getElementById(`tab-${next}`)?.focus(); } }}>{label}</button>)}</div>
          <section role="tabpanel" id="panel-journey" aria-labelledby="tab-journey" hidden={activeTab !== 'journey'}><ExampleSearches onSelect={chooseExample} /><p className="form-hint">Select a stop in your journey to focus it on the map.</p></section>
          <section role="tabpanel" id="panel-nearby" aria-labelledby="tab-nearby" hidden={activeTab !== 'nearby'}>
          <NearestStops stops={nearbyStops} origin={origin} onSelect={value => { setOriginPlace(null); cancelLocationRequest(); setOrigin(value); setLocationOrigin(value); setRecommendNearby(false); setInputRevision(revision => revision + 1); clearResult(); }} accuracy={userLocation?.accuracy} />
          {!nearbyStops.length && <div className="tab-empty"><p>Find the closest bus stops and walking estimates.</p><button type="button" onClick={() => locateUser()} disabled={locating}>{locating ? 'Finding stops...' : 'Find nearby stops'}</button></div>}</section>
          <details className="assistant-disclosure"><summary><Icon name="route"/>Ask Route Assistant <span lang="ne">यात्रा सहायक</span></summary>
          <AIJourneyAssistant key={assistantRevision} onRequest={() => { cancelLocationRequest(); clearResult(); setAssistantStatus(''); }} onIntent={handleAssistantIntent} busy={locating || loading} status={assistantStatus || (locating ? locationMessage : '')} />
          <JourneyRecommendation recommendation={recommendation} destinationWalking={destinationWalking} originPlace={originPlace} destinationPlace={destinationPlace} />
          </details>
        </div>
        </>}
      </main>
      <Footer />
    </div>
  );
}
