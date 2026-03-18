'use client';

import Navbar from '@/components/Navbar';
import { BookOpen, Play, CheckCircle, Clock, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

const lessons = [
  {
    id: '1',
    title: 'Greetings & Introductions',
    description: 'Learn how to introduce yourself and greet others in various social situations.',
    duration: '10 min',
    level: 'Beginner',
    xp: 50,
    category: 'Speaking',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Common Phrasal Verbs',
    description: 'Master the most frequently used phrasal verbs in everyday conversation.',
    duration: '15 min',
    level: 'Intermediate',
    xp: 75,
    category: 'Grammar',
    color: 'bg-purple-500'
  },
  {
    id: '3',
    title: 'Ordering at a Restaurant',
    description: 'Practice the vocabulary and phrases needed to order food and drinks confidently.',
    duration: '12 min',
    level: 'Beginner',
    xp: 60,
    category: 'Speaking',
    color: 'bg-emerald-500'
  },
  {
    id: '4',
    title: 'Business English Basics',
    description: 'Essential phrases for meetings, emails, and professional communication.',
    duration: '20 min',
    level: 'Advanced',
    xp: 100,
    category: 'Professional',
    color: 'bg-orange-500'
  },
  {
    id: '5',
    title: 'Travel & Directions',
    description: 'Learn how to ask for directions and navigate through an airport or city.',
    duration: '15 min',
    level: 'Beginner',
    xp: 70,
    category: 'Speaking',
    color: 'bg-pink-500'
  },
  {
    id: '6',
    title: 'Expressing Opinions',
    description: 'How to agree, disagree, and share your thoughts politely in English.',
    duration: '18 min',
    level: 'Intermediate',
    xp: 80,
    category: 'Speaking',
    color: 'bg-indigo-500'
  }
];

export default function LessonsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">English Lessons</h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Structured lessons designed to improve your speaking, listening, and grammar skills with Steve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group"
            >
              <div className={`h-32 ${lesson.color} p-6 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                  <BookOpen size={120} className="text-white" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg">
                    {lesson.category}
                  </span>
                  <div className="flex items-center gap-1 text-white/80 text-xs font-bold">
                    <Star size={12} fill="currentColor" /> {lesson.xp} XP
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white relative z-10">{lesson.title}</h3>
              </div>
              
              <div className="p-6">
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                  {lesson.description}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} /> {lesson.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart size={14} /> {lesson.level}
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/lessons/${lesson.id}`}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-all"
                >
                  Start Lesson <Play size={16} fill="currentColor" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
