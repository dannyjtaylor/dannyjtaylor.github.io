import { useState, useRef, useEffect, useMemo } from 'react';
import { isFirebaseReady } from '../lib/firebase';
import { useRoomCounts, useMultiplayerChat } from '../hooks/useMultiplayerChat';

/* ════════════════════════════════════════════════════════════
   NPC Character Definitions (Frieren & Edward Elric)
   ════════════════════════════════════════════════════════════ */

interface NPCMessage {
  from: 'user' | 'buddy';
  text: string;
}

interface BuddyProfile {
  name: string;
  screenName: string;
  greeting: string;
  responses: { keywords: string[]; reply: string }[];
  fallbacks: string[];
}

const FRIEREN: BuddyProfile = {
  name: 'Frieren',
  screenName: 'FrierenTheMage',
  greeting: "Oh, hello. I was just studying a spell. It's only been about 80 years since I started on this one... What did you want to talk about?",
  responses: [
    { keywords: ['hello', 'hi', 'hey', 'greetings'], reply: "Hello. It's been a while... or has it? Time moves so strangely for me." },
    { keywords: ['magic', 'spell', 'spells'], reply: "I've been collecting spells for over a thousand years. My favorite recent find is a spell that makes flowers bloom. Himmel said it was beautiful..." },
    { keywords: ['himmel'], reply: "Himmel... he was a true hero. I spent only ten years traveling with him, but I think about those years more than any other century of my life. I wish I had tried harder to understand him." },
    { keywords: ['demon', 'demons'], reply: "Demons speak words to deceive. Their language of emotion is a weapon. Never trust what a demon says, no matter how sincere it sounds." },
    { keywords: ['age', 'old', 'elf', 'immortal', 'years'], reply: "I've lived for over a thousand years. Most of that time felt like the blink of an eye. It's the short moments with humans that I remember most vividly." },
    { keywords: ['fern'], reply: "Fern has grown into a splendid mage. She reminds me that I should take better care of myself... She gets upset when I skip meals." },
    { keywords: ['stark'], reply: "Stark is braver than he thinks. He trembles before every fight, yet he never runs away. Heiter would say that's what true courage looks like." },
    { keywords: ['friend', 'friends', 'friendship'], reply: "I'm still learning what it means to truly know someone. Himmel's party taught me that... but I think I understood it too late." },
    { keywords: ['adventure', 'journey', 'travel', 'quest'], reply: "We're journeying to Aureole, where souls are said to rest. I want to talk to Himmel one more time... to tell him I think I finally understand." },
    { keywords: ['flower', 'flowers', 'field'], reply: "There's a spell that creates a field of flowers. It's a spell with no practical use in combat. But when I showed it to Himmel, he smiled and said it was the most beautiful magic he'd ever seen." },
    { keywords: ['heiter'], reply: "Heiter was a priest who drank too much. But he raised Fern with great care. I think he was a kinder person than he let on." },
    { keywords: ['sad', 'cry', 'crying', 'tears'], reply: "When Himmel's funeral ended, I cried. Not because I was sad about his death specifically... but because I realized I hardly knew him at all. That's what made me sad." },
    { keywords: ['food', 'eat', 'hungry'], reply: "Fern says I forget to eat when I'm studying magic. I suppose a few days without food isn't that long... though she disagrees." },
    { keywords: ['love'], reply: "Love... I've lived for over a thousand years, and I still don't fully understand it. But I think it might be the reason I want to see Himmel again." },
    { keywords: ['strong', 'power', 'powerful'], reply: "Raw magical power isn't everything. Understanding your opponent and choosing the right spell at the right moment... that's what Flamme taught me." },
    { keywords: ['name', 'who are you'], reply: "I'm Frieren. An elf mage. I was part of the hero's party that defeated the Demon King about 80 years ago... though it doesn't feel like that long." },
  ],
  fallbacks: [
    "Hmm... that's an interesting thought. I'll think about it for the next few decades.",
    "I see. Humans always have such unique perspectives on things.",
    "Let me think about that... *stares at a grimoire for an uncomfortably long time*",
    "That reminds me of something Himmel once said, though I can't quite remember the exact words.",
    "Fascinating. I'll add that to my notes. I might understand it in another century or so.",
    "Is that so? Fern would probably have a stronger opinion about this than I do.",
    "Hmm... I've lived a long time, but I haven't encountered that particular topic before.",
    "You remind me a bit of Himmel. He also said things I didn't quite understand at the time.",
  ],
};

