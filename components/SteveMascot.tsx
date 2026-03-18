'use client';

import { motion } from 'motion/react';

export default function SteveMascot({ className = "w-48 h-48" }: { className?: string }) {
  return (
    <motion.div 
      className={`relative ${className}`}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Body */}
        <rect x="40" y="60" width="120" height="100" rx="30" fill="#3B82F6" />
        <rect x="55" y="75" width="90" height="70" rx="20" fill="#E0F2FE" />
        
        {/* Eyes */}
        <motion.circle 
          cx="75" cy="100" r="8" fill="#1E293B"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.circle 
          cx="125" cy="100" r="8" fill="#1E293B"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        
        {/* Mouth */}
        <motion.path 
          d="M85 125C85 125 90 132 100 132C110 132 115 125 115 125" 
          stroke="#1E293B" 
          strokeWidth="4" 
          strokeLinecap="round"
          animate={{ d: ["M85 125C85 125 90 132 100 132C110 132 115 125 115 125", "M85 128C85 128 90 135 100 135C110 135 115 128 115 128"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Antennas */}
        <rect x="95" y="30" width="10" height="30" rx="5" fill="#3B82F6" />
        <circle cx="100" cy="30" r="8" fill="#10B981" />
        
        {/* Arms */}
        <rect x="20" y="90" width="20" height="40" rx="10" fill="#3B82F6" />
        <rect x="160" y="90" width="20" height="40" rx="10" fill="#3B82F6" />
      </svg>
      
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-blue-400/20 blur-3xl rounded-full -z-10" />
    </motion.div>
  );
}
