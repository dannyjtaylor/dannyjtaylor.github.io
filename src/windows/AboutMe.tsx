import styles from './windows.module.css';

export function AboutMe() {
  return (
    <div className={styles.notepadEditable}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        background: 'var(--win-white)',
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        color: 'var(--win-black)',
        userSelect: 'text',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8, borderBottom: '2px solid var(--win-black)', paddingBottom: 4 }}>
          About Me
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: 12,
            padding: '3px 6px',
            background: 'var(--win-navy)',
            color: 'var(--win-white)',
            marginBottom: 4,
          }}>
            Welcome!
          </div>
          <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
            Hey there, I'm Danny! I'm a Computer Engineering senior at Florida Polytechnic University! This is my take on a portfolio website. I hope you enjoy interacting with DannyOS!
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: 12,
            padding: '3px 6px',
            background: 'var(--win-navy)',
            color: 'var(--win-white)',
            marginBottom: 4,
          }}>
            What You Can Do
          </div>
          <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
            Please navigate through the programs I created for you! I tried to make it as similar to Windows 95 as I could, plus some extra features. On this website, you can play games, read about me, read about my interests, interact with a terminal, set backgrounds, paint, have an AOL-styled instant messager (that IS actually multiplayer! Created with Google Firebase!), find my contacts, build simple breadboard projects, and listen to music!
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: 12,
            padding: '3px 6px',
            background: 'var(--win-navy)',
            color: 'var(--win-white)',
            marginBottom: 4,
          }}>
            Tips
          </div>
          <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
            To play the games, open up Steam! Also, there's a few easter eggs, so feel free to poke around. I hope you enjoy! :)
          </div>
        </div>
      </div>
    </div>
  );
}
