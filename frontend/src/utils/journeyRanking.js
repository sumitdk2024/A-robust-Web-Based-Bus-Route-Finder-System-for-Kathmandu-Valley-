// Compare complete candidate journeys without changing the bus-route graph.
// Final string keys make ties independent of candidate enumeration order.
const stableCompare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export function rankJourneyOptions(options) {
  const values = option => [
    option.result.transferCount ?? option.result.legs.length - 1,
    option.result.stopCount,
    Number.isFinite(option.estimate?.estimatedMinutes) ? option.estimate.estimatedMinutes : Infinity,
    JSON.stringify(option.result.legs.map(leg => leg.routeId)),
    option.origin.id, option.destination.id,
    JSON.stringify(option.result.legs.map(leg => leg.stops)),
  ];
  return [...options].sort((a, b) => {
    const av = values(a), bv = values(b);
    for (let i = 0; i < av.length; i++) {
      const difference = typeof av[i] === 'number' ? (av[i] === bv[i] ? 0 : av[i] < bv[i] ? -1 : 1) : stableCompare(av[i], bv[i]);
      if (difference) return difference;
    }
    return 0;
  });
}
