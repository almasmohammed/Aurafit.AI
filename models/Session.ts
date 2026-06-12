import mongoose, { Schema, Document, model, Model } from 'mongoose';

export interface SessionDocument extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  expiresAt: number;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<SessionDocument>({
  token: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Number, required: true },
}, { timestamps: true });

const Session: Model<SessionDocument> =
  (mongoose.models.Session as Model<SessionDocument>) || model<SessionDocument>('Session', SessionSchema);
export default Session;
