import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import User from "./models/User";
import Session from "./models/Session";
import Otp from "./models/Otp";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}

function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function createSessionToken() {
  return crypto.randomBytes(28).toString("hex");
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function sendOtpEmail(email: string, code: string) {
  console.log('[SMTP] startup config', {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
  });

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `AuraFit <${user || 'noreply@aurafit.local'}>`;

  if (!host) throw new Error('SMTP_HOST missing');
  if (!port) throw new Error('SMTP_PORT missing');
  if (!user) throw new Error('SMTP_USER missing');
  if (!pass) throw new Error('SMTP_PASS missing');


  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  await transporter.verify();
  console.log('[SMTP] SMTP verified successfully');

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: 'Your AuraFit login OTP code',
    text: `Your AuraFit login code is: ${code}. It expires in 5 minutes.`,
    html: `<p>Your AuraFit login code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`,
  });

  return { messageId: info.messageId, preview: nodemailer.getTestMessageUrl(info) };
}

app.use(express.json({ limit: '1mb' }));

const asyncHandler = (
  handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>
): express.RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

async function generateContentWithFallback(
  client: GoogleGenAI,
  options: {
    model: string;
    contents: any;
    config?: any;
    maxRetries?: number;
  }
): Promise<any> {
  const { model, contents, config, maxRetries = 3 } = options;
  const modelsToTry = [model, "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await client.models.generateContent({
          model: currentModel,
          contents,
          config,
        });
      } catch (error: any) {
        lastError = error;
        attempt += 1;
        const errorMsg = (error?.message || String(error) || JSON.stringify(error)).toUpperCase();
        const isTransient =
          errorMsg.includes("503") ||
          errorMsg.includes("UNAVAILABLE") ||
          errorMsg.includes("429") ||
          errorMsg.includes("RESOURCE_EXHAUSTED") ||
          errorMsg.includes("OVERLOADED") ||
          errorMsg.includes("HIGH DEMAND") ||
          errorMsg.includes("SPIKES") ||
          errorMsg.includes("TEMPORARY") ||
          errorMsg.includes("QUOTA_EXCEEDED") ||
          errorMsg.includes("RATE");

        if (isTransient && attempt <= maxRetries) {
          const baseWait = Math.pow(1.8, attempt) * 350;
          const jitter = Math.random() * 250;
          const waitTime = Math.min(5000, baseWait + jitter);
          console.info(`[Gemini Auto-Recovery] ${currentModel} is processing high queue traffic (Attempt ${attempt}/${maxRetries + 1}). Retrying in ${Math.round(waitTime)}ms.`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          console.info(`[Gemini Auto-Recovery] ${currentModel} handoff triggered. Switching request to next candidate...`);
          break;
        }
      }
    }
  }

  throw lastError || new Error("All robust Gemini model generation alternatives exhausted.");
}

function formatUserResponse(user: any) {
  return {
    email: user.email,
    profile: user.profile,
    onboarded: user.onboarded,
    mealLogs: user.mealLogs || [],
    weightHistory: user.weightHistory || [],
    dailyWater: user.dailyWater || 0,
    dailyBurned: user.dailyBurned || 0,
    dailyWaterTarget: user.dailyWaterTarget || 2500,
    telemetry: user.telemetry || [],
    messages: user.messages || [],
  };
}

async function getSessionUser(token: string) {
  if (!token) return null;
  const session = await Session.findOne({ token, expiresAt: { $gt: Date.now() } }).populate('user');
  if (!session || !session.user) return null;
  return { session, user: session.user as any };
}

async function requireAuth(req: express.Request, res: express.Response) {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Missing auth token.' });
    return null;
  }

  const auth = await getSessionUser(token);
  if (!auth) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return null;
  }

  return auth;
}

