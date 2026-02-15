"use client";
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext'; 
import { useRouter } from 'next/navigation';
import { 
  Mic, MicOff, ArrowRight, Sparkles, User, X, Zap, Eye, 
  Music, Coffee, Wind, Youtube, Coins, Activity, Droplets, Gem, Fingerprint, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

// --- IMPORTS ---
import PanicMode from '@/app/PanicMode'; 
import SuccessConfetti from '@/app/SuccessConfetti';
import AccessibilityToggle from '@/app/AccessibilityToggle';

// ==========================================
// 1. INLINE COMPONENTS
// ==========================================

const EnergyCrystals = ({ value, onChange, mode }) => {
  const levels = [20, 40, 60, 80, 100];
  const isHighContrast = mode === 'highContrast';

  return (
    <div className={`w-full flex flex-col items-center gap-3 ${isHighContrast ? 'p-4 border-2 border-yellow-400 bg-black' : ''}`}>
      <div className="flex justify-between w-full px-4 items-center">
         {levels.map((level, index) => {
            const isActive = value >= level;
            return (
               <button key={level} onClick={() => onChange(level)} className="group relative flex flex-col items-center gap-2 focus:outline-none">
                  <motion.div 
                     whileHover={{ scale: 1.2 }}
                     whileTap={{ scale: 0.9 }}
                     animate={{ scale: isActive ? 1.1 : 1, filter: isActive ? "grayscale(0%)" : "grayscale(100%) opacity(30%)" }}
                     className={`p-3 rounded-2xl transition-all duration-300 shadow-sm border-2
                        ${isActive 
                            ? (isHighContrast ? 'bg-yellow-400 border-yellow-400' : 'border-amber-400 bg-amber-100') 
                            : (isHighContrast ? 'border-gray-600 bg-gray-900' : 'border-stone-300 bg-stone-100')
                        }
                     `}
                  >
                     <Gem size={22} className={isActive ? (isHighContrast ? 'text-black' : 'text-amber-700') : 'text-stone-400'} />
                  </motion.div>
               </button>
            );
         })}
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Current Bandwidth</div>
    </div>
  );
};

const HoldToConnect = ({ onUnlock, mode }) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (progress >= 100) {
      clearInterval(intervalRef.current);
      onUnlock(); 
      setProgress(0);
      setHolding(false);
    }
  }, [progress, onUnlock]);

  const startHold = () => {
    setHolding(true);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2.5));
    }, 16);
  };

  const stopHold = () => {
    setHolding(false);
    clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
    <div className="w-full flex justify-center py-4">
      <div 
        className="relative group cursor-pointer"
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
           <circle cx="60" cy="60" r="54" stroke="currentColor" strokeOpacity="0.2" strokeWidth="8" fill="transparent" />
           <motion.circle 
             cx="60" cy="60" r="54" 
             stroke="currentColor" 
             strokeWidth="8" 
             fill="transparent"
             strokeDasharray="339.292"
             strokeDashoffset={339.292 - (339.292 * progress) / 100}
             strokeLinecap="round"
           />
        </svg>
        <div className="absolute top-2 left-2 w-[104px] h-[104px] rounded-full border-2 flex flex-col items-center justify-center z-10 bg-white/50 border-stone-200">
           <Fingerprint size={32} className="mb-1 transition-colors opacity-70" />
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{holding ? "Syncing..." : "Hold"}</span>
        </div>
      </div>
    </div>
  );
};

const BreathingModal = ({ onClose }) => {
  const [phase, setPhase] = useState("Ready");
  const audioRef = useRef(null);

  const startSession = () => {
    const audio = new Audio("/traian1984-ambience-wind-blowing-through-trees-01-186986.mp3"); 
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio blocked:", e));
    audioRef.current = audio;
    
    let p = 0;
    const phases = ["Inhale (4s)", "Hold (4s)", "Exhale (4s)"];
    setPhase(phases[0]);
    
    const interval = setInterval(() => {
        p = (p + 1) % 3;
        setPhase(phases[p]);
    }, 4000);
    
    return () => {
        clearInterval(interval);
        if (audioRef.current) { audioRef.current.pause(); }
    };
  };

  useEffect(() => {
    const cleanup = startSession();
    return cleanup;
  }, []);

  return (
    <div className="p-8 text-center flex flex-col items-center">
       <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Wind /> Zen Mode</h3>
       <motion.div 
         animate={{ scale: phase.includes("Inhale") ? 1.5 : phase.includes("Hold") ? 1.5 : 1 }} 
         transition={{ duration: 4, ease: "easeInOut" }} 
         className="w-40 h-40 rounded-full bg-teal-500/20 flex items-center justify-center border-4 border-teal-500 mb-6"
       >
          <span className="font-bold text-xl text-teal-800">{phase}</span>
       </motion.div>
       <button onClick={onClose} className="mt-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700">End Session</button>
    </div>
  );
};

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

