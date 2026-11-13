import mongoose from 'mongoose';
import provenanceFields from './provenanceFields.js';

const routeStopSchema = new mongoose.Schema({
  route_id: { type: String, required: true, trim: true },
  stop_id: { type: String, required: true, trim: true },
  stop_order: { type: Number, required: true, min: 1, validate: Number.isInteger },
  ...provenanceFields,
});

// One stop per position; the same stop may appear again on a loop route.
routeStopSchema.index({ route_id: 1, stop_order: 1 }, { unique: true });

export default mongoose.model('RouteStop', routeStopSchema, 'route_stops');