app.post('/api/auth/send-otp', asyncHandler(async (req, res) => {
  const { email, password, mode } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Provide a valid email address.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (mode === 'signup') {
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (existingUser) {
      const isMatch = await verifyPassword(password, existingUser.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'User already exists. Please sign in instead.' });
      }
    } else {
      const hashedPassword = await hashPassword(password);
      await User.create({
        email: normalizedEmail,
        passwordHash: hashedPassword,
        onboarded: false,
        mealLogs: [],
        weightHistory: [],
        dailyWater: 0,
        dailyBurned: 0,
        dailyWaterTarget: 2500,
        telemetry: [],
        messages: [
          {
            id: 'init_1',
            sender: 'aura',
            text: "Systems initialized. I am Coach Aura. State your targets, and let's optimize your athletic kinetics today.",
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  } else if (mode === 'signin') {
    if (!existingUser) {
      return res.status(404).json({ error: 'No account found for that email. Please sign up.' });
    }
    if (!password) {
      return res.status(401).json({ error: 'Password is required.' });
    }
    const isMatch = await verifyPassword(password, existingUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password for this account.' });
    }
  } else {
    return res.status(400).json({ error: 'mode must be signin or signup.' });
  }

  const code = generateOtpCode();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  await Otp.findOneAndUpdate(
    { email: normalizedEmail },
    { email: normalizedEmail, code, expiresAt, attempts: 0 },
    { upsert: true, new: true }
  );

  // In this project, OTP must be delivered via SMTP.
  // If SMTP is not configured, we fail loudly instead of silently previewing the OTP.
  try {
    const emailResult = await sendOtpEmail(normalizedEmail, code);
    console.log('[OTP EMAIL] Sent OTP', { email: normalizedEmail, messageId: emailResult.messageId });
    return res.json({
      success: true,
      message: 'OTP sent to your email address.',
      // preview removed to prevent OTP leakage; keep for debugging only if you explicitly add it back later.
    });
  } catch (error: any) {
    console.error('[OTP EMAIL] sendMail failed', {
      email: normalizedEmail,
      code,
      error: error?.message || String(error),
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP email. Check SMTP configuration.',
    });
  }
}));

app.post('/api/auth/verify-otp', asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const storedOtp = await Otp.findOne({ email: normalizedEmail });
  if (!storedOtp || storedOtp.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'OTP is expired or invalid. Request a new code.' });
  }

  if (storedOtp.attempts >= 3) {
    await storedOtp.deleteOne();
    return res.status(400).json({ error: 'Too many failed verification attempts. Request a new OTP.' });
  }

  if (storedOtp.code !== String(code).trim()) {
    storedOtp.attempts += 1;
    await storedOtp.save();
    return res.status(400).json({ error: 'Incorrect OTP code. Please try again.' });
  }

  await storedOtp.deleteOne();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ error: 'User record not found after OTP verification.' });
  }

  const sessionToken = createSessionToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  await Session.create({ token: sessionToken, user: user._id, expiresAt });

  return res.json({ success: true, token: sessionToken, user: formatUserResponse(user) });
}));

app.get('/api/auth/profile', asyncHandler(async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  return res.json({ success: true, user: formatUserResponse(auth.user) });
}));

app.post('/api/auth/profile', asyncHandler(async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const user = auth.user;
  const {
    profile,
    onboarded,
    mealLogs,
    weightHistory,
    dailyWater,
    dailyBurned,
    dailyWaterTarget,
    telemetry,
    messages,
  } = req.body;

  if (profile && typeof profile === 'object') {
    user.profile = { ...user.profile, ...profile };
  }
  if (typeof onboarded === 'boolean') {
    user.onboarded = onboarded;
  }
  if (Array.isArray(mealLogs)) {
    user.mealLogs = mealLogs;
  }
  if (Array.isArray(weightHistory)) {
    user.weightHistory = weightHistory;
  }
  if (typeof dailyWater === 'number') {
    user.dailyWater = dailyWater;
  }
  if (typeof dailyBurned === 'number') {
    user.dailyBurned = dailyBurned;
  }
  if (typeof dailyWaterTarget === 'number') {
    user.dailyWaterTarget = dailyWaterTarget;
  }
  if (Array.isArray(telemetry)) {
    user.telemetry = telemetry;
  }
  if (Array.isArray(messages)) {
    user.messages = messages;
  }

  await user.save();
  return res.json({ success: true, user: formatUserResponse(user) });
}));

