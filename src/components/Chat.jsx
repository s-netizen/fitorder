import { useState, useRef, useEffect } from "react";

const O = "#FC8019";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#1a1a1a";
const GOALS = { cut: "Fat Loss", bulk: "Muscle Gain", recomp: "Recomposition", maintain: "Maintain" };

const QUICK_PROMPTS = [
  { label: "🛒 Add best to cart", text: "Add the best option to my cart" },
  { label: "🥦 Veg only", text: "Show me vegetarian options only" },
  { label: "💊 Instamart protein", text: "Check Instamart for protein supplements" },
  { label: "💰 Under ₹250", text: "Find options under ₹250" },
  { label: "📦 Past orders", text: "What did I order last time?" },
];

// Animated food icons floating in background
function FloatingIcons() {
  const icons = ["🍗", "🥗", "🥚", "💪", "🏃", "⚡", "🥣", "🧀"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <style>{`
        @keyframes floatUp { 0%{opacity:0;transform:translateY(100px) rotate(0deg)} 20%{opacity:0.06} 80%{opacity:0.06} 100%{opacity:0;transform:translateY(-100px) rotate(20deg)} }
      `}</style>
      {icons.map((icon, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${10 + (i * 12)}%`,
          bottom: "-20px",
          fontSize: 20 + (i % 3) * 8,
          animation: `floatUp ${6 + i * 0.7}s ease-in-out ${i * 0.8}s infinite`,
          userSelect: "none",
        }}>{icon}</div>
      ))}
    </div>
  );
}

// Pulsing dot for demo mode
function DemoBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#1a1200", border: "1px solid #3a2500",
      borderRadius: 99, padding: "3px 10px",
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", animation: "demoPulse 1.5s ease-in-out infinite" }}/>
      <style>{`@keyframes demoPulse{0%,100%{opacity:0.5;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
      <span style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Demo</span>
    </div>
  );
}

// Meal card parsed from agent response
function MealCard({ name, restaurant, protein, carbs, fat, price, eta, score, source, emoji, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const isInstamart = source === "Instamart" || restaurant === "Instamart";
  const srcColor = isInstamart ? "#4ade80" : O;

  function handleAdd() {
    setAdded(true);
    onAddToCart && onAddToCart(name);
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#161616" : CARD,
        border: `1px solid ${hovered ? O + "55" : BORDER}`,
        borderRadius: 16, padding: "14px 16px", marginBottom: 10,
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 32px ${O}18` : "none",
        position: "relative", overflow: "hidden",
      }}>
      {score >= 85 && (
        <div style={{ position: "absolute", top: 0, right: 0, background: O, fontSize: 8, fontWeight: 800, color: "#fff", padding: "3px 10px", borderBottomLeftRadius: 8, letterSpacing: "0.08em" }}>BEST MATCH</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 26 }}>{emoji || "🍽"}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: "#f0f0f0", lineHeight: 1.3 }}>{name}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
              <span style={{ fontSize: 11, color: "#444" }}>{restaurant}</span>
              <span style={{ fontSize: 8, fontWeight: 700, background: isInstamart ? "#0a200a" : "#1a0e00", color: srcColor, border: `1px solid ${srcColor}33`, padding: "1px 6px", borderRadius: 99, letterSpacing: "0.06em" }}>
                {isInstamart ? "INSTAMART" : "SWIGGY"}
              </span>
            </div>
          </div>
        </div>
        {score && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: score >= 80 ? "#4ade80" : score >= 60 ? O : "#f87171" }}>{score}%</div>
            <div style={{ fontSize: 8, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>Match</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { l: "P", v: protein, c: "#4ade80", u: "g" },
          { l: "C", v: carbs, c: "#60a5fa", u: "g" },
          { l: "F", v: fat, c: O, u: "g" },
        ].map(m => (
          <div key={m.l} style={{ background: "#1a1a1a", borderRadius: 8, padding: "4px 10px", display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.c, flexShrink: 0 }}/>
            <span style={{ fontFamily: "'Space Grotesk',monospace", fontSize: 11, color: "#666" }}>
              <span style={{ color: "#ddd", fontWeight: 700 }}>{m.v}</span>{m.u} {m.l}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>₹{price}</span>
          {eta && <span style={{ fontSize: 12, color: "#444" }}>⏱ {eta}</span>}
        </div>
        <button onClick={handleAdd} style={{
          background: added ? "#0a200a" : O,
          color: added ? "#4ade80" : "#fff",
          border: added ? "1px solid #4ade8033" : "none",
          borderRadius: 10, padding: "7px 14px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          transition: "all 0.2s", fontFamily: "inherit",
        }}>{added ? "✓ Added!" : "Add to Cart"}</button>
      </div>
    </div>
  );
}

// Parse meal cards from agent markdown response
function parseMealCards(text) {
  const cards = [];
  const lines = text.split("\n");
  let current = null;

  for (const line of lines) {
    const match = line.match(/\*\*\d+\.\s+(.*?)\*\*.*?([🍗🍳🥣🥟🥗🥛💪🫘🧀🍽])/u) ||
                  line.match(/([🍗🍳🥣🥟🥗🥛💪🫘🧀])\s+\*\*(.*?)\*\*/u);
    if (match) {
      if (current) cards.push(current);
      const name = (match[1] || match[2] || "").replace(/[🍗🍳🥣🥟🥗🥛💪🫘🧀]/g, "").trim();
      const emoji = (line.match(/[🍗🍳🥣🥟🥗🥛💪🫘🧀🍽]/u) || ["🍽"])[0];
      current = { name, emoji, restaurant: "", protein: 0, carbs: 0, fat: 0, price: 0, eta: "", score: 0, source: "Swiggy Food" };
    }
    if (current) {
      const pMatch = line.match(/(\d+)g.*?[Pp]rotein|[Pp]rotein.*?(\d+)g|💪\s*(\d+)g/);
      if (pMatch) current.protein = +(pMatch[1] || pMatch[2] || pMatch[3]);
      const cMatch = line.match(/(\d+)g.*?[Cc]arb|[Cc]arb.*?(\d+)g|🍚\s*(\d+)g/);
      if (cMatch) current.carbs = +(cMatch[1] || cMatch[2] || cMatch[3]);
      const fMatch = line.match(/(\d+)g.*?[Ff]at|[Ff]at.*?(\d+)g|🫙\s*(\d+)g/);
      if (fMatch) current.fat = +(fMatch[1] || fMatch[2] || fMatch[3]);
      const priceMatch = line.match(/₹(\d+)/);
      if (priceMatch) current.price = +priceMatch[1];
      const etaMatch = line.match(/(\d+)\s*min/);
      if (etaMatch) current.eta = `${etaMatch[1]} min`;
      const scoreMatch = line.match(/\*\*(\d+)%.*?match\*\*|\*\*(\d+)%\*\*/i);
      if (scoreMatch) current.score = +(scoreMatch[1] || scoreMatch[2]);
      const restaurantMatch = line.match(/·\s+([^·\n]+?)(?:\s*$|\s*·)/);
      if (restaurantMatch && !current.restaurant) current.restaurant = restaurantMatch[1].replace(/[🟢🟠]/g, "").trim();
      if (line.includes("Instamart")) current.source = "Instamart";
      if (line.includes("EatFit") || line.includes("Freshmenu") || line.includes("Wow")) current.restaurant = line.match(/EatFit|Freshmenu|Wow! Momo|Swiggy Food/)?.[0] || current.restaurant;
    }
  }
  if (current) cards.push(current);
  return cards.filter(c => c.name && (c.protein > 0 || c.price > 0));
}

// Render markdown text (non-card parts)
function renderText(text) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    const parts = line.split(/\*\*(.*?)\*\*/g).map((p, j) =>
      j % 2 === 1 ? <strong key={j} style={{ color: "#fff", fontWeight: 700 }}>{p}</strong> : p
    );
    const isBullet = /^[-*]\s/.test(line.trim());
    return (
      <div key={i} style={{ display: "flex", gap: isBullet ? 8 : 0, marginBottom: 3 }}>
        {isBullet && <span style={{ color: O, flexShrink: 0 }}>·</span>}
        <span>{parts}</span>
      </div>
    );
  });
}

function AgentBubble({ content, onAddToCart }) {
  const cards = parseMealCards(content);
  // Remove card lines from text
  const textLines = content.split("\n").filter(line => {
    const hasEmoji = /[🍗🍳🥣🥟🥗🥛💪🫘🧀]/.test(line);
    const hasMacro = /\d+g.*[PCF]|₹\d+|\d+%.*match/i.test(line);
    return !(hasEmoji && hasMacro) && !line.match(/\*\*\d+\.\s+[🍗🍳🥣🥟🥗🥛💪🫘🧀]/u);
  }).join("\n");

  return (
    <div style={{ maxWidth: "90%" }}>
      {textLines.trim() && (
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 16px", marginBottom: cards.length ? 10 : 0,
          fontSize: 13, lineHeight: 1.75, color: "#bbb",
          fontFamily: "'DM Sans',sans-serif",
        }}>
          {renderText(textLines.trim())}
        </div>
      )}
      {cards.map((card, i) => (
        <MealCard key={i} {...card} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}

function Bubble({ msg, onAddToCart }) {
  const isUser = msg.role === "user";
  if (!isUser) return (
    <div style={{ display: "flex", gap: 8, margin: "6px 0", alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: O, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>⚡</div>
      <AgentBubble content={msg.content} onAddToCart={onAddToCart} />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "row-reverse", margin: "6px 0" }}>
      <div style={{ maxWidth: "78%", background: O, borderRadius: "16px 16px 4px 16px", padding: "12px 16px", fontSize: 13, lineHeight: 1.65, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 8, margin: "6px 0", alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: O, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⚡</div>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 16px 16px 16px", padding: "12px 16px", display: "flex", gap: 5 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: O, animation: `bdot 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
        <style>{`@keyframes bdot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
      </div>
    </div>
  );
}

export default function Chat({ macros, messages, loading, toolActivity, mode, onSend, onReset }) {
  const [input, setInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    onSend(msg);
    setInput("");
  }

  const rem = {
    p: Math.max((macros.protein || 0) - (macros.consumed?.protein || 0), 0),
    c: Math.max((macros.carbs || 0) - (macros.consumed?.carbs || 0), 0),
    f: Math.max((macros.fat || 0) - (macros.consumed?.fat || 0), 0),
  };

  function handleAddToCart(mealName) {
    onSend(`Add ${mealName} to my Swiggy cart`);
  }

  return (
    <div style={{ height: "100vh", background: BG, fontFamily: "'DM Sans',sans-serif", color: "#fff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, button { font-family: inherit; }
        input:focus { outline: none; }
        .qprompt:hover { border-color: ${O}55 !important; color: #888 !important; transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 99px; }
        @keyframes slideIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes floatUp { 0%{opacity:0;transform:translateY(60px) rotate(0deg)} 20%{opacity:0.04} 80%{opacity:0.04} 100%{opacity:0;transform:translateY(-80px) rotate(15deg)} }
      `}</style>

      <FloatingIcons />

      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "relative", zIndex: 10, background: BG }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: O, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 0 16px ${O}44` }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em" }}>FitOrder</div>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase" }}>{GOALS[macros.goal]} · Swiggy MCP</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <DemoBadge />
          {[
            { l: "P", v: rem.p, c: "#4ade80" },
            { l: "C", v: rem.c, c: "#60a5fa" },
            { l: "F", v: rem.f, c: O },
          ].map(p => (
            <div key={p.l} style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "3px 8px", fontFamily: "'Space Grotesk',monospace", fontSize: 10 }}>
              <span style={{ color: p.c, fontWeight: 700 }}>{p.v}g</span>
              <span style={{ color: "#2a2a2a" }}> {p.l}</span>
            </div>
          ))}
          <button onClick={onReset} style={{ background: "#111", border: `1px solid ${BORDER}`, color: "#333", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>←</button>
        </div>
      </div>

      {/* Tool activity */}
      {toolActivity && (
        <div style={{ padding: "5px 16px", background: "#0d0d0d", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0, zIndex: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: O, animation: "demoPulse 0.8s infinite" }}/>
          <span style={{ fontSize: 11, color: "#333", fontFamily: "'Space Grotesk',monospace" }}>{toolActivity}</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", position: "relative", zIndex: 5 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ animation: "slideIn 0.3s ease-out" }}>
            <Bubble msg={m} onAddToCart={handleAddToCart} />
          </div>
        ))}
        {loading && <TypingDots />}
        <div ref={chatEnd} />
      </div>

      {/* Quick prompts */}
      {messages.length > 0 && messages.length <= 2 && !loading && (
        <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0, zIndex: 10 }}>
          {QUICK_PROMPTS.map(q => (
            <button key={q.text} className="qprompt" onClick={() => send(q.text)} style={{
              background: "#0d0d0d", border: `1px solid ${BORDER}`,
              borderRadius: 99, padding: "6px 12px",
              fontSize: 11, color: "#444", cursor: "pointer",
              transition: "all 0.15s", fontFamily: "inherit",
            }}>{q.label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, flexShrink: 0, zIndex: 10, background: BG }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about meals, macros, add to cart…"
          style={{ flex: 1, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14 }}/>
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          width: 46, height: 46, flexShrink: 0,
          background: loading || !input.trim() ? "#111" : O,
          border: `1px solid ${loading || !input.trim() ? BORDER : O}`,
          borderRadius: 12, fontSize: 18, cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", boxShadow: !loading && input.trim() ? `0 4px 16px ${O}44` : "none",
        }}>→</button>
      </div>
    </div>
  );
}
