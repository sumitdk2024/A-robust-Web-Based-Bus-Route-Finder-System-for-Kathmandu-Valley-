export function matchStops(stops, query, limit = 10) {
  const text = query.trim().toLocaleLowerCase();
  const score = stop => {
    const name = stop.stop_name.toLocaleLowerCase();
    if (!text || name.startsWith(text)) return 0;
    if (name.split(/[\s,()-]+/).some(word => word.startsWith(text))) return 1;
    return name.includes(text) ? 2 : 3;
  };
  return stops.map(stop => ({ stop, rank: score(stop) }))
    .filter(item => item.rank < 3)
    .sort((a, b) => a.rank - b.rank || a.stop.stop_name.localeCompare(b.stop.stop_name))
    .slice(0, limit).map(item => item.stop);
}
