import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { networkStops, stopsById } from '../data/network.js';
import { getJourneyStops } from '../utils/journeyStops.js';
import { formatDistance } from '../utils/distance.js';

const roles = {
  origin: { label: 'Origin', symbol: 'O' },
  destination: { label: 'Destination', symbol: 'D' },
  intermediate: { label: 'Intermediate stop', symbol: '•' },
  transfer: { label: 'Transfer · Change bus here', symbol: 'T' },
  sample: { label: 'Bus stop', symbol: '•' },
};

export default function RouteMap({ result, activeStop, focusedStop, userLocation, nearestStop, nearbyOrigin, walking, originPlace, destinationPlace, destinationWalking }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const routesRef = useRef(null);
  const markersRef = useRef(null);
  const locationLayer = useRef(null);
  const savedPlaceLayer = useRef(null);
  const boundsRef = useRef(null);
  const stopMarkers = useRef(new Map());
  const [tileError, setTileError] = useState(false);
  const visibleStops = getJourneyStops(result);

  useEffect(() => {
    const map = L.map(container.current, { scrollWheelZoom: false });
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).on('tileerror', () => setTileError(true)).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    routesRef.current = L.layerGroup().addTo(map);
    locationLayer.current = L.layerGroup().addTo(map);
    savedPlaceLayer.current = L.layerGroup().addTo(map);
    map.fitBounds(networkStops.map(stop => stop.position), { padding: [45, 45] });
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      if (boundsRef.current) map.fitBounds(boundsRef.current, { padding: [45, 55], maxZoom: 15, animate: false });
    });
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      routesRef.current = null;
      markersRef.current = null;
      locationLayer.current = null;
      savedPlaceLayer.current = null;
    };
  }, []);

  useEffect(() => {
    routesRef.current.clearLayers();
    markersRef.current.clearLayers();
    stopMarkers.current.clear();
    const stops = getJourneyStops(result);
    // A stop may occur more than once in the journey. Render it once on the
    // map, preserving the most prominent role without changing the journey.
    const priority = { origin: 3, destination: 3, transfer: 2, intermediate: 1 };
    const markers = new Map();
    stops.forEach(stop => {
      const previous = markers.get(stop.id);
      if (!previous || priority[stop.role] > priority[previous.role]) markers.set(stop.id, stop);
    });
    markers.forEach(stop => {
      const role = roles[stop.role];
      const intermediate = stop.role === 'intermediate';
      const icon = L.divIcon({
        className: `stop-marker stop-marker--${stop.role}`,
        html: `<span aria-hidden="true">${intermediate ? '' : role.symbol}</span>`,
        // Keep the visible dot small while providing a 44px touch target.
        iconSize: intermediate ? [44, 44] : [28, 28],
        iconAnchor: intermediate ? [22, 22] : [14, 14],
      });
      const marker = L.marker(stop.position, { icon, title: `${stop.name}: ${role.label}`, alt: `${stop.name}: ${role.label}` })
        .addTo(markersRef.current);
      const popup = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = stop.name;
      const description = document.createElement('div');
      description.textContent = role.label;
      popup.append(name, description);
      marker.bindPopup(popup);
      if (!intermediate) marker.bindTooltip(stop.name, { permanent: true, direction: 'top', offset: [0, -14] });
      marker.getElement()?.setAttribute('aria-label', `${stop.name}: ${role.label}`);
      stopMarkers.current.set(stop.id, marker);
    });
    result?.legs?.forEach(leg => {
      const points = leg.stops.map(id => stopsById[id].position);
      L.polyline(points, { color: leg.color, weight: 5, dashArray: '9 8' })
        .bindTooltip(`${leg.routeId} — illustrative connection only`)
        .addTo(routesRef.current);
    });
    boundsRef.current = (stops.length ? stops : networkStops).map(stop => stop.position);
    mapRef.current.fitBounds(boundsRef.current, { padding: [45, 55], maxZoom: 15 });
  }, [result]);

  useEffect(() => {
    locationLayer.current.clearLayers();
    if (!userLocation) return;
    const position = [userLocation.latitude, userLocation.longitude];
    const icon = L.divIcon({ className: 'user-location-marker', html: '<span aria-hidden="true">●</span>', iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker(position, { icon, title: 'Your current location', alt: 'Your current location', zIndexOffset: 1500 })
      .bindPopup('Your current location (approximate)').addTo(locationLayer.current);
    const points = [position];
    for (const stop of [nearestStop, nearbyOrigin?.id !== nearestStop?.id ? nearbyOrigin : null].filter(Boolean)) {
      const label = `${stop.name}: ${stop.id === nearestStop?.id ? 'Nearest stop' : 'Selected origin'} · ${formatDistance(stop.distance)} straight-line distance`;
      L.circleMarker(stop.position, { radius: 19, color: '#1565c0', weight: 3, fillOpacity: 0.08 })
        .bindTooltip(label).addTo(locationLayer.current);
      points.push(stop.position);
    }
    if (nearbyOrigin && walking) {
      const realRoute = walking.source === 'pedestrian' && walking.geometry;
      const walkingPoints = realRoute ? walking.geometry.coordinates.map(([lon, lat]) => [lat, lon]) : [position, nearbyOrigin.position];
      L.polyline(walkingPoints, { color: '#1565c0', weight: 3, dashArray: '4 7', className: realRoute ? 'walking-route' : 'walking-route-fallback' })
        .bindTooltip(realRoute ? `Walking route to ${nearbyOrigin.name}` : 'Approximate connection — walking route unavailable')
        .addTo(locationLayer.current);
      points.push(...walkingPoints);
    }
    boundsRef.current = [...points, ...(result?.legs ? getJourneyStops(result).map(stop => stop.position) : [])];
    mapRef.current.fitBounds(boundsRef.current, { padding: [45, 55], maxZoom: 16 });
  }, [userLocation, nearestStop, nearbyOrigin, result, walking]);

  // Saved addresses are a separate overlay: never GPS markers or graph stops.
  // Bus lines, stop roles, transfer markers and the existing GPS layer stay intact.
  useEffect(() => {
    savedPlaceLayer.current.clearLayers();
    const addresses = [[originPlace, walking, false], [destinationPlace, destinationWalking, true]]
      .filter(([place]) => place?.type === 'address');
    if (!addresses.length) return;
    const points = getJourneyStops(result).map(stop => stop.position);
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);
    if (walking?.geometry) points.push(...walking.geometry.coordinates.map(([lon, lat]) => [lat, lon]));
    for (const [place, connection, arrival] of addresses) {
      const position = [place.latitude, place.longitude];
      const stop = stopsById[place.nearestStopId];
      points.push(position, stop.position);
      const content = document.createElement('div');
      content.textContent = `${place.label} — Saved address: ${place.displayAddress}`;
      const marker = L.circleMarker(position, { radius: 9, color: '#17324D', fillColor: '#E8F1F5', fillOpacity: 1, weight: 3,
        className: 'saved-address-marker' }).bindTooltip(`${place.label} · Saved address`).bindPopup(content).addTo(savedPlaceLayer.current);
      const element = marker.getElement();
      element?.setAttribute('tabindex', '0'); element?.setAttribute('role', 'button');
      element?.setAttribute('aria-label', `${place.label}: Saved address`);
      element?.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); marker.openPopup(); } });
      if (!connection) continue;
      const real = connection.source === 'pedestrian' && connection.geometry;
      const line = real ? connection.geometry.coordinates.map(([lon, lat]) => [lat, lon])
        : arrival ? [stop.position, position] : [position, stop.position];
      L.polyline(line, { color: '#1565C0', weight: 3, dashArray: '4 7', className: `saved-address-walking${arrival ? ' saved-address-walking--destination' : ''}` })
        .bindTooltip(real ? `Walk from ${connection.startLabel} to ${connection.endLabel}` : 'Approximate connection — walking route unavailable')
        .addTo(savedPlaceLayer.current);
      points.push(...line);
    }
    boundsRef.current = points;
    mapRef.current.fitBounds(points, { padding: [45, 55], maxZoom: 16 });
  }, [originPlace, destinationPlace, walking, destinationWalking, result, userLocation]);

  useEffect(() => {
    stopMarkers.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('marker-active', id === activeStop);
      marker.setZIndexOffset(id === activeStop ? 1000 : 0);
    });
  }, [activeStop, result]);

  useEffect(() => {
    const marker = stopMarkers.current.get(focusedStop?.id);
    if (!marker) return;
    mapRef.current.setView(marker.getLatLng(), 16, { animate: false });
    marker.openPopup();
    container.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [focusedStop]);

  return (
    <section className="map-card" aria-labelledby="map-title">
      <div className="map-heading"><div><h2 id="map-title">Route Map</h2></div><span className="count">{visibleStops.length} stops</span></div>
      {!result && !userLocation && <p className="map-empty-state">Search for a journey to display the route.</p>}
      {tileError && <p className="map-error" role="status">Some map tiles could not load. Check your internet connection and reload. Journey search still works.</p>}
      {result?.type === 'message' && <p className="map-status">No journey to display. Choose your stops and search again.</p>}
      <div ref={container} className="map" aria-label={result?.legs ? 'Map of stops in the selected journey' : 'Kathmandu map; select a journey to display stops'} />
      {(visibleStops.length > 0 || userLocation || originPlace?.type === 'address' || destinationPlace?.type === 'address') && <div className="map-caption">
        {userLocation && <span className="legend-item">🔵 Your location · Blue ring: nearby stop{nearbyOrigin && (walking?.source === 'pedestrian' ? ' · Blue dashed line: pedestrian route' : ' · Approximate connection — walking route unavailable')}</span>}
        {(walking?.source === 'pedestrian' || destinationWalking?.source === 'pedestrian') && <span className="legend-item">Walking directions: <a href="https://openrouteservice.org/">openrouteservice</a> / OpenStreetMap contributors</span>}
        {(originPlace?.type === 'address' || destinationPlace?.type === 'address') && <span className="legend-item">Outlined circle: saved address · Blue dashed line: walking connection{[walking, destinationWalking].some(item => item && item.source !== 'pedestrian') && ' (approximate — walking route unavailable)'}</span>}
        {(result?.legs ? ['origin', 'destination', 'intermediate', 'transfer'] : ['sample']).map(role => (
          <span className="legend-item" key={role}><span className={`legend-marker stop-marker--${role}`} aria-hidden="true">{roles[role].symbol}</span>{role === 'transfer' ? 'Transfer stop' : roles[role].label}</span>
        ))}
        <span className="legend-item"><span className="legend-line" /> Illustrative connection</span>
      </div>}
      <details className="map-explanation"><summary>About this map</summary><p className="map-note">Route lines are illustrative connections between stops and may not represent exact road geometry. Locations are approximate. Use + / − or pinch to zoom.</p></details>
    </section>
  );
}
