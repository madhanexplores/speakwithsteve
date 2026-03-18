'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { CheckCircle2, Sparkles, Wand2, ArrowRight, Info, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSteveResponse } from '@/lib/gemini';

export default function GrammarPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    corrected: string;
    explanation: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFix = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setResult(null);

    const prompt = `Please fix the grammar of this sentence: "${input}". 
    Format your response exactly like this:
    Corrected sentence: [The corrected version]
    Explanation: [A short, simple explanation of the fix]`;

    const response = await getSteveResponse(prompt, []) || "";
    
    // Parse response
    const correctedMatch = response.match(/Corrected sentence:\s*(.*)/i);
    const explanationMatch = response.match(/Explanation:\s*([\s\S]*)/i);

    if (correctedMatch && explanationMatch) {
      setResult({
        corrected: correctedMatch[1].trim(),
        explanation: explanationMatch[1].trim()
      });
    } else {
      // Fallback if parsing fails
      setResult({
        corrected: response.split('\n')[0].replace(/Corrected sentence:/i, '').trim(),
        explanation: "Steve fixed your sentence! Check the result above."
      });
    }
    
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <Wand2 size={14} /> Grammar Fixer
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Write Like a Pro</h1>
          <p className="text-slate-500">Paste any sentence and Steve will polish it for you instantly.</p>
        </div>

        <div className="space-y-6">
          {/* Input Area */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Your Sentence</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., She don't like coffee because it are bitter."
              className="w-full h-32 bg-transparent border-none focus:ring-0 text-lg text-slate-700 resize-none"
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleFix}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    Fix Grammar <Sparkles size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                  <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Corrected Version
                    </span>
                    <button 
                      onClick={copyToClipboard}
                      className="text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="p-8">
                    <p className="text-2xl font-bold text-slate-800 leading-relaxed">
                      {result.corrected}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">Steve&apos;s Explanation</h4>
                    <p className="text-blue-800/80 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => { setInput(''); setResult(null); }}
                    className="text-slate-400 font-medium hover:text-slate-600 transition-colors flex items-center gap-2"
                  >
                    Clear and try another <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
