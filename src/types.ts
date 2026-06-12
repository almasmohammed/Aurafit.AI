export interface UserProfile {
  age: number;
  gender: string;
  height: number; // cm
  weight: number; // kg
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  goal: 'Weight Loss' | 'Muscle Gain' | 'Cardio Endurance' | 'Overall Health';
  workoutTime: number; // mins/day
  location: 'Gym' | 'Home';
  equipment: string[]; // e.g., Dumbbells, Resistance Bands, etc.
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  dietaryPref: 'Standard' | 'High-Protein' | 'Keto' | 'Vegan' | 'Vegetarian' | 'Paleo';
  restrictions: string; // text input
}

export interface TelemetryLog {
  id: string;
  timestamp: string; // ISO or HH:MM:SS
  eventType: 'User Event' | 'System DB' | 'API Call' | 'Diagnostics' | 'Error';
  message: string;
  durationMs?: number;
  success: boolean;
}

export interface WeightDataPoint {
  date: string; // 'YYYY-MM-DD' or shorter label 'June 10'
  weight: number; // kg
  bmi: number;
}

export interface MealLog {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
}

export interface Exercise {
  id: string;
  name: string;
  target: string;
  sets: number;
  reps: string; // e.g., "10-12" or "12"
  restSeconds: number;
  instructions: string;
  completedSets: boolean[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  timestamp: string;
}
