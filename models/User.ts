import mongoose, { Schema, Document, model, Model } from 'mongoose';

export interface MealLogEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface WeightHistoryEntry {
  date: string;
  weight: number;
  bmi: number;
}

export interface TelemetryEntry {
  id: string;
  timestamp: string;
  eventType: 'User Event' | 'System DB' | 'API Call' | 'Diagnostics' | 'Error';
  message: string;
  durationMs?: number;
  success: boolean;
}

export interface ChatMessageEntry {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  workoutTime: number;
  location: string;
  equipment: string[];
  experience: string;
  dietaryPref: string;
  restrictions: string;
}

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  profile: UserProfile;
  onboarded: boolean;
  mealLogs: MealLogEntry[];
  weightHistory: WeightHistoryEntry[];
  dailyWater: number;
  dailyBurned: number;
  dailyWaterTarget: number;
  telemetry: TelemetryEntry[];
  messages: ChatMessageEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const MealLogSchema = new Schema<MealLogEntry>({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  carbs: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
}, { _id: false });

const WeightHistorySchema = new Schema<WeightHistoryEntry>({
  date: { type: String, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
}, { _id: false });

const TelemetrySchema = new Schema<TelemetryEntry>({
  id: { type: String, required: true },
  timestamp: { type: String, required: true },
  eventType: { type: String, required: true, enum: ['User Event', 'System DB', 'API Call', 'Diagnostics', 'Error'] },
  message: { type: String, required: true },
  durationMs: { type: Number, required: false },
  success: { type: Boolean, required: true },
}, { _id: false });

const ChatMessageSchema = new Schema<ChatMessageEntry>({
  id: { type: String, required: true },
  sender: { type: String, required: true, enum: ['user', 'aura'] },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
}, { _id: false });

const UserProfileSchema = new Schema<UserProfile>({
  age: { type: Number, required: true, default: 26 },
  gender: { type: String, required: true, default: 'Female' },
  height: { type: Number, required: true, default: 165 },
  weight: { type: Number, required: true, default: 68 },
  activityLevel: { type: String, required: true, default: 'Moderately Active' },
  goal: { type: String, required: true, default: 'Weight Loss' },
  workoutTime: { type: Number, required: true, default: 40 },
  location: { type: String, required: true, default: 'Home' },
  equipment: { type: [String], required: true, default: ['Dumbbells', 'Resistance Bands'] },
  experience: { type: String, required: true, default: 'Intermediate' },
  dietaryPref: { type: String, required: true, default: 'Standard' },
  restrictions: { type: String, required: false, default: '' },
}, { _id: false });

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  profile: { type: UserProfileSchema, required: true, default: () => ({
    age: 26,
    gender: 'Female',
    height: 165,
    weight: 68,
    activityLevel: 'Moderately Active',
    goal: 'Weight Loss',
    workoutTime: 40,
    location: 'Home',
    equipment: ['Dumbbells', 'Resistance Bands'],
    experience: 'Intermediate',
    dietaryPref: 'Standard',
    restrictions: '',
  }) },
  onboarded: { type: Boolean, required: true, default: false },
  mealLogs: { type: [MealLogSchema], required: true, default: [] },
  weightHistory: { type: [WeightHistorySchema], required: true, default: [] },
  dailyWater: { type: Number, required: true, default: 0 },
  dailyBurned: { type: Number, required: true, default: 0 },
  dailyWaterTarget: { type: Number, required: true, default: 2500 },
  telemetry: { type: [TelemetrySchema], required: true, default: [] },
  messages: { type: [ChatMessageSchema], required: true, default: [] },
}, { timestamps: true });

const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) || model<UserDocument>('User', UserSchema);
export default User;
