/**
 * Hook for reading/writing Last Goodbye leaderboard scores
 * via Firebase Realtime Database.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ref,
  push,
  onValue,
  query,
  orderByChild,
  limitToFirst,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/database';
import { db } from '../lib/firebase';

export interface LeaderboardEntry {
  id: string;
  name: string;
  hits: number;
  timestamp: number;
}

/* Module-level cache so reopening the window is instant */
let cachedEntries: LeaderboardEntry[] | null = null;

/**
 * Subscribe to the top leaderboard scores (lowest hits = best).
 * Returns entries sorted ascending by hits (best first).
 */
export function useLeaderboard(limit = 50) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(cachedEntries ?? []);
  const [loading, setLoading] = useState(cachedEntries === null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const lbRef = query(
      ref(db, 'leaderboard'),
      orderByChild('hits'),
      limitToFirst(limit),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsub: Unsubscribe = onValue(lbRef, (snapshot: any) => {
      const data: LeaderboardEntry[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      snapshot.forEach((child: any) => {
        const val = child.val() as { name: string; hits: number; timestamp: number };
        data.push({
          id: child.key!,
          name: val.name,
          hits: val.hits,
          timestamp: val.timestamp,
        });
      });
      data.sort((a, b) => a.hits - b.hits);
      cachedEntries = data;
      setEntries(data);
      setLoading(false);
    }, (error: Error) => {
      console.error('Leaderboard fetch error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [limit]);

  const submitScore = useCallback(async (name: string, hits: number) => {
    if (!db) return;
    const lbRef = ref(db, 'leaderboard');
    await push(lbRef, {
      name: name.trim().slice(0, 10),
      hits,
      timestamp: serverTimestamp(),
    });
  }, []);

  return { entries, loading, submitScore };
}