app.post('/api/auth/logout', asyncHandler(async (req, res) => {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (token) {
    await Session.deleteOne({ token });
  }
  return res.json({ success: true });
}));

app.post('/api/tip', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { profile } = req.body;
  const standardTips = [
    `Hydration is engine performance: aiming for ${profile?.weight ? Math.round(profile.weight * 35) : 2500}ml water keeps workouts crisp.`,
    `Goal: ${profile?.goal || "Fitness"} demands consistency! Aim for active rest intervals of 60 seconds.`,
    `AuraFit Pro Tip: Since you train at ${profile?.location || "Home"}, focus on controlling the negative phase of your set movements.`,
    `Fuel efficiency: A macro ratio tailored for ${profile?.dietaryPref || "Standard"} will amplify your ${profile?.goal || "overall wellness"} results today.`,
    `Rest is when muscles rebuild. Keep sleep high, stress low, and maintain your tracking streak!`,
  ];

  try {
    const client = getGemini();
    if (!client) {
      const duration = Date.now() - startTime;
      const randomTip = standardTips[Math.floor(Math.random() * standardTips.length)];
      return res.json({
        content: `[Fallback TIP] ${randomTip}`,
        telemetry: {
          eventType: 'API Call',
          message: 'Gemini client offline (using fallback tip engine)',
          durationMs: duration,
          success: true,
        },
      });
    }

    const goal = profile?.goal || 'overall fitness';
    const restrictions = profile?.restrictions || 'none';
    const pref = profile?.dietaryPref || 'Standard';
    const place = profile?.location || 'anywhere';
    const promptText = `Provide 1 highly personalized, motivational, ultra-precise daily fitness tip (under 160 characters, max 2 sentences) for an athlete who is ${profile?.age || 25} yrs old, weighs ${profile?.weight || 75}kg, gender ${profile?.gender || 'unspecified'}. Goal: ${goal}. Workout location: ${place}. Diet: ${pref}. Restrictions: ${restrictions}. Keep it concise, professional, direct, coaching-focused. Do not output markdown lists, just plain text.`;

    const response = await generateContentWithFallback(client, {
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      config: {
        systemInstruction:
          'You are Coach Aura, an elite cyberpunk fitness, nutrition & psychological coach specializing in hyper-focused micro-achievements.',
      },
    });


    const duration = Date.now() - startTime;
    const text =
      (typeof (response as any)?.text === 'function'
        ? (response as any).text()
        : (response as any)?.text) ||
      (typeof (response as any)?.response?.text === 'function'
        ? (response as any).response.text()
        : (response as any)?.response?.text) ||
      (Array.isArray((response as any)?.candidates)
        ? (response as any).candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('')
        : undefined);

    return res.json({
      content: String(text || '').trim() || standardTips[0],
      telemetry: {
        eventType: 'API Call',
        message: `Generated custom daily tip via Gemini API in ${duration}ms`,
        durationMs: duration,
        success: true,
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    const randomTip = standardTips[Math.floor(Math.random() * standardTips.length)];
    return res.json({
      content: `[Fallback TIP] ${randomTip}`,
      telemetry: {
        eventType: 'Error',
        message: `Gemini API Tip generation failed: ${error?.message || error}`,
        durationMs: duration,
        success: false,
      },
    });
  }
}));

function extractJsonBlock(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

function safeParseWorkoutPlan(text: string) {
  try {
    return JSON.parse(extractJsonBlock(text));
  } catch {
    return null;
  }
}

const PRESET_WORKOUTS: Record<string, { title: string; exercises: any[] }> = {
  'Home-Beginner': {
    title: 'Home Strength Starter',
    exercises: [
      { id: 'home-beg-1', name: 'Goblet Squat', target: 'Lower Body', sets: 3, reps: '12', restSeconds: 45, instructions: 'Hold a dumbbell close to your chest and squat with control.', completedSets: [false, false, false] },
      { id: 'home-beg-2', name: 'Push-Up Progression', target: 'Chest & Core', sets: 3, reps: '10', restSeconds: 40, instructions: 'Keep your core tight and lower with a straight spine; modify to knees if needed.', completedSets: [false, false, false] },
      { id: 'home-beg-3', name: 'Reverse Lunge', target: 'Leg Strength', sets: 3, reps: '10 each leg', restSeconds: 40, instructions: 'Step back with control and drive through the front heel to return upright.', completedSets: [false, false, false] },
    ],
  },
  'Home-Intermediate': {
    title: 'Home Power Circuit',
    exercises: [
      { id: 'home-int-1', name: 'Dumbbell Romanian Deadlift', target: 'Posterior Chain', sets: 4, reps: '10', restSeconds: 50, instructions: 'Hinge from the hips with soft knees and squeeze glutes at the top.', completedSets: [false, false, false, false] },
      { id: 'home-int-2', name: 'Incline Push-Up', target: 'Chest & Shoulders', sets: 4, reps: '12', restSeconds: 45, instructions: 'Use a stable elevated surface and keep your body in a straight line.', completedSets: [false, false, false, false] },
      { id: 'home-int-3', name: 'Split Squat', target: 'Quads & Stability', sets: 4, reps: '10 each leg', restSeconds: 45, instructions: 'Maintain an upright torso and gently pulse at the bottom.', completedSets: [false, false, false, false] },
    ],
  },
  'Gym-Beginner': {
    title: 'Gym Foundational Circuit',
    exercises: [
      { id: 'gym-beg-1', name: 'Leg Press', target: 'Leg Drive', sets: 4, reps: '10', restSeconds: 50, instructions: 'Control the motion and avoid locking out the knees at the top.', completedSets: [false, false, false, false] },
      { id: 'gym-beg-2', name: 'Chest Press', target: 'Push Strength', sets: 4, reps: '10', restSeconds: 45, instructions: 'Keep shoulders pinned and press through the midline.', completedSets: [false, false, false, false] },
      { id: 'gym-beg-3', name: 'Lat Pulldown', target: 'Back Development', sets: 4, reps: '10', restSeconds: 45, instructions: 'Pull to the chest with elbows driving down and back.', completedSets: [false, false, false, false] },
    ],
  },
};

function buildFallbackWorkoutPlan(profile: any, bmi: number, dailyWater: number, dailyWaterTarget: number, dailyBurned: number) {
  const sourceKey = `${profile?.location || 'Home'}-${profile?.experience || 'Beginner'}`;
  const preset = PRESET_WORKOUTS[sourceKey] || PRESET_WORKOUTS['Home-Beginner'];
  const hydrationFactor = dailyWaterTarget > 0 ? Math.min(1.2, Math.max(0.5, dailyWater / dailyWaterTarget)) : 1;
  const recoveryModifier = profile?.experience === 'Beginner' ? 1.15 : profile?.experience === 'Advanced' ? 0.9 : 1;
  const restAdjustment = Math.round((bmi > 27 ? 10 : bmi < 18.5 ? -5 : 0) + (hydrationFactor < 0.85 ? 10 : hydrationFactor > 1.1 ? -5 : 0));
  const goalIsStrength = profile?.goal === 'Muscle Gain';
  const goalIsEndurance = profile?.goal === 'Cardio Endurance';
  const goalIsWeightLoss = profile?.goal === 'Weight Loss';

  const cloned = JSON.parse(JSON.stringify(preset || PRESET_WORKOUTS['Home-Beginner']));
  cloned.exercises = cloned.exercises.map((ex: any) => {
    const baseReps = Number(String(ex.reps).match(/\d+/)?.[0] || 10);
    const suffix = String(ex.reps).replace(/\d+/g, '').trim();
    let reps = baseReps;
    if (goalIsStrength) reps = Math.max(6, Math.min(12, baseReps - 2));
    if (goalIsWeightLoss) reps = Math.max(10, baseReps + 2);
    if (goalIsEndurance) reps = Math.max(12, baseReps + 4);
    if (profile?.experience === 'Beginner') reps = Math.min(14, reps + 2);
    if (profile?.experience === 'Advanced' && goalIsStrength) reps = Math.max(6, reps - 1);

    const restSeconds = Math.max(30, Math.min(90, ex.restSeconds + restAdjustment));
    const equipmentHint = (profile?.equipment || []).includes('Dumbbells')
      ? 'Choose dumbbells that make the last reps feel challenging while maintaining clean form.'
      : 'Use bodyweight, bands, or household weights to scale the intensity safely.';

    return {
      ...ex,
      reps: `${reps}${suffix ? ` ${suffix}` : ''}`,
      restSeconds,
      instructions: `${ex.instructions} ${equipmentHint}`,
      completedSets: new Array(ex.sets).fill(false),
    };
  });

  return cloned;
}

app.post('/api/workout-plan', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { profile, dailyWater, dailyWaterTarget, dailyBurned } = req.body;
  const weight = profile?.weight || 0;
  const height = profile?.height || 0;
  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;
  const fallbackPlan = () => buildFallbackWorkoutPlan(profile, bmi, dailyWater || 0, dailyWaterTarget || 0, dailyBurned || 0);

  try {
    const client = getGemini();
    if (!client) {
      return res.json({
        workout: fallbackPlan(),
        telemetry: {
          eventType: 'API Call',
          message: 'Gemini client offline; returning fallback workout plan.',
          durationMs: Date.now() - startTime,
          success: true,
        },
      });
    }

    const promptText = `Generate a structured workout plan in JSON only. Use the following athlete profile and metrics:
- Age: ${profile?.age || 25}
- Gender: ${profile?.gender || 'unspecified'}
- Height: ${height} cm
- Weight: ${weight} kg
- BMI: ${bmi}
- Goal: ${profile?.goal || 'Overall Health'}
- Experience: ${profile?.experience || 'Beginner'}
- Location: ${profile?.location || 'Home'}
- Equipment: ${(profile?.equipment || []).join(', ') || 'Bodyweight'}
- Workout time: ${profile?.workoutTime || 40} minutes
- Dietary preference: ${profile?.dietaryPref || 'Standard'}
- Daily water: ${dailyWater || 0} ml / target ${dailyWaterTarget || 2500} ml
- Recent training load estimate: ${dailyBurned || 0} kcal burned

Return JSON with keys: title, exercises. Each exercise must have id, name, target, sets, reps, restSeconds, instructions, completedSets. Do not add explanation outside JSON. Use rest times and rep ranges appropriate for the profile, hydration, and goal.`;

    const response = await generateContentWithFallback(client, {
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      config: {
        systemInstruction: 'You are Coach Aura, a cyberpunk fitness AI coach generating workout plans tailored to the athlete profile. Output only valid JSON.'
      },
    });

    const rawText =
      typeof (response as any)?.text === 'function'
        ? (response as any).text()
        : (response as any)?.text ||
          (Array.isArray((response as any)?.candidates)
            ? (response as any).candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('')
            : undefined) || '';

    const parsed = safeParseWorkoutPlan(String(rawText));
    if (parsed && parsed.title && Array.isArray(parsed.exercises)) {
      return res.json({
        workout: parsed,
        telemetry: {
          eventType: 'API Call',
          message: `Generated AI workout plan via Gemini in ${Date.now() - startTime}ms`,
          durationMs: Date.now() - startTime,
          success: true,
        },
      });
    }

    throw new Error('AI returned invalid workout JSON');
  } catch (error: any) {
    return res.json({
      workout: fallbackPlan(),
      telemetry: {
        eventType: 'Error',
        message: `Workout plan generation failed: ${error?.message || error}. Using fallback plan.`,
        durationMs: Date.now() - startTime,
        success: false,
      },
    });
  }
}));

