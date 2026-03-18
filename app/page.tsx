'use client';

import Navbar from '@/components/Navbar';
import SteveMascot from '@/components/SteveMascot';
import { motion } from 'motion/react';
import { MessageSquare, Mic, CheckCircle, BarChart3, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full border border-blue-100">
                AI-Powered Learning
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
                SpeakWith<span className="text-blue-600">Steve</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Practice English by talking with your AI speaking partner. Get instant feedback, fix your grammar, and build confidence in real-time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/chat" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group">
                  Start Talking <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                  How it Works
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 flex justify-center items-center">
            <SteveMascot className="w-64 h-64 lg:w-96 lg:h-96" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Everything you need to master English</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Steve is more than just a chatbot. He&apos;s a comprehensive language tutor designed to help you reach fluency.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <MessageSquare className="text-blue-500" />, title: "AI Conversation", desc: "Natural conversations on any topic to build your speaking stamina." },
              { icon: <Mic className="text-emerald-500" />, title: "Pronunciation", desc: "Real-time feedback on your accent and clarity using advanced speech analysis." },
              { icon: <CheckCircle className="text-amber-500" />, title: "Grammar Fix", desc: "Instant corrections and simple explanations for every mistake you make." },
              { icon: <Zap className="text-purple-500" />, title: "Roleplay", desc: "Practice real-life scenarios like job interviews, ordering coffee, or travel." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Three steps to fluency</h2>
            <p className="text-slate-500">The most effective way to learn is by doing. Steve makes it easy.</p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 -translate-y-1/2 z-0" />
            
            <div className="grid lg:grid-cols-3 gap-12 relative z-10">
              {[
                { step: "01", title: "Talk with Steve", desc: "Start a conversation on any topic or choose a guided lesson." },
                { step: "02", title: "Get Corrections", desc: "Steve listens and provides instant grammar and pronunciation fixes." },
                { step: "03", title: "Improve Fluency", desc: "Track your progress and watch your speaking confidence grow." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500">Start for free, upgrade when you&apos;re ready to go pro.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 rounded-3xl border border-slate-200 bg-white hover:border-blue-200 transition-all">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Plan</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-emerald-500" /> 10 conversations per day
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-emerald-500" /> Basic grammar correction
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-emerald-500" /> Daily progress tracking
                </li>
              </ul>
              <Link href="/chat" className="block w-full py-4 text-center border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
                Get Started
              </Link>
            </div>
            
            {/* Premium Plan */}
            <div className="p-10 rounded-3xl border-2 border-blue-600 bg-white relative overflow-hidden shadow-2xl shadow-blue-100">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                Recommended
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium Plan</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$12</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-blue-500" /> Unlimited conversations
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-blue-500" /> Advanced pronunciation scoring
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-blue-500" /> Interview & Exam practice
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle size={18} className="text-blue-500" /> Personalized learning path
                </li>
              </ul>
              <Link href="/chat" className="block w-full py-4 text-center bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Go Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SpeakWithSteve</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 SpeakWithSteve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
