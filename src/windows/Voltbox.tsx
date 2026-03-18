import styles from './windows.module.css';

/**
 * Breadbox — Breadboard circuit simulator
 * Embeds the standalone Breadbox app via an iframe.
 * The ?embedded=true param hides the inner Win95 chrome so
 * it integrates cleanly with the DannyOS Window frame.
 */
export function Breadbox() {
  return (
    <div className={styles.notepadEditable} style={{ background: '#808080' }}>
      <iframe
        src="/voltbox/index.html?embedded=true"
        title="Breadbox"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}

export default Breadbox;

