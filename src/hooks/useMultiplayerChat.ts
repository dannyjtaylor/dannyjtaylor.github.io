/**
 * Hook for real-time multiplayer chat via Firebase Realtime Database.
 *
 * Handles:
 *  - Joining / leaving a room (with onDisconnect presence cleanup)
 *  - Listening for messages in real-time
 *  - Sending messages
 *  - Tracking online users per room
 *  - Fetching room user counts (for the lobby)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref,
  push,
  set,
  onValue,
  onDisconnect,
  remove,
  query,
  limitToLast,
  type Unsubscribe,
} from 'firebase/database';
import { db } from '../lib/firebase';

/* ── Types ── */

export interface ChatMessage {
  id: string;
  text: string;
  from: string;
  color: string;
  timestamp: number;
}

export interface RoomUser {
  sessionId: string;
  name: string;
  color: string;
}

export interface RoomCounts {
  [roomId: string]: number;
}

const MAX_MESSAGES = 50;

/* ── Session ID (unique per tab) ── */
function makeSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ── Room user-count listener (for the lobby) ── */
export function useRoomCounts(roomIds: string[]): RoomCounts {
  const [counts, setCounts] = useState<RoomCounts>({});

  useEffect(() => {
    if (!db) return;
    const unsubs: Unsubscribe[] = [];

    for (const roomId of roomIds) {
      const usersRef = ref(db, `rooms/${roomId}/users`);
      const unsub = onValue(usersRef, (snap) => {
        const val = snap.val();
        const count = val ? Object.keys(val).length : 0;
        setCounts((prev) => ({ ...prev, [roomId]: count }));
      });
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [roomIds]);

  return counts;
}

/* ── Main multiplayer chat hook ── */
export function useMultiplayerChat(
  roomId: string | null,
  screenName: string,
  userColor: string,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const sessionIdRef = useRef(makeSessionId());
  const presenceRef = useRef<ReturnType<typeof ref> | null>(null);

  /* ── Join room: write presence + set onDisconnect ── */
  useEffect(() => {
    if (!db || !roomId || !screenName) return;

    const sessionId = sessionIdRef.current;
    const userRef = ref(db, `rooms/${roomId}/users/${sessionId}`);
    presenceRef.current = userRef;

    // Write presence
    set(userRef, {
      name: screenName,
      color: userColor,
      joinedAt: Date.now(),
    });

    // Auto-remove on disconnect
    onDisconnect(userRef).remove();

    // Cleanup: remove presence when leaving room
    return () => {
      remove(userRef);
      presenceRef.current = null;
    };
  }, [roomId, screenName, userColor]);

  /* ── Listen for messages ── */
  useEffect(() => {
    if (!db || !roomId) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    const messagesQuery = query(messagesRef, limitToLast(MAX_MESSAGES));

    const unsub = onValue(messagesQuery, (snap) => {
      const val = snap.val();
      if (!val) {
        setMessages([]);
        return;
      }
      const msgs: ChatMessage[] = Object.entries(val).map(([id, data]) => {
        const d = data as Record<string, unknown>;
        return {
          id,
          text: (d.text as string) ?? '',
          from: (d.from as string) ?? '???',
          color: (d.color as string) ?? '#000',
          timestamp: (d.timestamp as number) ?? 0,
        };
      });
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });

    return () => unsub();
  }, [roomId]);

  /* ── Listen for online users ── */
  useEffect(() => {
    if (!db || !roomId) {
      setUsers([]);
      return;
    }

    const usersRef = ref(db, `rooms/${roomId}/users`);
    const unsub = onValue(usersRef, (snap) => {
      const val = snap.val();
      if (!val) {
        setUsers([]);
        return;
      }
      const list: RoomUser[] = Object.entries(val).map(([sessionId, data]) => {
        const d = data as Record<string, unknown>;
        return {
          sessionId,
          name: (d.name as string) ?? '???',
          color: (d.color as string) ?? '#000',
        };
      });
      setUsers(list);
    });

    return () => unsub();
  }, [roomId]);

  /* ── Send message ── */
  const sendMessage = useCallback(
    (text: string) => {
      if (!db || !roomId || !text.trim()) return;
      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      push(messagesRef, {
        text: text.trim(),
        from: screenName,
        color: userColor,
        timestamp: Date.now(),
      });
    },
    [roomId, screenName, userColor],
  );

  return { messages, users, sendMessage };
}
