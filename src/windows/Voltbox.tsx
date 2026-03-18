import styles from './windows.module.css';

/**
 * Voltbox — Breadboard circuit simulator
 * Embeds the standalone Voltbox app via an iframe.
 * The ?embedded=true param hides the inner Win95 chrome so
 * it integrates cleanly with the DannyOS Window frame.
 */
export function Voltbox() {
  return (
    <div className={styles.notepadEditable} style={{ background: '#808080' }}>
      <iframe
        src="/voltbox/index.html?embedded=true"
        title="Voltbox"
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

export default Voltbox;

