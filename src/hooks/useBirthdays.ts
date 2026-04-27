import { useState, useEffect, useCallback } from 'react';
import { ref, push, remove, onValue, type Unsubscribe } from 'firebase/database';
import { db } from '../lib/firebase';

export interface BirthdayEntry {
  id: string;
  name: string;
  month: number;
  day: number;
  year?: number;
}

export function useBirthdays() {
  const [entries, setEntries] = useState<BirthdayEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const bdRef = ref(db, 'birthdays');
    const unsub: Unsubscribe = onValue(
      bdRef,
      (snapshot) => {
        const data: BirthdayEntry[] = [];
        snapshot.forEach((child) => {
          const val = child.val() as { name: string; month: number; day: number; year?: number };
          data.push({ id: child.key!, name: val.name, month: val.month, day: val.day, year: val.year });
        });
        setEntries(data);
        setLoading(false);
      },
      (error: Error) => {
        console.error('Birthdays fetch error:', error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const addBirthday = useCallback(
    async (name: string, month: number, day: number, year?: number): Promise<boolean> => {
      if (!db) return false;
      try {
        await push(ref(db, 'birthdays'), {
          name: name.trim().slice(0, 100),
          month,
          day,
          ...(year !== undefined ? { year } : {}),
        });
        return true;
      } catch (err) {
        console.error('Birthdays: Failed to add:', err);
        return false;
      }
    },
    []
  );

  const deleteBirthday = useCallback(async (id: string): Promise<boolean> => {
    if (!db) return false;
    try {
      await remove(ref(db, `birthdays/${id}`));
      return true;
    } catch (err) {
      console.error('Birthdays: Failed to delete:', err);
      return false;
    }
  }, []);

  return { entries, loading, addBirthday, deleteBirthday };
}
