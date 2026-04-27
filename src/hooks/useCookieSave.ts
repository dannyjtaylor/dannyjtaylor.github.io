import { useState, useEffect, useCallback } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';

export interface CookieSaveData {
  cookies: number;
  totalBaked: number;
  totalClicks: number;
  handmadeClicks: number;
  buildings: Record<string, number>;
  purchasedUpgrades: string[];
  unlockedAchievements: string[];
  goldenClicks: number;
  frenzyActivations: number;
  clickFrenzyActivations: number;
  playTimeSeconds: number;
  lastSaved: number;
}

function sanitizeKey(name: string): string {
  return name.replace(/[.#$/[\]\s]/g, '_').trim().slice(0, 40);
}

export function useCookieSave(username: string | null) {
  const [saveData, setSaveData] = useState<CookieSaveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  useEffect(() => {
    if (!username || !db) {
      setSaveData(null);
      setLoading(false);
      return;
    }
    const key = sanitizeKey(username);
    if (!key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get(ref(db, `cookieclicker/users/${key}`))
      .then(snap => {
        setSaveData(snap.exists() ? (snap.val() as CookieSaveData) : null);
        setLoading(false);
      })
      .catch(() => {
        setSaveData(null);
        setLoading(false);
      });
  }, [username]);

  const save = useCallback(
    async (data: Omit<CookieSaveData, 'lastSaved'>): Promise<boolean> => {
      if (!username || !db) return false;
      const key = sanitizeKey(username);
      if (!key) return false;
      setSaving(true);
      try {
        await set(ref(db, `cookieclicker/users/${key}`), { ...data, lastSaved: Date.now() });
        setLastSaveTime(Date.now());
        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [username]
  );

  return { saveData, loading, saving, lastSaveTime, save };
}
