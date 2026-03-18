import styles from './windows.module.css';

export function Contact() {
  return (
    <div className={styles.mail}>
      <div className={styles.mailHeader}>
        <div className={styles.mailRow}>
          <label>To:</label>
          <span>dannyengineers@outlook.com</span>
        </div>
        <div className={styles.mailRow}>
          <label>Subject:</label>
          <span>Hello from a visitor!</span>
        </div>
      </div>
      <div className={styles.mailBody}>
        <p>Reach me through any of these channels:</p>
        <br />
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:dannyengineers@outlook.com">
            dannyengineers@outlook.com
          </a>
        </p>
        <br />
        <p>
          <strong>GitHub:</strong>{' '}
          <a href="https://github.com/dannyjtaylor" target="_blank" rel="noopener noreferrer">
            github.com/dannyjtaylor
          </a>
        </p>
        <br />
        <p>
          <strong>LinkedIn:</strong>{' '}
          <a href="https://linkedin.com/in/dannyjtaylor" target="_blank" rel="noopener noreferrer">
            linkedin.com/in/dannyjtaylor
          </a>
        </p>
      </div>
    </div>
  );
}
