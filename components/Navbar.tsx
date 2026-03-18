'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Mic, CheckCircle, BarChart3, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/FirebaseProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SpeakWithSteve</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/chat" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Chat</Link>
            <Link href="/lessons" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Lessons</Link>
            <Link href="/pronunciation" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pronunciation</Link>
            <Link href="/grammar" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Grammar</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <div className="relative w-8 h-8">
                      <Image 
                        src={user.photoURL} 
                        alt={user.displayName || ''} 
                        fill 
                        className="rounded-full border border-slate-200 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700 hidden lg:block">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={login} className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-4">
          <Link href="/chat" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Chat</Link>
          <Link href="/lessons" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Lessons</Link>
          <Link href="/pronunciation" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Pronunciation</Link>
          <Link href="/grammar" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Grammar</Link>
          <Link href="/dashboard" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Dashboard</Link>
          
          {user ? (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <div className="relative w-10 h-10">
                    <Image 
                      src={user.photoURL} 
                      alt="" 
                      fill 
                      className="rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <span className="font-bold text-slate-900">{user.displayName}</span>
              </div>
              <button onClick={() => { logout(); setIsOpen(false); }} className="text-red-500 font-bold text-sm">Logout</button>
            </div>
          ) : (
            <button onClick={() => { login(); setIsOpen(false); }} className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold">
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
