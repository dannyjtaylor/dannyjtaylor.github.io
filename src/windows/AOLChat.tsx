import { useState, useRef, useEffect } from 'react';

/* ── Character definitions ── */

interface Message {
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

const BUDDIES = [FRIEREN, EDWARD];

function getResponse(buddy: BuddyProfile, input: string): string {
  const lower = input.toLowerCase();
  for (const r of buddy.responses) {
    if (r.keywords.some((kw) => lower.includes(kw))) {
      return r.reply;
    }
  }
  return buddy.fallbacks[Math.floor(Math.random() * buddy.fallbacks.length)]!;
}

/* ── AOL Triangle Logo SVG ── */
const AOLLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#0033A0" stroke="#fff" strokeWidth="1" />
    <path d="M12 4 L20 18 H4 Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="17" cy="9" r="2" fill="#fff" />
  </svg>
);

/* ── Buddy Icon SVGs ── */
const FrierenIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    {/* Hair */}
    <ellipse cx="14" cy="10" rx="10" ry="9" fill="#C8D8E8" />
    <rect x="4" y="10" width="20" height="16" rx="2" fill="#C8D8E8" />
    {/* Face */}
    <ellipse cx="14" cy="12" rx="7" ry="7" fill="#FDEBD0" />
    {/* Eyes */}
    <ellipse cx="11" cy="11" rx="1.2" ry="1.5" fill="#6B5B95" />
    <ellipse cx="17" cy="11" rx="1.2" ry="1.5" fill="#6B5B95" />
    {/* Mouth */}
    <path d="M12 15 Q14 16.5 16 15" fill="none" stroke="#B5651D" strokeWidth="0.7" />
    {/* Hair detail */}
    <path d="M6 8 Q8 3 14 2 Q20 3 22 8" fill="none" stroke="#A0B8CC" strokeWidth="1" />
    {/* Ears */}
    <path d="M4 10 L1 7 L5 9" fill="#FDEBD0" stroke="#FDEBD0" strokeWidth="0.5" />
    <path d="M24 10 L27 7 L23 9" fill="#FDEBD0" stroke="#FDEBD0" strokeWidth="0.5" />
  </svg>
);

const EdwardIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    {/* Hair */}
    <ellipse cx="14" cy="9" rx="9" ry="8" fill="#FFD700" />
    {/* Antenna hair */}
    <path d="M14 1 L12 5 L16 5 Z" fill="#FFD700" />
    {/* Braid */}
    <rect x="12" y="16" width="4" height="10" rx="1.5" fill="#DAA520" />
    {/* Face */}
    <ellipse cx="14" cy="12" rx="7" ry="7" fill="#FDEBD0" />
    {/* Eyes */}
    <ellipse cx="11" cy="11" rx="1.2" ry="1.5" fill="#B8860B" />
    <ellipse cx="17" cy="11" rx="1.2" ry="1.5" fill="#B8860B" />
    {/* Determined eyebrows */}
    <line x1="9" y1="8.5" x2="12.5" y2="9.5" stroke="#DAA520" strokeWidth="1" />
    <line x1="15.5" y1="9.5" x2="19" y2="8.5" stroke="#DAA520" strokeWidth="1" />
    {/* Grin */}
    <path d="M11 15 Q14 17.5 17 15" fill="none" stroke="#B5651D" strokeWidth="0.8" />
  </svg>
);

