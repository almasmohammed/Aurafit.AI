import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Droplet, Flame, Sparkles, TrendingUp } from 'lucide-react';

interface AuraRingVisualizerProps {
  // Workout sets metrics
  workoutSetsCompleted: number;
  workoutSetsTotal: number;
  // Active Burn metrics
  dailyBurned: number;
  dailyBurnedTarget: number;
  // Hydration metrics
  dailyWater: number;
  dailyWaterTarget: number;
  // Energy metrics
  totalCaloriesConsumed: number;
  targetCaloriesConsumed: number;
  // User goal
  userGoal: string;
}

export function AuraRingVisualizer({
  workoutSetsCompleted,
  workoutSetsTotal,
  dailyBurned,
  dailyBurnedTarget,
  dailyWater,
  dailyWaterTarget,
  totalCaloriesConsumed,
  targetCaloriesConsumed,
  userGoal
}: AuraRingVisualizerProps) {
  // Selected metric to highlight in the center
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'workout' | 'hydration' | 'calories'>('all');

  // 1. Calculate workout progress (completed sets)
  const workoutPercent = useMemo(() => {
    if (workoutSetsTotal === 0) {
      // Fallback to active burn progress if no workout has been instantiated yet
      return dailyBurnedTarget > 0 ? (dailyBurned / dailyBurnedTarget) * 100 : 0;
    }
    return (workoutSetsCompleted / workoutSetsTotal) * 100;
  }, [workoutSetsCompleted, workoutSetsTotal, dailyBurned, dailyBurnedTarget]);

  // 2. Calculate hydration progress
  const hydrationPercent = useMemo(() => {
    if (dailyWaterTarget === 0) return 0;
    return (dailyWater / dailyWaterTarget) * 100;
  }, [dailyWater, dailyWaterTarget]);

  // 3. Calculate calorie/energy intake progress
  const caloriePercent = useMemo(() => {
    if (targetCaloriesConsumed === 0) return 0;
    return (totalCaloriesConsumed / targetCaloriesConsumed) * 100;
  }, [totalCaloriesConsumed, targetCaloriesConsumed]);

  // 4. Calculate overall holistic Aura Score (0 to 100)
  const auraScore = useMemo(() => {
    // cap individual scores to 100% for overall aura balance, then average them
    const wScore = Math.min(100, Math.max(0, workoutPercent));
    const hScore = Math.min(100, Math.max(0, hydrationPercent));
    const cScore = Math.min(100, Math.max(0, caloriePercent));
    return Math.round((wScore + hScore + cScore) / 3);
  }, [workoutPercent, hydrationPercent, caloriePercent]);

  // SVG radii and circumferences config
  const outerRadius = 80; // Workout Ring (Purple)
  const outerCircumference = 2 * Math.PI * outerRadius; // ~502.65

  const middleRadius = 60; // Hydration Ring (Cyan)
  const middleCircumference = 2 * Math.PI * middleRadius; // ~376.99

  const innerRadius = 40; // Calorie Ring (Emerald)
  const innerCircumference = 2 * Math.PI * innerRadius; // ~251.33

  // Get bounded percentages for rendering the progress rings
  const boundedWorkoutPercent = Math.min(100, Math.max(0, workoutPercent));
  const boundedHydrationPercent = Math.min(100, Math.max(0, hydrationPercent));
  const boundedCaloriePercent = Math.min(100, Math.max(0, caloriePercent));

  // Offset calculations
  const outerOffset = outerCircumference - (boundedWorkoutPercent / 100) * outerCircumference;
  const middleOffset = middleCircumference - (boundedHydrationPercent / 100) * middleCircumference;
  const innerOffset = innerCircumference - (boundedCaloriePercent / 100) * innerCircumference;

  // Active highlighted info for center text
  const currentDisplay = useMemo(() => {
    switch (selectedMetric) {
      case 'workout':
        return {
          title: 'Active Sets',
          value: `${workoutSetsCompleted}/${workoutSetsTotal}`,
          subValue: `${Math.round(workoutPercent)}% Finished`,
          color: 'text-[#8B5CF6]',
          desc: `${dailyBurned} kcal Active Burn`
        };
      case 'hydration':
        return {
          title: 'Hydration',
          value: `${dailyWater.toLocaleString()} ml`,
          subValue: `${Math.round(hydrationPercent)}% of Goal`,
          color: 'text-[#00E5FF]',
          desc: `Goal: ${dailyWaterTarget.toLocaleString()} ml`
        };
      case 'calories':
        return {
          title: 'Energy Intake',
          value: `${totalCaloriesConsumed} kcal`,
          subValue: `${Math.round(caloriePercent)}% of Target`,
          color: 'text-emerald-400',
          desc: `Target: ${targetCaloriesConsumed} kcal`
        };
      case 'all':
      default:
        return {
          title: 'Aura Score',
          value: `${auraScore}%`,
          subValue: 'System Integrity',
          color: 'text-white',
          desc: `Goal: ${userGoal || 'Peak Physical Optimization'}`
        };
    }
  }, [
    selectedMetric,
    workoutSetsCompleted,
    workoutSetsTotal,
    workoutPercent,
    dailyBurned,
    dailyWater,
    hydrationPercent,
    dailyWaterTarget,
    totalCaloriesConsumed,
    caloriePercent,
    targetCaloriesConsumed,
    auraScore,
    userGoal
  ]);

  return (
    <div className="AuraRingVisualizer bg-[#1C1C1E] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_25px_rgba(139,92,246,0.04)] h-full relative overflow-hidden group">
      
      {/* Visual Tech Grid Accent background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-45"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header section with tiny tech badge */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">HOLISTIC BIOMETRICS</span>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-[#8B5CF6] animate-pulse" />
              <span>AuraFit Multi-Ring Overview</span>
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => setSelectedMetric('all')}
            className={`px-2 py-0.5 border rounded-full font-mono text-[9px] uppercase transition-all ${selectedMetric === 'all' ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-white font-semibold' : 'bg-transparent border-gray-800 text-gray-500 hover:text-white'}`}
          >
            Aura Score
          </button>
        </div>

        {/* Dynamic Interactive SVG Rings */}
        <div className="flex-1 flex flex-col items-center justify-center relative py-5 select-none">
          <div className="relative w-[210px] h-[210px]">
            <svg 
              width="210" 
              height="210" 
              viewBox="0 0 210 210" 
              className="transform rotate-0"
              id="aurafit_svg_multiring"
            >
              <defs>
                <filter id="purple-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. OUTER RING: WORKOUT SETTRACKING (PURPLE) */}
              {/* Track */}
              <circle
                cx="105"
                cy="105"
                r={outerRadius}
                fill="none"
                stroke="rgba(139, 92, 246, 0.08)"
                strokeWidth="10"
                className="cursor-pointer"
                onClick={() => setSelectedMetric('workout')}
              />
              {/* Highlight background when focused */}
              {selectedMetric === 'workout' && (
                <circle
                  cx="105"
                  cy="105"
                  r={outerRadius}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.04)"
                  strokeWidth="20"
                  className="animate-pulse"
                />
              )}
              {/* Animated Progress Circle */}
              <motion.circle
                cx="105"
                cy="105"
                r={outerRadius}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth={selectedMetric === 'workout' ? "12" : "10"}
                strokeDasharray={outerCircumference}
                initial={{ strokeDashoffset: outerCircumference }}
                animate={{ strokeDashoffset: outerOffset }}
                transition={{ duration: 1.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                className="origin-center -rotate-90 cursor-pointer hover:stroke-[12px] transition-[stroke-width,filter] duration-300"
                onClick={() => setSelectedMetric('workout')}
                filter={selectedMetric === 'workout' ? "url(#purple-glow)" : "none"}
              />

              {/* 2. MIDDLE RING: HYDRATION INTENSITY (CYAN) */}
              {/* Track */}
              <circle
                cx="105"
                cy="105"
                r={middleRadius}
                fill="none"
                stroke="rgba(0, 229, 255, 0.08)"
                strokeWidth="10"
                className="cursor-pointer"
                onClick={() => setSelectedMetric('hydration')}
              />
              {/* Highlight background when focused */}
              {selectedMetric === 'hydration' && (
                <circle
                  cx="105"
                  cy="105"
                  r={middleRadius}
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.04)"
                  strokeWidth="20"
                  className="animate-pulse"
                />
              )}
              {/* Animated Progress Circle */}
              <motion.circle
                cx="105"
                cy="105"
                r={middleRadius}
                fill="none"
                stroke="#00E5FF"
                strokeWidth={selectedMetric === 'hydration' ? "12" : "10"}
                strokeDasharray={middleCircumference}
                initial={{ strokeDashoffset: middleCircumference }}
                animate={{ strokeDashoffset: middleOffset }}
                transition={{ duration: 1.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                className="origin-center -rotate-90 cursor-pointer hover:stroke-[12px] transition-[stroke-width,filter] duration-300"
                onClick={() => setSelectedMetric('hydration')}
                filter={selectedMetric === 'hydration' ? "url(#cyan-glow)" : "none"}
              />

              {/* 3. INNER RING: CALORIC INTEGRATION (EMERALD) */}
              {/* Track */}
              <circle
                cx="105"
                cy="105"
                r={innerRadius}
                fill="none"
                stroke="rgba(52, 211, 153, 0.08)"
                strokeWidth="10"
                className="cursor-pointer"
                onClick={() => setSelectedMetric('calories')}
              />
              {/* Highlight background when focused */}
              {selectedMetric === 'calories' && (
                <circle
                  cx="105"
                  cy="105"
                  r={innerRadius}
                  fill="none"
                  stroke="rgba(52, 211, 153, 0.04)"
                  strokeWidth="20"
                  className="animate-pulse"
                />
              )}
              {/* Animated Progress Circle */}
              <motion.circle
                cx="105"
                cy="105"
                r={innerRadius}
                fill="none"
                stroke="#34D399"
                strokeWidth={selectedMetric === 'calories' ? "12" : "10"}
                strokeDasharray={innerCircumference}
                initial={{ strokeDashoffset: innerCircumference }}
                animate={{ strokeDashoffset: innerOffset }}
                transition={{ duration: 1.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                className="origin-center -rotate-90 cursor-pointer hover:stroke-[12px] transition-[stroke-width,filter] duration-300"
                onClick={() => setSelectedMetric('calories')}
                filter={selectedMetric === 'calories' ? "url(#emerald-glow)" : "none"}
              />
            </svg>

            {/* Central Overlay text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMetric}
                  initial={{ opacity: 0, scale: 0.95, y: 2 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="text-center flex flex-col items-center"
                >
                  <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                    {currentDisplay.title}
                  </span>
                  <span className={`text-3xl font-display font-extrabold tracking-tight ${currentDisplay.color} transition-all`}>
                    {currentDisplay.value}
                  </span>
                  <span className="text-[10px] font-medium text-white/90 mt-0.5">
                    {currentDisplay.subValue}
                  </span>
                  <span className="text-[8.5px] font-mono text-gray-500 mt-1 max-w-[110px] truncate">
                    {currentDisplay.desc}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Readout Percent Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-3.5 flex items-center justify-center gap-3.5 text-[9px] font-mono bg-zinc-950/40 border border-gray-800/50 rounded-full py-1 px-3.5"
          >
            <button 
              type="button"
              onClick={() => setSelectedMetric('workout')}
              className={`flex items-center gap-1 cursor-pointer transition-all ${selectedMetric === 'workout' ? 'text-[#8B5CF6] font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedMetric === 'workout' ? 'bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]' : 'bg-[#8B5CF6]/50'}`}></span>
              <span>W:{Math.round(workoutPercent)}%</span>
            </button>
            <span className="text-gray-700 select-none">|</span>
            <button 
              type="button"
              onClick={() => setSelectedMetric('hydration')}
              className={`flex items-center gap-1 cursor-pointer transition-all ${selectedMetric === 'hydration' ? 'text-[#00E5FF] font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedMetric === 'hydration' ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#00E5FF]/50'}`}></span>
              <span>H:{Math.round(hydrationPercent)}%</span>
            </button>
            <span className="text-gray-700 select-none">|</span>
            <button 
              type="button"
              onClick={() => setSelectedMetric('calories')}
              className={`flex items-center gap-1 cursor-pointer transition-all ${selectedMetric === 'calories' ? 'text-emerald-400 font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedMetric === 'calories' ? 'bg-[#34D399] shadow-[0_0_8px_#34D399]' : 'bg-emerald-500/50'}`}></span>
              <span>C:{Math.round(caloriePercent)}%</span>
            </button>
          </motion.div>
        </div>

        {/* Legend Interactive Pills Section */}
        <div className="space-y-2 mt-2">
          {/* Workout / Active Sets */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            onClick={() => setSelectedMetric('workout')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${selectedMetric === 'workout' ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/50 shadow-[0_0_12px_rgba(139,92,246,0.06)]' : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/60 hover:border-gray-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6]">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-white block">Workout Progress</span>
                <span className="text-[9px] font-mono text-gray-500 leading-none">Completed Sets</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white block">
                {workoutSetsCompleted}/{workoutSetsTotal}
              </span>
              <span className="text-[9px] font-mono text-[#8B5CF6] font-semibold">
                {Math.round(workoutPercent)}%
              </span>
            </div>
          </motion.div>

          {/* Hydration */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            onClick={() => setSelectedMetric('hydration')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${selectedMetric === 'hydration' ? 'bg-[#00E5FF]/10 border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.06)]' : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/60 hover:border-gray-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF]">
                <Droplet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-white block">Daily Hydration</span>
                <span className="text-[9px] font-mono text-gray-500 leading-none">Target quota</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white block">
                {dailyWater.toLocaleString()} ml
              </span>
              <span className="text-[9px] font-mono text-[#00E5FF] font-semibold">
                {Math.round(hydrationPercent)}%
              </span>
            </div>
          </motion.div>

          {/* Food Energy */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            onClick={() => setSelectedMetric('calories')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${selectedMetric === 'calories' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.06)]' : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/60 hover:border-gray-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-white block">Caloric Energy Intake</span>
                <span className="text-[9px] font-mono text-gray-500 leading-none">Macronutrient cap</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white block">
                {totalCaloriesConsumed} kcal
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                {Math.round(caloriePercent)}%
              </span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
