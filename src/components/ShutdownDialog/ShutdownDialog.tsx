import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { Sounds } from '../../utils/sounds';
import styles from './ShutdownDialog.module.css';

export function ShutdownDialog() {
  const phase = useDesktopStore((s) => s.phase);
  const setPhase = useDesktopStore((s) => s.setPhase);

  if (phase === 'shutdown') {
    return (
      <div className={styles.shutdownScreen}>
        <div className={styles.shutdownMessage}>
          <p>It's now safe to turn off</p>
          <p>your computer.</p>
          <button
            className={styles.rebootBtn}
            onClick={() => setPhase('boot')}
          >
            Reboot
          </button>
        </div>
      </div>
    );
  }

  if (phase !== 'shutdown-prompt') return null;

  const handleShutdown = () => {
    Sounds.shutdown();
    setTimeout(() => setPhase('shutdown'), 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.dialog}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          {/* Title bar */}
          <div className={styles.titlebar}>
            <span>Shut Down DannyOS</span>
            <button
              className={styles.closeBtn}
              onClick={() => setPhase('desktop')}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
                <line x1="0" y1="0" x2="8" y2="8" stroke="#000" strokeWidth="2" />
                <line x1="8" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className={styles.warningIcon}>&#9888;</div>
            <div className={styles.text}>
              <p>Are you sure you want to shut down?</p>
              <p className={styles.subtext}>Thanks for visiting!</p>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.buttons}>
            <button className={styles.btn} onClick={handleShutdown}>
              OK
            </button>
            <button className={styles.btn} onClick={() => setPhase('desktop')}>
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
