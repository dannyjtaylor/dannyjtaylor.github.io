import { useState, useEffect, useCallback, useRef } from 'react';
import { useDesktopStore } from '../stores/desktopStore';

/* ── Helpers ── */
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

const TIME_ZONES = [
  { label: '(GMT-10:00) Hawaii', offset: -10 },
  { label: '(GMT-09:00) Alaska', offset: -9 },
  { label: '(GMT-08:00) Pacific Time (US & Canada)', offset: -8 },
  { label: '(GMT-07:00) Mountain Time (US & Canada)', offset: -7 },
  { label: '(GMT-06:00) Central Time (US & Canada)', offset: -6 },
  { label: '(GMT-05:00) Eastern Time (US & Canada)', offset: -5 },
  { label: '(GMT-04:00) Atlantic Time (Canada)', offset: -4 },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

/* ── Shared Win95 style fragments ── */
const sunkenBorder = {
  borderTop: '1px solid var(--win-btn-shadow)',
  borderLeft: '1px solid var(--win-btn-shadow)',
  borderBottom: '1px solid var(--win-btn-hilight)',
  borderRight: '1px solid var(--win-btn-hilight)',
};

const raisedBorder = {
  borderTop: '1px solid var(--win-btn-hilight)',
  borderLeft: '1px solid var(--win-btn-hilight)',
  borderBottom: '1px solid var(--win-btn-dk-shadow)',
  borderRight: '1px solid var(--win-btn-dk-shadow)',
};

const groupBoxStyle: React.CSSProperties = {
  borderTop: '1px solid var(--win-btn-shadow)',
  borderLeft: '1px solid var(--win-btn-shadow)',
  borderBottom: '1px solid var(--win-btn-hilight)',
  borderRight: '1px solid var(--win-btn-hilight)',
  padding: '14px 8px 8px',
  margin: '4px 0',
  position: 'relative',
};

const groupLabelStyle: React.CSSProperties = {
  position: 'absolute',
  top: -7,
  left: 8,
  background: 'var(--win-gray)',
  padding: '0 4px',
  fontSize: 11,
  fontFamily: 'var(--font-system)',
  color: 'var(--win-black)',
};

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  background: 'var(--win-gray)',
  minWidth: 75,
  height: 23,
  ...raisedBorder,
  outline: 'none',
  padding: '0 6px',
};

const spinBtnStyle: React.CSSProperties = {
  display: 'block',
  width: 16,
  height: 11,
  background: 'var(--win-gray)',
  ...raisedBorder,
  fontSize: 7,
  lineHeight: '11px',
  textAlign: 'center' as const,
  padding: 0,
  border: 'none',
  borderTop: '1px solid var(--win-btn-hilight)',
  borderLeft: '1px solid var(--win-btn-hilight)',
  borderBottom: '1px solid var(--win-btn-dk-shadow)',
  borderRight: '1px solid var(--win-btn-dk-shadow)',
  fontFamily: 'var(--font-system)',
  cursor: 'default',
};