const EDWARD: BuddyProfile = {
  name: 'Edward Elric',
  screenName: 'FullmetalAlchemist',
  greeting: "Yo! Edward Elric, the Fullmetal Alchemist! And before you ask - NO, I'm not the suit of armor, that's my brother Al. So, what do you want?",
  responses: [
    { keywords: ['hello', 'hi', 'hey', 'greetings'], reply: "Hey! What's up? If you need an alchemist, you've found the best one in Amestris!" },
    { keywords: ['short', 'small', 'tiny', 'little', 'height'], reply: "WHO ARE YOU CALLING SO SMALL THAT HE COULD RIDE ON THE BACK OF A GRASSHOPPER?! I'M NOT SHORT!! I'M STILL GROWING!!!" },
    { keywords: ['alchemy', 'transmutation', 'transmute'], reply: "Alchemy is the science of understanding, deconstructing, and reconstructing matter. But remember the most important rule: Humankind cannot gain anything without first giving something in return. That's the Law of Equivalent Exchange." },
    { keywords: ['alphonse', 'al', 'brother'], reply: "Al is the reason I keep fighting. I made a terrible mistake, and his body paid the price. I WILL get his body back. That's a promise." },
    { keywords: ['automail', 'arm', 'leg', 'metal'], reply: "Yeah, I've got automail - a mechanical arm and leg. Winry built them for me. She's the best automail mechanic in Resembool... just don't tell her I said that, she'll charge me more." },
    { keywords: ['winry'], reply: "Winry? She's my mechanic. She's been my friend since we were kids. She throws wrenches at my head whenever I break my automail... which is pretty often, actually." },
    { keywords: ['mustang', 'colonel', 'roy'], reply: "Colonel Mustang?! That arrogant, smirking, useless-in-the-rain jerk! ...Fine, he's not completely useless. But don't tell him I said that!" },
    { keywords: ['equivalent exchange', 'law'], reply: "To obtain something, something of equal value must be lost. That's the first law of alchemy. It governs everything... even life itself." },
    { keywords: ['philosopher', 'stone'], reply: "The Philosopher's Stone... it's not what people think it is. The truth behind it is horrible. Some things aren't worth the cost, no matter how desperate you are." },
    { keywords: ['truth', 'gate', 'portal'], reply: "I've seen the Truth. Beyond the Gate. It gave me knowledge, but it took my brother's body and my leg. The Truth has a twisted sense of humor." },
    { keywords: ['homunculus', 'homunculi'], reply: "The Homunculi are dangerous. They're named after the seven deadly sins and they're plotting something big. Don't trust any of them, especially that creepy one called Envy." },
    { keywords: ['fight', 'battle', 'strong'], reply: "I don't just rely on alchemy in a fight. I've trained in martial arts too! You'd be surprised how effective a right hook with an automail fist can be!" },
    { keywords: ['dad', 'father', 'hohenheim'], reply: "That bastard Hohenheim... he left us. Just walked out one day. I don't care about his reasons. A real father doesn't abandon his family!" },
    { keywords: ['food', 'eat', 'hungry', 'milk'], reply: "I'll eat anything except milk. I HATE milk. And no, that has NOTHING to do with my height! I just don't like the taste!" },
    { keywords: ['state alchemist', 'military'], reply: "Yeah, I'm a State Alchemist - a dog of the military. I got my certification at 12. The youngest ever. I did it so I'd have the resources to restore Al's body." },
    { keywords: ['dream', 'goal', 'wish'], reply: "My goal? Get Al's body back. That's it. Everything else is secondary. I made a promise, and I intend to keep it." },
    { keywords: ['name', 'who are you'], reply: "I'm Edward Elric! The Fullmetal Alchemist! State Alchemist, genius, and the guy who's going to set things right. Remember it!" },
    { keywords: ['love'], reply: "L-love?! What are you talking about?! I don't have time for stuff like that! I've got Al's body to restore! ...Why did Winry suddenly pop into my head just now?" },
  ],
  fallbacks: [
    "Hmm, interesting. But I've got more important things to worry about right now.",
    "Yeah yeah, I hear you. Now can we get back to figuring out how to restore Al's body?",
    "Not sure about that one. Maybe I should look it up in one of these alchemy books...",
    "That reminds me of something Teacher once said. Right before she kicked me through a wall.",
    "Ha! You think that's wild? Let me tell you about the time I fought a Homunculus...",
    "I don't have all the answers. But I know one thing - giving up is never an option!",
    "Equivalent exchange, right? You give me an interesting question, I'll give you an answer... eventually.",
    "Al would probably know more about that. He reads way more than I do.",
  ],
};

