import { useState, useEffect, useCallback, useRef } from 'react';
import { useDesktopStore } from '../stores/desktopStore';

/* -- Helpers -- */
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

/** Compute the CURRENT UTC offset for a given IANA timezone (accounts for DST) */
function getCurrentOffset(tz: string): number {
  const now = new Date();
  // Get the UTC time string in that timezone and parse the offset
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(now);
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  if (!tzPart) return 0;
  const m = tzPart.value.match(/GMT([+-]?\d+)?(?::(\d+))?/);
  if (!m) return 0;
  const hours = parseInt(m[1] || '0', 10);
  const mins = parseInt(m[2] || '0', 10);
  return hours + (hours < 0 ? -mins : mins) / 60;
}

/** Build timezone list with DST-aware offsets */
const TZ_DEFS: { label: string; iana: string }[] = [
  { label: 'Intl Date Line West', iana: 'Etc/GMT+12' },
  { label: 'Midway Island, Samoa', iana: 'Pacific/Midway' },
  { label: 'Hawaii', iana: 'Pacific/Honolulu' },
  { label: 'Alaska', iana: 'America/Anchorage' },
  { label: 'Pacific Time (US & Canada)', iana: 'America/Los_Angeles' },
  { label: 'Mountain Time (US & Canada)', iana: 'America/Denver' },
  { label: 'Central Time (US & Canada)', iana: 'America/Chicago' },
  { label: 'Eastern Time (US & Canada)', iana: 'America/New_York' },
  { label: 'Atlantic Time (Canada)', iana: 'America/Halifax' },
  { label: 'Buenos Aires, Greenland', iana: 'America/Argentina/Buenos_Aires' },
  { label: 'Mid-Atlantic', iana: 'Atlantic/South_Georgia' },
  { label: 'Azores, Cape Verde Is.', iana: 'Atlantic/Azores' },
  { label: 'UTC / London, Dublin', iana: 'Europe/London' },
  { label: 'Berlin, Paris, Rome', iana: 'Europe/Berlin' },
  { label: 'Cairo, Helsinki, Athens', iana: 'Europe/Athens' },
  { label: 'Moscow, Kuwait, Riyadh', iana: 'Europe/Moscow' },
  { label: 'Abu Dhabi, Muscat, Baku', iana: 'Asia/Dubai' },
  { label: 'Islamabad, Karachi', iana: 'Asia/Karachi' },
  { label: 'Mumbai, Kolkata, Chennai', iana: 'Asia/Kolkata' },
  { label: 'Astana, Dhaka', iana: 'Asia/Dhaka' },
  { label: 'Bangkok, Hanoi, Jakarta', iana: 'Asia/Bangkok' },
  { label: 'Beijing, Singapore, Perth', iana: 'Asia/Shanghai' },
  { label: 'Tokyo, Seoul, Osaka', iana: 'Asia/Tokyo' },
  { label: 'Sydney, Melbourne, Guam', iana: 'Australia/Sydney' },
  { label: 'Magadan, Solomon Is.', iana: 'Pacific/Guadalcanal' },
  { label: 'Auckland, Wellington, Fiji', iana: 'Pacific/Auckland' },
];

function buildTimeZones() {
  return TZ_DEFS.map(tz => {
    const offset = getCurrentOffset(tz.iana);
    const sign = offset >= 0 ? '+' : '-';
    const absH = Math.floor(Math.abs(offset));
    const absM = Math.round((Math.abs(offset) - absH) * 60);
    const label = `(GMT${sign}${String(absH).padStart(2, '0')}:${String(absM).padStart(2, '0')}) ${tz.label}`;
    return { label, offset };
  });
}

const TIME_ZONES = buildTimeZones();

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

/** Get the offset in hours for the user's local timezone */
function getLocalUtcOffsetHours() {
  return -(new Date().getTimezoneOffset() / 60);
}

/** Given a timezone offset (hours from UTC) and a time offset (ms), compute a Date */
function getAdjustedDate(tzOffsetHours: number, timeOffsetMs: number): Date {
  const now = new Date();
  // Convert current time to UTC, then apply timezone offset and user time offset
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + tzOffsetHours * 3600000 + timeOffsetMs);
}

