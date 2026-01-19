import { Schema, model, models } from 'mongoose';

const EntrySchema = new Schema({
  text: { type: String, default: '' },
  start: { type: String, default: '00:00' },
  end: { type: String, default: '00:15' },
  duration: { type: Number, default: 15 },
  completed: { type: Boolean, default: false },
}, { _id: false });

const ScheduleSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  entries: { type: Map, of: EntrySchema, default: {} },
}, { timestamps: true });

const Schedule = models.Schedule || model('Schedule', ScheduleSchema);
export default Schedule;
