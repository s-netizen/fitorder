import { useState } from "react";

const O = "#FC8019";
const BORDER = "#1e1e1e";
const CARD = "#141414";

const GOALS = { cut: "Fat Loss", bulk: "Muscle Gain", recomp: "Recomposition", maintain: "Maintain" };
const GOAL_ICONS = { cut: "🔥", bulk: "💪", recomp: "⚡", maintain: "🎯" };

// Animated scooter SVG
function ScooterSVG() {
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .scooter-body { animation: scooterBob 2s ease-in-out infinite; }
        .wheel-front { animation: spin 0.8s linear infinite; transform-origin: 95px 46px; }
        .wheel-back { animation: spin 0.8s linear infinite; transform-origin: 28px 46px; }
        .speed-line { animation: speedLine 0.6s ease-out infinite; }
        .speed-line2 { animation: speedLine 0.6s ease-out 0.2s infinite; }
        .speed-line3 { animation: speedLine 0.6s ease-out 0.4s infinite; }
        @keyframes scooterBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes speedLine { 0%{opacity:1;transform:translateX(0)} 100%{opacity:0;transform:translateX(-20px)} }
      `}</style>
      {/* Speed lines */}
      <line className="speed-line" x1="0" y1="32" x2="18" y2="32" stroke={O} strokeWidth="2" strokeLinecap="round"/>
      <line className="speed-line2" x1="0" y1="38" x2="12" y2="38" stroke={O} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line className="speed-line3" x1="0" y1="26" x2="8" y2="26" stroke={O} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      {/* Scooter body */}
      <g className="scooter-body">
        {/* Back wheel */}
        <circle className="wheel-back" cx="28" cy="46" r="10" stroke="#333" strokeWidth="2.5" fill="#1a1a1a"/>
        <circle cx="28" cy="46" r="4" fill="#333"/>
        <line x1="28" y1="36" x2="28" y2="56" stroke="#444" strokeWidth="1.5" className="wheel-back"/>
        <line x1="18" y1="46" x2="38" y2="46" stroke="#444" strokeWidth="1.5" className="wheel-back"/>
        {/* Body */}
        <path d="M28 38 Q40 20 60 22 L75 22 L80 30 L85 30 Q90 30 92 36 L95 36" stroke={O} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M60 22 L58 38 L80 38 L80 30" fill="#1a1a1a" stroke="#333" strokeWidth="1.5"/>
        {/* Delivery box */}
        <rect x="58" y="10" width="22" height="18" rx="3" fill={O} opacity="0.9"/>
        <line x1="58" y1="18" x2="80" y2="18" stroke="#fff" strokeWidth="1" opacity="0.4"/>
        <text x="69" y="22" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">⚡</text>
        {/* Front wheel */}
        <circle className="wheel-front" cx="95" cy="46" r="10" stroke="#333" strokeWidth="2.5" fill="#1a1a1a"/>
        <circle cx="95" cy="46" r="4" fill="#333"/>
        <line x1="95" y1="36" x2="95" y2="56" stroke="#444" strokeWidth="1.5" className="wheel-front"/>
        <line x1="85" y1="46" x2="105" y2="46" stroke="#444" strokeWidth="1.5" className="wheel-front"/>
        {/* Handlebar */}
        <line x1="88" y1="22" x2="95" y2="35" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="84" y1="22" x2="93" y2="22" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Rider */}
        <circle cx="72" cy="8" r="6" fill="#333" stroke="#444" strokeWidth="1"/>
        <path d="M66 14 Q72 12 78 14 L76 24 L68 24 Z" fill="#333"/>
      </g>
    </svg>
  );
}

// Animated macro ring
function MacroRing({ label, val, max, color, size = 64 }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(val / max, 1);
  const dash = pct * circ;
  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}/>
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color, lineHeight: 1 }}>{val}</div>
        <div style={{ fontSize: 8, color: "#444", letterSpacing: "0.06em" }}>/{max}</div>
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

function Slider({ label, val, max, color, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: "'Space Grotesk',monospace", fontSize: 14, fontWeight: 700, color }}>{val}g</span>
      </div>
      <div style={{ position: "relative" }}>
        <input type="range" min={20} max={max} value={val} onChange={e => onChange(+e.target.value)}
          style={{ width: "100%", accentColor: color, height: 3 }}/>
      </div>
    </div>
  );
}

export default function MacroSetup({ onStart }) {
  const [macros, setMacros] = useState({ goal: "recomp", protein: 160, carbs: 180, fat: 60, consumed: { protein: 85, carbs: 90, fat: 32 } });
  const [hoveredGoal, setHoveredGoal] = useState(null);

  const rem = {
    p: Math.max(macros.protein - macros.consumed.protein, 0),
    c: Math.max(macros.carbs - macros.consumed.carbs, 0),
    f: Math.max(macros.fat - macros.consumed.fat, 0),
  };

  function handleStart() {
    const opening = `I'm on a ${GOALS[macros.goal]} plan. I still need ${rem.p}g protein, ${rem.c}g carbs, and ${rem.f}g fat today. Find me the best high-protein meal options from Swiggy near me. Search restaurants and also check Instamart.`;
    onStart(macros, opening);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, button { font-family: inherit; }
        input[type=range] { cursor: pointer; }
        input:focus { outline: none; }
        .goal-btn:hover { transform: translateY(-2px); }
        .start-btn:hover { transform: translateY(-1px); box-shadow: 0 16px 48px rgba(252,128,25,0.5) !important; }
        .start-btn:active { transform: translateY(0); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.05)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${O}18 0%, transparent 70%)`, animation: "pulse-ring 4s ease-in-out infinite" }}/>
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${O}10 0%, transparent 70%)`, animation: "pulse-ring 4s ease-in-out 2s infinite" }}/>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 460, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "48px 0 32px", animation: "fadeUp 0.6s ease-out" }}>
          <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 16 }}>
            <ScooterSVG />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 8 }}>
            Fit<span style={{ color: O }}>Order</span>
          </h1>
          <p style={{ fontSize: 13, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
            Swiggy Builders Club · Macro-Aware Meal Agent
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, background: "#111", border: "1px solid #1e1e1e", borderRadius: 99, padding: "6px 14px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", animation: "pulse-ring 1.5s infinite" }}/>
            <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>DEMO MODE · Swiggy Food + Instamart MCP</span>
          </div>
        </div>

        {/* Goal selector */}
        <div style={{ marginBottom: 24, animation: "fadeUp 0.6s ease-out 0.1s both" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Your Goal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(GOALS).map(([k, v]) => {
              const active = macros.goal === k;
              return (
                <button key={k} className="goal-btn"
                  onClick={() => setMacros(m => ({ ...m, goal: k }))}
                  onMouseEnter={() => setHoveredGoal(k)}
                  onMouseLeave={() => setHoveredGoal(null)}
                  style={{
                    background: active ? O : "#111",
                    color: active ? "#fff" : "#444",
                    border: `1px solid ${active ? O : hoveredGoal === k ? "#333" : "#1e1e1e"}`,
                    borderRadius: 12, padding: "12px 16px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.2s", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                  <span style={{ fontSize: 18 }}>{GOAL_ICONS[k]}</span>
                  <span>{v}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Macro rings - remaining visual */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px", marginBottom: 16, animation: "fadeUp 0.6s ease-out 0.2s both" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Still Needed Today</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <MacroRing label="Protein" val={rem.p} max={macros.protein} color="#4ade80" />
            <MacroRing label="Carbs" val={rem.c} max={macros.carbs} color="#60a5fa" />
            <MacroRing label="Fat" val={rem.f} max={macros.fat} color={O} />
            <MacroRing label="kcal" val={rem.p*4+rem.c*4+rem.f*9} max={macros.protein*4+macros.carbs*4+macros.fat*9} color="#c084fc" />
          </div>
        </div>

        {/* Targets */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px", marginBottom: 12, animation: "fadeUp 0.6s ease-out 0.3s both" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Daily Targets</div>
          <Slider label="Protein" val={macros.protein} max={300} color="#4ade80" onChange={v => setMacros(m => ({ ...m, protein: v }))} />
          <Slider label="Carbs" val={macros.carbs} max={400} color="#60a5fa" onChange={v => setMacros(m => ({ ...m, carbs: v }))} />
          <Slider label="Fat" val={macros.fat} max={150} color={O} onChange={v => setMacros(m => ({ ...m, fat: v }))} />
        </div>

        {/* Consumed */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px", marginBottom: 28, animation: "fadeUp 0.6s ease-out 0.4s both" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Already Eaten Today</div>
          <div style={{ fontSize: 11, color: "#2a2a2a", marginBottom: 16 }}>Drag to set what you've had so far</div>
          <Slider label="Protein eaten" val={macros.consumed.protein} max={macros.protein} color="#4ade80" onChange={v => setMacros(m => ({ ...m, consumed: { ...m.consumed, protein: v } }))} />
          <Slider label="Carbs eaten" val={macros.consumed.carbs} max={macros.carbs} color="#60a5fa" onChange={v => setMacros(m => ({ ...m, consumed: { ...m.consumed, carbs: v } }))} />
          <Slider label="Fat eaten" val={macros.consumed.fat} max={macros.fat} color={O} onChange={v => setMacros(m => ({ ...m, consumed: { ...m.consumed, fat: v } }))} />
        </div>

        <button className="start-btn" onClick={handleStart} style={{
          width: "100%", background: O, color: "#fff",
          border: "none", borderRadius: 16, padding: "18px",
          fontSize: 16, fontWeight: 800, cursor: "pointer",
          letterSpacing: "0.02em", fontFamily: "inherit",
          boxShadow: `0 8px 32px ${O}40`,
          transition: "all 0.2s",
          animation: "fadeUp 0.6s ease-out 0.5s both",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span>Find My Meals on Swiggy</span>
          <span style={{ fontSize: 20 }}>→</span>
        </button>

        <p style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "#252525", animation: "fadeUp 0.6s ease-out 0.6s both" }}>
          Powered by Claude API · Swiggy Builders Club MCP
        </p>
      </div>
    </div>
  );
}
