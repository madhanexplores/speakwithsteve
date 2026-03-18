'use client';

import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/components/FirebaseProvider';

export interface UserProgress {
  xp: number;
  level: string;
  streak: number;
  speakingTime: number; // in minutes
  wordsLearned: number;
  lastActive: any;
  explanationLanguage: 'English' | 'Tamil';
}

const LEVELS = [
  { name: "Beginner", minXp: 0 },
  { name: "Explorer", minXp: 500 },
  { name: "Speaker", minXp: 1500 },
  { name: "Fluent", minXp: 3000 },
  { name: "Master", minXp: 5000 }
];

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: "Beginner",
    streak: 0,
    speakingTime: 0,
    wordsLearned: 0,
    lastActive: null,
    explanationLanguage: 'English'
  });

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setProgress(doc.data() as UserProgress);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  const setLanguage = async (lang: 'English' | 'Tamil') => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        explanationLanguage: lang
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const newXp = progress.xp + amount;
      const newLevel = LEVELS.slice().reverse().find(l => newXp >= l.minXp)?.name || "Beginner";
      
      await updateDoc(userRef, {
        xp: increment(amount),
        level: newLevel,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addSpeakingTime = async (minutes: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        speakingTime: increment(minutes)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addWords = async (count: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        wordsLearned: increment(count)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return { progress, addXp, addSpeakingTime, addWords, setLanguage, levels: LEVELS };
}
