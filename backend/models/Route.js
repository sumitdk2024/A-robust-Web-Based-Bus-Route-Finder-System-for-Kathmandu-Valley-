import mongoose from 'mongoose';
import provenanceFields from './provenanceFields.js';

const routeSchema = new mongoose.Schema({
  route_id: { type: String, required: true, unique: true, trim: true },
  route_name: { type: String, required: true, trim: true },
  status: { type: String, trim: true },
  operator: String,
  ...provenanceFields,
  notes: String,
});

export default mongoose.model('Route', routeSchema, 'routes');
