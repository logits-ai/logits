import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';

const PanicMode = ({ isOpen, onClose }) => {
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [breathText, setBreathText] = useState("Inhale");
  
  // Use a Ref to hold the Audio object
  const audioRef = useRef(null);

  // --- 1. AUTO-PLAY & CLEANUP LOGIC ---
  useEffect(() => {
    if (isOpen) {
      // Initialize audio instance if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio("/traian1984-ambience-wind-blowing-through-trees-01-186986.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.6;
      }

      // Auto-play immediately on open
      audioRef.current.play()
        .then(() => setIsPlayingNoise(true))
        .catch(e => {
          console.error("Autoplay blocked by browser:", e);
          setIsPlayingNoise(false);
        });

    } else {
      // Stop and reset when closed
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingNoise(false);
      }
    }
  }, [isOpen]);

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // --- 2. MANUAL TOGGLE (Stop/Start when clicked) ---
  const toggleAmbience = () => {
    if (!audioRef.current) return;

    if (isPlayingNoise) {
      audioRef.current.pause();
      setIsPlayingNoise(false);
    } else {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
      setIsPlayingNoise(true);
    }
  };

  // --- 3. BREATHING ANIMATION CYCLE ---
  useEffect(() => {
    if (!isOpen) return;
    
    const breatheCycle = () => {
      setBreathText("Inhale");
      setTimeout(() => {
        setBreathText("Hold");
        setTimeout(() => {
          setBreathText("Exhale");
        }, 4000); // Hold for 4s
      }, 4000); // Inhale for 4s
    };

    breatheCycle(); 
    const interval = setInterval(breatheCycle, 12000); // 12s total cycle

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* --- ANIMATED BACKGROUND --- */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] animate-gradient-slow z-0" />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5 
              }}
              animate={{ 
                y: [null, Math.random() * -100], 
                opacity: [0.2, 0.5, 0.2] 
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ width: Math.random() * 4 + 1, height: Math.random() * 4 + 1 }}
            />
          ))}

          {/* --- CORE BREATHING ORB --- */}
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-white/80 font-light text-2xl tracking-[0.3em] uppercase mb-12 drop-shadow-lg">
              Center Your Mind
            </h1>

            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{ 
                  duration: 12, 
                  times: [0, 0.33, 1], 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-teal-500 rounded-full blur-[60px]"
              />

              {/* Main Breathing Circle */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1.3, 1], 
                }}
                transition={{ 
                  duration: 12, 
                  times: [0, 0.33, 0.66, 1], 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-48 h-48 bg-gradient-to-b from-teal-300 to-emerald-600 rounded-full shadow-[0_0_50px_rgba(20,184,166,0.5)] flex items-center justify-center relative z-20 backdrop-blur-sm border border-white/10"
              >
                <motion.span 
                  key={breathText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-white font-medium text-xl tracking-widest uppercase"
                >
                  {breathText}
                </motion.span>
              </motion.div>
            </div>

            {/* --- CONTROLS --- */}
            <div className="mt-16 flex flex-col gap-4 w-64">
              <button 
                onClick={toggleAmbience}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-md border transition-all duration-300 group
                  ${isPlayingNoise 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
              >
                {isPlayingNoise ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <span className="font-bold tracking-wide">
                  {isPlayingNoise ? 'Wind Active' : 'Play Wind Sound'}
                </span>
              </button>

              <button 
                onClick={() => {
                  // Sound stops automatically via useEffect cleanup
                  onClose();
                }}
                className="px-6 py-4 rounded-2xl bg-transparent border border-white/20 text-white/50 font-bold tracking-widest hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> EXIT
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PanicMode;