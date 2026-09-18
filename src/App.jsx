import React, { useState, useEffect, useRef } from 'react';

const INK_WELLS = {
  walnut: { name: 'Walnut Gall', color: '#27150c', wetColor: '#120a06', glow: 'rgba(39,21,12,0.45)' },
  indigo: { name: 'Midnight Indigo', color: '#162035', wetColor: '#0a101d', glow: 'rgba(22,32,53,0.45)' },
  sepia: { name: 'Imperial Sepia', color: '#4a2c16', wetColor: '#2b170a', glow: 'rgba(74,44,22,0.45)' },
  crimson: { name: 'Rosehip Red', color: '#541517', wetColor: '#2d080a', glow: 'rgba(84,21,23,0.45)' }
};

const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export default function ProfessionalFolio() {
  const [stage, setStage] = useState(0); // 0: Cover1, 1: Cover2, 2: Writing Leaf
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeInk, setActiveInk] = useState('walnut');
  const [isWet, setIsWet] = useState(false);
  const [candleMode, setCandleMode] = useState(false);
  const [candlePos, setCandlePos] = useState({ x: 180, y: 180 });

  // Persistent storage state
  const [storedFolio, setStoredFolio] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('folio_locked_records') || '{}');
    } catch {
      return {};
    }
  });

  // Current draft in textarea (NOT saved until locked)
  const [draftText, setDraftText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Page curl drag state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const pageRef = useRef(null);

  const dateKey = formatDateKey(selectedDate);
  const dayOfYear = getDayOfYear(selectedDate);

  // Sync draft text whenever date changes
  useEffect(() => {
    const savedContent = storedFolio[dateKey]?.content || '';
    setDraftText(savedContent);
    setIsLocked(Boolean(storedFolio[dateKey]?.locked));
    setStatusMessage(savedContent ? 'Inscribed & Sealed' : 'Clean Vellum');
  }, [dateKey, storedFolio]);

  // Audio Context Engine
  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playQuillScratch = () => {
    try {
      const ctx = getAudioCtx();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.045, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.28;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3400 + Math.random() * 600, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) { }
  };

  const playPaperRustle = () => {
    try {
      const ctx = getAudioCtx();
      const len = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.32);
      filter.Q.value = 1.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.34);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) { }
  };

  const playLockThump = () => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.24, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) { }
  };

  const playEraserRub = () => {
    try {
      const ctx = getAudioCtx();
      const len = ctx.sampleRate * 0.22;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) { }
  };

  // MANUAL SAVE & LOCK
  const handleLockAndSave = () => {
    playLockThump();
    if (navigator.vibrate) navigator.vibrate([40, 50]);

    const updated = {
      ...storedFolio,
      [dateKey]: {
        content: draftText,
        locked: true,
        savedAt: new Date().toISOString()
      }
    };
    setStoredFolio(updated);
    localStorage.setItem('folio_locked_records', JSON.stringify(updated));
    setIsLocked(true);
    setStatusMessage('Locked & Preserved 🔒');
  };

  // ERASER
  const handleEraser = () => {
    playEraserRub();
    setDraftText('');
    setIsLocked(false);

    const updated = { ...storedFolio };
    delete updated[dateKey];
    setStoredFolio(updated);
    localStorage.setItem('folio_locked_records', JSON.stringify(updated));
    setStatusMessage('Erased Clean 🧹');
  };

  const handleWriting = (e) => {
    if (isLocked) return;
    setDraftText(e.target.value);
    setIsWet(true);
    playQuillScratch();
    setStatusMessage('Unsaved Script...');

    clearTimeout(window.inkTimer);
    window.inkTimer = setTimeout(() => setIsWet(false), 2400);
  };

  const stepDate = (days) => {
    playPaperRustle();
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  // Drag / Swipe handling
  const handlePointerDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const handlePointerMove = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    if (candleMode && pageRef.current) {
      const rect = pageRef.current.getBoundingClientRect();
      setCandlePos({ x: clientX - rect.left, y: clientY - rect.top });
    }

    if (!isDragging) return;
    setDragOffset(clientX - startXRef.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -65) stepDate(1);
    else if (dragOffset > 65) stepDate(-1);
    setDragOffset(0);
  };

  const pageIndex = ((dayOfYear - 1) % 9) + 1;
  const pageSrc = `/assets/page${pageIndex}.jfif`;
  const ink = INK_WELLS[activeInk];

  const curlAngle = Math.max(-25, Math.min(25, dragOffset * 0.22));
  const curlShadow = Math.abs(dragOffset) * 0.35;

  return (
    <main
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        minHeight: '100dvh',
        width: '100vw',
        background: 'radial-gradient(ellipse at center, #18100a 0%, #0d0705 65%, #030202 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '16px',
        boxSizing: 'border-box',
        userSelect: 'none'
      }}
    >
      {/* Dynamic Candle Mask */}
      {candleMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            background: `radial-gradient(circle 170px at ${candlePos.x}px ${candlePos.y}px, rgba(255,215,130,0.18) 0%, rgba(0,0,0,0.88) 75%)`
          }}
        />
      )}

      {/* STAGE 0: Wordless Floral Cover 1 */}
      {stage === 0 && (
        <div
          onClick={() => { playLockThump(); setStage(1); }}
          style={{
            zIndex: 2,
            width: 'min(90vw, 380px)',
            aspectRatio: '9 / 14',
            borderRadius: '20px',
            backgroundImage: `url('/assets/cover1.jfif')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.92), inset 0 0 40px rgba(255,245,230,0.25)',
            cursor: 'pointer',
            border: '1px solid rgba(255,245,230,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,245,225,0.85) 0%, rgba(200,165,110,0) 70%)',
            boxShadow: '0 0 28px rgba(255,235,190,0.6)',
            animation: 'pulse 3.2s infinite ease-in-out'
          }} />
        </div>
      )}

      {/* STAGE 1: Wordless Ephemera Cover 2 */}
      {stage === 1 && (
        <div
          onClick={() => { playPaperRustle(); setStage(2); }}
          style={{
            zIndex: 2,
            width: 'min(90vw, 380px)',
            aspectRatio: '9 / 14',
            borderRadius: '20px',
            backgroundImage: `url('/assets/cover2.jfif')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.92)',
            cursor: 'pointer',
            border: '1px solid rgba(255,240,220,0.25)'
          }}
        />
      )}

      {/* STAGE 2: Parchment Writing Page */}
      {stage === 2 && (
        <div style={{
          zIndex: 2,
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Top Control Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '2px 8px'
          }}>
            {/* Historical Ink Wells */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {Object.keys(INK_WELLS).map((k) => (
                <div
                  key={k}
                  onClick={() => setActiveInk(k)}
                  title={INK_WELLS[k].name}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: INK_WELLS[k].color,
                    cursor: 'pointer',
                    border: activeInk === k ? '2px solid #e7d1b3' : '1px solid rgba(255,255,255,0.25)',
                    boxShadow: activeInk === k ? `0 0 10px ${INK_WELLS[k].glow}` : 'none',
                    transform: activeInk === k ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>

            {/* Status & Secret Ink Toggle */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '11px',
                letterSpacing: '1.2px',
                color: isLocked ? '#cba471' : 'rgba(255,240,220,0.5)'
              }}>
                {statusMessage}
              </span>

              <button
                onClick={() => setCandleMode(!candleMode)}
                style={{
                  background: candleMode ? '#c88a38' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '2px 8px',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                🕯️
              </button>
            </div>
          </div>

          {/* 2.5D Curling Paper Sheet */}
          <div
            ref={pageRef}
            onPointerDown={handlePointerDown}
            style={{
              width: '100%',
              aspectRatio: '9 / 14',
              borderRadius: '16px',
              backgroundImage: `url('${pageSrc}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: `0 25px 70px rgba(0,0,0,0.92), ${curlShadow}px 0 ${curlShadow * 1.5}px rgba(0,0,0,0.45)`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              padding: '48px 36px 36px',
              boxSizing: 'border-box',
              transform: `perspective(1200px) rotateY(${curlAngle}deg)`,
              transformOrigin: dragOffset < 0 ? 'right center' : 'left center',
              transition: isDragging ? 'none' : 'transform 0.4s ease, box-shadow 0.4s ease'
            }}
          >
            {/* Velvet Bookmark Ribbon */}
            <div style={{
              position: 'absolute',
              top: -6,
              left: '46px',
              width: '14px',
              height: '46px',
              background: 'linear-gradient(180deg, #5b1d24 0%, #3e1217 100%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.45)',
              borderRadius: '0 0 3px 3px'
            }} />

            {/* TOP HEADER: Clean Integrated Date & Navigation Arrows */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(43,23,12,0.18)',
              paddingBottom: '6px',
              marginBottom: '10px'
            }}>
              <button
                onClick={() => stepDate(-1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#472a1a',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '0 6px',
                  fontFamily: 'serif'
                }}
              >
                ‹
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '14px',
                  letterSpacing: '2px',
                  color: '#472a1a',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{
                  fontFamily: '"Pinyon Script", cursive',
                  fontSize: '16px',
                  color: '#6e452a',
                  marginTop: '-2px'
                }}>
                  Folio Leaf {dayOfYear}
                </span>
              </div>

              <button
                onClick={() => stepDate(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#472a1a',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '0 6px',
                  fontFamily: 'serif'
                }}
              >
                ›
              </button>
            </div>

            {/* 18th-Century Manuscript Entry Area */}
            <textarea
              value={draftText}
              onChange={handleWriting}
              readOnly={isLocked}
              placeholder={isLocked ? "This leaf is sealed with wax." : "Write your thoughts upon this folio..."}
              style={{
                flex: 1,
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: '"Pinyon Script", "Italianno", cursive',
                fontSize: 'clamp(23px, 5.2vw, 30px)',
                lineHeight: '1.45',
                color: candleMode ? 'transparent' : isWet ? ink.wetColor : ink.color,
                textShadow: candleMode
                  ? 'none'
                  : isWet
                    ? `0 0 1.2px ${ink.wetColor}, 0 0 3px ${ink.glow}`
                    : `0 0.4px 0.8px ${ink.glow}`,
                letterSpacing: '0.4px',
                padding: 0,
                cursor: isLocked ? 'default' : 'text',
                transition: 'color 0.8s ease, text-shadow 0.8s ease'
              }}
            />

            {/* BOTTOM MARGIN: Pro Tools (Erase, Close, Lock & Save) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '8px',
              borderTop: '1px solid rgba(43,23,12,0.12)'
            }}>
              {/* Eraser Tool */}
              <button
                onClick={handleEraser}
                title="Erase Leaf"
                style={{
                  background: 'rgba(60,30,15,0.08)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  color: '#472a1a',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  cursor: 'pointer'
                }}
              >
                🧹 Erase
              </button>

              <span
                onClick={() => { playLockThump(); setStage(0); }}
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(36, 19, 9, 0.45)',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </span>

              {/* Lock & Save Button */}
              <button
                onClick={isLocked ? () => setIsLocked(false) : handleLockAndSave}
                style={{
                  background: isLocked
                    ? 'radial-gradient(circle, #8a2428 0%, #561215 100%)'
                    : 'rgba(50,25,12,0.14)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '4px 12px',
                  color: isLocked ? '#f5e4c8' : '#32190c',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '11px',
                  letterSpacing: '1.2px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: isLocked ? '0 2px 8px rgba(138,36,40,0.45)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                {isLocked ? '🔒 Sealed' : '💾 Lock & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.45; }
          50% { transform: scale(1.18); opacity: 0.95; }
        }
      `}</style>
    </main>
  );
}