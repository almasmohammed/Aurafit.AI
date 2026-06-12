import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  Droplet,
  Flame,
  Utensils,
  TrendingDown,
  ChevronRight,
  Send,
  Plus,
  RotateCcw,
  User,
  LogOut,
  Sliders,
  Sparkles,
  Search,
  Wifi,
  WifiOff,
  Skull,
  Play,
  Pause,
  AlertCircle,
  Clock,
  Briefcase,
  CheckCircle,
  Compass,
  ArrowRight,
  Dumbbell,
  Apple
} from 'lucide-react';
import { UserProfile, TelemetryLog, WeightDataPoint, MealLog, Exercise, ChatMessage } from './types';
import { AuraRingVisualizer } from './components/AuraRingVisualizer';
import { FormattedMessage } from './components/FormattedMessage';

const PRESET_WORKOUTS: Record<string, { title: string; exercises: Exercise[] }> = {
  'Home-Beginner': {
    title: 'Home Strength Starter',
    exercises: [
      {
        id: 'home-beg-1',
        name: 'Goblet Squat',
        target: 'Lower Body',
        sets: 3,
        reps: '12',
        restSeconds: 45,
        instructions: 'Hold a dumbbell close to your chest and squat with control, focusing on posture and depth.',
        completedSets: [false, false, false]
      },
      {
        id: 'home-beg-2',
        name: 'Push-Up Progression',
        target: 'Chest & Core',
        sets: 3,
        reps: '10',
        restSeconds: 40,
        instructions: 'Keep your core tight and lower with a straight spine; modify to knees if needed.',
        completedSets: [false, false, false]
      },
      {
        id: 'home-beg-3',
        name: 'Reverse Lunge',
        target: 'Leg Strength',
        sets: 3,
        reps: '10 each leg',
        restSeconds: 40,
        instructions: 'Step back with control and drive through the front heel to return upright.',
        completedSets: [false, false, false]
      }
    ]
  },
  'Home-Intermediate': {
    title: 'Home Power Circuit',
    exercises: [
      {
        id: 'home-int-1',
        name: 'Dumbbell Romanian Deadlift',
        target: 'Posterior Chain',
        sets: 4,
        reps: '10',
        restSeconds: 50,
        instructions: 'Hinge from the hips with soft knees, lowering weights along the legs and squeezing glutes at the top.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'home-int-2',
        name: 'Incline Push-Up',
        target: 'Chest & Shoulders',
        sets: 4,
        reps: '12',
        restSeconds: 45,
        instructions: 'Use a stable elevated surface and keep your body in a straight line throughout each repetition.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'home-int-3',
        name: 'Split Squat',
        target: 'Quads & Stability',
        sets: 4,
        reps: '10 each leg',
        restSeconds: 45,
        instructions: 'Maintain an upright torso and gently pulse at the bottom before driving back up.',
        completedSets: [false, false, false, false]
      }
    ]
  },
  'Home-Advanced': {
    title: 'Home Athletic Performance',
    exercises: [
      {
        id: 'home-adv-1',
        name: 'Bulgarian Split Squat',
        target: 'Leg Strength',
        sets: 4,
        reps: '10 each leg',
        restSeconds: 50,
        instructions: 'Rear foot elevated, descend with control and drive through the front heel.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'home-adv-2',
        name: 'Decline Push-Up',
        target: 'Upper Push Power',
        sets: 4,
        reps: '12',
        restSeconds: 45,
        instructions: 'Place feet on a raised surface and keep your body aligned while pressing hard.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'home-adv-3',
        name: 'Single-Leg Deadlift',
        target: 'Balance & Posterior Chain',
        sets: 4,
        reps: '10 each side',
        restSeconds: 50,
        instructions: 'Keep hips square and lower the weight with a strong hinge, maintaining balance.',
        completedSets: [false, false, false, false]
      }
    ]
  },
  'Gym-Beginner': {
    title: 'Gym Foundational Circuit',
    exercises: [
      {
        id: 'gym-beg-1',
        name: 'Leg Press',
        target: 'Leg Drive',
        sets: 4,
        reps: '10',
        restSeconds: 50,
        instructions: 'Control the motion and do not lock out the knees at the top.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'gym-beg-2',
        name: 'Chest Press',
        target: 'Push Strength',
        sets: 4,
        reps: '10',
        restSeconds: 45,
        instructions: 'Keep shoulders pinned and press through the midline with steady tempo.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'gym-beg-3',
        name: 'Lat Pulldown',
        target: 'Back Development',
        sets: 4,
        reps: '10',
        restSeconds: 45,
        instructions: 'Pull to the chest with elbows driving down and back, avoiding shrugging.',
        completedSets: [false, false, false, false]
      }
    ]
  },
  'Gym-Intermediate': {
    title: 'Gym Strength Builder',
    exercises: [
      {
        id: 'gym-int-1',
        name: 'Barbell Squat',
        target: 'Lower Body',
        sets: 5,
        reps: '8',
        restSeconds: 60,
        instructions: 'Drive through the heels and keep the chest tall while maintaining depth.',
        completedSets: [false, false, false, false, false]
      },
      {
        id: 'gym-int-2',
        name: 'Dumbbell Bench Press',
        target: 'Chest',
        sets: 4,
        reps: '10',
        restSeconds: 50,
        instructions: 'Press with control and focus on squeezing the chest at the top of each rep.',
        completedSets: [false, false, false, false]
      },
      {
        id: 'gym-int-3',
        name: 'Seated Row',
        target: 'Midback',
        sets: 4,
        reps: '10',
        restSeconds: 50,
        instructions: 'Pull the handle to your torso with a full contraction between your shoulder blades.',
        completedSets: [false, false, false, false]
      }
    ]
  },
  'Gym-Advanced': {
    title: 'Gym Performance Session',
    exercises: [
      {
        id: 'gym-adv-1',
        name: 'Deadlift',
        target: 'Posterior Chain',
        sets: 5,
        reps: '6',
        restSeconds: 90,
        instructions: 'Keep a tight back and drive through the heels while maintaining hip hinge form.',
        completedSets: [false, false, false, false, false]
      },
      {
        id: 'gym-adv-2',
        name: 'Pull-Up',
        target: 'Upper Back',
        sets: 5,
        reps: '8',
        restSeconds: 60,
        instructions: 'Use full range of motion and avoid kipping unless performing a controlled dynamic set.',
        completedSets: [false, false, false, false, false]
      },
      {
        id: 'gym-adv-3',
        name: 'Barbell Overhead Press',
        target: 'Shoulders',
        sets: 5,
        reps: '8',
        restSeconds: 60,
        instructions: 'Push the bar straight overhead while bracing your core and keeping the spine neutral.',
        completedSets: [false, false, false, false, false]
      }
    ]
  }
};

