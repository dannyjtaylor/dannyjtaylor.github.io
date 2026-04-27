import React, { useState, useMemo } from 'react';
import { useBirthdays } from '../hooks/useBirthdays';
import { isFirebaseReady } from '../lib/firebase';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysUntil(month: number, day: number): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, month - 1, day);
  if (next < now) {
    next = new Date(thisYear + 1, month - 1, day);
  }
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
}

const sunken: React.CSSProperties = {
  borderTop: '1px solid var(--win-btn-shadow)',
  borderLeft: '1px solid var(--win-btn-shadow)',
  borderBottom: '1px solid var(--win-btn-hilight)',
  borderRight: '1px solid var(--win-btn-hilight)',
};

const raised: React.CSSProperties = {
  borderTop: '1px solid var(--win-btn-hilight)',
  borderLeft: '1px solid var(--win-btn-hilight)',
  borderBottom: '1px solid var(--win-btn-dk-shadow)',
  borderRight: '1px solid var(--win-btn-dk-shadow)',
};

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  background: 'var(--win-gray)',
  minWidth: 60,
  height: 23,
  ...raised,
  cursor: 'default',
  padding: '0 6px',
  outline: 'none',
  color: 'var(--win-black)',
};

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  background: 'var(--win-white)',
  color: 'var(--win-black)',
  height: 20,
  ...sunken,
  padding: '0 4px',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export function Birthdays() {
  const { entries, loading, addBirthday, deleteBirthday } = useBirthdays();
  const [name, setName] = useState('');
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [yearStr, setYearStr] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => daysUntil(a.month, a.day) - daysUntil(b.month, b.day));
  }, [entries]);

  async function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) { setError('Name is required.'); return; }
    if (day < 1 || day > 31) { setError('Day must be 1–31.'); return; }
    setError('');
    setAdding(true);
    const yearNum = yearStr ? parseInt(yearStr, 10) : undefined;
    const ok = await addBirthday(trimmedName, month, day, yearNum);
    if (ok) {
      setName('');
      setYearStr('');
    } else {
      setError('Failed to save. Is Firebase configured?');
    }
    setAdding(false);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div style={{
      fontFamily: 'var(--font-system)',
      fontSize: 11,
      color: 'var(--win-black)',
      background: 'var(--win-gray)',
      padding: 8,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      userSelect: 'none',
    }}>
      {!isFirebaseReady() && (
        <div style={{
          color: '#cc0000', marginBottom: 6, fontSize: 10,
          padding: '2px 4px', background: '#fff0f0', ...sunken,
        }}>
          Firebase not configured — birthdays will not be saved.
        </div>
      )}

      {/* Column headers */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '2px 6px',
        background: 'var(--win-gray)', fontWeight: 'bold', fontSize: 10,
        borderBottom: '1px solid var(--win-btn-shadow)', flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>Name</div>
        <div style={{ width: 100 }}>Date</div>
        <div style={{ width: 90, textAlign: 'right', marginRight: 8 }}>Coming Up</div>
        <div style={{ width: 54 }}></div>
      </div>

      {/* Birthday list */}
      <div style={{
        flex: 1, overflow: 'auto', ...sunken,
        background: 'var(--win-white)',
        marginBottom: 8,
      }}>
        {loading && (
          <div style={{ padding: 8, color: 'var(--win-btn-shadow)' }}>Loading...</div>
        )}
        {!loading && sorted.length === 0 && (
          <div style={{ padding: 8, color: 'var(--win-btn-shadow)' }}>No birthdays added yet.</div>
        )}
        {!loading && sorted.map(entry => {
          const days = daysUntil(entry.month, entry.day);
          const isToday = days === 0;
          const isSoon = days > 0 && days <= 30;
          return (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'center', padding: '3px 6px',
              borderBottom: '1px solid #e0e0e0',
              background: isToday ? '#ffffcc' : 'transparent',
            }}>
              <div style={{ flex: 1, fontWeight: isToday ? 'bold' : 'normal' }}>
                {entry.name}
                {entry.year !== undefined && (
                  <span style={{ color: 'var(--win-btn-shadow)', marginLeft: 4, fontWeight: 'normal' }}>
                    ({currentYear - entry.year} yrs)
                  </span>
                )}
              </div>
              <div style={{ width: 100, color: 'var(--win-btn-shadow)' }}>
                {MONTHS[entry.month - 1].slice(0, 3)} {entry.day}
                {entry.year !== undefined ? `, ${entry.year}` : ''}
              </div>
              <div style={{
                width: 90, textAlign: 'right', marginRight: 8,
                color: isToday ? '#cc6600' : isSoon ? '#0000cc' : 'var(--win-btn-shadow)',
                fontWeight: isToday || isSoon ? 'bold' : 'normal',
              }}>
                {isToday ? '\u{1F382} Today!' : `in ${days}d`}
              </div>
              <button
                style={{ ...btnStyle, minWidth: 0, width: 54, fontSize: 10 }}
                onClick={() => deleteBirthday(entry.id)}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      <div style={{ borderTop: '1px solid var(--win-btn-shadow)', paddingTop: 8, flexShrink: 0 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Add Birthday</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>Name:</span>
          <input
            style={{ ...inputStyle, flex: 1, minWidth: 100 }}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            maxLength={100}
            placeholder="Friend's name"
          />
          <span>Month:</span>
          <select
            style={{ ...inputStyle, width: 92 }}
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <span>Day:</span>
          <input
            style={{ ...inputStyle, width: 38 }}
            type="number"
            value={day}
            onChange={e => setDay(Math.max(1, Math.min(31, Number(e.target.value))))}
            min={1}
            max={31}
          />
          <span>Year:</span>
          <input
            style={{ ...inputStyle, width: 52 }}
            type="number"
            value={yearStr}
            onChange={e => setYearStr(e.target.value)}
            placeholder="opt."
            min={1900}
            max={currentYear}
          />
          <button style={btnStyle} onClick={handleAdd} disabled={adding}>
            {adding ? '...' : 'Add'}
          </button>
        </div>
        {error && (
          <div style={{ color: '#cc0000', marginTop: 4, fontSize: 10 }}>{error}</div>
        )}
      </div>
    </div>
  );
}
