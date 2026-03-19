'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SteveMascot from '@/components/SteveMascot';
import { Send, Mic, MicOff, RotateCcw, User, Bot, Sparkles, LogIn, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSteveSpeech } from '@/lib/gemini';
import { getSteveResponseAction } from '@/app/actions/ai';
import { playSteveAudio, speakText } from '@/lib/audio';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, addDoc, query, orderBy, limit, limitToLast, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'steve';
  text: string;
  timestamp: any;
}

export default function ChatPage() {
  const { user, loading, login } = useAuth();
  const { addXp, addWords, progress, setLanguage } = useProgress();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTalkBackEnabled, setIsTalkBackEnabled] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const handleReplay = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    
    setSpeakingMsgId(msgId);

    // Hybrid Logic:
    // If text contains Tamil characters, use Gemini for natural sound
    // Otherwise use Browser for free/fast sound
    const hasTamil = /[\u0B80-\u0BFF]/.test(text);

    if (hasTamil) {
      try {
        const audioData = await getSteveSpeech(text);
        if (audioData) {
          playSteveAudio(audioData);
        } else {
          speakText(text); // Fallback
        }
      } catch (err) {
        speakText(text); // Fallback
      } finally {
        setSpeakingMsgId(null);
      }
    } else {
      speakText(text, () => setSpeakingMsgId(null));
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'users', user.uid, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limitToLast(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/messages`);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const clearChat = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to clear the chat history?")) return;
    
    // In a real app we'd delete from Firestore, for now we'll just clear local state
    // and let the user know. 
    // Actually, let's just show a toast or something. 
    // For this demo, we'll just clear the local messages.
    setMessages([]);
  };

  const quickReplies = [
    "How are you today?",
    "Can you help me with my grammar?",
    "Let's talk about food!",
    "Tell me a joke in English.",
    "What's the weather like?"
  ];

  const lastSendTime = useRef(0);

  const handleSend = async (textOverride?: string) => {
    const now = Date.now();
    if (now - lastSendTime.current < 500) return;
    lastSendTime.current = now;

    const text = (textOverride || input).trim();
    if (!text || !user || isTyping) return;

    // Clear input immediately to prevent double sends
    setInput('');
    setIsTyping(true);

    try {
      const messagesRef = collection(db, 'users', user.uid, 'messages');
      
      // Save user message
      await addDoc(messagesRef, {
        role: 'user',
        text: text,
        timestamp: serverTimestamp()
      });

      // Award XP and words
      addXp(10);
      addWords(text.split(/\s+/).length);

      // Prepare history for Gemini
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
      }));

      const steveReply = await getSteveResponseAction(text, history, progress.explanationLanguage);
      setIsTyping(false);

      const replyText = steveReply || "I'm sorry, I didn't catch that.";
      
      // Save to Firestore to show the message immediately
      await addDoc(messagesRef, {
        role: 'steve',
        text: replyText,
        timestamp: serverTimestamp()
      });

      // Speak in the background if enabled
      if (isTalkBackEnabled && steveReply) {
        const hasTamil = /[\u0B80-\u0BFF]/.test(steveReply);
        if (hasTamil) {
          getSteveSpeech(steveReply).then(audioData => {
            if (audioData) playSteveAudio(audioData);
            else speakText(steveReply);
          }).catch(() => speakText(steveReply));
        } else {
          speakText(steveReply);
        }
      }

    } catch (error) {
      console.error("Error in handleSend:", error);
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/messages`);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = async () => {
    console.log("startListening called, current state:", isListening);
    
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      setIsListening(false);
      return;
    }

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    // Stop any playing audio
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      // Request microphone permission explicitly first to catch issues early
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permErr) {
        console.error("Microphone permission error:", permErr);
        alert("Could not access microphone. Please ensure you have granted permission in your browser settings.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log("Speech recognition onstart fired");
        setIsListening(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition onerror:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert("Microphone access was denied. Please check your browser's site settings.");
        } else if (event.error === 'network') {
          alert("Network error occurred during speech recognition. Please check your connection.");
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition onend fired");
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech recognition result:", transcript);
        if (transcript && transcript.trim()) {
          // Stop recognition immediately to prevent double triggers
          try {
            recognition.stop();
          } catch (e) {}
          setIsListening(false);
          handleSend(transcript.trim());
        }
      };

      recognition.start();
      // Set listening to true immediately for UI feedback
      setIsListening(true);
    } catch (err) {
      console.error("Critical error in startListening:", err);
      setIsListening(false);
      recognitionRef.current = null;
      alert("An error occurred while starting the microphone. Please try again or refresh the page.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SteveMascot className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to talk?</h2>
            <p className="text-slate-600 mb-8">Sign in with your Google account to start practicing English with Steve and track your progress.</p>
            <button 
              onClick={login}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      <Navbar />
      
      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4 md:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isListening ? 'ring-4 ring-blue-200 scale-110' : ''}`}>
              <SteveMascot className={`w-8 h-8 sm:w-10 sm:h-10 ${isListening ? 'animate-bounce' : ''}`} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Steve</h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  {isListening ? 'Listening...' : 'Online & Ready'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl flex-1 sm:flex-none">
              <button 
                onClick={() => setLanguage('English')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${progress.explanationLanguage === 'English' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('Tamil')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${progress.explanationLanguage === 'Tamil' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Tamil
              </button>
            </div>
            
            <button 
              onClick={() => setIsTalkBackEnabled(!isTalkBackEnabled)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${isTalkBackEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}
              title={isTalkBackEnabled ? "Turn off Talk Back" : "Turn on Talk Back"}
            >
              {isTalkBackEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span className="text-[10px] font-bold hidden md:block">{isTalkBackEnabled ? 'Talk Back On' : 'Talk Back Off'}</span>
            </button>

            <button 
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear Chat"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {messages.length === 0 && !isTyping && (
            <div className="text-center py-12 opacity-40">
              <SteveMascot className="w-24 h-24 mx-auto mb-4 grayscale" />
              <p className="text-slate-500 font-medium">Say hi to Steve to start the conversation!</p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed pr-8">{msg.text}</p>
                    <button 
                      onClick={() => handleReplay(msg.id, msg.text)}
                      disabled={speakingMsgId === msg.id}
                      className={`absolute top-3 right-2 p-1.5 rounded-lg transition-all ${
                        msg.role === 'user' 
                          ? 'text-white/40 hover:text-white hover:bg-white/10' 
                          : 'text-slate-300 hover:text-blue-600 hover:bg-blue-50'
                      } ${speakingMsgId === msg.id ? 'animate-pulse' : ''}`}
                      title="Listen"
                    >
                      {speakingMsgId === msg.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </button>
                    {msg.timestamp && (
                      <span className={`text-[10px] mt-2 block opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm rounded-tl-none">
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <SteveMascot className="w-5 h-5 animate-bounce" />
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium text-slate-400">Steve is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-6">
          {/* Quick Replies */}
          {showQuickReplies && messages.length < 5 && (
            <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all whitespace-nowrap shadow-sm"
                >
                  {reply}
                </button>
              ))}
              <button 
                onClick={() => setShowQuickReplies(false)}
                className="p-2 text-slate-300 hover:text-slate-500"
              >
                <RotateCcw size={14} className="rotate-45" />
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg focus-within:border-blue-400 transition-all">
            <div className="group relative">
              <button 
                onClick={startListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <div className="absolute left-0 bottom-full mb-2 w-48 p-3 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-[10px] text-slate-500 leading-relaxed pointer-events-none">
                <p className="font-bold mb-1 text-slate-700">Mic not working?</p>
                <ul className="list-disc ml-3 space-y-1">
                  <li>Use Chrome, Safari, or Edge</li>
                  <li>Grant mic permission in browser</li>
                  <li>Ensure you are on HTTPS</li>
                  <li>Try refreshing the page</li>
                </ul>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 resize-none max-h-32 min-h-[44px] text-slate-700"
              rows={1}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
            >
              <Send size={22} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
            <Sparkles size={10} /> Steve will correct your grammar as you chat!
          </p>
        </div>
      </div>
      
      {/* Listening Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8"
            >
              <Mic size={64} />
            </motion.div>
            <h2 className="text-3xl font-black mb-2">Steve is listening...</h2>
            <p className="text-blue-100">Speak clearly in English</p>
            <button 
              onClick={startListening}
              className="mt-12 px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-xl"
            >
              Stop Listening
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