/* ── Running Man / Buddy Icon ── */
const BuddyStatusIcon = ({ online }: { online: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    {/* Person shape */}
    <circle cx="6" cy="3" r="2" fill={online ? '#FFD700' : '#808080'} />
    <path d="M3 6 L6 5 L9 6 L8 10 L7 10 L6 8 L5 10 L4 10 Z" fill={online ? '#FFD700' : '#808080'} />
  </svg>
);

export function AOLChat() {
  const [selectedBuddy, setSelectedBuddy] = useState<number | null>(null);
  const [chats, setChats] = useState<Record<number, Message[]>>({ 0: [], 1: [] });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, typing]);

  const sendMessage = () => {
    if (!input.trim() || selectedBuddy === null || typing) return;
    const buddy = BUDDIES[selectedBuddy]!;
    const trimmed = input.trim();

    setChats((prev) => ({
      ...prev,
      [selectedBuddy]: [...(prev[selectedBuddy] ?? []), { from: 'user', text: trimmed }],
    }));
    setInput('');
    setTyping(true);

    // Simulate typing delay
    const delay = 600 + Math.random() * 1200;
    setTimeout(() => {
      const reply = getResponse(buddy, trimmed);
      setChats((prev) => ({
        ...prev,
        [selectedBuddy]: [...(prev[selectedBuddy] ?? []), { from: 'buddy', text: reply }],
      }));
      setTyping(false);
    }, delay);
  };

  const startChat = (idx: number) => {
    setSelectedBuddy(idx);
    const buddy = BUDDIES[idx]!;
    if (!chats[idx] || chats[idx]!.length === 0) {
      setChats((prev) => ({
        ...prev,
        [idx]: [{ from: 'buddy', text: buddy.greeting }],
      }));
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const messages = selectedBuddy !== null ? (chats[selectedBuddy] ?? []) : [];
  const buddy = selectedBuddy !== null ? BUDDIES[selectedBuddy]! : null;

  /* ── Buddy List View ── */
  if (selectedBuddy === null) {
    return (
      <div style={S.root}>
        {/* AOL Header */}
        <div style={S.aolHeader}>
          <AOLLogo size={20} />
          <span style={{ marginLeft: 6, fontWeight: 'bold', fontSize: 13 }}>AOL Instant Messenger</span>
        </div>

        {/* Screen name bar */}
        <div style={S.screenNameBar}>
          <BuddyStatusIcon online={true} />
          <span style={{ marginLeft: 4, fontSize: 11 }}>DannyT95</span>
        </div>

        {/* Buddy list */}
        <div style={S.buddyList}>
          <div style={S.buddyCategory}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginRight: 4 }}>
              <path d="M2 3 L8 3 L5 7 Z" fill="#000" />
            </svg>
            <span style={{ fontWeight: 'bold', fontSize: 11 }}>Buddies (2/2)</span>
          </div>
          {BUDDIES.map((b, i) => (
            <div
              key={b.screenName}
              style={S.buddyItem}
              onDoubleClick={() => startChat(i)}
            >
              <BuddyStatusIcon online={true} />
              <span style={{ marginLeft: 6, fontSize: 11 }}>{b.screenName}</span>
            </div>
          ))}
        </div>

        <div style={S.buddyFooter}>
          <span style={{ fontSize: 9, color: '#666' }}>Double-click a buddy to chat</span>
        </div>
      </div>
    );
  }

  /* ── Chat View ── */
  return (
    <div style={S.root}>
      {/* Chat header */}
      <div style={S.aolHeader}>
        <AOLLogo size={18} />
        <span style={{ marginLeft: 6, fontWeight: 'bold', fontSize: 12 }}>
          {buddy!.screenName} - Instant Message
        </span>
      </div>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <button style={S.toolBtn} onClick={() => setSelectedBuddy(null)}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M10 2 L4 7 L10 12" fill="none" stroke="#000" strokeWidth="2" />
          </svg>
        </button>
        <div style={S.toolDivider} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {selectedBuddy === 0 ? <FrierenIcon /> : <EdwardIcon />}
          <span style={{ fontSize: 11, fontWeight: 'bold' }}>{buddy!.name}</span>
        </div>
      </div>

      {/* Chat area */}
      <div style={S.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{
              fontWeight: 'bold',
              color: msg.from === 'user' ? '#0000CC' : '#CC0000',
              fontSize: 12,
            }}>
              {msg.from === 'user' ? 'DannyT95' : buddy!.screenName}:
            </span>{' '}
            <span style={{ fontSize: 12 }}>{msg.text}</span>
          </div>
        ))}
        {typing && (
          <div style={{ color: '#888', fontSize: 11, fontStyle: 'italic' }}>
            {buddy!.screenName} is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div style={S.inputArea}>
        <div style={S.inputRow}>
          <input
            ref={inputRef}
            style={S.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            placeholder="Type a message..."
            disabled={typing}
          />
          <button style={S.sendBtn} onClick={sendMessage} disabled={typing}>
            Send
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div style={S.statusBar}>
        <svg width="8" height="8" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" fill="#00CC00" />
        </svg>
        <span style={{ marginLeft: 4, fontSize: 9, color: '#666' }}>
          {buddy!.screenName} is online
        </span>
      </div>
    </div>
  );
}

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
  aolHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    background: 'linear-gradient(180deg, #0055CC 0%, #003399 100%)',
    color: '#fff',
    fontSize: 12,
  },
  screenNameBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 8px',
    background: '#D4D0C8',
    borderBottom: '1px solid #808080',
  },
  buddyList: {
    flex: 1,
    background: '#fff',
    padding: '4px 0',
    overflowY: 'auto',
    border: '1px inset #808080',
    margin: '0 4px',
  },
  buddyCategory: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 8px',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
  },
  buddyItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px 2px 20px',
    cursor: 'pointer',
  },
  buddyFooter: {
    padding: '4px 8px',
    borderTop: '1px solid #808080',
    background: '#D4D0C8',
    textAlign: 'center',
  },
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
  chatArea: {
    flex: 1,
    padding: '6px 8px',
    overflowY: 'auto',
    background: '#fff',
    border: '2px inset #808080',
    margin: '2px 4px',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    lineHeight: 1.4,
  },
  inputArea: {
    padding: '4px',
  },
  inputRow: {
    display: 'flex',
    gap: 4,
  },
  input: {
    flex: 1,
    padding: '3px 4px',
    border: '2px inset #808080',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize: 11,
    outline: 'none',
  },
  sendBtn: {
    padding: '2px 12px',
    background: '#D4D0C8',
    border: '2px outset #fff',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize: 11,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px',
    background: '#D4D0C8',
    borderTop: '1px solid #808080',
    fontSize: 9,
  },
};
