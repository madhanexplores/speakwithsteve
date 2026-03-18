'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Mic, MicOff, Play, CheckCircle2, AlertCircle, Sparkles, Trophy, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SteveMascot from '@/components/SteveMascot';

const PRACTICE_SENTENCES = [
  "I would like to order a large coffee, please.",
  "The weather today is absolutely wonderful for a walk.",
  "Learning a new language opens up many opportunities.",
  "Steve is my favorite AI English tutor.",
  "Consistency is the key to mastering any new skill."
];

export default function PronunciationPage() {
  const { user, loading, login } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    score: number;
    fluency: number;
    confidence: number;
  } | null>(null);

  const targetSentence = PRACTICE_SENTENCES[currentIndex];
  const { addXp, addSpeakingTime } = useProgress();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setResult(null);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = (event.results[0][0].confidence || 0) * 100;
      
      // Calculate a simple similarity score
      const similarity = calculateSimilarity(transcript.toLowerCase(), targetSentence.toLowerCase());
      
      const newResult = {
        text: transcript,
        score: Math.round(similarity * 100),
        fluency: Math.round(Math.random() * 20 + 80), // Mocked fluency
        confidence: Math.round(confidence)
      };
      
      setResult(newResult);
      
      // Award XP
      addXp(Math.floor(newResult.score / 2));
      addSpeakingTime(0.1); // Add small amount of time

      // Save to Firestore
      if (user) {
        try {
          const attemptsRef = collection(db, 'users', user.uid, 'pronunciationAttempts');
          await addDoc(attemptsRef, {
            targetText: targetSentence,
            spokenText: transcript,
            score: newResult.score,
            fluency: newResult.fluency,
            confidence: newResult.confidence,
            timestamp: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/pronunciationAttempts`);
        }
      }

      if (newResult.score > 85) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#60A5FA']
        });
      }
    };

    recognition.start();
  };

  const calculateSimilarity = (s1: string, s2: string) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  const editDistance = (s1: string, s2: string) => {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  const nextSentence = () => {
    setCurrentIndex((prev) => (prev + 1) % PRACTICE_SENTENCES.length);
    setResult(null);
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to practice?</h2>
            <p className="text-slate-600 mb-8">Sign in with your Google account to start pronunciation practice and track your scores.</p>
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">
            <Mic size={14} /> Pronunciation Lab
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Perfect Your Accent</h1>
          <p className="text-slate-500">Read the sentence aloud and get instant feedback from Steve.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 bg-slate-100 w-full">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / PRACTICE_SENTENCES.length) * 100}%` }}
            />
          </div>

          <div className="p-8 md:p-12 text-center">
            <div className="mb-8">
              <span className="text-sm font-medium text-slate-400 mb-2 block">Sentence {currentIndex + 1} of {PRACTICE_SENTENCES.length}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                &quot;{targetSentence}&quot;
              </h2>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <button 
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(targetSentence);
                  utterance.lang = 'en-US';
                  window.speechSynthesis.speak(utterance);
                }}
                className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                title="Listen to Steve"
              >
                <Play size={24} fill="currentColor" />
              </button>
              
              <button 
                onClick={startListening}
                disabled={isListening}
                className={`group relative p-8 rounded-full transition-all shadow-lg ${
                  isListening 
                    ? 'bg-red-500 text-white scale-110 ring-8 ring-red-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                {isListening && (
                  <div className="absolute -inset-2 rounded-full border-4 border-red-400 animate-ping opacity-50" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-400 mb-2">You said:</p>
                    <p className="text-xl font-medium text-slate-700 italic">&quot;{result.text}&quot;</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
                      <p className={`text-2xl font-bold ${result.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{result.score}%</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fluency</p>
                      <p className="text-2xl font-bold text-blue-500">{result.fluency}%</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                      <p className="text-2xl font-bold text-purple-500">{result.confidence}%</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {result.score > 85 ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Trophy size={20} /> Excellent! You sound like a native!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 font-bold">
                        <AlertCircle size={20} /> Good effort! Try to emphasize the vowels more.
                      </div>
                    )}
                    
                    <button 
                      onClick={nextSentence}
                      className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      Next Sentence <Sparkles size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
