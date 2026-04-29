import { useState, useRef, useEffect } from "react";
import { useAgent } from "./hooks/useAgent.js";

const O = "#FC8019";
const BG = "#080808";
const CARD = "#111";
const BORDER = "#1a1a1a";
const GOALS = { cut: "Fat Loss", bulk: "Muscle Gain", recomp: "Recomposition", maintain: "Maintain" };
const GOAL_ICONS = { cut: "🔥", bulk: "💪", recomp: "⚡", maintain: "🎯" };
const QUICK_PROMPTS = [
  { label: "🛒 Add best to cart", text: "Add the best option to my cart" },
  { label: "🥦 Veg only", text: "Show me vegetarian options only" },
  { label: "💊 Instamart protein", text: "Check Instamart for protein supplements" },
  { label: "💰 Under ₹250", text: "Find options under ₹250" },
];

function Scooter({ size = 90 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 66" fill="none">
      <style>{`
        .wb{animation:spin 0.9s linear infinite;transform-origin:28px 50px}
        .wf{animation:spin 0.9s linear infinite;transform-origin:95px 50px}
        .sb{animation:bob 2.2s ease-in-out infinite}
        .sl1{animation:sl 0.7s ease-out infinite}
        .sl2{animation:sl 0.7s ease-out 0.15s infinite}
        .sl3{animation:sl 0.7s ease-out 0.3s infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes sl{0%{opacity:0.8;transform:translateX(0)}100%{opacity:0;transform:translateX(-18px)}}
      `}</style>
      <line className="sl1" x1="2" y1="34" x2="18" y2="34" stroke={O} strokeWidth="2" strokeLinecap="round"/>
      <line className="sl2" x1="2" y1="40" x2="12" y2="40" stroke={O} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line className="sl3" x1="2" y1="28" x2="8" y2="28" stroke={O} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <g className="sb">
        <circle className="wb" cx="28" cy="50" r="11" stroke="#2a2a2a" strokeWidth="2.5" fill="#141414"/>
        <circle cx="28" cy="50" r="4" fill="#2a2a2a"/>
        <path d="M28 42 Q42 22 62 24 L78 24 L83 32 L88 32 Q93 32 95 38 L97 38" stroke={O} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M62 24 L60 40 L83 40 L83 32" fill="#141414" stroke="#222" strokeWidth="1.5"/>
        <rect x="60" y="10" width="22" height="18" rx="3" fill={O} opacity="0.95"/>
        <line x1="60" y1="19" x2="82" y2="19" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <text x="71" y="23" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">⚡</text>
        <circle className="wf" cx="95" cy="50" r="11" stroke="#2a2a2a" strokeWidth="2.5" fill="#141414"/>
        <circle cx="95" cy="50" r="4" fill="#2a2a2a"/>
        <line x1="90" y1="24" x2="97" y2="38" stroke="#444" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="86" y1="24" x2="95" y2="24" stroke="#444" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="74" cy="9" r="6" fill="#2a2a2a" stroke="#333" strokeWidth="1"/>
        <path d="M68 15 Q74 13 80 15 L78 26 L70 26 Z" fill="#2a2a2a"/>
      </g>
    </svg>
  );
}

function Ring({ label, val, max, color, size = 54 }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(val / (max || 1), 1);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth="4.5"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4.5"
            strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color, lineHeight: 1 }}>{val}</div>
          <div style={{ fontSize: 7, color: "#333" }}>/{max}</div>
        </div>
      </div>
      <div style={{ fontSize: 8, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 5 }}>{label}</div>
    </div>
  );
}