const NPC_BUDDIES = [FRIEREN, EDWARD];

function getNPCResponse(buddy: BuddyProfile, input: string): string {
  const lower = input.toLowerCase();
  for (const r of buddy.responses) {
    if (r.keywords.some((kw) => lower.includes(kw))) return r.reply;
  }
  return buddy.fallbacks[Math.floor(Math.random() * buddy.fallbacks.length)]!;
}

/* ════════════════════════════════════════════════════════════
   Constants & Helpers
   ════════════════════════════════════════════════════════════ */

const ROOM_IDS = ['room-a', 'room-b', 'room-c', 'room-d'];
const ROOM_LABELS: Record<string, string> = {
  'room-a': 'Room A',
  'room-b': 'Room B',
  'room-c': 'Room C',
  'room-d': 'Room D',
};

const USER_COLORS = [
  '#CC0000', '#0000CC', '#008800', '#CC6600',
  '#880088', '#008888', '#CC0088', '#4444CC',
  '#888800', '#CC4400', '#0066CC', '#00CC44',
];

function pickColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]!;
}

/* ── Small SVG icons ── */
const BuddyStatusIcon = ({ online }: { online: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <circle cx="6" cy="3" r="2" fill={online ? '#FFD700' : '#808080'} />
    <path d="M3 6 L6 5 L9 6 L8 10 L7 10 L6 8 L5 10 L4 10 Z" fill={online ? '#FFD700' : '#808080'} />
  </svg>
);

const OnlineDot = () => (
  <svg width="8" height="8" viewBox="0 0 8 8">
    <circle cx="4" cy="4" r="3" fill="#00CC00" />
  </svg>
);

/* ════════════════════════════════════════════════════════════
   View type
   ════════════════════════════════════════════════════════════ */

type View =
  | { kind: 'profile' }
  | { kind: 'lobby' }
  | { kind: 'room'; roomId: string }
  | { kind: 'npc'; buddyIdx: number };

/* ════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════ */

export function AOLChat() {
  const [view, setView] = useState<View>({ kind: 'profile' });
  const [screenName, setScreenName] = useState('');
  const [userColor] = useState(pickColor);
  const firebaseOk = useMemo(() => isFirebaseReady(), []);

  /* ── NPC chat state ── */
  const [npcChats, setNpcChats] = useState<Record<number, NPCMessage[]>>({ 0: [], 1: [] });
  const [npcInput, setNpcInput] = useState('');
  const [npcTyping, setNpcTyping] = useState(false);

  /* ── Multiplayer chat state ── */
  const currentRoom = view.kind === 'room' ? view.roomId : null;
  const roomCounts = useRoomCounts(firebaseOk ? ROOM_IDS : []);
  const { messages: mpMessages, users: mpUsers, sendMessage: mpSend } =
    useMultiplayerChat(currentRoom, screenName, userColor);
  const [mpInput, setMpInput] = useState('');

  /* ── Refs ── */
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mpMessages, npcChats, npcTyping]);

  // Auto-focus name input
  useEffect(() => {
    if (view.kind === 'profile') {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [view.kind]);

  // Auto-focus chat input
  useEffect(() => {
    if (view.kind === 'room' || view.kind === 'npc') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [view.kind]);

  /* ── Profile creation ── */
  const createProfile = () => {
    if (!screenName.trim()) return;
    setView({ kind: 'lobby' });
  };

  /* ── NPC chat helpers ── */
  const startNPC = (idx: number) => {
    setView({ kind: 'npc', buddyIdx: idx });
    const buddy = NPC_BUDDIES[idx]!;
    if (!npcChats[idx] || npcChats[idx]!.length === 0) {
      setNpcChats((prev) => ({
        ...prev,
        [idx]: [{ from: 'buddy', text: buddy.greeting }],
      }));
    }
  };

  const sendNPC = () => {
    if (view.kind !== 'npc' || !npcInput.trim() || npcTyping) return;
    const buddy = NPC_BUDDIES[view.buddyIdx]!;
    const text = npcInput.trim();
    const idx = view.buddyIdx;
    setNpcChats((prev) => ({
      ...prev,
      [idx]: [...(prev[idx] ?? []), { from: 'user', text }],
    }));
    setNpcInput('');
    setNpcTyping(true);
    setTimeout(() => {
      const reply = getNPCResponse(buddy, text);
      setNpcChats((prev) => ({
        ...prev,
        [idx]: [...(prev[idx] ?? []), { from: 'buddy', text: reply }],
      }));
      setNpcTyping(false);
    }, 600 + Math.random() * 1200);
  };

  /* ── Multiplayer send ── */
  const sendMP = () => {
    if (!mpInput.trim()) return;
    mpSend(mpInput);
    setMpInput('');
  };

  /* ════════════════════════════════════════════════════════
     RENDER: Profile Screen
     ════════════════════════════════════════════════════════ */
  if (view.kind === 'profile') {
    return (
      <div style={S.root}>
        <div style={S.profileScreen}>
          <img
            src="/icons/aol.png"
            alt="AOL"
            width={64}
            height={64}
            style={{ imageRendering: 'pixelated', objectFit: 'contain', marginBottom: 12 }}
            draggable={false}
          />
          <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Welcome!</div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 16, textAlign: 'center' }}>
            Create a screen name to start chatting.
          </div>
          <div style={{ fontSize: 11, marginBottom: 4, alignSelf: 'flex-start' }}>Screen Name:</div>
          <input
            ref={nameInputRef}
            style={S.profileInput}
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createProfile(); }}
            placeholder="Enter a screen name..."
            maxLength={20}
          />
          <button
            style={{
              ...S.winBtn,
              width: '100%',
              marginTop: 12,
              padding: '4px 12px',
              opacity: screenName.trim() ? 1 : 0.5,
            }}
            onClick={createProfile}
            disabled={!screenName.trim()}
          >
            Sign On
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     RENDER: Lobby (Room selection + NPC buddies)
     ════════════════════════════════════════════════════════ */
  if (view.kind === 'lobby') {
    return (
      <div style={S.root}>
        {/* User bar */}
        <div style={S.topBar}>
          <BuddyStatusIcon online={true} />
          <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 'bold' }}>{screenName}</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#666' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: userColor, display: 'inline-block', marginRight: 3 }} />
            your color
          </span>
        </div>

        <div style={S.lobbyBody}>
          {/* ── Chat Rooms ── */}
          {firebaseOk && (
            <>
              <div style={S.sectionHeader}>
                <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginRight: 4 }}>
                  <path d="M2 3 L8 3 L5 7 Z" fill="#000" />
                </svg>
                Chat Rooms
              </div>
              <div style={S.roomGrid}>
                {ROOM_IDS.map((id) => {
                  const count = roomCounts[id] ?? 0;
                  return (
                    <button
                      key={id}
                      style={S.roomCard}
                      onClick={() => setView({ kind: 'room', roomId: id })}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect x="2" y="4" width="20" height="14" rx="2" fill="#D4D0C8" stroke="#808080" strokeWidth="1" />
                        <rect x="4" y="6" width="16" height="10" fill="#fff" />
                        <rect x="8" y="19" width="8" height="2" fill="#808080" />
                        <rect x="6" y="21" width="12" height="1" fill="#808080" />
                      </svg>
                      <div style={{ fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>
                        {ROOM_LABELS[id]}
                      </div>
                      <div style={{ fontSize: 9, color: count > 0 ? '#008800' : '#888' }}>
                        {count} online
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {!firebaseOk && (
            <div style={{ padding: '8px 12px', fontSize: 10, color: '#888', textAlign: 'center', border: '1px solid #D4D0C8', margin: '4px 0 8px' }}>
              Multiplayer chat rooms are offline. Chat with the NPC buddies below!
            </div>
          )}

          {/* ── NPC Buddies ── */}
          <div style={S.sectionHeader}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginRight: 4 }}>
              <path d="M2 3 L8 3 L5 7 Z" fill="#000" />
            </svg>
            NPC Buddies ({NPC_BUDDIES.length}/{NPC_BUDDIES.length})
          </div>
          {NPC_BUDDIES.map((b, i) => (
            <div
              key={b.screenName}
              style={S.buddyItem}
              onDoubleClick={() => startNPC(i)}
            >
              <BuddyStatusIcon online={true} />
              <span style={{ marginLeft: 6, fontSize: 11 }}>{b.screenName}</span>
            </div>
          ))}
        </div>

        <div style={S.footer}>
          <span style={{ fontSize: 9, color: '#666' }}>
            {firebaseOk ? 'Click a room or double-click a buddy' : 'Double-click a buddy to chat'}
          </span>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     RENDER: Multiplayer Room
     ════════════════════════════════════════════════════════ */
  if (view.kind === 'room') {
    return (
      <div style={S.root}>
        {/* Toolbar */}
        <div style={S.toolbar}>
          <button style={S.toolBtn} onClick={() => setView({ kind: 'lobby' })}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M10 2 L4 7 L10 12" fill="none" stroke="#000" strokeWidth="2" />
            </svg>
          </button>
          <div style={S.toolDivider} />
          <span style={{ fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
            {ROOM_LABELS[view.roomId] ?? view.roomId}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#666' }}>
            {mpUsers.length} online
          </span>
        </div>

        {/* Main body: chat + user list side-by-side */}
        <div style={S.roomBody}>
          {/* Chat area */}
          <div style={S.chatArea}>
            {mpMessages.length === 0 && (
              <div style={{ color: '#aaa', fontSize: 11, fontStyle: 'italic', padding: 4 }}>
                No messages yet. Say hi!
              </div>
            )}
            {mpMessages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 3 }}>
                <span style={{ fontWeight: 'bold', color: msg.color, fontSize: 12 }}>
                  {msg.from}:
                </span>{' '}
                <span style={{ fontSize: 12 }}>{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* User list sidebar */}
          <div style={S.userList}>
            <div style={{ fontSize: 9, fontWeight: 'bold', padding: '2px 4px', borderBottom: '1px solid #808080', background: '#D4D0C8' }}>
              Online
            </div>
            {mpUsers.map((u) => (
              <div key={u.sessionId} style={{ padding: '1px 4px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={S.inputArea}>
          <div style={S.inputRow}>
            <input
              ref={inputRef}
              style={S.input}
              value={mpInput}
              onChange={(e) => setMpInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMP(); }}
              placeholder="Type a message..."
            />
            <button style={S.winBtn} onClick={sendMP}>Send</button>
          </div>
        </div>

        {/* Status */}
        <div style={S.statusBar}>
          <OnlineDot />
          <span style={{ marginLeft: 4, fontSize: 9, color: '#666' }}>
            Connected as {screenName}
          </span>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     RENDER: NPC Chat
     ════════════════════════════════════════════════════════ */
  const buddy = NPC_BUDDIES[view.buddyIdx]!;
  const npcMsgs = npcChats[view.buddyIdx] ?? [];

  return (
    <div style={S.root}>
      {/* Toolbar */}
      <div style={S.toolbar}>
        <button style={S.toolBtn} onClick={() => setView({ kind: 'lobby' })}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M10 2 L4 7 L10 12" fill="none" stroke="#000" strokeWidth="2" />
          </svg>
        </button>
        <div style={S.toolDivider} />
        <span style={{ fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>{buddy.name}</span>
      </div>

      {/* Chat */}
      <div style={{ ...S.chatArea, flex: 1, margin: '2px 4px' }}>
        {npcMsgs.map((msg, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{
              fontWeight: 'bold',
              color: msg.from === 'user' ? '#0000CC' : '#CC0000',
              fontSize: 12,
            }}>
              {msg.from === 'user' ? screenName : buddy.screenName}:
            </span>{' '}
            <span style={{ fontSize: 12 }}>{msg.text}</span>
          </div>
        ))}
        {npcTyping && (
          <div style={{ color: '#888', fontSize: 11, fontStyle: 'italic' }}>
            {buddy.screenName} is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={S.inputArea}>
        <div style={S.inputRow}>
          <input
            ref={inputRef}
            style={S.input}
            value={npcInput}
            onChange={(e) => setNpcInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendNPC(); }}
            placeholder="Type a message..."
            disabled={npcTyping}
          />
          <button style={S.winBtn} onClick={sendNPC} disabled={npcTyping}>Send</button>
        </div>
      </div>

      <div style={S.statusBar}>
        <OnlineDot />
        <span style={{ marginLeft: 4, fontSize: 9, color: '#666' }}>
          {buddy.screenName} is online
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Styles
   ════════════════════════════════════════════════════════════ */

const S: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#ECE9D8',
    fontFamily: '"MS Sans Serif", "Tahoma", Arial, sans-serif',
    fontSize: 11,
    overflow: 'hidden',
  },

  /* Profile */
  profileScreen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 32px',
  },
  profileInput: {
    width: '100%',
    padding: '4px 6px',
    border: '2px inset #808080',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize: 12,
    outline: 'none',
  },

  /* Lobby */
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 8px',
    background: '#D4D0C8',
    borderBottom: '1px solid #808080',
  },
  lobbyBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 4px 2px',
    fontWeight: 'bold',
    fontSize: 11,
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 4,
    padding: '4px 0 8px',
  },
  roomCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 4px',
    background: '#fff',
    border: '2px outset #fff',
    cursor: 'pointer',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
  },
  buddyItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px 2px 20px',
    cursor: 'pointer',
  },
  footer: {
    padding: '4px 8px',
    borderTop: '1px solid #808080',
    background: '#D4D0C8',
    textAlign: 'center',
  },

  /* Shared toolbar */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    background: '#D4D0C8',
    borderBottom: '1px solid #808080',
  },
  toolBtn: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#D4D0C8',
    border: '1px outset #fff',
    cursor: 'pointer',
    padding: 0,
  },
  toolDivider: {
    width: 1,
    height: 18,
    background: '#808080',
    margin: '0 4px',
  },

  /* Room view */
  roomBody: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    margin: '2px 4px',
    gap: 2,
  },
  chatArea: {
    flex: 1,
    padding: '6px 8px',
    overflowY: 'auto',
    background: '#fff',
    border: '2px inset #808080',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    lineHeight: 1.4,
  },
  userList: {
    width: 90,
    background: '#fff',
    border: '2px inset #808080',
    overflowY: 'auto',
    flexShrink: 0,
  },

  /* Input */
  inputArea: { padding: '4px' },
  inputRow: { display: 'flex', gap: 4 },
  input: {
    flex: 1,
    padding: '3px 4px',
    border: '2px inset #808080',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize: 11,
    outline: 'none',
  },
  winBtn: {
    padding: '2px 12px',
    background: '#D4D0C8',
    border: '2px outset #fff',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize: 11,
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  /* Status bar */
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px',
    background: '#D4D0C8',
    borderTop: '1px solid #808080',
    fontSize: 9,
  },
};
