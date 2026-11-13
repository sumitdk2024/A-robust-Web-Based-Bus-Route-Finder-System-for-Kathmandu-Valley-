import { useEffect, useState } from 'react';
import { stopsById } from '../data/network.js';
import { fetchWalkingRoute } from './walkingRoutes.js';

export function useSavedPlaceWalking(place, direction) {
  const active = place?.type === 'address';
  const key = active ? JSON.stringify([place.id, place.label, place.latitude, place.longitude, place.nearestStopId, direction]) : '';
  const [connection, setConnection] = useState({ key: '', walking: null, busy: false });
  useEffect(() => {
    if (!active) { setConnection({ key: '', walking: null, busy: false }); return; }
    const controller = new AbortController();
    setConnection({ key, walking: null, busy: true });
    const stop = stopsById[place.nearestStopId];
    fetchWalkingRoute(place, stop, { signal: controller.signal, direction })
      .then(walking => {
        if (!controller.signal.aborted) setConnection({ key, busy: false, walking: { ...walking,
          startLabel: direction === 'to-stop' ? place.label : stop.name,
          endLabel: direction === 'to-stop' ? stop.name : place.label } });
      }).catch(() => { /* Cancellation never restores an old connection. */ });
    return () => controller.abort();
  }, [key]);
  return { walking: active && connection.key === key ? connection.walking : null,
    busy: active && (connection.key !== key || connection.busy) };
}
