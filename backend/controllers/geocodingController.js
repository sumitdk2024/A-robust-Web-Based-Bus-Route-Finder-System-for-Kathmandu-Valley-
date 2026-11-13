import { searchNepalAddress } from '../services/geocodingService.js';

export async function geocode(req, res) {
  res.set('Cache-Control', 'no-store');
  try { return res.json({ results: await searchNepalAddress(req.body?.query) }); }
  catch (error) {
    const status = [400, 404, 422].includes(error.status) ? error.status : 503;
    return res.status(status).json({ message: status === 400 ? 'Please select an address within Nepal.'
      : status === 404 ? 'We could not find that address.' : status === 422 ? 'Please enter an address.' : 'Address search is temporarily unavailable.' });
  }
}