const ACCESSIBILITY_MODES = {
  default: { label: "Default", bg: "#FFF8F0", text: "#4A3B32", font: '"Inter", sans-serif', animation: true },
  highContrast: { label: "High Contrast", bg: "#000000", text: "#FFFF00", font: 'Arial, sans-serif', border: '2px solid #FFFF00', animation: false },
  soft: { label: "Soft (Dyslexia)", bg: "#FDF6E3", text: "#5D4037", font: 'OpenDyslexic, Verdana', lineHeight: "2.0", animation: true },
  adhd: { label: "ADHD Focus", bg: "#F0F4F8", text: "#102A43", font: 'Verdana, sans-serif', spacing: "wide", animation: true }
};

export default function Home() {
  const { coins, setCoins } = useUser(); 
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [greetingIndex, setGreetingIndex] = useState(0); // For smooth text cycling
  const router = useRouter();
  
  const [energyLevel, setEnergyLevel] = useState(60);
  const [showRecharge, setShowRecharge] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null); 
  const [message, setMessage] = useState(null);

  const [accessMode, setAccessMode] = useState('default');
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [voiceType, setVoiceType] = useState('asmr'); 

  // --- OPTIMIZED LOADING ANIMATION LOGIC ---
  const greetings = ["Hello", "नमस्ते", "Hola"];

  useEffect(() => {
    // 1. Cycle through greetings
    const greetingInterval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 800);

    // 2. End loading after 2.5s
    const timer = setTimeout(() => {
      clearInterval(greetingInterval);
      setIsLoading(false);
    }, 2600);

    return () => {
      clearTimeout(timer);
      clearInterval(greetingInterval);
    };
  }, []);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); 
  // Removed top-level refs for space bar to keep logic contained in effect
  
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setInput(transcript);
        if (/\b(panic)\b/i.test(transcript)) {
            setPanicMode(true);
            stopListening();
        }
      };
      recognition.onend = () => { setIsListening(false); };
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
        try { recognitionRef.current.start(); setIsListening(true); } 
        catch (e) { console.error("Mic error", e); }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return alert("Browser not supported");
    if (isListening) stopListening();
    else startListening();
  };

  // --- UPDATED: SPACE BAR HOLD (1 Second) ---
  useEffect(() => {
    let spaceTimer = null;
    let isSpaceHeld = false;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        const tag = document.activeElement.tagName;
        // Don't trigger if typing in a text field
        if (tag !== 'TEXTAREA' && tag !== 'INPUT') {
          e.preventDefault(); 
          
          if (isSpaceHeld) return; // Prevent repeat triggers
          isSpaceHeld = true;

          // Start 1-second timer (1000ms)
          spaceTimer = setTimeout(() => {
            if (isSpaceHeld) {
               startListening();
               triggerToast("🎤 Mic Active (Release to Stop)");
            }
          }, 1000); // Changed from 2000 to 1000
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        isSpaceHeld = false;
        
        // If released before 1s, clear timer
        if (spaceTimer) { 
          clearTimeout(spaceTimer); 
          spaceTimer = null; 
        }
        
        // If holding longer than 1s (Mic is ON), stop it
        if (isListeningRef.current) { 
          stopListening(); 
          triggerToast("Mic Off"); 
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // Logic contained in effect, no external refs needed

  const handleStart = () => {
    if (!input.trim()) return;
    localStorage.setItem("userTask", input);
    localStorage.setItem("userEnergy", energyLevel);
    localStorage.setItem("voiceType", voiceType); 
    setShowConfetti(true);
    setTimeout(() => { router.push("/dashboard"); }, 1500);
  };

  const triggerToast = (msg) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 2000);
  };

  const handleUnlock = () => {
    setShowRecharge(true); 
    setTimeout(() => { document.getElementById('recharge-section')?.scrollIntoView({ behavior: 'smooth' }); }, 300);
  };

  const openLink = (url) => window.open(url, '_blank');

  const currentStyle = ACCESSIBILITY_MODES[accessMode];
  const isReducedMotion = !currentStyle.animation || panicMode; 

  return (
    <MotionConfig reducedMotion={isReducedMotion ? "always" : "never"}>
      <style jsx global>{`
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/opendyslexic@2.1.0-beta1/resources/fonts/OpenDyslexic-Regular.woff2') format('woff2');
        }
        body { 
          background-color: ${currentStyle.bg} !important; 
          color: ${currentStyle.text} !important; 
          transition: background-color 0.5s ease;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden transition-all duration-300" style={{ fontFamily: currentStyle.font }}>
        
        {!panicMode && <SuccessConfetti trigger={showConfetti} />}

        {/* === HEADER === */}
        <div className="absolute top-6 right-6 flex gap-3 z-50">
           <div className="relative flex gap-2">
             <AccessibilityToggle highContrast={accessMode === 'highContrast'} setHighContrast={() => setAccessMode(accessMode === 'highContrast' ? 'default' : 'highContrast')} />
             
             <button onClick={() => setShowAccessMenu(!showAccessMenu)} className="p-3 bg-white/20 border border-current rounded-xl hover:bg-white/40 backdrop-blur-sm transition-all text-current"><Eye className="w-5 h-5" /></button>
             
             <AnimatePresence>
               {showAccessMenu && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-[60]">
                    <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Visual Mode</h3>
                    <div className="grid grid-cols-1 gap-2 mb-4">
                       {Object.keys(ACCESSIBILITY_MODES).map(m => ( 
                           <button key={m} onClick={() => setAccessMode(m)} className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${accessMode === m ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                             {ACCESSIBILITY_MODES[m].label}
                           </button> 
                       ))}
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Voice Style</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setVoiceType('asmr')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${voiceType === 'asmr' ? 'bg-pink-100 text-pink-700 border border-pink-300' : 'bg-slate-100 text-slate-500'}`}>Stimulating</button>
                        <button onClick={() => setVoiceType('neutral')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${voiceType === 'neutral' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-500'}`}>Neutral</button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           <button onClick={() => setPanicMode(true)} className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg animate-pulse" title="Panic Mode"><Activity className="w-5 h-5" /></button>
           
           <button onClick={() => router.push('/profile')} className="p-3 bg-white/40 backdrop-blur-sm border border-current rounded-xl hover:bg-white/60 transition-all text-current">
              <User className="w-5 h-5" />
           </button>
        </div>

        {/* === TOAST === */}
        <AnimatePresence>{message && <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /> {message}</motion.div>}</AnimatePresence>

        {/* === OPTIMIZED SMOOTH FADE LOADING === */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="splash" 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
            >
               <div className="relative flex flex-col items-center justify-center w-full">
                  
                  {/* Subtle Glow */}
                  <motion.div 
                    animate={{ 
                      opacity: [0.1, 0.3, 0.1],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"
                  />

                  {/* Smooth Text Fader (Fixed Position) */}
                  <div className="h-32 flex items-center justify-center z-10 w-full relative">
                     <AnimatePresence mode="wait">
                       <motion.span
                         key={greetings[greetingIndex]}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 1.05 }}
                         transition={{ duration: 0.5, ease: "easeOut" }}
                         className="text-6xl md:text-8xl font-light text-white tracking-[0.2em] absolute"
                       >
                          {greetings[greetingIndex]}
                       </motion.span>
                     </AnimatePresence>
                  </div>

                  {/* Progress Line */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    className="mt-20 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"
                  />
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="mt-4 text-xs font-bold uppercase tracking-[0.6em] text-indigo-200"
                  >
                    Neural Syncing
                  </motion.p>
               </div>
            </motion.div>
          ) : (
            <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
              
              <div className="max-w-3xl w-full">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">NeuroSpeak</h1>
                <p className="text-xl opacity-70 mb-12">The workspace that adapts to your brain.</p>

                <div className="relative w-full max-w-2xl mx-auto mb-12 group">
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="What needs to be done?" 
                    className={`w-full h-40 p-6 rounded-[2rem] shadow-xl text-xl resize-none outline-none transition-all
                      ${accessMode === 'highContrast' 
                        ? 'bg-black border-2 border-yellow-400 text-yellow-400 placeholder:text-yellow-700' 
                        : 'bg-white/60 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100'
                      }`} 
                  />
                  <div className="absolute bottom-4 right-4">
                     <button onClick={toggleVoiceInput} className={`p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                        {isListening ? <Mic /> : <MicOff />}
                     </button>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    <EnergyCrystals value={energyLevel} onChange={setEnergyLevel} mode={accessMode} />
                    
                    <button onClick={handleStart} disabled={!input.trim()} className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-3
                        ${accessMode === 'highContrast' ? 'bg-yellow-400 text-black hover:bg-white' : 'bg-slate-800 text-white hover:bg-slate-900'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Zap className={accessMode === 'highContrast' ? 'fill-black' : 'fill-yellow-400 text-yellow-400'} /> 
                        Break It Down
                    </button>

                    <button onClick={() => setShowRecharge(!showRecharge)} className="text-sm font-bold opacity-60 hover:opacity-100 uppercase tracking-widest mt-8">
                        {showRecharge ? "Close Dopamine Menu" : "Need a Dopamine Hit?"}
                    </button>

                    {/* === FINGERPRINT MOVED OUTSIDE === */}
                    {!showRecharge && (
                        <div className="mt-4">
                            <HoldToConnect onUnlock={handleUnlock} mode={accessMode} />
                        </div>
                    )}

                    <AnimatePresence>
                        {showRecharge && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setActiveFeature('breathe')} className="group p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-3xl flex flex-col items-center gap-3 hover:scale-[1.02] transition-all shadow-sm">
                                        <div className="p-3 bg-white rounded-full shadow-sm"><Wind className="text-teal-500 w-6 h-6" /></div>
                                        <div><span className="block font-bold text-teal-900">Breathe</span><span className="text-xs text-teal-600">Quick Zen Mode</span></div>
                                    </button>
                                    <button onClick={() => setActiveFeature('hydrate')} className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl flex flex-col items-center gap-3 hover:scale-[1.02] transition-all shadow-sm">
                                        <div className="p-3 bg-white rounded-full shadow-sm"><Droplets className="text-blue-500 w-6 h-6" /></div>
                                        <div><span className="block font-bold text-blue-900">Hydrate</span><span className="text-xs text-blue-600">Quick Refresh</span></div>
                                    </button>
                                    <button onClick={() => setActiveFeature('music')} className="group p-6 bg-gradient-to-br from-green-50 to-lime-50 border border-green-100 rounded-3xl flex flex-col items-center gap-3 hover:scale-[1.02] transition-all shadow-sm">
                                        <div className="p-3 bg-white rounded-full shadow-sm"><Music className="text-green-500 w-6 h-6" /></div>
                                        <div><span className="block font-bold text-green-900">Music</span><span className="text-xs text-green-600">Focus Beats</span></div>
                                    </button>
                                    <button onClick={() => setActiveFeature('youtube')} className="group p-6 bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-3xl flex flex-col items-center gap-3 hover:scale-[1.02] transition-all shadow-sm">
                                        <div className="p-3 bg-white rounded-full shadow-sm"><Youtube className="text-red-500 w-6 h-6" /></div>
                                        <div><span className="block font-bold text-red-900">Videos</span><span className="text-xs text-red-600">Satisfying Visuals</span></div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>

        {/* === MODAL OVERLAY === */}
        <AnimatePresence>
          {activeFeature && (
            <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveFeature(null)}>
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setActiveFeature(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
                  {activeFeature === 'breathe' && <BreathingModal onClose={() => setActiveFeature(null)} />}
                  {activeFeature === 'hydrate' && (
                      <div className="p-8 text-center">
                          <h3 className="text-xl font-bold mb-4">Hydration Station</h3>
                          <div className="space-y-3">
                              <button onClick={() => triggerToast("💧 Logged Water")} className="w-full p-4 border rounded-xl hover:bg-blue-50 font-bold flex items-center justify-center gap-2"><Droplets size={18} /> Ice Water</button>
                              <button onClick={() => triggerToast("🍵 Logged Tea")} className="w-full p-4 border rounded-xl hover:bg-green-50 font-bold flex items-center justify-center gap-2"><Coffee size={18} /> Green Tea</button>
                          </div>
                      </div>
                  )}
                  {activeFeature === 'music' && (
                      <div className="p-8 text-center">
                          <h3 className="text-xl font-bold mb-4">Focus Music</h3>
                          <div className="space-y-3">
                              <button onClick={() => openLink('https://open.spotify.com')} className="w-full p-4 bg-[#1DB954] text-white rounded-xl font-bold hover:opacity-90">Open Spotify</button>
                              <button onClick={() => openLink('https://music.youtube.com')} className="w-full p-4 bg-[#FF0000] text-white rounded-xl font-bold hover:opacity-90">YouTube Music</button>
                          </div>
                      </div>
                  )}
                  {activeFeature === 'youtube' && (
                      <div className="p-8 text-center">
                          <h3 className="text-xl font-bold mb-4">Visual Stim</h3>
                          <div className="space-y-3">
                              <button onClick={() => openLink('https://www.youtube.com/results?search_query=satisfying+video')} className="w-full p-4 border rounded-xl hover:bg-purple-50 font-bold">Satisfying Loops</button>
                              <button onClick={() => openLink('https://www.youtube.com/results?search_query=asmr+nature')} className="w-full p-4 border rounded-xl hover:bg-teal-50 font-bold">Nature ASMR</button>
                          </div>
                      </div>
                  )}
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <PanicMode isOpen={panicMode} onClose={() => setPanicMode(false)} />
      </div>
    </MotionConfig>
  );
}