app.post('/api/chat', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { messages, profile } = req.body;
  const nickname = profile?.gender === 'Male' ? 'champ' : profile?.gender === 'Female' ? 'warrior' : 'athlete';
  const workoutSetting = `${profile?.location || 'Home'} using ${profile?.equipment?.join(', ') || 'bodyweight'}`;
  const dietSetting = `${profile?.dietaryPref || 'Standard'} diet with restrictions: ${profile?.restrictions || 'no restrictions'}`;
  const localAnswers = [
    `Keep pushing, ${nickname}! Based on your ${profile?.goal || 'Fitness'} target, consistency is key. Ensure you stay hydrated!`,
    `Let's analyze that: as a ${profile?.experience || 'Intermediate'} training in a ${workoutSetting} setup, making incremental updates to weight reps is very logical.`,
    `Fuel check! Your choice of a ${dietSetting} aligns well with tracking macro partitions. Aiming for 1g of protein per pound of target body weight is a great base.`,
    `Need a custom workout schedule? For a ${profile?.workoutTime || 45}-minute session, let's complete a split focusing on primary kinetic chains!`,
  ];

  try {
    const client = getGemini();
    if (!client) {
      const duration = Date.now() - startTime;
      const genericReply = localAnswers[Math.floor(Math.random() * localAnswers.length)];
      return res.json({
        content: `Aura Coach [Fallback Offline Mode]: ${genericReply}

(Coach is in offline fallback because GEMINI_API_KEY is not configured in the environment.)`,
        telemetry: {
          eventType: 'API Call',
          message: 'Gemini client offline: Using locally simulated coaching engine',
          durationMs: duration,
          success: true,
        },
      });
    }

    const systemInstruction = `You are Coach Aura, the ultra-elite, cyberpunk-themed virtual fitness and nutrition AI companion on AuraFit. Your character is empathetic, highly scientific, motivational, telemetry-obsessed, and direct.
User profile context:
- Age: ${profile?.age || 25} years
- Gender: ${profile?.gender || 'unspecified'}
- Height: ${profile?.height || 175}cm, Weight: ${profile?.weight || 70}kg
- Experience: ${profile?.experience || 'Beginner'}
- Goal: ${profile?.goal || 'Overall Wellness'}
- Workout structure: ${profile?.workoutTime || 40} minutes per day, location: ${profile?.location || 'Home'}, equipment: ${profile?.equipment?.join(', ') || 'Bodyweight'}
- Nutrition: ${dietSetting}
Address the user as ${nickname} or another intense coaching persona. Provide direct workout edits, recovery cues, and actionable coaching. Keep responses concise and elevated.`;

    const recentMessages = Array.isArray(messages) ? messages.slice(-8) : [];
    const geminiContents = recentMessages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await generateContentWithFallback(client, {
      model: 'gemini-3.5-flash',
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const duration = Date.now() - startTime;
    return res.json({
      content: response.text?.trim() || "Let's push further!",
      telemetry: {
        eventType: 'API Call',
        message: 'Successfully generated Coach reply via Gemini API',
        durationMs: duration,
        success: true,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const genericReply = localAnswers[Math.floor(Math.random() * localAnswers.length)];
    return res.json({
      content: `Aura Coach [Temporary Offline Mode]: ${genericReply}

(Note: The cloud network is in a backup high-efficiency cycle.)`,
      telemetry: {
        eventType: 'Error',
        message: `Gemini API call failed: ${error?.message || error}`,
        durationMs: duration,
        success: false,
      },
    });
  }
}));

app.get('/api/health', (_req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({ status: 'ok', geminiConfigured: hasKey, time: new Date().toISOString() });
});

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!err) return next();
  const message = err?.message || String(err);
  if (message.includes('request aborted') || err.type === 'entity.parse.failed') {
    console.warn('[Express] Request parsing failed:', message);
    return res.status(400).json({ error: 'Invalid or aborted request body. Please retry.' });
  }
  console.error('[Express] Unhandled error:', message);
  return res.status(500).json({ error: 'Internal server error. Please retry.' });
});

process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled rejection:', reason);
});

async function startServer() {
  await connectMongo();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} in env ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
