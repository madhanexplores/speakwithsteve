'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SteveMascot from '@/components/SteveMascot';
import { motion } from 'motion/react';
import { useProgress } from '@/hooks/useProgress';
import { 
  BarChart3, 
  Clock, 
  BookOpen, 
  Flame, 
  Trophy, 
  Star, 
  ChevronRight, 
  Target,
  Zap,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const { progress: userProgress, levels } = useProgress();

  const stats = [
    { icon: <Clock className="text-blue-500" />, label: "Speaking Time", value: `${userProgress.speakingTime.toFixed(1)} hrs`, color: "bg-blue-50" },
    { icon: <BookOpen className="text-emerald-500" />, label: "Words Learned", value: userProgress.wordsLearned.toLocaleString(), color: "bg-emerald-50" },
    { icon: <Flame className="text-orange-500" />, label: "Daily Streak", value: `${userProgress.streak} days`, color: "bg-orange-50" },
    { icon: <BarChart3 className="text-purple-500" />, label: "Accuracy", value: "92%", color: "bg-purple-50" }
  ];

  const currentLevelIndex = levels.findIndex(l => l.name === userProgress.level);
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1] || levels[currentLevelIndex];
  
  const xpInCurrentLevel = userProgress.xp - currentLevel.minXp;
  const xpNeededForNext = nextLevel.minXp - currentLevel.minXp;
  const progressPercent = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  const levelIcons: Record<string, React.ReactNode> = {
    "Beginner": <Star size={16} />,
    "Explorer": <Target size={16} />,
    "Speaker": <Zap size={16} />,
    "Fluent": <Award size={16} />,
    "Master": <Trophy size={16} />
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Profile & Level */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <SteveMascot className="w-20 h-20" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">English Learner</h2>
              <p className="text-slate-500 text-sm mb-6">Joined March 2026</p>
              
              <div className="p-4 bg-blue-600 rounded-2xl text-white">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {levelIcons[userProgress.level]}
                  <span className="font-bold uppercase tracking-wider text-xs">{userProgress.level}</span>
                </div>
                <p className="text-2xl font-black">{userProgress.xp} XP</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" /> Next Milestone
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-slate-700">{nextLevel.name}</span>
                  <span className="text-slate-400">{userProgress.xp} / {nextLevel.minXp} XP</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {nextLevel.minXp > userProgress.xp 
                    ? `Only ${nextLevel.minXp - userProgress.xp} XP to go!` 
                    : "You've reached the maximum level!"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Challenges */}
          <div className="flex-1 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                >
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    {stat.icon}
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Daily Challenges */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Recommended Lessons</h3>
                <Link href="/lessons" className="text-blue-600 text-sm font-bold hover:underline">View All</Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Greetings", desc: "Basic introductions", xp: "+50", color: "bg-blue-500", id: "1" },
                  { title: "Phrasal Verbs", desc: "Intermediate grammar", xp: "+75", color: "bg-purple-500", id: "2" }
                ].map((lesson, i) => (
                  <Link href={`/lessons/${lesson.id}`} key={i} className="group p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all">
                    <div className={`w-10 h-10 ${lesson.color} rounded-xl flex items-center justify-center mb-4 text-white`}>
                      <BookOpen size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lesson.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">{lesson.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600">{lesson.xp} XP</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Daily Challenges</h3>
                <span className="text-blue-600 text-sm font-bold">View All</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Morning Chat", desc: "Talk with Steve for 5 minutes", xp: "+50", done: true },
                  { title: "Grammar Master", desc: "Fix 5 sentences in the tool", xp: "+30", done: false },
                  { title: "Perfect Accent", desc: "Get 90%+ in pronunciation", xp: "+100", done: false }
                ].map((challenge, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${challenge.done ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'} flex items-center gap-4`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${challenge.done ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {challenge.done ? <CheckCircle2 size={20} /> : <Star size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{challenge.title}</h4>
                      <p className="text-sm text-slate-500">{challenge.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">{challenge.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Star className="text-amber-400" fill="currentColor" /> Weekly Leaderboard
                </h3>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Maria S.", xp: "4,250", me: false },
                    { rank: 2, name: "You", xp: "1,850", me: true },
                    { rank: 3, name: "Kenji T.", xp: "1,720", me: false }
                  ].map((user, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${user.me ? 'bg-white/10' : ''}`}>
                      <span className="w-6 font-bold text-slate-500">{user.rank}</span>
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
                        {user.name[0]}
                      </div>
                      <span className={`flex-1 font-bold ${user.me ? 'text-blue-400' : ''}`}>{user.name}</span>
                      <span className="font-mono text-sm">{user.xp} XP</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                  View Full Leaderboard <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
