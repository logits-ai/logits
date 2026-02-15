"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext'; 
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, Timer, Sparkles, BrainCircuit, 
  Play, Coins, Split, Loader2, Zap, Home 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const { setCoins } = useUser(); 
  
  // --- STATE ---
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState([]);
  const [energy, setEnergy] = useState(50);
  
  const [phase, setPhase] = useState('loading'); 
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionCoins, setSessionCoins] = useState(0);

  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [rewardData, setRewardData] = useState(null); 

  // --- IMPROVED SMART ENGINE (Detailed Steps) ---
  const generateSmartSteps = (taskInput) => {
    const t = taskInput.toLowerCase();
    
    // COMPLEX: CODING (8 Steps)
    if (t.includes('code') || t.includes('app') || t.includes('debug') || t.includes('react') || t.includes('api')) {
        return [
            { id: 1, text: "Initialize project environment and install dependencies." },
            { id: 2, text: "Review documentation and architectural requirements." },
            { id: 3, text: "Set up the database schema or data structure." },
            { id: 4, text: "Build the core backend API routes." },
            { id: 5, text: "Develop the frontend components and UI." },
            { id: 6, text: "Connect frontend to backend and manage state." },
            { id: 7, text: "Test for bugs, edge cases, and responsiveness." },
            { id: 8, text: "Refactor code, clean up comments, and commit." }
        ];
    }

    // COMPLEX: COOKING (7 Steps)
    if (t.includes('cook') || t.includes('recipe') || t.includes('bake') || t.includes('meal') || t.includes('kitchen')) {
        return [
            { id: 1, text: "Read the full recipe to understand timing." },
            { id: 2, text: "Clear counter and set up 'Mise en place' (ingredients)." },
            { id: 3, text: "Wash, chop, and prep all vegetables and proteins." },
            { id: 4, text: "Preheat oven or stove and prepare cookware." },
            { id: 5, text: "Execute main cooking process (sauté/bake/simmer)." },
            { id: 6, text: "Taste test and adjust seasoning (salt/acid/heat)." },
            { id: 7, text: "Plate the dish, serve immediately, and soak pans." }
        ];
    }

    // COMPLEX: STUDYING/WRITING (7 Steps)
    if (t.includes('study') || t.includes('write') || t.includes('essay') || t.includes('exam') || t.includes('read')) {
        return [
            { id: 1, text: "Clear desk and open necessary materials/tabs." },
            { id: 2, text: "Outline the main arguments or topics to cover." },
            { id: 3, text: "Draft the introduction or review first section." },
            { id: 4, text: "Deep work session: Core content generation." },
            { id: 5, text: "Take a 5-minute active recall or stretch break." },
            { id: 6, text: "Review work for clarity, grammar, or gaps." },
            { id: 7, text: "Final polish and submission/saving." }
        ];
    }

    // DEFAULT COMPLEX (6 Steps) - Fallback for general big tasks
    return [
        { id: 1, text: "Define the specific goal and desired outcome." },
        { id: 2, text: "Gather all necessary resources and tools." },
        { id: 3, text: "Create a rough outline or plan of action." },
        { id: 4, text: "Execute the most difficult part of the task first." },
        { id: 5, text: "Complete the remaining smaller details." },
        { id: 6, text: "Review work against the original goal and finish." }
    ];
  };

  // --- 1. INITIALIZE & FETCH API ---
  useEffect(() => {
    const storedTask = localStorage.getItem("userTask");
    const storedEnergy = parseInt(localStorage.getItem("userEnergy") || "50");
    
    if (!storedTask) {
       router.push('/'); 
       return;
    }
    setTask(storedTask);
    setEnergy(storedEnergy);

    async function fetchBreakdown() {
      try {
        const res = await fetch('/api/decompose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: storedTask }),
        });

        if (!res.ok) throw new Error("API Route missing or failed");

        const data = await res.json();

        // If API returns steps, use them (Assuming API returns full list)
        if (data.tasks && data.tasks.length > 0) {
          const apiSteps = data.tasks.map((t, idx) => ({
            id: idx + 1,
            text: t.text || t 
          }));
          setSteps(apiSteps);
        } else {
          throw new Error("No tasks returned");
        }
      } catch (error) {
        // FALLBACK: Use the detailed Smart Engine
        console.log("Using Detailed Smart Engine Fallback");
        setSteps(generateSmartSteps(storedTask));
      } finally {
        setTimeout(() => setPhase('review'), 2500); 
      }
    }

    fetchBreakdown();
  }, [router]);

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 3. REWARD LOGIC ---
  const calculateReward = () => {
    let baseCoin = 10;
    let multiplier = 1;
    let reason = "Step Complete";

    // Difficulty Bonus (More steps = harder task)
    if (steps.length >= 6) {
        baseCoin += 5; // Hard task bonus
    }

    if (energy <= 30) {
        multiplier = 2.0; 
        reason = "⚡ Heroic Effort Bonus!";
    } else if (energy <= 60) {
        multiplier = 1.5;
        reason = "🔥 Momentum Bonus!";
    } else {
        multiplier = 1.0;
        reason = "✨ Task Complete";
    }

    return { total: Math.round(baseCoin * multiplier), reason: reason };
  };

  const saveToHistory = (finalCoins) => {
    const completedTask = {
        id: Date.now(),
        task: task, 
        date: new Date().toLocaleDateString(),
        duration: formatTime(timer),
        coins: finalCoins 
    };

    const existingHistory = JSON.parse(localStorage.getItem('taskHistory') || '[]');
    const newHistory = [completedTask, ...existingHistory];
    
    localStorage.setItem('taskHistory', JSON.stringify(newHistory));
  };

  // --- HANDLERS ---
  const handleStart = () => {
    setPhase('active');
    setIsTimerRunning(true); 
  };

  const handleNextStep = () => {
    const reward = calculateReward();
    const newTotalSessionCoins = sessionCoins + reward.total;

    setCoins(prev => prev + reward.total);
    setSessionCoins(newTotalSessionCoins); 
    
    setRewardData(reward);
    setTimeout(() => setRewardData(null), 2000); 

    if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
    } else {
        setPhase('complete');
        setIsTimerRunning(false);
        saveToHistory(newTotalSessionCoins); 
    }
  };

  const handleBreakDown = () => {
    if (isBreakingDown) return;
    setIsBreakingDown(true);
    
    setTimeout(() => {
        const currentTaskText = steps[currentStep].text;
        const newSubSteps = [
            { id: Date.now(), text: `Prepare: ${currentTaskText.substring(0, 15)}...` },
            { id: Date.now() + 1, text: `Execute core: ${currentTaskText.substring(0, 15)}...` }
        ];
        const updatedSteps = [...steps];
        updatedSteps.splice(currentStep + 1, 0, ...newSubSteps);
        setSteps(updatedSteps);
        setIsBreakingDown(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#FFF8F0] text-[#4A3B32] font-sans transition-colors duration-500">
      
      <AnimatePresence>
        {rewardData && (
            <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.8 }} 
                animate={{ y: -50, opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 pointer-events-none z-[100] flex flex-col items-center justify-center"
            >
                <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center">
                    <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                        <Coins className="w-8 h-8 fill-yellow-400" /> +{rewardData.total}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{rewardData.reason}</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <button onClick={() => router.push('/')} className="p-3 rounded-xl bg-white border border-[#D7CCC8] hover:bg-[#EFEBE9] transition-all text-[#5D4037]">
           <ArrowLeft size={20} />
        </button>

        {phase === 'active' && (
            <div className="absolute top-6 left-20 hidden md:flex items-center gap-2 px-3 py-1 bg-white/50 rounded-lg text-xs font-bold uppercase tracking-wider opacity-60">
                <Zap size={12} className={energy < 40 ? "text-red-500 fill-red-500" : "text-yellow-500 fill-yellow-500"} />
                {energy < 40 ? "Hard Mode (2x Rewards)" : "Standard Mode"}
            </div>
        )}

        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-500
            ${isTimerRunning ? 'bg-indigo-50 border-indigo-200 shadow-md scale-105' : 'bg-white/50 border-transparent'}
        `}>
            <Timer className={`w-5 h-5 ${isTimerRunning ? 'text-indigo-600 animate-pulse' : 'text-[#A1887F]'}`} />
            <span className={`font-mono text-xl font-bold tracking-widest ${isTimerRunning ? 'text-indigo-700' : 'text-[#A1887F]'}`}>
                {formatTime(timer)}
            </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
            
            {phase === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-8">
                        <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-indigo-200 rounded-full blur-xl"/>
                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full flex items-center justify-center"><BrainCircuit className="w-10 h-10 text-indigo-500 animate-pulse" /></div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#4A3B32] mb-2">Analyzing Task Difficulty...</h2>
                    <div className="flex items-center gap-2 text-sm text-[#8D6E63]"><span>Energy Level: {energy}%</span><span className="w-1 h-1 bg-[#8D6E63] rounded-full"></span><span>Calculating Rewards...</span></div>
                </motion.div>
            )}

            {phase === 'review' && (
                <motion.div key="review" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="w-full max-w-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#3E2723] mb-2">Ready to Start?</h1>
                        <p className="text-[#8D6E63]">Your current energy is <span className="font-bold">{energy}%</span>. {energy < 40 ? " You'll earn Double Coins for pushing through!" : " You're in prime condition."}</p>
                    </div>
                    <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="p-4 bg-white rounded-xl border border-[#D7CCC8] shadow-sm flex gap-4 items-center">
                                <span className="w-8 h-8 rounded-full bg-[#EFEBE9] text-[#5D4037] flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>
                                <p className="font-medium text-[#5D4037]">{step.text}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleStart} className="w-full py-5 bg-[#3E2723] text-[#FFF8F0] rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-[#2D2420] transition-all flex items-center justify-center gap-3"><Play className="w-5 h-5 fill-current" /> Let's Begin</button>
                </motion.div>
            )}

            {phase === 'active' && (
                <motion.div key="active" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }} className="w-full max-w-2xl flex flex-col items-center">
                    <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border border-[#D7CCC8] mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#EFEBE9]"><motion.div className="h-full bg-green-500" initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</span>
                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg"><Coins size={12} /> Potential: {energy <= 30 ? "20" : "10"}</div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723] leading-tight mb-6">{steps[currentStep].text}</h2>
                        <button onClick={handleBreakDown} disabled={isBreakingDown} className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-dashed border-[#D7CCC8] text-[#8D6E63] font-bold hover:bg-[#F5F5F0] hover:border-[#8D6E63] transition-all flex items-center justify-center gap-2 disabled:opacity-50">{isBreakingDown ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Split className="w-4 h-4" /> Break Down Step</>}</button>
                    </div>
                    <button onClick={handleNextStep} className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-green-600 text-white rounded-full font-bold shadow-xl hover:bg-green-700 hover:scale-[1.02] transition-all active:scale-95"><CheckCircle className="w-6 h-6" /> Complete Step</button>
                </motion.div>
            )}

            {phase === 'complete' && (
                <motion.div key="complete" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"><Sparkles size={48} /></div>
                    <h1 className="text-4xl font-bold text-[#3E2723] mb-4">Task Crushed!</h1>
                    <p className="text-xl text-[#8D6E63] mb-8">You stayed focused for {formatTime(timer)} and earned <span className="font-bold text-yellow-600">{sessionCoins} Coins</span>!</p>
                    
                    <button onClick={() => router.push('/')} className="px-8 py-4 bg-[#3E2723] text-white rounded-2xl font-bold hover:bg-[#2D2420] flex items-center gap-2 mx-auto">
                        <Home size={20} /> Back to Home
                    </button>
                </motion.div>
            )}

        </AnimatePresence>
      </main>
    </div>
  );
}