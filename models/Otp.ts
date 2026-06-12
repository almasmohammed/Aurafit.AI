import mongoose, { Schema, Document, model, Model } from 'mongoose';

export interface OtpDocument extends Document {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<OtpDocument>({
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Number, required: true },
  attempts: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const Otp: Model<OtpDocument> =
  (mongoose.models.Otp as Model<OtpDocument>) || model<OtpDocument>('Otp', OtpSchema);
export default Otp;
