'use client';

import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ChevronLeft, Play, BookOpen, CheckCircle, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { speakText } from '@/lib/audio';

const lessonData: Record<string, any> = {
  '1': {
    title: 'Greetings & Introductions',
    content: [
      { 
        type: 'text', 
        value: 'In English, there are formal and informal ways to greet people.',
        tamil: 'ஆங்கிலத்தில், மக்களை வரவேற்க முறையான மற்றும் முறைசாரா வழிகள் உள்ளன.'
      },
      { 
        type: 'example', 
        label: 'Formal', 
        value: 'Hello, how do you do?',
        tamil: 'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?'
      },
      { 
        type: 'example', 
        label: 'Informal', 
        value: "Hi! What's up?",
        tamil: 'ஹாய்! என்ன விஷயம்?'
      },
      { 
        type: 'text', 
        value: 'When introducing yourself, you can say "My name is..." or "I am...".',
        tamil: 'உங்களை அறிமுகப்படுத்தும்போது, "எனது பெயர்..." அல்லது "நான்..." என்று கூறலாம்.'
      }
    ],
    practice: 'Try introducing yourself to Steve and ask him how his day is going!',
    practiceTamil: 'உங்களை ஸ்டீவிடம் அறிமுகப்படுத்திக் கொள்ளுங்கள் மற்றும் அவரது நாள் எப்படி போகிறது என்று கேளுங்கள்!'
  },
  '2': {
    title: 'Common Phrasal Verbs',
    content: [
      { 
        type: 'text', 
        value: 'Phrasal verbs are verbs combined with a preposition or adverb.',
        tamil: 'Phrasal verbs என்பது ஒரு வினைச்சொல் மற்றும் ஒரு முன்னிடைச்சொல் அல்லது வினை உரிச்சொல் ஆகியவற்றின் கலவையாகும்.'
      },
      { 
        type: 'example', 
        label: 'Pick up', 
        value: 'To lift something or someone.',
        tamil: 'ஏதாவது அல்லது ஒருவரைத் தூக்குவது.'
      },
      { 
        type: 'example', 
        label: 'Give up', 
        value: 'To stop trying.',
        tamil: 'முயற்சி செய்வதை நிறுத்துவது.'
      },
      { 
        type: 'text', 
        value: 'They are very common in spoken English!',
        tamil: 'பேச்சு ஆங்கிலத்தில் இவை மிகவும் பொதுவானவை!'
      }
    ],
    practice: 'Use the phrasal verb "look forward to" in a sentence with Steve.',
    practiceTamil: '"look forward to" என்ற phrasal verb-ஐ ஸ்டீவிடம் ஒரு வாக்கியத்தில் பயன்படுத்துங்கள்.'
  },
  '3': {
    title: 'Ordering at a Restaurant',
    content: [
      { 
        type: 'text', 
        value: 'When ordering, it is polite to use "I would like..." or "Could I have...".',
        tamil: 'ஆர்டர் செய்யும் போது, "I would like..." அல்லது "Could I have..." என்று பயன்படுத்துவது மரியாதைக்குரியது.'
      },
      { 
        type: 'example', 
        label: 'Ordering', 
        value: 'I would like a cheeseburger, please.',
        tamil: 'எனக்கு ஒரு சீஸ்பர்கர் வேண்டும், தயவுசெய்து.'
      },
      { 
        type: 'example', 
        label: 'Asking for the bill', 
        value: 'Could we have the check, please?',
        tamil: 'தயவுசெய்து எங்களுக்கு பில் தர முடியுமா?'
      }
    ],
    practice: 'Pretend you are at a restaurant. Order a 3-course meal from Steve!',
    practiceTamil: 'நீங்கள் ஒரு உணவகத்தில் இருப்பதாக கற்பனை செய்து கொள்ளுங்கள். ஸ்டீவிடம் 3-வேளை உணவை ஆர்டர் செய்யுங்கள்!'
  }
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { progress } = useProgress();
  const id = params.id as string;
  const lesson = lessonData[id] || lessonData['1'];
  const [step, setStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const nextStep = () => {
    if (step < lesson.content.length) {
      setStep(step + 1);
    } else {
      router.push('/chat');
    }
  };

  const speakContent = () => {
    if (isSpeaking) return;
    
    const currentContent = lesson.content[step];
    if (!currentContent) return;

    setIsSpeaking(true);
    speakText(currentContent.value, () => setIsSpeaking(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-3xl mx-auto">
        <Link href="/lessons" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-bold text-sm">
          <ChevronLeft size={16} /> Back to Lessons
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="h-2 bg-slate-100 w-full">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / (lesson.content.length + 1)) * 100}%` }}
            />
          </div>

          <div className="p-6 md:p-12">
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{lesson.title}</h1>
              {step < lesson.content.length && (
                <button 
                  onClick={speakContent}
                  disabled={isSpeaking}
                  className={`p-3 rounded-xl transition-all ${isSpeaking ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <Volume2 size={24} />
                </button>
              )}
            </div>

            <div className="min-h-[250px] md:min-h-[300px] flex flex-col justify-center">
              {step < lesson.content.length ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {lesson.content[step].type === 'text' ? (
                    <div className="space-y-4">
                      <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
                        {lesson.content[step].value}
                      </p>
                      {progress.explanationLanguage === 'Tamil' && (
                        <p className="text-base md:text-lg text-blue-600 font-medium leading-relaxed border-l-4 border-blue-200 pl-4">
                          {lesson.content[step].tamil}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-6 md:p-8 rounded-2xl border border-blue-100 space-y-4">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-500 mb-2 block">
                        {lesson.content[step].label}
                      </span>
                      <p className="text-xl md:text-2xl font-bold text-slate-900 italic">
                        &quot;{lesson.content[step].value}&quot;
                      </p>
                      {progress.explanationLanguage === 'Tamil' && (
                        <p className="text-base md:text-lg text-blue-600 font-medium italic border-t border-blue-100 pt-4">
                          &quot;{lesson.content[step].tamil}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">Lesson Complete!</h2>
                  <div className="bg-amber-50 p-5 md:p-6 rounded-2xl border border-amber-100 text-left">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                      <Sparkles size={18} /> Practice Challenge:
                    </h3>
                    <p className="text-amber-900 text-sm md:text-base">{lesson.practice}</p>
                    {progress.explanationLanguage === 'Tamil' && (
                      <p className="text-amber-700 text-sm md:text-base mt-2 border-t border-amber-200 pt-2">
                        {lesson.practiceTamil}
                      </p>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-slate-500">Now, let&apos;s head to the chat and practice what you&apos;ve learned with Steve.</p>
                </motion.div>
              )}
            </div>

            <div className="mt-10 md:mt-12 flex justify-end">
              <button
                onClick={nextStep}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {step < lesson.content.length ? 'Next' : 'Go to Chat'} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
