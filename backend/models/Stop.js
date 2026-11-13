import mongoose from 'mongoose';
import provenanceFields from './provenanceFields.js';

const stopSchema = new mongoose.Schema({
  stop_id: { type: String, required: true, unique: true, trim: true },
  // V2 contains intentionally unnamed OSM features. Preserve their blank names.
  stop_name: String,
  latitude: { type: Number, default: null, min: -90, max: 90, validate: value => value == null || Number.isFinite(value) },
  longitude: { type: Number, default: null, min: -180, max: 180, validate: value => value == null || Number.isFinite(value) },
  coordinate_status: String,
  ...provenanceFields,
});

export default mongoose.model('Stop', stopSchema, 'stops');
