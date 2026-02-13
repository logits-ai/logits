import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [text, setText] = useState("Copilot gives shitty results but Gemini is love. That will install the GPU-enabled runtime into your venv, and your RTX 4060 will be used.");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("System Ready");
  
  const recognitionRef = useRef(null);
  const audioQueue = useRef([]); 
  const isPlayingRef = useRef(false);

  // --- 1. AUDIO PLAYER (Queue System) ---
  const playNextInQueue = () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setStatus("Finished");
      return;
    }

    isPlayingRef.current = true;
    const blob = audioQueue.current.shift();
    const audio = new Audio(URL.createObjectURL(blob));
    
    audio.onended = () => {
      playNextInQueue(); 
    };
    audio.play();
  };

  // --- 2. THE "INSTANT START" LOGIC ---
const handleSpeak = async () => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    setStatus("🚀 instant start...");

    // 1. Prepare Text
    // Remove newlines to prevent weird pauses
    const cleanText = text.replace(/\n/g, " ");
    
    // 2. The "3-WORD BURST" Strategy
    // Chunk 1: First 3 words (Generates in ~50ms -> Instant Audio)
    // Chunk 2: Rest of the sentence
    // Chunk 3: Rest of the paragraph
    const words = cleanText.split(" ");
    let chunks = [];

    if (words.length > 3) {
      chunks.push(words.slice(0, 3).join(" ")); // The "Burst"
      
      // Split the rest by punctuation
      const remainingText = words.slice(3).join(" ");
      const restChunks = remainingText.match(/[^.?!,;]+[.?!,;]+[\])'"]*|.+/g) || [remainingText];
      chunks.push(...restChunks);
    } else {
      chunks = [cleanText];
    }

    // 3. Streaming Loop
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (!chunk) continue;

      try {
        const response = await fetch("http://localhost:8000/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: chunk, 
            speed: 1.1 
          })
        });

        if (!response.ok) throw new Error("Server Error");

        const blob = await response.blob();
        audioQueue.current.push(blob);

        if (!isPlayingRef.current) {
          playNextInQueue();
        }

      } catch (e) {
        console.error(e);
      }
    }
  };



  // --- 3. PROACTIVE GPU WARM-UP ---
  // Wakes up the GPU the moment your mouse touches the button
  const warmUpGPU = async () => {
    await fetch("http://localhost:8000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: ".", speed: 2.0 })
    }).catch(() => {});
  };

  // --- 4. SPEECH TO TEXT & UTILS ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setText(prev => prev + " " + t);
        setStatus("Heard: " + t);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else {
      recognitionRef.current?.start();
      setIsListening(true);
      setStatus("Listening...");
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: '#1e1e2e', color: '#cdd6f4',
      fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <nav style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontWeight: 'bold' }}>⚡ NeuroSpeak (RTX 4050)</h1>
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '10px', opacity: 0.8, color: '#f9e2af' }}>STATUS: {status}</div>
        
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%', height: '200px', background: '#313244', color: 'white',
            border: `2px solid #45475a`, borderRadius: '15px', padding: '20px', 
            fontSize: '1.2rem', resize: 'none', outline: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
          <button onClick={toggleListening} style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: isListening ? '#ff4757' : '#89b4fa', cursor: 'pointer', fontSize: '1.5rem' }}>
            🎤
          </button>

          {/* THE MAGIC BUTTON */}
          <button 
            onMouseEnter={warmUpGPU} // <--- Wakes up GPU before you click!
            onClick={handleSpeak} 
            disabled={isSpeaking} 
            style={{ 
              padding: '0 40px', borderRadius: '30px', border: 'none', 
              background: '#a6e3a1', fontSize: '1.2rem', fontWeight: 'bold', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', 
              opacity: isSpeaking ? 0.7 : 1, transition: 'all 0.2s'
            }}
          >
             🔊 {isSpeaking ? 'Speaking...' : 'Read Aloud'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;