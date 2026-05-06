import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useBirthdays } from '../hooks/useBirthdays';
import { isFirebaseReady } from '../lib/firebase';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function daysUntil(month: number, day: number): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yr = now.getFullYear();
  let next = new Date(yr, month - 1, day);
  if (next < now) next = new Date(yr + 1, month - 1, day);
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
  minWidth: 24,
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

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, []);

  const [viewMonth, setViewMonth] = useState(today.month);
  const [viewYear, setViewYear] = useState(today.year);
  const [popup, setPopup] = useState<{ month: number; day: number } | null>(null);
  const [popupName, setPopupName] = useState('');
  const [popupYearStr, setPopupYearStr] = useState('');
  const [popupError, setPopupError] = useState('');
  const [adding, setAdding] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (popup) {
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [popup]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const birthdayMap = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const key = `${e.month}-${e.day}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [entries]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysCount = new Date(viewYear, viewMonth, 0).getDate();
    const prevDaysCount = new Date(viewYear, viewMonth - 1, 0).getDate();
    const cells: Array<{ day: number; inMonth: boolean }> = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: prevDaysCount - firstDay + 1 + i, inMonth: false });
    }
    for (let d = 1; d <= daysCount; d++) {
      cells.push({ day: d, inMonth: true });
    }
    const rem = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
    for (let d = 1; d <= rem; d++) {
      cells.push({ day: d, inMonth: false });
    }
    return cells;
  }, [viewMonth, viewYear]);

  const rows = calendarCells.length / 7;

  const upcoming = useMemo(() => {
    return [...entries]
      .map(e => ({ ...e, days: daysUntil(e.month, e.day) }))
      .sort((a, b) => a.days - b.days)
      .slice(0, 3);
  }, [entries]);

  const openPopup = useCallback((day: number) => {
    setPopup({ month: viewMonth, day });
    setPopupName('');
    setPopupYearStr('');
    setPopupError('');
  }, [viewMonth]);

  const closePopup = useCallback(() => {
    setPopup(null);
    setPopupName('');
    setPopupYearStr('');
    setPopupError('');
  }, []);

  const handleAdd = useCallback(async () => {
    if (!popup) return;
    const trimmed = popupName.trim();
    if (!trimmed) { setPopupError('Name is required.'); return; }
    setPopupError('');
    setAdding(true);
    const yr = popupYearStr ? parseInt(popupYearStr, 10) : undefined;
    const ok = await addBirthday(trimmed, popup.month, popup.day, yr);
    setAdding(false);
    if (ok) { setPopupName(''); setPopupYearStr(''); }
    else setPopupError('Failed to save. Is Firebase configured?');
  }, [popup, popupName, popupYearStr, addBirthday]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    else if (e.key === 'Escape') closePopup();
  }, [handleAdd, closePopup]);

  const currentYear = today.year;

  return (
    <div style={{
      fontFamily: 'var(--font-system)',
      fontSize: 11,
      color: 'var(--win-black)',
      background: 'var(--win-gray)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      userSelect: 'none',
    }}>
      {!isFirebaseReady() && (
        <div style={{
          color: '#cc0000', padding: '2px 6px', fontSize: 10,
          background: '#fff0f0', ...sunken, margin: 4, flexShrink: 0,
        }}>
          Firebase not configured - birthdays will not be saved.
        </div>
      )}

      {loading ? (
        <div style={{ padding: 8, color: 'var(--win-btn-shadow)' }}>Loading...</div>
      ) : (
        <>
          {/* Month navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '4px 6px',
            flexShrink: 0, borderBottom: '1px solid var(--win-btn-shadow)',
            gap: 4,
          }}>
            <button style={btnStyle} onClick={prevMonth}>&lt;</button>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>
              {MONTHS[viewMonth - 1]} {viewYear}
            </div>
            <div style={{ fontSize: 10, color: 'var(--win-btn-shadow)' }}>
              Today: {MONTHS_SHORT[today.month - 1]} {today.day}
            </div>
            <button style={btnStyle} onClick={nextMonth}>&gt;</button>
          </div>

          {/* Day names */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            flexShrink: 0, borderBottom: '1px solid var(--win-btn-shadow)',
            background: 'var(--win-gray)',
          }}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{
                textAlign: 'center', padding: '2px 0', fontSize: 10,
                fontWeight: 'bold', color: 'var(--win-btn-shadow)',
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            ...sunken,
            background: 'var(--win-white)',
            margin: '4px 4px 0 4px',
            overflow: 'hidden',
          }}>
            {calendarCells.map((cell, idx) => {
              if (!cell.inMonth) {
                return (
                  <div key={idx} style={{
                    border: '1px solid #e8e8e8',
                    padding: '2px 3px',
                    background: '#f4f4f4',
                    overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: 9, color: '#ccc' }}>{cell.day}</div>
                  </div>
                );
              }
              const isToday = cell.day === today.day && viewMonth === today.month && viewYear === today.year;
              const mapKey = `${viewMonth}-${cell.day}`;
              const cellBirthdays = birthdayMap.get(mapKey) ?? [];
              const hasBirthday = cellBirthdays.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => openPopup(cell.day)}
                  style={{
                    border: isToday ? '2px solid #0000cc' : '1px solid #e0e0e0',
                    padding: '2px 3px',
                    background: hasBirthday ? '#fffde7' : '#fff',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    fontSize: 9,
                    fontWeight: isToday ? 'bold' : 'normal',
                    color: isToday ? '#0000cc' : '#555',
                    lineHeight: 1.2,
                  }}>
                    {cell.day}
                  </div>
                  {cellBirthdays.slice(0, 2).map(e => (
                    <div key={e.id} style={{
                      fontSize: 9, color: '#333', lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {e.name}
                    </div>
                  ))}
                  {cellBirthdays.length > 2 && (
                    <div style={{ fontSize: 8, color: '#888', lineHeight: 1.2 }}>
                      +{cellBirthdays.length - 2}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upcoming strip */}
          <div style={{
            flexShrink: 0, padding: '4px 6px',
            margin: '4px 4px 4px 4px',
            ...sunken,
            background: 'var(--win-white)',
            fontSize: 10,
            minHeight: 22,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            <span style={{ fontWeight: 'bold' }}>Upcoming: </span>
            {upcoming.length === 0 ? (
              <span style={{ color: 'var(--win-btn-shadow)' }}>No upcoming birthdays</span>
            ) : (
              upcoming.map((e, i) => (
                <span key={e.id}>
                  {i > 0 && <span style={{ color: 'var(--win-btn-shadow)' }}> · </span>}
                  <span style={{
                    color: e.days === 0 ? '#cc6600' : e.days <= 7 ? '#0000cc' : '#333',
                    fontWeight: e.days <= 7 ? 'bold' : 'normal',
                  }}>
                    {e.name} ({MONTHS_SHORT[e.month - 1]} {e.day},{' '}
                    {e.days === 0 ? 'Today!' : `${e.days}d`})
                  </span>
                </span>
              ))
            )}
          </div>
        </>
      )}

      {/* Popup overlay */}
      {popup && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) closePopup(); }}
        >
          <div style={{ background: 'var(--win-gray)', ...raised, minWidth: 230, maxWidth: 290 }}>
            {/* Titlebar */}
            <div style={{
              background: '#000080', color: '#fff', fontWeight: 'bold',
              padding: '2px 4px 2px 6px', fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>Add Birthday &mdash; {MONTHS_SHORT[popup.month - 1]} {popup.day}</span>
              <button
                onClick={closePopup}
                style={{
                  ...btnStyle, minWidth: 16, height: 14, padding: '0 3px',
                  fontSize: 9, background: 'var(--win-gray)',
                }}
              >x</button>
            </div>

            {/* Existing birthdays on this date */}
            {(() => {
              const existing = birthdayMap.get(`${popup.month}-${popup.day}`) ?? [];
              if (existing.length === 0) return null;
              return (
                <div style={{
                  padding: '4px 6px',
                  borderBottom: '1px solid var(--win-btn-shadow)',
                  maxHeight: 120,
                  overflowY: 'auto',
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 3 }}>
                    On this date:
                  </div>
                  {existing.map(e => (
                    <div key={e.id} style={{
                      display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2,
                    }}>
                      <span style={{ flex: 1, fontSize: 10 }}>
                        {e.name}
                        {e.year !== undefined && (
                          <span style={{ color: 'var(--win-btn-shadow)' }}>
                            {' '}({currentYear - e.year} yrs)
                          </span>
                        )}
                      </span>
                      <button
                        style={{ ...btnStyle, minWidth: 0, width: 44, height: 18, fontSize: 9 }}
                        onClick={() => deleteBirthday(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Add form */}
            <div style={{ padding: 8 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 5, fontSize: 11 }}>Add Birthday</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 36, flexShrink: 0 }}>Name:</span>
                  <input
                    ref={nameInputRef}
                    style={{ ...inputStyle, flex: 1 }}
                    value={popupName}
                    onChange={e => setPopupName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={100}
                    placeholder="Enter name"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 36, flexShrink: 0 }}>Born:</span>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="number"
                    value={popupYearStr}
                    onChange={e => setPopupYearStr(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Year (optional)"
                    min={1900}
                    max={currentYear}
                  />
                </div>
              </div>
              {popupError && (
                <div style={{ color: '#cc0000', fontSize: 10, marginTop: 3 }}>
                  {popupError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8 }}>
                <button style={btnStyle} onClick={closePopup}>Cancel</button>
                <button
                  style={{ ...btnStyle, fontWeight: 'bold' }}
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? '...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