/* ── Component ── */
export function DateTime() {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [time, setTime] = useState(now);
  const [hours, setHours] = useState(now.getHours());
  const [minutes, setMinutes] = useState(now.getMinutes());
  const [seconds, setSeconds] = useState(now.getSeconds());
  const [timeZone, setTimeZone] = useState('(GMT-05:00) Eastern Time (US & Canada)');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Real-time clock tick
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setTime(n);
      setHours(n.getHours());
      setMinutes(n.getMinutes());
      setSeconds(n.getSeconds());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Calendar grid data
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarCells: { day: number; currentMonth: boolean }[] = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, currentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, currentMonth: true });
  }
  // Next month leading days
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, currentMonth: false });
  }

  // Format time display
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const changeMonth = useCallback((delta: number) => {
    setViewMonth((m) => {
      let newM = m + delta;
      if (newM < 0) { setViewYear((y) => y - 1); newM = 11; }
      if (newM > 11) { setViewYear((y) => y + 1); newM = 0; }
      return newM;
    });
  }, []);

  const closeWindow = useCallback(() => {
    useDesktopStore.getState().closeWindow('datetime');
  }, []);

  const handleApply = useCallback(() => {
    setStatusMsg('Settings applied');
    setTimeout(() => setStatusMsg(null), 1500);
  }, []);

  const handleOk = useCallback(() => {
    handleApply();
    setTimeout(() => closeWindow(), 400);
  }, [handleApply, closeWindow]);

  // SVG clock
  const clockSize = 120;
  const cx = clockSize / 2;
  const cy = clockSize / 2;
  const clockRadius = 52;

  const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90;
  const minuteAngle = (minutes + seconds / 60) * 6 - 90;
  const secondAngle = seconds * 6 - 90;

  function polarToCartesian(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const hourEnd = polarToCartesian(hourAngle, 28);
  const minEnd = polarToCartesian(minuteAngle, 38);
  const secEnd = polarToCartesian(secondAngle, 42);

  // Tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30 - 90;
    const inner = polarToCartesian(angle, 44);
    const outer = polarToCartesian(angle, 50);
    return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
  });

  return (
    <div
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        color: 'var(--win-black)',
        background: 'var(--win-gray)',
        padding: 10,
        userSelect: 'none',
        width: 410,
      }}
    >
      {/* ── Top row: Date & Time ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        {/* ── Date Section ── */}
        <div style={{ ...groupBoxStyle, flex: '1 1 55%' }}>
          <span style={groupLabelStyle}>Date</span>

          {/* Month / Year selectors */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
            {/* Month dropdown */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                flex: 1,
                height: 21,
                background: 'var(--win-white)',
                ...sunkenBorder,
              }}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            {/* Year with spinner */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={viewYear}
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  width: 48,
                  height: 21,
                  textAlign: 'right',
                  background: 'var(--win-white)',
                  ...sunkenBorder,
                  paddingRight: 2,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  style={spinBtnStyle}
                  onClick={() => setViewYear((y) => y + 1)}
                  aria-label="Year up"
                >&#9650;</button>
                <button
                  style={spinBtnStyle}
                  onClick={() => setViewYear((y) => y - 1)}
                  aria-label="Year down"
                >&#9660;</button>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <div
            style={{
              background: 'var(--win-white)',
              ...sunkenBorder,
              padding: 2,
            }}
          >
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
              {DAY_HEADERS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-system)',
                    color: 'var(--win-black)',
                    padding: '1px 0',
                    fontWeight: 'bold',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
              {calendarCells.map((cell, i) => {
                const isSelected = cell.currentMonth && cell.day === selectedDay;
                const isToday =
                  cell.currentMonth &&
                  cell.day === now.getDate() &&
                  viewMonth === now.getMonth() &&
                  viewYear === now.getFullYear();
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (cell.currentMonth) setSelectedDay(cell.day);
                      else if (i < 7) changeMonth(-1);
                      else changeMonth(1);
                    }}
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-system)',
                      padding: '2px 0',
                      width: 22,
                      height: 16,
                      lineHeight: '16px',
                      margin: '0 auto',
                      borderRadius: 0,
                      color: !cell.currentMonth
                        ? 'var(--win-btn-shadow)'
                        : isSelected
                        ? 'var(--win-white)'
                        : 'var(--win-black)',
                      background: isSelected ? 'var(--win-navy)' : 'transparent',
                      cursor: 'default',
                      outline: isToday && !isSelected ? '1px dotted var(--win-black)' : 'none',
                    }}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Time Section ── */}
        <div style={{ ...groupBoxStyle, flex: '1 1 45%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={groupLabelStyle}>Time</span>

          {/* Analog clock (SVG) */}
          <svg
            ref={svgRef}
            width={clockSize}
            height={clockSize}
            viewBox={`0 0 ${clockSize} ${clockSize}`}
            style={{ margin: '4px 0 8px' }}
          >
            {/* Face */}
            <circle cx={cx} cy={cy} r={clockRadius} fill="var(--win-white)" stroke="var(--win-black)" strokeWidth={1.5} />
            {/* Hour ticks */}
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--win-black)" strokeWidth={1.5} />
            ))}
            {/* Hour hand */}
            <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke="var(--win-black)" strokeWidth={2.5} strokeLinecap="round" />
            {/* Minute hand */}
            <line x1={cx} y1={cy} x2={minEnd.x} y2={minEnd.y} stroke="var(--win-black)" strokeWidth={1.5} strokeLinecap="round" />
            {/* Second hand */}
            <line x1={cx} y1={cy} x2={secEnd.x} y2={secEnd.y} stroke="red" strokeWidth={0.8} />
            {/* Center dot */}
            <circle cx={cx} cy={cy} r={2.5} fill="var(--win-black)" />
          </svg>

          {/* Digital time display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--win-white)',
                ...sunkenBorder,
                height: 21,
                padding: '0 3px',
              }}
            >
              <span style={{ width: 20, textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11 }}>
                {pad2(h12)}
              </span>
              <span>:</span>
              <span style={{ width: 20, textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11 }}>
                {pad2(minutes)}
              </span>
              <span>:</span>
              <span style={{ width: 20, textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11 }}>
                {pad2(seconds)}
              </span>
              <span style={{ marginLeft: 3, fontFamily: 'var(--font-system)', fontSize: 11 }}>{ampm}</span>
            </div>
            {/* Time spinners */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                style={spinBtnStyle}
                onClick={() => {
                  const n2 = new Date(time);
                  n2.setMinutes(n2.getMinutes() + 1);
                  setTime(n2);
                  setHours(n2.getHours());
                  setMinutes(n2.getMinutes());
                  setSeconds(n2.getSeconds());
                }}
                aria-label="Time up"
              >&#9650;</button>
              <button
                style={spinBtnStyle}
                onClick={() => {
                  const n2 = new Date(time);
                  n2.setMinutes(n2.getMinutes() - 1);
                  setTime(n2);
                  setHours(n2.getHours());
                  setMinutes(n2.getMinutes());
                  setSeconds(n2.getSeconds());
                }}
                aria-label="Time down"
              >&#9660;</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Time Zone Section ── */}
      <div style={{ ...groupBoxStyle, marginTop: 8 }}>
        <span style={groupLabelStyle}>Time Zone</span>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            width: '100%',
            height: 21,
            background: 'var(--win-white)',
            ...sunkenBorder,
          }}
        >
          {TIME_ZONES.map((tz) => (
            <option key={tz.label} value={tz.label}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* ── Status message ── */}
      {statusMsg && (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--win-navy)',
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            padding: '3px 0 0',
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* ── OK / Cancel / Apply buttons ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
        <button style={btnStyle} onClick={handleOk}>OK</button>
        <button style={btnStyle} onClick={closeWindow}>Cancel</button>
        <button style={btnStyle} onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