function MealCard({ name, restaurant, protein, carbs, fat, price, eta, score, source, emoji, onAdd }) {
  const [added, setAdded] = useState(false);
  const isInsta = source === "Instamart" || restaurant === "Instamart";
  function handleAdd() { setAdded(true); onAdd?.(name); setTimeout(() => setAdded(false), 2500); }
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
      {score >= 85 && <div style={{ position: "absolute", top: 0, right: 0, background: O, fontSize: 7, fontWeight: 800, color: "#fff", padding: "2px 8px", borderBottomLeftRadius: 6, letterSpacing: "0.1em" }}>TOP PICK</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>{emoji || "🍽"}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#eee", lineHeight: 1.3, fontFamily: "'Space Grotesk',sans-serif" }}>{name}</div>
            <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "#333" }}>{restaurant}</span>
              <span style={{ fontSize: 7, fontWeight: 700, background: isInsta ? "#0a1a0a" : "#1a0e00", color: isInsta ? "#4ade80" : O, border: `1px solid ${isInsta ? "#4ade8022" : O+"22"}`, padding: "1px 5px", borderRadius: 99, letterSpacing: "0.06em" }}>
                {isInsta ? "INSTAMART" : "SWIGGY"}
              </span>
            </div>
          </div>
        </div>
        {score > 0 && <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: score >= 80 ? "#4ade80" : score >= 60 ? O : "#f87171", fontFamily: "'Space Grotesk',sans-serif" }}>{score}%</div>
          <div style={{ fontSize: 7, color: "#333", letterSpacing: "0.08em" }}>MATCH</div>
        </div>}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[["P", protein, "#4ade80"], ["C", carbs, "#60a5fa"], ["F", fat, O]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#1a1a1a", borderRadius: 6, padding: "3px 7px", display: "flex", gap: 3, alignItems: "center" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c }}/>
            <span style={{ fontFamily: "'Space Grotesk',monospace", fontSize: 10, color: "#555" }}>
              <span style={{ color: "#ccc", fontWeight: 700 }}>{v}</span>g {l}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>₹{price}</span>
          {eta && <span style={{ fontSize: 11, color: "#333" }}>⏱ {eta}</span>}
        </div>
        <button onClick={handleAdd} style={{ background: added ? "#0a200a" : O, color: added ? "#4ade80" : "#fff", border: added ? "1px solid #4ade8033" : "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
          {added ? "✓ Added" : "+ Cart"}
        </button>
      </div>
    </div>
  );
}

function parseMeals(text) {
  const cards = []; let current = null;
  for (const line of text.split("\n")) {
    const emojiMatch = line.match(/([🍗🍳🥣🥟🥗🥛💪🫘🧀🍽])/u);
    const boldMatch = line.match(/\*\*\d+\.\s+(.*?)\*\*/) || (emojiMatch && line.match(/\*\*(.*?)\*\*/));
    if (boldMatch && line.match(/\*\*/)) {
      if (current?.name) cards.push(current);
      const rawName = (boldMatch[1] || "").replace(/[🍗🍳🥣🥟🥗🥛💪🫘🧀·—\-]/gu, "").trim();
      if (!rawName || rawName.length < 3) continue;
      current = { name: rawName, emoji: emojiMatch?.[1] || "🍽", restaurant: "", protein: 0, carbs: 0, fat: 0, price: 0, eta: "", score: 0, source: "Swiggy Food" };
    }
    if (!current) continue;
    const p = line.match(/💪\s*(\d+)g|(\d+)g\s*[Pp]rotein/); if (p) current.protein = +(p[1]||p[2]);
    const c = line.match(/🍚\s*(\d+)g|(\d+)g\s*[Cc]arb/); if (c) current.carbs = +(c[1]||c[2]);
    const f = line.match(/🫙\s*(\d+)g|(\d+)g\s*[Ff]at/); if (f) current.fat = +(f[1]||f[2]);
    const pr = line.match(/₹(\d+)/); if (pr) current.price = +pr[1];
    const et = line.match(/(\d+)\s*min/); if (et) current.eta = `${et[1]} min`;
    const sc = line.match(/\*\*(\d+)%/); if (sc) current.score = +sc[1];
    if (line.includes("Instamart")) current.source = "Instamart";
    const rm = line.match(/·\s+(EatFit|Freshmenu|Wow! Momo|Keventers|Instamart)/); if (rm) current.restaurant = rm[1];
  }
  if (current?.name) cards.push(current);
  return cards.filter(c => c.name && (c.protein > 0 || c.price > 0));
}

function renderMd(text) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 5 }}/>;
    const parts = line.split(/\*\*(.*?)\*\*/g).map((p, j) =>
      j % 2 === 1 ? <strong key={j} style={{ color: "#ddd", fontWeight: 700 }}>{p}</strong> : p
    );
    const isBullet = /^[-*]\s/.test(line.trim());
    return <div key={i} style={{ display: "flex", gap: isBullet ? 7 : 0, marginBottom: 2 }}>
      {isBullet && <span style={{ color: O, flexShrink: 0 }}>·</span>}
      <span style={{ lineHeight: 1.65 }}>{parts}</span>
    </div>;
  });
}