/* -- Shared Win95 style fragments -- */
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

/* -- Component -- */
export function DateTime() {
  const storeTimeOffset = useDesktopStore((s) => s.timeOffset);
  const storeTimeZone = useDesktopStore((s) => s.timeZone);
  const setStoreTimeOffset = useDesktopStore((s) => s.setTimeOffset);
  const setStoreTimeZone = useDesktopStore((s) => s.setTimeZone);

  // Find the stored timezone's offset
  const getOffsetForTz = (tzLabel: string) => {
    const tz = TIME_ZONES.find((t) => t.label === tzLabel);
    return tz ? tz.offset : getLocalUtcOffsetHours();
  };

  // Local editing state (not applied until OK/Apply)
  const [pendingTimeOffset, setPendingTimeOffset] = useState(storeTimeOffset);
  const [pendingTimeZone, setPendingTimeZone] = useState(storeTimeZone);

  // Current displayed time (ticks every second)
  const [displayDate, setDisplayDate] = useState(() =>
    getAdjustedDate(getOffsetForTz(storeTimeZone), storeTimeOffset)
  );

  // Editing hours/minutes/seconds (local state for spinners)
  const [editHours, setEditHours] = useState(displayDate.getHours());
  const [editMinutes, setEditMinutes] = useState(displayDate.getMinutes());
  const [editSeconds, setEditSeconds] = useState(displayDate.getSeconds());
  const userEdited = useRef(false);

  const [viewMonth, setViewMonth] = useState(displayDate.getMonth());
  const [viewYear, setViewYear] = useState(displayDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState(displayDate.getDate());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => {
      const tzOffset = getOffsetForTz(pendingTimeZone);
      const adjusted = getAdjustedDate(tzOffset, pendingTimeOffset);
      setDisplayDate(adjusted);

      // Only update edit fields if user hasn't manually edited
      if (!userEdited.current) {
        setEditHours(adjusted.getHours());
        setEditMinutes(adjusted.getMinutes());
        setEditSeconds(adjusted.getSeconds());
      }
    }, 1000);
    return () => clearInterval(id);
  }, [pendingTimeOffset, pendingTimeZone]);

  // Calendar grid data
  const now = new Date();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarCells: { day: number; currentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, currentMonth: true });
  }
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, currentMonth: false });
  }

  // Format time display using edit state
  const h12 = editHours % 12 || 12;
  const ampm = editHours >= 12 ? 'PM' : 'AM';

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

  // Compute offset from user-edited time
  const computeOffsetFromEdit = useCallback(() => {
    const tzOffset = getOffsetForTz(pendingTimeZone);
    // Get what the un-offset time would be right now
    const baseDate = getAdjustedDate(tzOffset, 0);
    // Compute difference between what user set and the base
    const userMs = editHours * 3600000 + editMinutes * 60000 + editSeconds * 1000;
    const baseMs = baseDate.getHours() * 3600000 + baseDate.getMinutes() * 60000 + baseDate.getSeconds() * 1000;
    return userMs - baseMs;
  }, [editHours, editMinutes, editSeconds, pendingTimeZone]);

  const handleApply = useCallback(() => {
    const newOffset = userEdited.current ? computeOffsetFromEdit() : pendingTimeOffset;
    setPendingTimeOffset(newOffset);
    setStoreTimeOffset(newOffset);
    setStoreTimeZone(pendingTimeZone);
    userEdited.current = false;
    setStatusMsg('Settings applied');
    setTimeout(() => setStatusMsg(null), 1500);
  }, [computeOffsetFromEdit, pendingTimeOffset, pendingTimeZone, setStoreTimeOffset, setStoreTimeZone]);

  const handleOk = useCallback(() => {
    handleApply();
    setTimeout(() => closeWindow(), 400);
  }, [handleApply, closeWindow]);

  const handleCancel = useCallback(() => {
    // Discard pending changes
    setPendingTimeOffset(storeTimeOffset);
    setPendingTimeZone(storeTimeZone);
    userEdited.current = false;
    closeWindow();
  }, [storeTimeOffset, storeTimeZone, closeWindow]);

  // Spinner handlers for hours
  const spinHour = useCallback((delta: number) => {
    userEdited.current = true;
    setEditHours((h) => ((h + delta) % 24 + 24) % 24);
  }, []);

  // Spinner handlers for minutes
  const spinMinute = useCallback((delta: number) => {
    userEdited.current = true;
    setEditMinutes((m) => {
      let newM = m + delta;
      if (newM >= 60) { newM = 0; spinHour(1); }
      if (newM < 0) { newM = 59; spinHour(-1); }
      return newM;
    });
  }, [spinHour]);

  // Handle timezone change
  const handleTzChange = useCallback((newTzLabel: string) => {
    setPendingTimeZone(newTzLabel);
    userEdited.current = false;
    // Immediately update display with new timezone
    const tzOffset = getOffsetForTz(newTzLabel);
    const adjusted = getAdjustedDate(tzOffset, pendingTimeOffset);
    setDisplayDate(adjusted);
    setEditHours(adjusted.getHours());
    setEditMinutes(adjusted.getMinutes());
    setEditSeconds(adjusted.getSeconds());
  }, [pendingTimeOffset]);

  // SVG clock
  const clockSize = 120;
  const cx = clockSize / 2;
  const cy = clockSize / 2;
  const clockRadius = 52;

  const hourAngle = ((editHours % 12) + editMinutes / 60) * 30 - 90;
  const minuteAngle = (editMinutes + editSeconds / 60) * 6 - 90;
  const secondAngle = editSeconds * 6 - 90;

  function polarToCartesian(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const hourEnd = polarToCartesian(hourAngle, 28);
  const minEnd = polarToCartesian(minuteAngle, 38);
  const secEnd = polarToCartesian(secondAngle, 42);

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
        overflow: 'hidden',
      }}
    >
      {/* -- Top row: Date & Time -- */}
      <div style={{ display: 'flex', gap: 10 }}>
        {/* -- Date Section -- */}
        <div style={{ ...groupBoxStyle, flex: '1 1 55%' }}>
          <span style={groupLabelStyle}>Date</span>

          {/* Month / Year selectors */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
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

        {/* -- Time Section -- */}
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
            <circle cx={cx} cy={cy} r={clockRadius} fill="var(--win-white)" stroke="var(--win-black)" strokeWidth={1.5} />
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--win-black)" strokeWidth={1.5} />
            ))}
            <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke="var(--win-black)" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={minEnd.x} y2={minEnd.y} stroke="var(--win-black)" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={secEnd.x} y2={secEnd.y} stroke="red" strokeWidth={0.8} />
            <circle cx={cx} cy={cy} r={2.5} fill="var(--win-black)" />
          </svg>

          {/* Digital time display with spinners */}
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
                {pad2(editMinutes)}
              </span>
              <span>:</span>
              <span style={{ width: 20, textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11 }}>
                {pad2(editSeconds)}
              </span>
              <span style={{ marginLeft: 3, fontFamily: 'var(--font-system)', fontSize: 11 }}>{ampm}</span>
            </div>
            {/* Time spinners */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                style={spinBtnStyle}
                onClick={() => spinMinute(1)}
                aria-label="Time up"
              >&#9650;</button>
              <button
                style={spinBtnStyle}
                onClick={() => spinMinute(-1)}
                aria-label="Time down"
              >&#9660;</button>
            </div>
          </div>

          {/* Hour spinners */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--font-system)', fontSize: 10 }}>Hour:</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                style={spinBtnStyle}
                onClick={() => spinHour(1)}
                aria-label="Hour up"
              >&#9650;</button>
              <button
                style={spinBtnStyle}
                onClick={() => spinHour(-1)}
                aria-label="Hour down"
              >&#9660;</button>
            </div>
          </div>
        </div>
      </div>

      {/* -- Time Zone Section -- */}
      <div style={{ ...groupBoxStyle, marginTop: 8 }}>
        <span style={groupLabelStyle}>Time Zone</span>
        <select
          value={pendingTimeZone}
          onChange={(e) => handleTzChange(e.target.value)}
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

      {/* -- Status message -- */}
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

      {/* -- OK / Cancel / Apply buttons -- */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
        <button style={btnStyle} onClick={handleOk}>OK</button>
        <button style={btnStyle} onClick={handleCancel}>Cancel</button>
        <button style={btnStyle} onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