export default function App() {
  // --- STATE DECLARATIONS ---
  // Auth and Onboarding Screens Flow states
  const [sessionUser, setSessionUser] = useState<{ email: string } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [authRequestMode, setAuthRequestMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  // Profile and Onboarding (defaults only for onboarding UI; not persisted)
  const EMPTY_PROFILE: UserProfile = {
    age: 0,
    gender: '',
    height: 0,
    weight: 0,
    activityLevel: 'Sedentary',
    goal: 'Overall Health',
    workoutTime: 0,
    location: 'Home',
    equipment: [],
    experience: 'Beginner',
    dietaryPref: 'Standard',
    restrictions: ''
  };

  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  const [onboardingSlide, setOnboardingSlide] = useState(0);

  // App Navigation Panel (Dashboard, Workouts, Meals, Coach AI, Admin System)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'meals' | 'coach'>('dashboard');

  // Backend-driven stats (source of truth)
  const [auraScore, setAuraScore] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [sleep, setSleep] = useState<number>(0);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [backendTelemetry, setBackendTelemetry] = useState<TelemetryLog[]>([]);
  const [backendWeightHistory, setBackendWeightHistory] = useState<WeightDataPoint[]>([]);

  const isEmptyState = backendTelemetry.length === 0 && backendWeightHistory.length === 0 && calories === 0 && water === 0 && auraScore === 0 && steps === 0 && sleep === 0;


  // Interactive Live Metrics Tracking state
  const [dailyBurned, setDailyBurned] = useState<number>(0);
  const [dailyWater, setDailyWater] = useState<number>(0);
  const [dailyWaterTarget, setDailyWaterTarget] = useState<number>(0);

  const dailyBurnedTarget = useMemo(() => {
    if (profile.goal === 'Muscle Gain') return 650;
    if (profile.goal === 'Cardio Endurance') return 600;
    if (profile.goal === 'Weight Loss') return 520;
    return 580;
  }, [profile.goal]);

  const mealSuggestions = useMemo(() => {
    const label = profile.goal === 'Muscle Gain'
      ? 'Protein Focused'
      : profile.goal === 'Weight Loss'
      ? 'Lean Performance'
      : 'Balanced Wellness';

    return {
      breakfast: { name: `${label} Oat Bowl`, calories: 320, carbs: 38, protein: 18, fat: 10 },
      lunch: { name: `${label} Grain Bowl`, calories: 420, carbs: 35, protein: 32, fat: 14 },
      dinner: { name: `${label} Greens Plate`, calories: 380, carbs: 34, protein: 28, fat: 12 },
      snack: { name: `${label} Recovery Bite`, calories: 180, carbs: 14, protein: 12, fat: 8 }
    };
  }, [profile.goal]);

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Local UI state for lists (should be empty for backend-driven empty-state)
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightDataPoint[]>([]);
  const [selectedChartPoint, setSelectedChartPoint] = useState<WeightDataPoint | null>(null);
  const [checkInWeightInput, setCheckInWeightInput] = useState<string>('');

  // Workout plan loading state
  const [workoutLoading, setWorkoutLoading] = useState<boolean>(false);

  // Athlete Profile Editor drafts state (onboarding only)
  const [draftAge, setDraftAge] = useState<number>(profile.age);
  const [draftWeight, setDraftWeight] = useState<number>(profile.weight);
  const [draftHeight, setDraftHeight] = useState<number>(profile.height);
  const [draftWaterTarget, setDraftWaterTarget] = useState<number>(dailyWaterTarget);
  const [draftExperience, setDraftExperience] = useState<string>(profile.experience);
  const [draftGoal, setDraftGoal] = useState<string>(profile.goal);
  const [draftDietaryPref, setDraftDietaryPref] = useState<string>(profile.dietaryPref);
  const [profileSuccessFeedback, setProfileSuccessFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isProfileDrawerOpen) {
      setDraftAge(profile.age);
      setDraftWeight(profile.weight);
      setDraftHeight(profile.height);
      setDraftWaterTarget(dailyWaterTarget);
      setDraftExperience(profile.experience);
      setDraftGoal(profile.goal);
      setDraftDietaryPref(profile.dietaryPref);
      setProfileSuccessFeedback(null);
    }
  }, [isProfileDrawerOpen, profile, dailyWaterTarget]);

  // Load a workout preset when the athlete profile becomes available
  const loadWorkoutPlan = async (currentProfile: UserProfile) => {
    setWorkoutLoading(true);
    addTelemetry('API Call', `Requesting workout plan for ${currentProfile.location}/${currentProfile.experience}`);

    const planKey = `${currentProfile.location}-${currentProfile.experience}`;
    const localFallback = PRESET_WORKOUTS[planKey] || PRESET_WORKOUTS['Home-Beginner'];

    try {
      const response = await fetch('/api/workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: currentProfile,
          dailyWater,
          dailyWaterTarget,
          dailyBurned,
        }),
      });

      const data = await response.json();
      if (data?.workout?.title && Array.isArray(data.workout.exercises)) {
        const workout = {
          ...data.workout,
          exercises: data.workout.exercises.map((ex: any) => ({
            ...ex,
            completedSets: Array.isArray(ex.completedSets)
              ? ex.completedSets
              : new Array(ex.sets || 0).fill(false),
          })),
        };
        setActiveWorkout(workout);
        setSelectedExerciseId(workout.exercises[0]?.id || null);
      } else {
        throw new Error('Invalid workout plan response');
      }

      if (data.telemetry) {
        addTelemetry(data.telemetry.eventType, data.telemetry.message, data.telemetry.durationMs, data.telemetry.success);
      }
    } catch (err: any) {
      addTelemetry('Error', `Workout plan API failed: ${err?.message || err}. Falling back to local workout.`, 0, false);
      const cloned = JSON.parse(JSON.stringify(localFallback)) as { title: string; exercises: Exercise[] };
      setActiveWorkout(cloned);
      setSelectedExerciseId(cloned.exercises[0]?.id || null);
    } finally {
      setWorkoutLoading(false);
    }
  };

  useEffect(() => {
    if (!isOnboarded || !sessionUser) return;
    if (!profile.location || !profile.experience) return;
    loadWorkoutPlan(profile);
  }, [isOnboarded, sessionUser, profile.location, profile.experience]);

  // Daily advice state
  const [dailyTip, setDailyTip] = useState<string>('');
  const [isTipLoading, setIsTipLoading] = useState<boolean>(false);

  // Telemetry logs
  const [telemetry, setTelemetry] = useState<TelemetryLog[]>([]);

  // Offline Mode toggle (from Module G instructions)
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Active workout structure
  const [activeWorkout, setActiveWorkout] = useState<{ title: string; exercises: Exercise[] } | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Active Rest Timer state
  const [restTimeLeft, setRestTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Coach Aura AI Messaging states
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('aurafit_messages');
    return saved ? JSON.parse(saved) : [
      { id: 'init_1', sender: 'aura', text: "Systems initialized. I am Coach Aura. State your targets, and let's optimize your athletic kinetics today." }
    ];
  });
  const [chatInput, setChatInput] = useState<string>('');
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // --- EFFECT TRIGGERS ---

  // OTP Verification Throttle timer countdown
  useEffect(() => {
    let intervalId: any;
    if (authStep === 'otp' && otpTimer > 0) {
      intervalId = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [authStep, otpTimer]);

  const parseJsonResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) {
      const isMissingApiRoute = response.status === 404 && response.url.includes('/api/');
      return {
        success: false,
        error: isMissingApiRoute
          ? 'Auth API route was not found. Start the app with `npm run dev` so the Express API server is running.'
          : `Empty response body (${response.status})`,
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: `Invalid JSON response (${response.status}): ${text}` };
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const isOtpStep = authStep === 'otp';
      // Never auto-load session if we're in OTP verification flow
      if (!sessionToken || isOtpStep) return;
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        const data = await parseJsonResponse(response);
        if (!response.ok) throw new Error(data?.error || 'Failed to load profile');
        setSessionUser({ email: data.user.email });
        localStorage.setItem('aurafit_user', JSON.stringify({ email: data.user.email }));
        if (data.user.profile && data.user.profile.age) {
          setProfile(data.user.profile);
          setIsOnboarded(true);
          localStorage.setItem('aurafit_profile', JSON.stringify(data.user.profile));
          localStorage.setItem('aurafit_onboarded', 'true');
        }
      } catch (err: any) {
        // Only clear token if we're NOT in the middle of OTP verification
        if (!isOtpStep) {
          localStorage.removeItem('aurafit_token');
          localStorage.removeItem('aurafit_user');
          setSessionToken(null);
          setSessionUser(null);
        }
      }
    };
    loadSession();
  }, [sessionToken, authStep]);



  // Auto-scroll chatroom view
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCoachTyping]);

  // Fetch fitness advice from fullstack API
  const fetchDailyTip = async (currentProfile: UserProfile) => {
    setIsTipLoading(true);
    addTelemetry('API Call', `Sending POST request /api/tip to context system...`);

    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: currentProfile }),
      });
      const data = await response.json();
      setDailyTip(data.content);

      if (data.telemetry) {
        addTelemetry(data.telemetry.eventType, data.telemetry.message, data.telemetry.durationMs, data.telemetry.success);
      }
    } catch (e: any) {
      setDailyTip(`Aura Tip: Prioritize dynamic movements. Stay explosive with perfect movement patterns.`);
      addTelemetry('Error', `Tip endpoint failed: ${e?.message || e}. Switched to local rule.`, 10, false);
    } finally {
      setIsTipLoading(false);
    }
  };

  // Initially fetch Daily tip on main launch (if onboarded)
  useEffect(() => {
    if (isOnboarded && sessionUser) {
      fetchDailyTip(profile);
    }
  }, [isOnboarded, sessionUser]);

  // Rest Timer ticking down trigger
  useEffect(() => {
    if (isTimerRunning && restTimeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            addTelemetry('User Event', 'Rest countdown complete! Proceeding with next set.', 0, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, restTimeLeft]);

  // --- HELPER UTILITIES ---

  // Calculate BMI according to standard metrics formula
  const calculateBMI = (kg: number, cm: number) => {
    const meters = cm / 100;
    return Number((kg / (meters * meters)).toFixed(1));
  };

  // Current user BMI categorization
  const userBMIValue = useMemo(() => {
    return calculateBMI(profile.weight, profile.height);
  }, [profile.weight, profile.height]);

  const otpPreviewCode = useMemo(() => {
    return otpPreview?.match(/\d{6}/)?.[0] || null;
  }, [otpPreview]);

  // Dynamically calculate calorie calculations in real-time
  const totalCaloriesConsumed = useMemo(() => {
    return mealLogs.reduce((acc, curr) => acc + curr.calories, 0);
  }, [mealLogs]);

  const targetCaloriesConsumed = useMemo(() => {
    // Basic metabolic guideline depending on goal
    if (profile.goal === 'Weight Loss') return 1800;
    if (profile.goal === 'Muscle Gain') return 2800;
    if (profile.goal === 'Cardio Endurance') return 2400;
    return 2100;
  }, [profile.goal]);

  const targetMacros = useMemo(() => {
    // Return relative Carb/Pro/Fat ratio allocations (g)
    if (profile.goal === 'Weight Loss') return { carbs: 140, protein: 160, fat: 55 };
    if (profile.goal === 'Muscle Gain') return { carbs: 280, protein: 190, fat: 80 };
    if (profile.goal === 'Cardio Endurance') return { carbs: 300, protein: 140, fat: 65 };
    return { carbs: 200, protein: 130, fat: 60 };
  }, [profile.goal]);

  const currentMacrosSum = useMemo(() => {
    return mealLogs.reduce(
      (acc, curr) => {
        acc.carbs += curr.carbs;
        acc.protein += curr.protein;
        acc.fat += curr.fat;
        return acc;
      },
      { carbs: 0, protein: 0, fat: 0 }
    );
  }, [mealLogs]);

  // Workout completed sets calculation
  const workoutSetsTotal = useMemo(() => {
    if (!activeWorkout) return 0;
    return activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  }, [activeWorkout]);

  const workoutSetsCompleted = useMemo(() => {
    if (!activeWorkout) return 0;
    return activeWorkout.exercises.reduce((sum, ex) => sum + ex.completedSets.filter(Boolean).length, 0);
  }, [activeWorkout]);

  // 14 Days of physical consistency logs (13 days relative mock history + today live state)
  const consistencyData = useMemo(() => {
    const historicalBase = [
      { dayOffset: 13, label: '13d ago', waterPercent: 100, workoutPercent: 100 },
      { dayOffset: 12, label: '12d ago', waterPercent: 80, workoutPercent: 0 },
      { dayOffset: 11, label: '11d ago', waterPercent: 120, workoutPercent: 100 },
      { dayOffset: 10, label: '10d ago', waterPercent: 50, workoutPercent: 50 },
      { dayOffset: 9, label: '9d ago', waterPercent: 100, workoutPercent: 100 },
      { dayOffset: 8, label: '8d ago', waterPercent: 100, workoutPercent: 0 },
      { dayOffset: 7, label: '7d ago', waterPercent: 40, workoutPercent: 100 },
      { dayOffset: 6, label: '6d ago', waterPercent: 110, workoutPercent: 100 },
      { dayOffset: 5, label: '5d ago', waterPercent: 90, workoutPercent: 100 },
      { dayOffset: 4, label: '4d ago', waterPercent: 100, workoutPercent: 0 },
      { dayOffset: 3, label: '3d ago', waterPercent: 100, workoutPercent: 100 },
      { dayOffset: 2, label: '2d ago', waterPercent: 60, workoutPercent: 50 },
      { dayOffset: 1, label: '1d ago', waterPercent: 120, workoutPercent: 100 },
    ];

    const todayWaterRatio = dailyWaterTarget > 0 ? (dailyWater / dailyWaterTarget) * 100 : 0;
    const todayWorkoutRatio = workoutSetsTotal > 0 ? (workoutSetsCompleted / workoutSetsTotal) * 100 : 0;

    return [
      ...historicalBase,
      { dayOffset: 0, label: 'Today', waterPercent: todayWaterRatio, workoutPercent: todayWorkoutRatio }
    ];
  }, [dailyWater, dailyWaterTarget, workoutSetsCompleted, workoutSetsTotal]);

  // Custom telemetry appender
  const addTelemetry = (
    eventType: 'User Event' | 'System DB' | 'API Call' | 'Diagnostics' | 'Error',
    message: string,
    durationMs?: number,
    success: boolean = true
  ) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLog: TelemetryLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      eventType,
      message,
      durationMs,
      success
    };
    setTelemetry((prev) => [newLog, ...prev].slice(0, 50));
  };

  // --- ACTIONS HANDLERS ---

  // Auth Submit Click handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback(null);
    setOtpPreview(null);

    if (!authEmail || !authEmail.includes('@')) {
      setAuthFeedback({ text: 'Provide a valid athletic email address.', isError: true });
      return;
    }

    if (!authPassword || authPassword.length < 6) {
      setAuthFeedback({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }

    setIsAuthLoading(true);
    const mode = authStep === 'signup' ? 'signup' : 'signin';
    const previousStep = authStep;
    setAuthRequestMode(mode);
    setAuthStep('otp');
    setOtpTimer(60);
    setCanResend(false);
    setAuthOtp(['', '', '', '', '', '']);
    setTimeout(() => document.getElementById('otp-0')?.focus(), 0);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          mode,
        }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Unable to send OTP (${response.status}).`);
      }

      addTelemetry('User Event', `OTP requested for ${authEmail} in ${authStep} mode.`, 24, true);
      if (data.preview) {
        setOtpPreview(data.preview);
      }
      setAuthFeedback({ text: 'OTP sent. Check your email and enter the 6-digit code.', isError: false });
    } catch (error: any) {
      setAuthStep(previousStep);
      setAuthFeedback({ text: error?.message || 'Unable to send OTP.', isError: true });
      setOtpPreview(null);
      // If OTP send fails, clear any stale session token to prevent confusion
      localStorage.removeItem('aurafit_token');
      setSessionToken(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsAuthLoading(true);
    setAuthFeedback(null);
    setOtpPreview(null);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          mode: authRequestMode,
        }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Unable to resend OTP (${response.status}).`);
      }
      setOtpTimer(60);
      setCanResend(false);
      setAuthOtp(['', '', '', '', '', '']);
      setTimeout(() => document.getElementById('otp-0')?.focus(), 0);
      if (data.preview) setOtpPreview(data.preview);
      setAuthFeedback({ text: 'OTP resent. Check your inbox.', isError: false });
    } catch (error: any) {
      setAuthFeedback({ text: error?.message || 'Unable to resend OTP.', isError: true });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const applyOtpCode = (code: string) => {
    const digits = code.replace(/\D/g, '').slice(0, 6).split('');
    setAuthOtp(Array.from({ length: 6 }, (_, idx) => digits[idx] || ''));
    if (digits.length < 6) {
      document.getElementById(`otp-${digits.length}`)?.focus();
    }
  };

  const handleSubmitOtp = async () => {
    const fullCode = authOtp.join('');
    if (fullCode.length < 6) {
      setAuthFeedback({ text: 'Enter the full 6-digit OTP code.', isError: true });
      return;
    }

    setIsAuthLoading(true);
    setAuthFeedback(null);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: fullCode }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'OTP verification failed.');
      }

      const user = { email: data.user.email };
      setSessionUser(user);
      setSessionToken(data.token);
      localStorage.setItem('aurafit_user', JSON.stringify(user));
      localStorage.setItem('aurafit_token', data.token);

      if (data.user.profile && data.user.profile.age) {
        setProfile(data.user.profile);
        setIsOnboarded(true);
        localStorage.setItem('aurafit_profile', JSON.stringify(data.user.profile));
        localStorage.setItem('aurafit_onboarded', 'true');
        
        // Set personalized greeting message for returning user
        const userName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
        const userTitle = data.user.profile.gender === 'Male' ? 'Warrior' : 'Queen';
        const personalizedMsg: ChatMessage = {
          id: 'init_1',
          sender: 'aura',
          text: `Greetings, ${userTitle} ${userName}. I am Coach Aura. Let's optimize your athletic kinetics and dominate your physical targets today.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([personalizedMsg]);
      }

      setAuthFeedback({ text: 'Authentication successful. Welcome to AuraFit.', isError: false });
      setAuthOtp(['', '', '', '', '', '']);
      setAuthPassword('');
      setAuthEmail('');
      setAuthStep('signin');
    } catch (error: any) {
      setAuthFeedback({ text: error?.message || 'OTP verification failed.', isError: true });
      // Clear stale token on OTP verification failure
      localStorage.removeItem('aurafit_token');
      setSessionToken(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign out handle
  const handleSignOut = async () => {
    try {
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      }
    } catch {
      // ignore logout failure
    }

    localStorage.removeItem('aurafit_user');
    localStorage.removeItem('aurafit_token');
    setSessionUser(null);
    setSessionToken(null);
    setIsProfileDrawerOpen(false);
    addTelemetry('User Event', 'Biometric session terminated correctly. Logged out.', 14, true);
  };

  // Save tracking metrics to backend when they change (hydration, meals, weight, telemetry)
  const saveMetricsToBackend = async () => {
    if (!sessionToken) return;
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          mealLogs,
          weightHistory,
          dailyWater,
          dailyBurned,
          dailyWaterTarget,
          telemetry,
        }),
      });
    } catch (err) {
      console.log('Failed to save metrics to backend:', err);
    }
  };

  // Auto-save metrics to backend when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveMetricsToBackend();
    }, 2000); // Debounce to avoid excessive API calls

    return () => clearTimeout(timer);
  }, [mealLogs, weightHistory, dailyWater, dailyBurned, dailyWaterTarget, telemetry, sessionToken]);

  // Onboarding Complete path
  const handleOnboardingComplete = async () => {
    localStorage.setItem('aurafit_profile', JSON.stringify(profile));
    localStorage.setItem('aurafit_onboarded', 'true');
    setIsOnboarded(true);

    if (sessionToken) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ profile }),
      });
    }

    addTelemetry('System DB', 'User physical biometric profile committed securely to local cache.', 48, true);
    fetchDailyTip(profile);
  };

  // Daily water tracking increments
  const handleLogWater = (amount: number) => {
    setDailyWater((prev) => {
      const updated = prev + amount;
      addTelemetry('User Event', `Logged Hydration Intake: +${amount}ml (Total: ${updated}/${dailyWaterTarget}ml)`, 4, true);
      return updated;
    });
  };

  // Manual check-in weights update
  const handleWeightCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(checkInWeightInput);
    if (isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 250) {
      alert('Provide a realistic physiological mass (30 - 250 kg).');
      return;
    }

    const previousWeight = profile.weight;
    const newBmi = calculateBMI(parsedWeight, profile.height);

    // Update active profile state
    const updatedProfile = { ...profile, weight: parsedWeight };
    setProfile(updatedProfile);
    localStorage.setItem('aurafit_profile', JSON.stringify(updatedProfile));

    // Append to histories
    const checkInDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newPoint: WeightDataPoint = {
      date: checkInDate,
      weight: parsedWeight,
      bmi: newBmi
    };

    setWeightHistory((prev) => [...prev, newPoint]);
    setCheckInWeightInput('');
    setSelectedChartPoint(newPoint);

    addTelemetry(
      'System DB',
      `Telemetry weight modification: Updated from ${previousWeight}kg to ${parsedWeight}kg. Updated BMI: ${newBmi}`,
      5,
      true
    );
  };

  const handleSaveProfileDrafts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(draftAge) || draftAge < 10 || draftAge > 120) {
      alert("Provide a realistic physiological age (10 - 120 years).");
      return;
    }
    if (isNaN(draftWeight) || draftWeight < 30 || draftWeight > 300) {
      alert("Provide a realistic weight (30 - 300 kg).");
      return;
    }
    if (isNaN(draftHeight) || draftHeight < 100 || draftHeight > 250) {
      alert("Provide a realistic height (100 - 250 cm).");
      return;
    }
    if (isNaN(draftWaterTarget) || draftWaterTarget < 500 || draftWaterTarget > 10000) {
      alert("Provide a realistic water goal target (500ml - 10,000ml).");
      return;
    }

    // Save profile configurations
    const updatedProfile: UserProfile = {
      ...profile,
      age: draftAge,
      weight: draftWeight,
      height: draftHeight,
      experience: draftExperience as any,
      goal: draftGoal as any,
      dietaryPref: draftDietaryPref as any
    };

    setProfile(updatedProfile);
    localStorage.setItem('aurafit_profile', JSON.stringify(updatedProfile));

    if (sessionToken) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ profile: updatedProfile }),
      });
    }

    setDailyWaterTarget(draftWaterTarget);
    localStorage.setItem('aurafit_water_target', draftWaterTarget.toString());

    // Automatically update the main histories line coordinate as well if they modified core mass
    const checkInDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newBmi = parseFloat((draftWeight / ((draftHeight / 100) ** 2)).toFixed(1));
    const newPoint: WeightDataPoint = {
      date: checkInDate,
      weight: draftWeight,
      bmi: newBmi
    };
    
    setWeightHistory((prev) => {
      const filtered = prev.filter(p => p.date !== checkInDate); // filter duplicates of today
      return [...filtered, newPoint];
    });

    addTelemetry('User Event', `Committed biometric calibration adjustments: Weight ${draftWeight}kg, Height ${draftHeight}cm, Goal: ${draftGoal}`, 18, true);
    
    setProfileSuccessFeedback("✓ Biometric coordinates applied & calibrated!");
    setTimeout(() => {
      setProfileSuccessFeedback(null);
    }, 4000);
  };

  // Dynamic Workout sets checks
  const handleToggleSet = (exerciseId: string, setIndex: number) => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const nextCompleted = [...ex.completedSets];
        nextCompleted[setIndex] = !nextCompleted[setIndex];

        // Trigger calorie burn telemetry on marking set active completion!
        if (nextCompleted[setIndex]) {
          const burnIncrement = 25; // 25 kcal simulated burn per complete intense set!
          setDailyBurned((b) => b + burnIncrement);
          addTelemetry('User Event', `Exercising complete: set #${setIndex + 1} of ${ex.name} (+${burnIncrement} kcal registered)`, 2, true);

          // Trigger the active Mechanical countdown rest timer!
          setRestTimeLeft(ex.restSeconds);
          setIsTimerRunning(true);
        }
        return { ...ex, completedSets: nextCompleted };
      }
      return ex;
    });

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Reset current active workout
  const handleResetWorkout = () => {
    if (!activeWorkout) return;
    const resetExercises = activeWorkout.exercises.map((ex) => ({
      ...ex,
      completedSets: new Array(ex.sets).fill(false)
    }));
    setActiveWorkout({
      ...activeWorkout,
      exercises: resetExercises
    });
    setRestTimeLeft(0);
    setIsTimerRunning(false);
    addTelemetry('User Event', `Active tracking sheet reset. Clear session matrices.`, 0, true);
  };

  // Meal Quick Logging (Breakfast, Lunch, Dinner, Snack choices)
  const handleQuickLogMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const mealTemplate = mealSuggestions[mealType] || mealSuggestions.snack;

    const newLogItem: MealLog = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: mealType,
      name: mealTemplate.name,
      calories: mealTemplate.calories,
      carbs: mealTemplate.carbs,
      protein: mealTemplate.protein,
      fat: mealTemplate.fat
    };

    setMealLogs((prev) => [...prev, newLogItem]);
    addTelemetry('User Event', `Macro log appended: Registered ${mealTemplate.name} (+${mealTemplate.calories} kcal)`, 4, true);
  };

  // Delete logged meal
  const handleDeleteMeal = (id: string, name: string) => {
    setMealLogs((prev) => prev.filter((m) => m.id !== id));
    addTelemetry('User Event', `Purged logged meal coordinate: ${name}`, 4, true);
  };

  // Send messaging trigger context to Coach Aura AI
  const handleSendChat = async (e?: React.FormEvent, customSuggestion?: string) => {
    if (e) e.preventDefault();
    const query = customSuggestion || chatInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customSuggestion) setChatInput('');

    setIsCoachTyping(true);
    addTelemetry('API Call', `Dispatching conversation telemetry to Aura AI backend...`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          profile: profile
        }),
      });

      const data = await response.json();
      setIsCoachTyping(false);

      const auraMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'aura',
        text: data.content,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, auraMsg]);

      if (data.telemetry) {
        addTelemetry(data.telemetry.eventType, data.telemetry.message, data.telemetry.durationMs, data.telemetry.success);
      }
    } catch (err: any) {
      setIsCoachTyping(false);
      const fallbackAuraMsg: ChatMessage = {
        id: `msg_a_fail_${Date.now()}`,
        sender: 'aura',
        text: "My neural mesh communication lines are currently saturated. Rest assured, consistency is your greatest metric. Keep tracking, drink some water, and execute your sets.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackAuraMsg]);
      addTelemetry('Error', `Chat query failed: ${err?.message || err}. Fallback response rendered.`, 0, false);
    }
  };

  // Toggle dynamic offline simulation states (from Module G instructions)
  const handleToggleConnectivity = () => {
    setIsOffline((prev) => {
      const next = !prev;
      addTelemetry('User Event', `Connectivity altered: Swapped system state to ${next ? 'OFFLINE SIMULATED' : 'ONLINE'} mode.`, 0, true);
      return next;
    });
  };

  // Diagnostics: Inject mock histories for chart evaluation
  const handleInjectMockData = () => {
    const historicalPoints: WeightDataPoint[] = [
      { date: "May 10", weight: 84.2, bmi: 27.5 },
      { date: "May 15", weight: 82.8, bmi: 27.0 },
      { date: "May 20", weight: 81.0, bmi: 26.4 },
      ...weightHistory
    ];
    setWeightHistory(historicalPoints);
    addTelemetry('Diagnostics', "Injected advanced timeline historical weights (3 records) to evaluations database.", 5, true);
  };

  // Diagnostics: Clear all state values
  const handleResetApplicationState = () => {
    localStorage.clear();
    setSessionUser(null);
    setIsOnboarded(false);
    setOnboardingSlide(0);
    setDailyBurned(0);
    setDailyWater(0);
    setMealLogs([]);
    setWeightHistory([]);
    setTelemetry([]);
    setMessages([
      {
        id: 'init_1',
        sender: 'aura',
        text: "Systems initialized. I am Coach Aura. State your targets, and let's optimize your athletic kinetics today.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setActiveTab('dashboard');
    addTelemetry('System DB', "Quantum system purge: All cached biometric profiles and state machines cleared.", 15, true);
  };


  // --- CUSTOM SVG LINE CHART INTERACTION MODEL (highly robust, responsive, glow paths) ---
  const renderInteractiveSvgChart = () => {
    if (weightHistory.length === 0) return null;

    // Chart Dimensions
    const width = 500;
    const height = 180;
    const padding = 30;

    // Min and Max Weight boundaries
    const weights = weightHistory.map((d) => d.weight);
    const minWeight = Math.min(...weights) - 1.5;
    const maxWeight = Math.max(...weights) + 1.5;
    const weightRange = maxWeight - minWeight || 1;

    // Coordinate Mappers
    const getXCoord = (index: number) => {
      return padding + (index / (weightHistory.length - 1)) * (width - padding * 2);
    };

    const getYCoord = (weight: number) => {
      return height - padding - ((weight - minWeight) / weightRange) * (height - padding * 2);
    };

    // Construct SVG path points string
    const pointsString = weightHistory
      .map((d, index) => `${getXCoord(index)},${getYCoord(d.weight)}`)
      .join(' ');

    return (
      <div className="relative">
        {/* SVG Wrapper */}
        <div className="w-full overflow-x-auto select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minWidth: '400px' }}>
            {/* Grid horizontal guidelines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = padding + ratio * (height - padding * 2);
              const gridWeight = maxWeight - ratio * weightRange;
              return (
                <g key={i} className="opacity-15 font-mono text-[9px]">
                  <line
                    x1={padding}
                    y1={yVal}
                    x2={width - padding}
                    y2={yVal}
                    stroke="#E4E4E7"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text x={padding - 5} y={yVal + 3} fill="#E4E4E7" textAnchor="end">
                    {gridWeight.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Glowing neon trendline gradient filter */}
            <defs>
              <linearGradient id="gradient-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Fill Area gradient path */}
            {weightHistory.length > 1 && (
              <path
                d={`M ${getXCoord(0)},${height - padding} L ${pointsString} L ${getXCoord(weightHistory.length - 1)},${height - padding} Z`}
                fill="url(#gradient-glow)"
              />
            )}

            {/* Trendline stroke */}
            {weightHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.5"
                points={pointsString}
                className="transition-all duration-300"
              />
            )}

            {/* Nodes dots plot */}
            {weightHistory.map((point, index) => {
              const cx = getXCoord(index);
              const cy = getYCoord(point.weight);
              const isSelected = selectedChartPoint?.date === point.date;

              return (
                <g key={index} className="group cursor-pointer" onClick={() => setSelectedChartPoint(point)}>
                  {/* Outer laser halo on hover/select */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 8 : 5}
                    className={`transition-all duration-300 ${isSelected ? 'fill-violet-500 opacity-60 animate-ping' : 'fill-cyan-400 opacity-0 group-hover:opacity-40'}`}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 5 : 3.5}
                    className={`transition-all duration-300 ${isSelected ? 'fill-[#8B5CF6] stroke-[#00E5FF] stroke-2' : 'fill-[#0B0B0C] stroke-[#00E5FF] stroke-1.5 group-hover:fill-[#00E5FF]'}`}
                  />
                  {/* Mini-date marker beneath chart */}
                  <text
                    x={cx}
                    y={height - 8}
                    fill="#A1A1AA"
                    className="font-mono text-[8px] text-center opacity-60 group-hover:opacity-100 transition-opacity"
                    textAnchor="middle"
                  >
                    {point.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected coordinates metrics badge overlay */}
        <div className="mt-3 flex items-center justify-between bg-[#141416]/90 border border-zinc-800/80 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span className="text-xs text-zinc-400">Node Analysis:</span>
            {selectedChartPoint ? (
              <span className="text-xs font-mono font-medium text-white">
                {selectedChartPoint.date} —{' '}
                <span className="text-[#00E5FF]">{selectedChartPoint.weight} kg</span>{' '}
                <span className="text-[#8B5CF6]">({selectedChartPoint.bmi} BMI)</span>
              </span>
            ) : (
              <span className="text-xs text-zinc-500 italic">Select any chart plot point to evaluate diagnostics</span>
            )}
          </div>
          {selectedChartPoint && (
            <button
              onClick={() => setSelectedChartPoint(null)}
              className="text-[10px] text-zinc-500 hover:text-white underline font-mono transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    );
  };


  // --- SECURITY GATE OR SIGN-IN INTERFACES ---
  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Decorative Grid Lines and Scanline to hit the 'Obsidian Cyberpunk aesthetic' */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6]/45 to-transparent animate-[scanline_8s_linear_infinite] pointer-events-none"></div>

        {/* Outer radial ambient glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#8B5CF6] rounded-full filter blur-[120px] opacity-15 pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#1C1C1E] border border-gray-800 rounded-2xl p-6 relative overflow-hidden z-10 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-900 border border-[#8B5CF6]/30 mb-3 text-[#8B5CF6] relative overflow-hidden">
              <Activity className="w-6 h-6 animate-pulse" />
              <div className="absolute inset-0 bg-[#8B5CF6]/10 animate-ping rounded-xl"></div>
            </div>
            <h1 className="text-2xl font-display font-medium tracking-tight text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">AURAFIT<span className="text-[#00E5FF] ml-1">AI</span></h1>
            <p className="text-xs text-zinc-500 font-mono tracking-wider">AI PHYSICAL TELEMETRY INTERFACE</p>
          </div>

          {/* Feedback banners */}
          {authFeedback && (
            <div
              className={`mb-4 flex items-start gap-2 p-3 rounded-lg border text-xs leading-relaxed ${authFeedback.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF]'}`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authFeedback.text}</span>
            </div>
          )}

          {/* SWAPPABLE INTERFACES */}
          {authStep !== 'otp' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Athletic Email Coordinate
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Cryptographic Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B5CF6] hover:bg-[#7c4fe0] text-white text-xs font-mono uppercase tracking-wider font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>{authStep === 'signin' ? 'Verify Quantum Identity' : 'Establish Kinetic Node'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep(authStep === 'signin' ? 'signup' : 'signin');
                    setAuthFeedback(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-[#8B5CF6] font-mono transition-colors"
                >
                  {authStep === 'signin' ? "Create an account coordinate" : "Already established? Direct Log-In"}
                </button>
              </div>
            </form>
          ) : (
            // MODULE A: simulated 6-digit OTP code entry
            <div className="space-y-5">
              <div>
                <div className="text-center mb-4">
                  <span className="text-xs text-zinc-400 leading-normal block">
                    We transmitted an encrypted OTP token sequence to: <strong className="text-zinc-200">{authEmail}</strong>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    Enter the 6-digit OTP sent to your email.
                  </span>
                {otpPreview ? (
                  <span className="text-[10px] text-emerald-300 font-mono mt-2 block break-words">
                    Preview: {otpPreview}
                  </span>
                ) : null}
                {otpPreviewCode ? (
                  <button
                    type="button"
                    onClick={() => applyOtpCode(otpPreviewCode)}
                    className="mt-2 text-[10px] text-[#00E5FF] hover:text-white font-mono uppercase tracking-wider"
                  >
                    Fill preview code
                  </button>
                ) : null}
                </div>

                {/* 6 Grid inputs */}
                <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto mb-4">
                  {authOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length > 1) {
                          applyOtpCode(val);
                          document.getElementById(`otp-${Math.min(val.length, 6) - 1}`)?.focus();
                          return;
                        }
                        const nextOtp = [...authOtp];
                        nextOtp[idx] = val;
                        setAuthOtp(nextOtp);

                        // Auto focus shifts
                        if (val && idx < 5) {
                          const nextInput = document.getElementById(`otp-${idx + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedCode = e.clipboardData.getData('text');
                        applyOtpCode(pastedCode);
                        document.getElementById(`otp-${Math.min(pastedCode.replace(/\D/g, '').length, 6) - 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !authOtp[idx] && idx > 0) {
                          document.getElementById(`otp-${idx - 1}`)?.focus();
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-center py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono max-w-xs mx-auto mb-2">
                  <span className="text-zinc-500">RESEND LOCKOUT:</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#00E5FF] hover:underline"
                    >
                      RESEND CODE
                    </button>
                  ) : (
                    <span className="text-[#8B5CF6] font-medium">{otpTimer}s</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSubmitOtp}
                  disabled={isAuthLoading}
                  className="w-full bg-[#00E5FF] hover:bg-[#00cce3] text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                >
                  VERIFY OTP & LOGIN
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isAuthLoading}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                >
                  RESEND CODE {canResend ? '' : `(${otpTimer}s)`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('signin');
                    setAuthFeedback(null);
                    setAuthOtp(['', '', '', '', '', '']);
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase py-2 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  BACK TO EMAIL LOGIN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MODULE B: DETAILED CONVERSATIONAL ONBOARDING WIZARD ---
  if (!isOnboarded) {
    const onboardingSlides = [
      {
        title: 'Physiological Profiling',
        desc: 'Aura needs precise metrics to calibrate force dynamics and metabolic targets.',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Math.max(1, parseInt(e.target.value) || 0) })}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Gender Identity</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: Math.max(1, parseInt(e.target.value) || 0) })}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Current Mass (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: Math.max(1, parseFloat(e.target.value) || 0) })}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-2.5 text-center">
              <span className="text-[11px] font-mono text-zinc-400">
                CALCULATED INITIAL BODY MASS INDEX: <strong className="text-[#00E5FF]">{userBMIValue}</strong>
              </span>
            </div>
          </div>
        )
      },
      {
        title: 'Kinetic Intent & Habit Intensity',
        desc: 'Specify activity coefficients and core fitness targets.',
        content: (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Activity Coefficient</label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
              >
                <option value="Sedentary">Sedentary (No formal workouts)</option>
                <option value="Lightly Active">Lightly Active (1-2 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-4 days/week)</option>
                <option value="Very Active">Very Active (5+ days heavy training)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Primary Fitness Goal</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['Weight Loss', 'Muscle Gain', 'Cardio Endurance', 'Overall Health'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setProfile({ ...profile, goal: g })}
                    className={`p-2.5 rounded-lg border font-mono text-[11px] text-center transition-colors cursor-pointer ${profile.goal === g ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Workout Spatial Mapping & Gear',
        desc: 'Where do you train and what machinery do you have access to?',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Workout Location</label>
                <select
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value as any })}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
                >
                  <option value="Home">Home Setup</option>
                  <option value="Gym">Gym Facility</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Daily Allotted (mins)</label>
                <input
                  type="number"
                  value={profile.workoutTime}
                  onChange={(e) => setProfile({ ...profile, workoutTime: Math.max(10, parseInt(e.target.value) || 0) })}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Available Equipment Checklist</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {['Dumbbells', 'Barbell', 'Resistance Bands', 'Kettlebell', 'Bench', 'Pull-up Bar', 'Cardio Machines'].map((eq) => {
                  const hasEq = profile.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => {
                        const nextEq = hasEq ? profile.equipment.filter((e) => e !== eq) : [...profile.equipment, eq];
                        setProfile({ ...profile, equipment: nextEq });
                      }}
                      className={`py-1.5 px-2.5 rounded-full border font-mono text-[10px] transition-colors cursor-pointer ${hasEq ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Athlete Experience Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setProfile({ ...profile, experience: tier })}
                    className={`py-2 rounded-lg border font-mono text-[10px] text-center transition-colors cursor-pointer ${profile.experience === tier ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white animate-pulse' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Nutritional Protocols',
        desc: 'Filter recipes and establish macronutrient allocations.',
        content: (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Dietary Preference</label>
              <select
                value={profile.dietaryPref}
                onChange={(e) => setProfile({ ...profile, dietaryPref: e.target.value as any })}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white font-mono"
              >
                <option value="Standard">Standard Balanced Diet</option>
                <option value="High-Protein">High-Protein Protocol</option>
                <option value="Keto">Keto (Ketogenic Blueprint)</option>
                <option value="Vegan">Vegan (Plant-Powered)</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Paleo">Paleo (Paleolithic Diet)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Strict Allergies & restrictions</label>
              <input
                type="text"
                placeholder="e.g. Gluten-free, no peanuts, soy restriction"
                value={profile.restrictions}
                onChange={(e) => setProfile({ ...profile, restrictions: e.target.value })}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white placeholder-zinc-600 font-sans"
              />
            </div>

            <div className="p-3 bg-indigo-950/15 border border-[#8B5CF6]/20 rounded-lg text-zinc-400 text-xs leading-relaxed">
              🌱 Aura will filter recipes corresponding immediately to your <strong className="text-[#8B5CF6]">{profile.dietaryPref}</strong> selections and screen out any restricts.
            </div>
          </div>
        )
      }
    ];

    const currentSlideData = onboardingSlides[onboardingSlide];

    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 bg-[#0B0B0C] pointer-events-none"></div>

        <div className="w-full max-w-lg bg-[#1C1C1E] border border-gray-800 rounded-2xl p-6 relative overflow-hidden z-10 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
          {/* Progress Indicators */}
          <div className="flex gap-1.5 mb-6">
            {onboardingSlides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === onboardingSlide ? 'w-10 bg-[#00E5FF]' : i < onboardingSlide ? 'w-4 bg-[#8B5CF6]/60' : 'w-2 bg-zinc-800'}`}
              ></div>
            ))}
          </div>

          <span className="text-[10px] font-mono text-[#00E5FF] tracking-wider uppercase">
            Aura Onboarding Step {onboardingSlide + 1} of {onboardingSlides.length}
          </span>
          <h2 className="text-xl font-display font-medium tracking-tight text-white mb-1.5 mt-1">
            {currentSlideData.title}
          </h2>
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed">{currentSlideData.desc}</p>

          <div className="my-4">{currentSlideData.content}</div>

          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-900">
            <button
              onClick={() => {
                if (onboardingSlide > 0) setOnboardingSlide(onboardingSlide - 1);
              }}
              disabled={onboardingSlide === 0}
              className={`text-xs font-mono py-2 px-4 rounded-lg border transition-colors ${onboardingSlide === 0 ? 'border-zinc-950 text-zinc-700 cursor-not-allowed' : 'border-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              PREVIOUS
            </button>

            <div className="flex items-center gap-2">
              {/* Skip option */}
              <button
                onClick={handleOnboardingComplete}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono py-2 px-3 transition-colors"
                type="button"
              >
                BYPASS SETUP
              </button>

              {onboardingSlide < onboardingSlides.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingSlide(onboardingSlide + 1)}
                  className="bg-[#00E5FF] hover:bg-[#00cce3] text-zinc-950 text-xs font-mono font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>NEXT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOnboardingComplete}
                  className="bg-[#8B5CF6] hover:bg-[#7c4fe0] text-white text-xs font-mono font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer glow-shadow-violet"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>INITIALIZE MATRIX</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW LAYOUT ---
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#E4E4E7] font-sans flex flex-col relative select-none">
      {/* Visual cyber artifacts */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-20"></div>

      {/* HEADER BAR */}
      <header className="border-b border-[#1C1C1E] bg-[#0E0E10]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#00E5FF] flex items-center justify-center font-bold text-black shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.4)]">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  AURAFIT<span className="text-[#00E5FF] ml-0.5">AI</span>
                </h1>
                <span className="text-[8px] font-mono bg-[#1C1C1E] border border-gray-800 text-zinc-400 py-0.5 px-1.5 rounded-full uppercase">
                  V1.4-Core
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">BIOMETRIC TRACKING DECK</p>
            </div>
          </div>



          {/* Custom Avatar Click Trigger to open Bioenergetic Profile Drawer */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="text-xs font-semibold text-zinc-100 block">{sessionUser.email}</span>
              <span className="text-[10px] text-violet-400 font-mono tracking-wider uppercase font-semibold">
                {profile.experience} Athlete
              </span>
            </div>

            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="relative group flex items-center justify-center cursor-pointer focus:outline-none"
              title="View Athlete Profile & Consistency Center"
            >
              {/* Pulsing neon outer status rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#00E5FF] opacity-35 blur-[3px] group-hover:scale-110 transition-transform duration-300"></div>
              
              {/* Inner Avatar Bubble */}
              <div className="relative w-10 h-10 rounded-full bg-[#1C1C1E] border-2 border-zinc-800 group-hover:border-[#00E5FF]/70 flex items-center justify-center text-xs font-mono font-extrabold text-white transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] overflow-hidden">
                <span className="bg-gradient-to-r from-violet-300 to-[#00E5FF] bg-clip-text text-transparent">
                  {sessionUser.email.split('@')[0].substring(0, 2).toUpperCase()}
                </span>
                
                {/* Active compliance dot indicator status */}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-black flex items-center justify-center shadow-[0_0_6px_#10b981]">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR OR MAIN GRID CONTAINER */}
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col md:flex-row p-4 gap-6">
        {/* TAB NAVIGATION SIDEBAR */}
        <nav className="w-full md:w-52 lg:w-56 flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-2 shrink-0 select-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs text-left uppercase transition-all w-full cursor-pointer border ${activeTab === 'dashboard' ? 'bg-[#1C1C1E] border-gray-750 text-white shadow-[0_0_15px_rgba(139,92,246,0.08)] font-bold' : 'bg-[#1C1C1E]/40 border-transparent text-zinc-400 hover:text-white hover:bg-[#1C1C1E]/80 hover:border-zinc-800'}`}
          >
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs text-left uppercase transition-all w-full cursor-pointer border ${activeTab === 'workouts' ? 'bg-[#1C1C1E] border-gray-750 text-white shadow-[0_0_15px_rgba(0,229,255,0.08)] font-bold' : 'bg-[#1C1C1E]/40 border-transparent text-zinc-400 hover:text-white hover:bg-[#1C1C1E]/80 hover:border-zinc-800'}`}
          >
            <Dumbbell className="w-4 h-4 text-[#00E5FF]" />
            <span>Kinetics Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('meals')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs text-left uppercase transition-all w-full cursor-pointer border ${activeTab === 'meals' ? 'bg-[#1C1C1E] border-gray-750 text-white shadow-[0_0_15px_rgba(52,211,153,0.08)] font-bold' : 'bg-[#1C1C1E]/40 border-transparent text-zinc-400 hover:text-white hover:bg-[#1C1C1E]/80 hover:border-zinc-800'}`}
          >
            <Apple className="w-4 h-4 text-emerald-400" />
            <span>Macro Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs text-left uppercase transition-all w-full cursor-pointer border ${activeTab === 'coach' ? 'bg-[#1C1C1E] border-gray-750 text-white shadow-[0_0_15px_rgba(167,139,250,0.12)] font-bold' : 'bg-[#1C1C1E]/40 border-transparent text-zinc-400 hover:text-white hover:bg-[#1C1C1E]/80 hover:border-zinc-800'}`}
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <div className="absolute inset-0 text-violet-400 w-4 h-4 blur-xs opacity-50 bg-transparent"></div>
            </div>
            <span>Aura Coach AI</span>
          </button>
        </nav>

        {/* COMPONENT VIEWS SWAPPER */}
        <main className="flex-grow min-w-0">

          {/* TAB A: TACTICAL HOME DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">

              {/* BENTO GRID MAIN VIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Focus Directive (8 cols) */}
                <div className="col-span-12 lg:col-span-8 bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 relative overflow-hidden group shadow-[0_4px_20px_rgba(139,92,246,0.05)]">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
                    <div>
                      <div className="flex items-center gap-2 text-[#8B5CF6] text-xs font-bold uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping"></span>
                        Daily AI Insight Focus
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                        Maximize Hypertrophy with <br/>Rest-Pause Variation.
                      </h2>
                      {isTipLoading ? (
                        <div className="space-y-2 mt-4">
                          <div className="h-3 bg-zinc-850 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-zinc-850 rounded animate-pulse w-1/2"></div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs mt-3 max-w-xl leading-relaxed">
                          {dailyTip}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-800/40 text-[10px] font-mono text-gray-500">
                      <span>CALIBRATED TO: {profile.goal} / {profile.dietaryPref} DIET</span>
                      <button
                        onClick={() => fetchDailyTip(profile)}
                        disabled={isTipLoading}
                        className="text-[#00E5FF] hover:underline font-bold tracking-wider cursor-pointer transition-colors"
                      >
                        {isTipLoading ? 'REEXAMINING...' : 'REFRESH DIRECTIVE'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AuraFit Central Multi-Ring Overview (4 cols) */}
                <div className="col-span-12 lg:col-span-4">
                  <AuraRingVisualizer
                    workoutSetsCompleted={workoutSetsCompleted}
                    workoutSetsTotal={workoutSetsTotal}
                    dailyBurned={dailyBurned}
                    dailyBurnedTarget={dailyBurnedTarget}
                    dailyWater={dailyWater}
                    dailyWaterTarget={dailyWaterTarget}
                    totalCaloriesConsumed={totalCaloriesConsumed}
                    targetCaloriesConsumed={targetCaloriesConsumed}
                    userGoal={profile.goal}
                  />
                </div>

                {/* Active Burn (4 cols) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800 flex flex-col justify-between shadow-[0_4px_20px_rgba(139,92,246,0.02)]">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Active Burn</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold font-mono text-white">{dailyBurned}</span>
                      <span className="text-xs text-gray-500 mb-1">/ {dailyBurnedTarget} kcal</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#8B5CF6] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (dailyBurned / dailyBurnedTarget) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Workout Energy</span>
                      <span className="text-[#8B5CF6] font-bold">{Math.round(dailyBurned * 0.7)} kcal</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium font-medium">NEAT Steps</span>
                      <span className="text-[#8B5CF6] font-bold">{dailyBurned - Math.round(dailyBurned * 0.7)} kcal</span>
                    </div>
                  </div>
                </div>

                {/* Energy Intake (4 cols) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,229,255,0.02)]">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Energy Intake</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold font-mono text-white">{totalCaloriesConsumed}</span>
                      <span className="text-xs text-gray-500 mb-1">/ {targetCaloriesConsumed} kcal</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#00E5FF] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (totalCaloriesConsumed / targetCaloriesConsumed) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium font-medium">Active Protocol</span>
                      <span className="text-[#00E5FF] font-bold">{profile.dietaryPref}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium font-medium">Target Balance</span>
                      <span className={`font-bold ${totalCaloriesConsumed > targetCaloriesConsumed ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {totalCaloriesConsumed > targetCaloriesConsumed ? 'Surplus' : 'Deficit Target'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hydration Pulse (4 cols) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,229,255,0.05)]">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-[#00E5FF] uppercase tracking-widest font-bold">Hydration Pulse</h3>
                    <span className="text-[10px] font-mono text-gray-500 italic">Goal: {dailyWaterTarget}ml</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center relative py-3">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="#2D2D30" strokeWidth="5" fill="transparent" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="42" 
                        stroke="#00E5FF" 
                        strokeWidth="5" 
                        fill="transparent" 
                        strokeDasharray="263.89" 
                        strokeDashoffset={263.89 - Math.min(1, dailyWater / dailyWaterTarget) * 263.89} 
                        strokeLinecap="round" 
                        className="drop-shadow-[0_0_6px_#00E5FF] transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold text-white">{dailyWater.toLocaleString()}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">ml logged</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button onClick={() => handleLogWater(250)} className="bg-[#2D2D30] hover:bg-[#3D3D40] py-1.5 rounded-xl text-[10px] font-bold text-white transition-colors cursor-pointer">+250ml</button>
                    <button onClick={() => handleLogWater(500)} className="bg-[#2D2D30] hover:bg-[#3D3D40] py-1.5 rounded-xl text-[10px] font-bold text-white transition-colors cursor-pointer">+500ml</button>
                  </div>
                </div>

                {/* Weight curve chart (12 cols) */}
                <div className="col-span-12 bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,229,255,0.02)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weight Analytics</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[#00E5FF] font-mono">{profile.weight} kg (Current)</span>
                        <span className="text-gray-700 font-mono text-[10px]">|</span>
                        <span className="text-xs text-gray-400 font-mono">BMI: {userBMIValue}</span>
                      </div>
                    </div>

                    {/* Daily check-in weight input form */}
                    <form onSubmit={handleWeightCheckIn} className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={checkInWeightInput}
                        onChange={(e) => setCheckInWeightInput(e.target.value)}
                        placeholder="e.g. 74.5"
                        className="w-24 bg-zinc-900 border border-gray-800 focus:border-[#00E5FF] rounded-xl py-1.5 px-3 text-xs font-mono font-semibold text-white text-center focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#00E5FF] hover:bg-[#00cce3] text-zinc-950 font-mono text-[10px] font-bold uppercase px-4 py-1.5 rounded-xl transition-all duration-300 cursor-pointer"
                      >
                        CHECK-IN
                      </button>
                    </form>
                  </div>

                  {/* SVG Live Chart component */}
                  <div className="mt-2">
                    {renderInteractiveSvgChart()}
                  </div>
                </div>

              </div>

              {/* BENTO QUICK-ACCESS GRID NAVIGATION TILES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  onClick={() => setActiveTab('workouts')}
                  className="bg-[#1C1C1E] hover:bg-[#252529] border border-gray-800 hover:border-[#00E5FF]/40 transition-all duration-300 rounded-2xl p-5 cursor-pointer group"
                >
                  <Dumbbell className="w-5 h-5 text-[#00E5FF] group-hover:scale-110 transition-transform mb-2" />
                  <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold">Execute Active workout</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-normal">
                    Proceed directly to structured sets counting. Complete your rest timer.
                  </p>
                  <div className="mt-4 text-[10px] font-mono text-[#00E5FF] flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                    <span>GO TO CORE PLAN</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('meals')}
                  className="bg-[#1C1C1E] hover:bg-[#252529] border border-gray-800 hover:border-emerald-400/40 transition-all duration-300 rounded-2xl p-5 cursor-pointer group"
                >
                  <Apple className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                  <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold">Configure macro fuel</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-normal">
                    Register breakfast, lunches, dinners. Verify allergy exclusions.
                  </p>
                  <div className="mt-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                    <span>GO TO MEAL DECK</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('coach')}
                  className="bg-[#1C1C1E] hover:bg-[#252529] border border-gray-800 hover:border-[#8B5CF6]/40 transition-all duration-300 rounded-2xl p-5 cursor-pointer group"
                >
                  <Sparkles className="w-5 h-5 text-[#8B5CF6] group-hover:scale-110 transition-transform mb-2" />
                  <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold">Chat with coach aura</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-normal">
                    Inquire on bioenergetics dynamics, fast fat-loss mechanics, and kinetic repairs.
                  </p>
                  <div className="mt-4 text-[10px] font-mono text-[#8B5CF6] flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                    <span>SUMMON DIRECT COACH</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB B: WORKOUT TRACKER & ACTIVE WORKOUT ENGINE */}
          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#00E5FF]" />
                    <span>Structured Kinetic Workouts scheduler</span>
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Calculated program targeted exactly for <strong className="text-white">{profile.location} Setup</strong>, tailored for <strong className="text-white">{profile.experience} level</strong> athletes.
                  </p>
                </div>

                {/* Reset entire sheet */}
                <button
                  type="button"
                  onClick={handleResetWorkout}
                  className="self-start md:self-auto flex items-center gap-1.5 py-1.5 px-3 border border-gray-800 hover:bg-zinc-800 text-zinc-450 hover:text-white transition-colors font-mono text-[10px] rounded-xl cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET TODAY'S PROGRESS</span>
                </button>
              </div>

              {/* MAIN ACTIVE rest countdown mechanical stopwatch overlay */}
              {restTimeLeft > 0 && (
                <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#00E5FF] uppercase block tracking-wider font-semibold">
                        Aura rest countdown phase
                      </span>
                      <span className="text-sm font-medium text-white block">
                        Cool down those muscle cells before the next set explosion metrics.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <div className="text-2xl font-bold text-white tracking-widest bg-zinc-950/70 border border-zinc-800 roundedpx-4 py-1.5 min-w-[70px] text-center">
                      0:{restTimeLeft < 10 ? `0${restTimeLeft}` : restTimeLeft}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white rounded-lg transition-colors cursor-pointer"
                        title={isTimerRunning ? "Pause" : "Play"}
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setRestTimeLeft(0)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-405 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Skip rest phase"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TWO COLUMN GRID WORKOUT BODY */}
              {workoutLoading && !activeWorkout ? (
                <div className="text-center bg-[#1C1C1E] border border-gray-800 rounded-2xl p-8">
                  <span className="text-sm font-mono text-zinc-400">Generating your personalized workout plan. This may take a few seconds...</span>
                </div>
              ) : activeWorkout ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                  {/* Left Column: Exercises roster list */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">CURRENT INSTANTIATED SHEET:</span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{activeWorkout.title}</h3>
                    </div>

                    {activeWorkout.exercises.map((ex) => {
                      const isSelected = selectedExerciseId === ex.id;
                      const completedCount = ex.completedSets.filter(Boolean).length;
                      const isFullyComplete = completedCount === ex.sets;

                      return (
                        <div
                          key={ex.id}
                          onClick={() => setSelectedExerciseId(ex.id)}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all ${isSelected ? 'bg-[#1C1C1E] border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.05)]' : 'bg-[#1C1C1E]/40 border-gray-800 hover:border-zinc-700'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[#00E5FF] text-[11px] font-mono uppercase bg-zinc-900 border px-1.5 py-0.5 rounded ${isSelected ? 'border-[#00E5FF]/30' : 'border-zinc-800'}`}>
                                  {ex.target}
                                </span>
                                {isFullyComplete && (
                                  <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/25 border border-emerald-900/55 rounded px-2 py-0.5">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>COMPLETE</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-white mt-1.5 leading-tight">{ex.name}</h4>
                              <p className="text-xs text-zinc-500 mt-1">
                                Targets {ex.sets} sets x {ex.reps} reps with {ex.restSeconds}s rest
                              </p>
                            </div>

                            {/* Completed fraction progress */}
                            <div className="text-right font-mono self-center shrink-0">
                              <span className={`text-base font-bold ${isFullyComplete ? 'text-emerald-400' : 'text-[#8B5CF6]'}`}>
                                {completedCount}
                              </span>
                              <span className="text-xs text-zinc-500"> / {ex.sets} sets</span>
                            </div>
                          </div>

                          {/* Sets ticking indicators buttons inside list */}
                          <div className="mt-4 flex items-center gap-2.5 pt-3.5 border-t border-zinc-900/50" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-mono text-zinc-505">SET WORKLOAD TRACKING:</span>
                            <div className="flex items-center gap-2">
                              {ex.completedSets.map((isSetDone, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => handleToggleSet(ex.id, sIdx)}
                                  className={`w-7 h-7 rounded-md font-mono text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${isSetDone ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-500 hover:text-white'}`}
                                >
                                  {sIdx + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Detail description workspace & Gifs instructions */}
                  <div className="lg:col-span-5 space-y-4">
                    {(() => {
                      const selectedEx = activeWorkout.exercises.find((e) => e.id === selectedExerciseId);
                      if (!selectedEx) {
                        return (
                          <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-6 text-center text-zinc-500 font-mono text-sm leading-relaxed">
                            Select an exercise on the left to review detailed workout instructions.
                          </div>
                        );
                      }

                      return (
                        <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 space-y-4 sticky top-20 shadow-[0_4px_20px_rgba(0,229,255,0.02)]">
                          {/* Simulated exercise mechanics image/vector placeholder */}
                          <div className="relative h-44 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-center overflow-hidden">
                            {/* Animated vector grids to replace complex Gifs as perfect placeholders */}
                            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#00E5FF]/5 to-transparent pointer-events-none"></div>

                            {/* Center schematic ring and weight icon */}
                            <div className="text-center relative z-10 p-4">
                              <Dumbbell className="w-10 h-10 text-[#00E5FF] mx-auto opacity-75 animate-[bounce_2s_infinite]" />
                              <span className="text-[10px] font-mono text-[#00E5FF] uppercase block tracking-widest mt-3">
                                Aura kinetic simulation
                              </span>
                              <span className="text-xs text-white block mt-0.5">
                                KINETICS PLANE: {selectedEx.target}
                              </span>
                            </div>

                            {/* Scanline */}
                            <div className="absolute inset-0 bg-[#00E5FF]/5 opacity-20 pointer-events-none">
                              <div className="w-full h-full bg-[linear-gradient(to_bottom,rgba(0,229,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-[#8B5CF6] uppercase block">
                              Active Target Muscles
                            </span>
                            <h3 className="text-base font-semibold text-white mt-0.5">{selectedEx.name}</h3>
                          </div>

                          <div className="space-y-2.5">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block border-b border-zinc-900 pb-1">
                              Telemetry Mechanics Instructions:
                            </span>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                              {selectedEx.instructions}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5 border-t border-zinc-900 pt-3.5 text-xs">
                            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850">
                              <span className="text-[10px] font-mono text-zinc-500 tracking-wider block">ALLOTTED REPETITIONS</span>
                              <strong className="text-white mt-1 font-mono text-sm block">{selectedEx.reps} reps</strong>
                            </div>
                            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850">
                              <span className="text-[10px] font-mono text-zinc-500 tracking-wider block">REHAB REST THRESHOLD</span>
                              <strong className="text-white mt-1 font-mono text-sm block">{selectedEx.restSeconds} seconds</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              ) : (
                <div className="text-center bg-[#1C1C1E] border border-gray-800 rounded-2xl p-8">
                  <span className="text-sm font-mono text-zinc-500">Zero active workout templates mapped. Verify onboarding configuration.</span>
                </div>
              )}

            </div>
          )}

          {/* TAB C: PERSONALIZED MEAL & DIET PLANNER */}
          {activeTab === 'meals' && (
            <div className="space-y-4">

              {/* Dynamic Header */}
              <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                  <Apple className="w-5 h-5 text-emerald-400" />
                  <span>Personalized Diet & Macro Protocol Manager</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Active preference: <strong className="text-white">{profile.dietaryPref} Plan</strong>. Strict restriction filter profiles: <strong className="text-zinc-350">{profile.restrictions || "none"}</strong>.
                </p>
              </div>

              {/* MACRONUTRIENTS PROGRESS AND BALANCE CARD */}
              <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgba(52,211,153,0.02)]">
                <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider font-bold">
                  Real-time Daily Macronutrient Balance (grams)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Carbs Progress */}
                  <div className="bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-zinc-400 uppercase font-bold">Carbohydrates</span>
                      <span className="font-mono text-white font-semibold">
                        {currentMacrosSum.carbs}g / {targetMacros.carbs}g
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-450 h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentMacrosSum.carbs / targetMacros.carbs) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 block text-right">
                      {Math.max(0, targetMacros.carbs - currentMacrosSum.carbs)}g remaining target
                    </span>
                  </div>

                  {/* Protein Progress */}
                  <div className="bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono uppercase text-[#8B5CF6] font-bold">PROTEIN TARGETS</span>
                      <strong className="font-mono text-white font-semibold">
                        {currentMacrosSum.protein}g / {targetMacros.protein}g
                      </strong>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#8B5CF6] h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentMacrosSum.protein / targetMacros.protein) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-550 block text-right">
                      {Math.max(0, targetMacros.protein - currentMacrosSum.protein)}g remaining target
                    </span>
                  </div>

                  {/* Fat Progress */}
                  <div className="bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono uppercase text-[#00E5FF] font-bold">KINETIC LIPO FATS</span>
                      <strong className="font-mono text-white font-semibold flex items-center">
                        {currentMacrosSum.fat}g / {targetMacros.fat}g
                      </strong>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00E5FF] h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentMacrosSum.fat / targetMacros.fat) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 block text-right">
                      {Math.max(0, targetMacros.fat - currentMacrosSum.fat)}g remaining target
                    </span>
                  </div>
                </div>
              </div>

              {/* QUICK CLICK-LOGGING RECIPE PANELS AND LOG PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Left side: Roster of suggested meals mapping preference */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-[0_4px_20px_rgba(255,255,255,0.01)]">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold mb-1">
                      Personalized suggested Recipes ({profile.dietaryPref})
                    </h3>

                    {/* Breakfast recommendation card */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                      <div>
                        <span className="text-[9px] font-mono text-amber-500 uppercase font-semibold">Breakfast Pick</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">
                          {mealSuggestions.breakfast.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">
                          {mealSuggestions.breakfast.calories} kcal | {mealSuggestions.breakfast.protein}g Pro
                        </p>
                      </div>

                      <button
                        onClick={() => handleQuickLogMeal('breakfast')}
                        className="py-1 px-3 bg-zinc-905 hover:bg-[#8B5CF6]/20 border border-zinc-800 hover:border-[#8B5CF6] text-white hover:text-white transition-all text-[10px] font-mono rounded-lg cursor-pointer shrink-0"
                      >
                        LOG
                      </button>
                    </div>

                    {/* Lunch recommendation card */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                      <div>
                        <span className="text-[9px] font-mono text-[#00E5FF] uppercase font-semibold">Optimal Lunch Pick</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">
                          {mealSuggestions.lunch.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">
                          {mealSuggestions.lunch.calories} kcal | {mealSuggestions.lunch.protein}g Pro
                        </p>
                      </div>

                      <button
                        onClick={() => handleQuickLogMeal('lunch')}
                        className="py-1 px-3 bg-zinc-905 hover:bg-[#8B5CF6]/20 border border-zinc-800 hover:border-[#8B5CF6] text-white hover:text-white transition-all text-[10px] font-mono rounded-lg cursor-pointer shrink-0"
                      >
                        LOG
                      </button>
                    </div>

                    {/* Dinner recommendation card */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-[#8B5CF6]/20 rounded-xl">
                      <div>
                        <span className="text-[9px] font-mono text-[#8B5CF6] uppercase font-semibold">Premium Dinner Pick</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">
                          {mealSuggestions.dinner.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">
                          {mealSuggestions.dinner.calories} kcal | {mealSuggestions.dinner.protein}g Pro
                        </p>
                      </div>

                      <button
                        onClick={() => handleQuickLogMeal('dinner')}
                        className="py-1 px-3 bg-zinc-905 hover:bg-[#8B5CF6]/20 border border-zinc-800 hover:border-[#8B5CF6] text-white hover:text-white transition-all text-[10px] font-mono rounded-lg cursor-pointer shrink-0"
                      >
                        LOG
                      </button>
                    </div>

                    {/* Quick general snack logger */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase font-semibold">General micro fuel</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">High-Energy Telemetry snack</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">210 kcal | 14g protein</p>
                      </div>

                      <button
                        onClick={() => handleQuickLogMeal('snack')}
                        className="py-1 px-3 bg-zinc-905 hover:bg-[#8B5CF6]/20 border border-zinc-800 hover:border-[#8B5CF6] text-white hover:text-white transition-all text-[10px] font-mono rounded-lg cursor-pointer shrink-0"
                      >
                        LOG
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Logged meals spreadsheet list */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-[0_4px_20px_rgba(255,255,255,0.01)]">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold mb-1">
                      Active logged coordinates ({new Date().toISOString().split('T')[0]})
                    </h3>

                    {mealLogs.length === 0 ? (
                      <div className="text-center p-8 bg-zinc-950/30 border border-zinc-900 rounded-xl">
                        <span className="text-xs font-mono text-zinc-500 italic">No food matrices recorded today. Clear system payload.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {mealLogs.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl group"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-mono uppercase tracking-widest px-1 py-0.5 rounded leading-none ${m.type === 'breakfast' ? 'bg-amber-500/20 text-amber-500' : m.type === 'lunch' ? 'bg-cyan-500/20 text-cyan-400' : m.type === 'dinner' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-zinc-800 text-zinc-400'}`}>
                                  {m.type}
                                </span>
                                <h4 className="text-xs font-medium text-white">{m.name}</h4>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {m.calories} kcal | {m.protein}g Protein | {m.carbs}g Carbs
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteMeal(m.id, m.name)}
                              className="text-[10px] text-zinc-500 hover:text-red-400 font-mono underline md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-right"
                            >
                              PURGE
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB D: COACH AURA AI CHATROOM */}
          {activeTab === 'coach' && (
            <div className="space-y-4">

              {/* Chatroom wrapper workspace */}
              <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl flex flex-col h-[525px] relative overflow-hidden shadow-[0_4px_25px_rgba(139,92,246,0.03)]">

                {/* Chat header */}
                <div className="p-4 border-b border-zinc-900 bg-zinc-950/45 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="p-2.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6]">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-zinc-950"></span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white leading-tight">Coach Aura AI</h3>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Wifi className="w-3 h-3 text-[#00E5FF]" />
                        <span>QUANTUM ENCRYPTED CHAT CORE (GEMINI-3.5-FLASH)</span>
                      </span>
                    </div>
                  </div>

                  {/* Clear logs option */}
                  <button
                    onClick={() => {
                      setMessages([
                        { id: 'init_1', sender: 'aura', text: "Chat cleared. Ask me any structured physiological query.", timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
                      ]);
                      addTelemetry('User Event', 'Purged chat messages timeline histories.', 0, true);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white font-mono underline transition-colors cursor-pointer"
                  >
                    CLEAR SCREEN
                  </button>
                </div>

                {/* Chat Messages flow body */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-zinc-950/10">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${m.sender === 'user' ? 'bg-[#8B5CF6] text-white rounded-br-none glow-shadow-violet' : 'bg-[#1C1C1E] border border-zinc-850 text-zinc-300 rounded-bl-none'}`}>
                        {/* Speaker marker */}
                        {m.sender !== 'user' && (
                          <span className="text-[9px] font-mono text-[#8B5CF6] uppercase block font-semibold mb-1">
                            AURA INTERFACE
                          </span>
                        )}

                        {/* Text */}
                        {m.sender === 'user' ? (
                          <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                        ) : (
                          <FormattedMessage text={m.text} />
                        )}

                        {/* Stamp */}
                        <span className="text-[9px] font-mono text-zinc-500 block text-right mt-1.5 opacity-60">
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Custom typing state block */}
                  {isCoachTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#1C1C1E] border border-zinc-850 rounded-xl rounded-bl-none p-3.5 max-w-[80vw]">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold mb-1">
                          COACH AURA DISPATCHING CORE RESPONSE...
                        </span>
                        <div className="flex gap-1.5 py-1">
                          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef}></div>
                </div>

                {/* Prompt Suggesters section */}
                {chatInput.trim() === '' && !messages.some((m) => m.sender === 'user') && (
                  <div className="bg-zinc-950/20 border-t border-zinc-900/60 p-3 flex flex-wrap gap-1.5 shrink-0 select-none">
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider w-full mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/60"></span>
                      <span>SUGGESTED DISCOVERY QUERIES</span>
                    </div>
                    {[
                      "Construct a 20min Home HIIT workout",
                      "How do I maximize protein absorption on vegan diets?",
                      "Analyze my current 165cm and 68kg BMI specs",
                      "Suggest a customized macro split plan for weightloss",
                    ].map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendChat(undefined, s)}
                        className="py-1 px-2.5 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 text-[10px] font-sans text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer Send keyboard form */}
                <form onSubmit={(e) => handleSendChat(e)} className="p-3.5 border-t border-zinc-900 bg-zinc-950/45 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Inquire on bioenergetics dynamics, reps, caloric partitions..."
                    className="flex-grow bg-zinc-900/60 border border-zinc-800 focus:border-[#8B5CF6] rounded-xl py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-0 font-sans"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-[#8B5CF6] hover:bg-[#7c4fe0] text-white rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
                </div>
          )}

        </main>
      </div>

      {/* ATHLETE PROFILE & CONSISTENCY CENTER SLIDEOVER DRAWER */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]">
          {/* Backdrop Click Shield to close */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsProfileDrawerOpen(false)}
          ></div>

          {/* Sliding Drawer Body Card */}
          <div className="relative w-full max-w-md h-full bg-[#0E0E10] border-l border-zinc-805 text-white flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 animate-[slideInRight_0.25s_ease-out] overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-900 bg-[#121214] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#8B5CF6]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00E5FF]">
                  Aura Bio-Athlete Profile
                </h2>
              </div>
              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-830 text-[10px] font-mono text-zinc-405 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable Drawer Body Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6 scrollbar-thin">
              
              {/* Profile Avatar Stats Header */}
              <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col items-center text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] via-[#00E5FF] to-emerald-400"></div>
                
                {/* Large Neon Avatar Badge */}
                <div className="relative w-16 h-16 rounded-full bg-[#1C1C1E] border-2 border-[#8B5CF6]/40 flex items-center justify-center text-lg font-mono font-black text-white shadow-lg shadow-[#8B5CF6]/5">
                  <div className="absolute inset-0 rounded-full border border-[#00E5FF]/20 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-[#00E5FF] bg-clip-text text-transparent">
                    {sessionUser.email.split('@')[0].substring(0, 3).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{sessionUser.email}</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                    {profile.experience} Tier Athlete
                  </p>
                </div>

                {/* Overall Compliance Meter */}
                <div className="w-full bg-[#121214] border border-zinc-900 p-3.5 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-wider">Today's Bio-Compliance Rating</span>
                    <span className="text-xs font-mono font-bold text-[#00E5FF]">
                      {Math.round(
                        workoutSetsTotal > 0 
                          ? (Math.min(100, (dailyWater / dailyWaterTarget) * 100) + Math.min(100, (workoutSetsCompleted / workoutSetsTotal) * 100)) / 2 
                          : Math.min(100, (dailyWater / dailyWaterTarget) * 100)
                      )}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${Math.round(
                          workoutSetsTotal > 0 
                            ? (Math.min(100, (dailyWater / dailyWaterTarget) * 100) + Math.min(100, (workoutSetsCompleted / workoutSetsTotal) * 100)) / 2 
                            : Math.min(100, (dailyWater / dailyWaterTarget) * 100)
                        )}%` 
                      }}
                    ></div>
                  </div>

                  <p className="text-[9px] font-mono text-zinc-550 text-left mt-2 uppercase tracking-wide">
                    STATUS: {
                      (workoutSetsTotal > 0 
                        ? (Math.min(100, (dailyWater / dailyWaterTarget) * 100) + Math.min(100, (workoutSetsCompleted / workoutSetsTotal) * 100)) / 2 
                        : Math.min(100, (dailyWater / dailyWaterTarget) * 100)) >= 85 
                          ? '✨ Elite Compliance Confirmed' 
                          : (workoutSetsTotal > 0 
                            ? (Math.min(100, (dailyWater / dailyWaterTarget) * 100) + Math.min(100, (workoutSetsCompleted / workoutSetsTotal) * 100)) / 2 
                            : Math.min(100, (dailyWater / dailyWaterTarget) * 100)) >= 45 
                              ? '⚡ Healthy Progress Track' 
                              : '💤 Awaiting Bioenergetic Sync'
                    }
                  </p>
                </div>
              </div>

              {/* 14-days performance consistency grid */}
              <div className="space-y-3 p-4 border border-zinc-900 bg-zinc-950/20 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest font-bold">
                    14-Day Consistency Matrix
                  </h4>
                  <span className="text-[9px] font-mono text-[#00E5FF] font-semibold bg-[#00E5FF]/5 px-2 py-0.5 rounded border border-[#00E5FF]/10 uppercase">
                    Reactive Log
                  </span>
                </div>
                
                {/* Flex rows or grid of tracking cells */}
                <div className="grid grid-cols-7 gap-2 pt-1.5">
                  {consistencyData.map((day, idx) => {
                    const isFullyCompliant = day.waterPercent >= 100 && (workoutSetsTotal > 0 ? day.workoutPercent >= 100 : true);
                    const isHydrated = day.waterPercent >= 100;
                    const tookWorkout = day.workoutPercent > 0;
                    
                    let cellBg = "bg-[#121214] border border-zinc-900";
                    let glowSpec = "None";

                    if (isFullyCompliant) {
                      cellBg = "bg-gradient-to-br from-[#8B5CF6] to-[#00E5FF] border-transparent text-black font-bold shadow-[0_0_8px_rgba(139,92,246,0.3)]";
                      glowSpec = "Double Win (Water & Workouts)";
                    } else if (isHydrated) {
                      cellBg = "bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF]";
                      glowSpec = "Hydration Goal Completed";
                    } else if (tookWorkout) {
                      cellBg = "bg-[#8B5CF6]/25 border border-[#8B5CF6]/45 text-violet-300";
                      glowSpec = "Workout Sessions Executed";
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`aspect-square rounded-lg flex flex-col justify-center items-center font-mono text-[9px] transition-all cursor-pointer relative group ${cellBg}`}
                        title={`${day.label}: Water: ${Math.round(day.waterPercent)}%, Workout: ${Math.round(day.workoutPercent)}% (${glowSpec})`}
                      >
                        <span className={isFullyCompliant ? "text-zinc-950" : "text-zinc-350"}>
                          {idx === 13 ? 'TY' : day.label.replace(' ago', '')}
                        </span>

                        {/* Interactive cell hover micro tooltip info card details */}
                        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-50 bg-[#161618] border border-zinc-800 rounded px-2.5 py-1.5 w-36 text-[9px] leading-relaxed shadow-xl text-left text-zinc-300 select-none">
                          <p className="font-mono font-bold text-white border-b border-zinc-800 pb-1 mb-1">{idx === 13 ? 'Today (Live Tracker)' : day.label}</p>
                          <p className="flex justify-between"><span>💧 Water:</span> <span className="font-bold text-[#00E5FF]">{Math.round(day.waterPercent)}%</span></p>
                          <p className="flex justify-between"><span>⚡ Workout:</span> <span className="font-bold text-violet-400">{Math.round(day.workoutPercent)}%</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend bar */}
                <div className="flex flex-wrap text-[8px] font-mono text-zinc-500 gap-x-3 gap-y-1.5 pt-1.5 border-t border-zinc-900/60 font-semibold uppercase">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-gradient-to-br from-[#8B5CF6] to-[#00E5FF]"></span>
                    <span>Double Clear</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/40"></span>
                    <span>Water Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#8B5CF6]/25 border border-[#8B5CF6]/45"></span>
                    <span>Workout Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#121214] border border-zinc-900"></span>
                    <span>Incomplete</span>
                  </div>
                </div>
              </div>

              {/* Direct Hydration Pulse quick-logger panel */}
              <div className="p-4 border border-zinc-900 bg-zinc-950/20 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest font-bold">
                    Quick Hydration Intake Logs
                  </h4>
                  <span className="text-[9px] font-mono text-zinc-400">{dailyWater} / {dailyWaterTarget} ml</span>
                </div>
                
                {/* Drinking Grid log buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      setDailyWater(prev => Math.max(0, prev - 250));
                      addTelemetry('User Event', `Decreased Hydration logging: -250ml`, 1, true);
                    }}
                    className="py-2 bg-zinc-900 hover:bg-zinc-850 text-red-400 font-mono text-[9px] font-bold border border-zinc-800 rounded-lg hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    -250 ml
                  </button>
                  <button
                    onClick={() => handleLogWater(250)}
                    className="py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 font-mono text-[9px] font-bold border border-zinc-800 rounded-lg hover:border-[#00E5FF]/50 transition-all cursor-pointer"
                  >
                    +250 ml
                  </button>
                  <button
                    onClick={() => handleLogWater(500)}
                    className="py-2 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 text-[#00E5FF] font-mono text-[9px] font-extrabold border border-[#00E5FF]/20 rounded-lg transition-all cursor-pointer"
                  >
                    +500 ml
                  </button>
                  <button
                    onClick={() => handleLogWater(750)}
                    className="py-2 bg-gradient-to-r from-indigo-950 to-[#00E5FF]/30 text-white font-mono text-[9px] font-extrabold border border-[#00E5FF]/30 rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    +750 ml
                  </button>
                </div>
              </div>

              {/* Editable Profile parameters Form */}
              <form onSubmit={handleSaveProfileDrafts} className="space-y-4">
                <div className="bg-[#121214] border border-zinc-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest font-bold border-b border-zinc-900 pb-2 mb-1">
                    Edit Physiological Calibration
                  </h4>

                  {/* Weight cm / height weight inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={draftWeight} 
                        onChange={(e) => setDraftWeight(parseFloat(e.target.value) || 0)} 
                        className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Height (cm)</label>
                      <input 
                        type="number"
                        value={draftHeight} 
                        onChange={(e) => setDraftHeight(parseInt(e.target.value) || 0)} 
                        className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Age and daily water target logs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Age (years)</label>
                      <input 
                        type="number"
                        value={draftAge} 
                        onChange={(e) => setDraftAge(parseInt(e.target.value) || 0)} 
                        className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Water Goal (ml)</label>
                      <input 
                        type="number"
                        step="50"
                        value={draftWaterTarget} 
                        onChange={(e) => setDraftWaterTarget(parseInt(e.target.value) || 0)} 
                        className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Athletic experience level */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Coaching Tier Experience</label>
                    <select
                      value={draftExperience}
                      onChange={(e) => setDraftExperience(e.target.value)}
                      className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-805 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner Athlete</option>
                      <option value="Intermediate">Intermediate Athlete</option>
                      <option value="Advanced">Elite Advanced Athlete</option>
                    </select>
                  </div>

                  {/* Dietary protocol split */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Dietary Protocol Partitions</label>
                    <select
                      value={draftDietaryPref}
                      onChange={(e) => setDraftDietaryPref(e.target.value)}
                      className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-805 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
                    >
                      <option value="Standard">Standard Balanced Macros</option>
                      <option value="Ketogenic">High Fat Low Carb Ketogenic</option>
                      <option value="Plant-Based">Fully Plant-Based Clean Fuel</option>
                      <option value="High-Protein">Calorie-Controlled High Protein</option>
                    </select>
                  </div>

                  {/* Goal selection */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Primary Target Objective</label>
                    <select
                      value={draftGoal}
                      onChange={(e) => setDraftGoal(e.target.value)}
                      className="w-full bg-[#1C1C1E] text-xs text-white border border-zinc-805 rounded-xl px-3 py-2 focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
                    >
                      <option value="Weight Loss">Weight Loss & Fat Mobilization</option>
                      <option value="Muscle Gain">Hypertrophy & Lean Bulk Gain</option>
                      <option value="Cardio Endurance">Aerobic Capacity Cardio Endurance</option>
                      <option value="General Health">Holistic Health Maintenance</option>
                    </select>
                  </div>

                  {/* Feedback notifications */}
                  {profileSuccessFeedback && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-mono">
                      {profileSuccessFeedback}
                    </div>
                  )}

                  {/* Action submit button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-[#8B5CF6] hover:from-violet-500 hover:to-[#9f7cf7] text-white py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-md shadow-indigo-950/40 cursor-pointer"
                  >
                    Commit Biometric Coordinates
                  </button>
                </div>
              </form>

            </div>

            {/* Logout and dev watermark region in footer drawer */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex flex-col gap-3">
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 bg-red-950/20 hover:bg-red-900 border border-red-900/30 text-red-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Athlete Session</span>
              </button>
              
              <div className="text-center font-mono text-[8px] text-zinc-600 tracking-wider">
                DEVELOPED BY ALMAS✨ • AURAFIT CORE v1.4
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SYSTEM BOTTOM DECK WATERMARK */}
      <footer className="border-t border-[#1C1C1E] bg-zinc-950/30 py-3.5 px-4 text-center text-[10px] font-mono text-zinc-650">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AURAFIT PORTABLE BIO-CYBER DECK — ALL METRIC PATHWAYS SECURE</span>
          <span className="text-zinc-550 font-semibold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-400 to-zinc-600">DEVELOPED BY ALMAS✨</span>
        </div>
      </footer>
    </div>
  );
}
