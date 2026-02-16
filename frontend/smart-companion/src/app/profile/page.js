"use client";
import { useState, useEffect } from 'react'; // Added hooks
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trophy, Calendar, Coins, Zap } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const { coins } = useUser(); 
  
  // New state to hold history loaded from local storage
  const [localHistory, setLocalHistory] = useState([]);

  // --- FIX 1: LOAD DATA FROM BROWSER STORAGE ---
  useEffect(() => {
    // This grabs the data saved by the Dashboard
    const savedData = localStorage.getItem('taskHistory');
    if (savedData) {
      setLocalHistory(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
      
      {/* --- FIX 2: NAVIGATION TO HOME --- */}
      <button 
        onClick={() => router.push('/')} 
        className="flex items-center gap-2 text-[#8D6E63] hover:text-[#5D4037] mb-8 font-bold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Home Base
      </button>

      {/* HEADER CARD */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#D7CCC8] mb-8 flex flex-col md:flex-row items-center gap-8">
         <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <User className="w-10 h-10" />
         </div>
         <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-[#3E2723]">Pilot Profile</h1>
            <p className="text-[#8D6E63]">Level 1 • Ready for Action</p>
         </div>
         <div className="flex gap-6">
            <div className="text-center">
               <div className="text-xs text-[#A1887F] font-bold uppercase tracking-wider mb-1">Total Coins</div>
               <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                 <Coins className="w-6 h-6 fill-amber-500" /> {coins}
               </div>
            </div>
            <div className="text-center">
               <div className="text-xs text-[#A1887F] font-bold uppercase tracking-wider mb-1">Missions</div>
               {/* Use localHistory length */}
               <div className="text-2xl font-black text-[#5D4037]">{localHistory.length}</div>
            </div>
         </div>
      </div>

      {/* HISTORY LIST */}
      <h2 className="text-xl font-bold text-[#5D4037] mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-amber-600" /> Mission Log
      </h2>

      <div className="space-y-4">
        {localHistory.length > 0 ? (
          localHistory.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#D7CCC8] flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
               <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                      {/* FIX: Use 'task.task' because that is how Dashboard saves it */}
                      <h3 className="font-bold text-[#3E2723] text-lg">{task.task}</h3>
                      
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                          Completed
                      </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-[#8D6E63] font-bold">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {task.duration} Focus</span>
                  </div>
               </div>
               
               {/* FIX: Use 'task.coins' from saved data */}
               <span className="text-sm font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-1 border border-amber-100">
                 <Coins className="w-4 h-4 fill-amber-700" /> +{task.coins} Coins
               </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-[#A1887F]">
             <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
             <p>No missions completed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}