import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { Sounds } from '../../utils/sounds';
import styles from './ShutdownDialog.module.css';

type ShutdownOption = 'shutdown' | 'restart' | 'restart-dos' | 'standby';

export function ShutdownDialog() {
  const phase = useDesktopStore((s) => s.phase);
  const setPhase = useDesktopStore((s) => s.setPhase);
  const [selectedOption, setSelectedOption] = useState<ShutdownOption>('shutdown');

  // Sleep screen: wake on any key or click
  const handleWake = useCallback(() => {
    if (phase === 'sleep') {
      setPhase('desktop');
    }
  }, [phase, setPhase]);

  useEffect(() => {
    if (phase === 'sleep') {
      window.addEventListener('keydown', handleWake);
      window.addEventListener('mousedown', handleWake);
      return () => {
        window.removeEventListener('keydown', handleWake);
        window.removeEventListener('mousedown', handleWake);
      };
    }
  }, [phase, handleWake]);

  // Restarting: show message then go to boot
  useEffect(() => {
    if (phase === 'restarting') {
      const timer = setTimeout(() => setPhase('boot'), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  // Sleep screen
  if (phase === 'sleep') {
    return (
      <div className={styles.sleepScreen}>
        <div className={styles.sleepMessage}>
          Press any key or click to wake up
        </div>
      </div>
    );
  }

  // Restarting screen
  if (phase === 'restarting') {
    return (
      <div className={styles.shutdownScreen}>
        <div className={styles.shutdownMessage}>
          <p>Windows is restarting...</p>
        </div>
      </div>
    );
  }

  // "It's now safe to turn off" screen
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

  const handleOk = () => {
    if (selectedOption === 'shutdown') {
      Sounds.shutdown();
      setTimeout(() => setPhase('shutdown'), 800);
    } else if (selectedOption === 'restart') {
      Sounds.shutdown();
      setTimeout(() => setPhase('restarting'), 800);
    } else if (selectedOption === 'standby') {
      setPhase('sleep');
    }
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
            <span>Shut Down Windows</span>
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
            <div className={styles.computerIcon}>
              <img
                src="/icons/computer.png"
                alt=""
                width="32"
                height="32"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.textContent = '🖥️';
                }}
              />
            </div>
            <div className={styles.optionsArea}>
              <p className={styles.prompt}>What do you want the computer to do?</p>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shutdownOption"
                    className={styles.radioInput}
                    checked={selectedOption === 'standby'}
                    onChange={() => setSelectedOption('standby')}
                  />
                  <span className={styles.radioText}>Stand by</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shutdownOption"
                    className={styles.radioInput}
                    checked={selectedOption === 'shutdown'}
                    onChange={() => setSelectedOption('shutdown')}
                  />
                  <span className={styles.radioText}>Shut down</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shutdownOption"
                    className={styles.radioInput}
                    checked={selectedOption === 'restart'}
                    onChange={() => setSelectedOption('restart')}
                  />
                  <span className={styles.radioText}>Restart</span>
                </label>
                <label className={`${styles.radioLabel} ${styles.radioDisabled}`}>
                  <input
                    type="radio"
                    name="shutdownOption"
                    className={styles.radioInput}
                    disabled
                    checked={selectedOption === 'restart-dos'}
                    onChange={() => setSelectedOption('restart-dos')}
                  />
                  <span className={styles.radioText}>Restart in MS-DOS mode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.buttons}>
            <button className={styles.btn} onClick={handleOk}>
              OK
            </button>
            <button className={styles.btn} onClick={() => setPhase('desktop')}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnDisabled}`} disabled>
              Help
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