function AgentMsg({ content, onAdd }) {
  const cards = parseMeals(content);
  const textOnly = content.split("\n").filter(l => {
    const hasEmoji = /[🍗🍳🥣🥟🥗🥛💪🫘🧀]/.test(l);
    const hasMacro = /\d+g.*[PCF]|₹\d+|\d+%.*match/i.test(l);
    return !(hasEmoji && hasMacro);
  }).join("\n").trim();
  return (
    <div>
      {textOnly && <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 14px 14px 14px", padding: "10px 14px", marginBottom: cards.length ? 8 : 0, fontSize: 12.5, color: "#aaa", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7 }}>{renderMd(textOnly)}</div>}
      {cards.map((c, i) => <MealCard key={i} {...c} onAdd={onAdd}/>)}
    </div>
  );
}

function Bubble({ msg, onAdd }) {
  const isUser = msg.role === "user";
  if (isUser) return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
      <div style={{ maxWidth: "80%", background: O, borderRadius: "14px 14px 4px 14px", padding: "10px 14px", fontSize: 12.5, color: "#fff", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>{msg.content}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: O, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 1, boxShadow: `0 0 10px ${O}44` }}>⚡</div>
      <div style={{ flex: 1 }}><AgentMsg content={msg.content} onAdd={onAdd}/></div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: O, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>⚡</div>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 14px 14px 14px", padding: "10px 14px", display: "flex", gap: 4 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: O, animation: `b 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
        <style>{`@keyframes b{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
      </div>
    </div>
  );
}

export default function App() {
  const [macros, setMacros] = useState({ goal: "recomp", protein: 160, carbs: 180, fat: 60, consumed: { protein: 85, carbs: 90, fat: 32 } });
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState("");
  const agent = useAgent(macros);
  const chatEnd = useRef(null);

  const rem = {
    p: Math.max(macros.protein - macros.consumed.protein, 0),
    c: Math.max(macros.carbs - macros.consumed.carbs, 0),
    f: Math.max(macros.fat - macros.consumed.fat, 0),
  };

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [agent.messages, agent.loading]);

  function handleStart() {
    setStarted(true);
    const opening = `I'm on a ${GOALS[macros.goal]} plan. I still need ${rem.p}g protein, ${rem.c}g carbs, ${rem.f}g fat today. Find me the best high-protein meal options from Swiggy near me and check Instamart too.`;
    agent.startSession(opening, macros);
  }

  function send(text) {
    const msg = text || input.trim();
    if (!msg || agent.loading) return;
    agent.sendMessage(msg);
    setInput("");
  }

  const setM = (key) => (v) => setMacros(m => ({ ...m, [key]: v }));
  const setC = (key) => (v) => setMacros(m => ({ ...m, consumed: { ...m.consumed, [key]: v } }));

  return (
    <div style={{ height: "100vh", width: "100vw", background: BG, display: "flex", fontFamily: "'DM Sans',sans-serif", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button{font-family:inherit}
        input:focus{outline:none}
        input[type=range]{cursor:pointer}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:99px}
        .gbtn:hover{transform:translateY(-1px);border-color:#333!important}
        .sbtn:hover{box-shadow:0 12px 40px rgba(252,128,25,0.55)!important;transform:translateY(-1px)}
        .qp:hover{border-color:#333!important;color:#777!important}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{opacity:0.12}50%{opacity:0.25}}
        @keyframes floatIcon{0%{opacity:0;transform:translateY(60px)}15%{opacity:0.045}85%{opacity:0.045}100%{opacity:0;transform:translateY(-70px)}}
        @keyframes demoPulse{0%,100%{opacity:0.5;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "30%", left: "35%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${O}18 0%, transparent 70%)`, animation: "glow 6s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }}/>

      {/* ── LEFT: Setup panel ─────────────────────────────────────────────── */}
      <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1, background: "#0a0a0a" }}>

        {/* Logo area */}
        <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Scooter size={72}/>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>Fit<span style={{ color: O }}>Order</span></div>
              <div style={{ fontSize: 8, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Swiggy Builders Club</div>
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#110a00", border: "1px solid #2a1800", borderRadius: 99, padding: "3px 9px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", animation: "demoPulse 1.5s infinite" }}/>
            <span style={{ fontSize: 8, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>DEMO · Food + Instamart MCP</span>
          </div>
        </div>

        {/* Scrollable config */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>

          {/* Goal */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 7 }}>Goal</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {Object.entries(GOALS).map(([k, v]) => (
                <button key={k} className="gbtn" onClick={() => setMacros(m => ({ ...m, goal: k }))} style={{
                  background: macros.goal === k ? O : "#111", color: macros.goal === k ? "#fff" : "#3a3a3a",
                  border: `1px solid ${macros.goal === k ? O : BORDER}`, borderRadius: 9, padding: "7px 8px",
                  fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.18s",
                  textAlign: "left", display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ fontSize: 13 }}>{GOAL_ICONS[k]}</span><span>{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Macro rings */}
          <div style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 8px", marginBottom: 10 }}>
            <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Still Needed Today</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <Ring label="Protein" val={rem.p} max={macros.protein} color="#4ade80"/>
              <Ring label="Carbs" val={rem.c} max={macros.carbs} color="#60a5fa"/>
              <Ring label="Fat" val={rem.f} max={macros.fat} color={O}/>
              <Ring label="kcal" val={rem.p*4+rem.c*4+rem.f*9} max={macros.protein*4+macros.carbs*4+macros.fat*9} color="#c084fc"/>
            </div>
          </div>

          {/* Sliders */}
          {[
            { label: "Daily Targets", items: [
              { name: "Protein", val: macros.protein, max: 300, color: "#4ade80", fn: setM("protein") },
              { name: "Carbs", val: macros.carbs, max: 400, color: "#60a5fa", fn: setM("carbs") },
              { name: "Fat", val: macros.fat, max: 150, color: O, fn: setM("fat") },
            ]},
            { label: "Eaten Today", items: [
              { name: "Protein", val: macros.consumed.protein, max: macros.protein, color: "#4ade80", fn: setC("protein") },
              { name: "Carbs", val: macros.consumed.carbs, max: macros.carbs, color: "#60a5fa", fn: setC("carbs") },
              { name: "Fat", val: macros.consumed.fat, max: macros.fat, color: O, fn: setC("fat") },
            ]},
          ].map(({ label, items }) => (
            <div key={label} style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>{label}</div>
              {items.map(s => (
                <div key={s.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{s.name}</span>
                    <span style={{ fontFamily: "'Space Grotesk',monospace", fontSize: 11, fontWeight: 700, color: s.color }}>{s.val}g</span>
                  </div>
                  <input type="range" min={20} max={s.max} value={s.val} onChange={e => s.fn(+e.target.value)} style={{ width: "100%", accentColor: s.color, height: 3 }}/>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <button className="sbtn" onClick={handleStart} style={{
            width: "100%", background: O, color: "#fff", border: "none",
            borderRadius: 11, padding: "13px", fontSize: 13, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.02em",
            boxShadow: `0 6px 28px ${O}44`, transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {started ? "🔄 Refresh Meals" : "⚡ Find My Meals"}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Chat panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1, overflow: "hidden" }}>

        {/* Floating icons */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {["🍗","🥗","🥚","💪","⚡","🥣","🫘","🧀"].map((ic, i) => (
            <div key={i} style={{ position: "absolute", left: `${8+i*12}%`, bottom: -20, fontSize: 14+(i%3)*6, opacity: 0, animation: `floatIcon ${7+i*0.8}s ease-in-out ${i*0.9}s infinite`, userSelect: "none" }}>{ic}</div>
          ))}
        </div>

        {/* Chat header */}
        <div style={{ padding: "13px 20px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0, background: "#080808" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#2a2a2a", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {started ? `${GOALS[macros.goal]} · Macro-Aware Agent` : "Set macros on the left → hit Find My Meals"}
          </div>
          {agent.toolActivity && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: O, animation: "demoPulse 0.8s infinite" }}/>
              <span style={{ fontSize: 9, color: "#3a3a3a", fontFamily: "'Space Grotesk',monospace" }}>{agent.toolActivity}</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", position: "relative", zIndex: 1 }}>
          {!started ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: 0.3 }}>
              <div style={{ fontSize: 52 }}>🍽</div>
              <div style={{ fontSize: 12, color: "#333", textAlign: "center", fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.6 }}>Configure your macros<br/>and hit Find My Meals →</div>
            </div>
          ) : (
            agent.messages.map((m, i) => (
              <div key={i} style={{ animation: "fadeIn 0.3s ease-out" }}>
                <Bubble msg={m} onAdd={name => send(`Add ${name} to my cart`)}/>
              </div>
            ))
          )}
          {agent.loading && <TypingDots/>}
          <div ref={chatEnd}/>
        </div>

        {/* Quick prompts */}
        {started && agent.messages.length <= 2 && !agent.loading && (
          <div style={{ padding: "0 20px 8px", display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0 }}>
            {QUICK_PROMPTS.map(q => (
              <button key={q.text} className="qp" onClick={() => send(q.text)} style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 99, padding: "5px 11px", fontSize: 10, color: "#3a3a3a", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>{q.label}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "11px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, flexShrink: 0, background: "#080808" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder={started ? "Ask about meals, macros, or 'add to cart'…" : "Set your macros first →"}
            disabled={!started}
            style={{ flex: 1, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 11, padding: "10px 15px", color: "#fff", fontSize: 13, opacity: started ? 1 : 0.4 }}/>
          <button onClick={() => send()} disabled={agent.loading || !input.trim() || !started} style={{
            width: 42, height: 42, flexShrink: 0,
            background: !agent.loading && input.trim() && started ? O : "#111",
            border: `1px solid ${!agent.loading && input.trim() && started ? O : BORDER}`,
            borderRadius: 10, fontSize: 17, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
            boxShadow: !agent.loading && input.trim() && started ? `0 4px 16px ${O}44` : "none",
          }}>→</button>
        </div>
      </div>
    </div>
  );
}
