import { getWalkingRoute } from '../services/walkingRouteService.js';

export async function walkingRoute(req, res) {
  res.set('Cache-Control', 'no-store');
  try {
    const route = await getWalkingRoute(req.body?.start, req.body?.end);
    return res.json(route);
  } catch (error) {
    // Do not forward provider errors, request coordinates or credentials.
    return res.status(error.status === 400 ? 400 : 503).json({ message: error.status === 400
      ? 'Walking routes require valid locations within Nepal.'
      : 'Walking directions are temporarily unavailable. An approximate distance is shown instead.' });
  }
}
