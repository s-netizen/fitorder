// src/components/Chat.jsx
import { useState, useRef, useEffect } from "react";

const O = "#FC8019";
const BG = "#0c0c0c";
const CARD = "#141414";
const BORDER = "#1e1e1e";

const GOALS = { cut: "Fat Loss", bulk: "Muscle Gain", recomp: "Recomposition", maintain: "Maintain" };

const QUICK_PROMPTS = [
  "Add the best option to my cart",
  "Check Instamart for protein too",
  "Show me veg options only",
  "What did I order last time?",
  "Stay under ₹250 total",
];

// Simple markdown renderer for bold, bullets, line breaks
function renderMarkdown(text) {
  return text
    .split("\n")
    .map((line, i) => {
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 1 ? <strong key={j} style={{ color: "#fff", fontWeight: 700 }}>{part}</strong> : part
      );
      // Bullet lines
      const isBullet = line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ");
      const isNumbered = /^\d+\./.test(line.trim());

      if (isBullet) {
        return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ color: O, flexShrink: 0, marginTop: 1 }}>·</span>
            <span>{parts}</span>
          </div>
        );
      }
      if (isNumbered) {
        return <div key={i} style={{ marginBottom: 6 }}>{parts}</div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
      return <div key={i} style={{ marginBottom: 3 }}>{parts}</div>;
    });
}

function TypingDots() {
  return (
    <div style={{
      display: "flex", gap: 5, padding: "10px 14px",
      background: CARD, borderRadius: "4px 16px 16px 16px",
      width: "fit-content", border: `1px solid ${BORDER}`,
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: O,
          animation: `bdot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bdot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 8, margin: "6px 0", alignItems: "flex-end",
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: O,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>⚡</div>
      )}
      <div style={{
        maxWidth: "80%",
        background: isUser ? O : CARD,
        border: isUser ? "none" : `1px solid ${BORDER}`,
        borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
        padding: "12px 16px",
        fontSize: 13, lineHeight: 1.75,
        color: isUser ? "#fff" : "#ccc",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {isUser ? msg.content : renderMarkdown(msg.content)}
      </div>
    </div>
  );
}

export default function Chat({ macros, messages, loading, toolActivity, mode, onSend, onReset }) {
  const [input, setInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function send() {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  }

  const rem = {
    p: macros.protein - macros.consumed.protein,
    c: macros.carbs - macros.consumed.carbs,
    f: macros.fat - macros.consumed.fat,
  };

  const isDemo = mode && mode.startsWith("demo");

  return (
    <div style={{ height: "100vh", background: BG, fontFamily: "'DM Sans',sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, button { font-family: inherit; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: O, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>FitOrder</div>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {GOALS[macros.goal]} · {mode === "live" ? "Live Swiggy MCP" : "Swiggy MCP Demo"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {/* Demo badge */}
          {isDemo && (
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              background: "#1a1200", border: "1px solid #3a2800",
              color: "#f59e0b", borderRadius: 99, padding: "3px 8px",
              textTransform: "uppercase",
            }}>Demo</div>
          )}
          {mode === "live" && (
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              background: "#0a1f0a", border: "1px solid #1a3a1a",
              color: "#4ade80", borderRadius: 99, padding: "3px 8px",
              textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
              Live
            </div>
          )}

          {/* Macro pills */}
          {[
            { l: "P", v: rem.p, c: "#4ade80" },
            { l: "C", v: rem.c, c: "#60a5fa" },
            { l: "F", v: rem.f, c: O },
          ].map(p => (
            <div key={p.l} style={{
              background: "#161616", border: `1px solid ${BORDER}`,
              borderRadius: 7, padding: "3px 8px",
              fontFamily: "'DM Mono',monospace", fontSize: 10,
            }}>
              <span style={{ color: p.c, fontWeight: 700 }}>{p.v}g</span>
              <span style={{ color: "#333" }}> {p.l}</span>
            </div>
          ))}
          <button onClick={onReset} style={{
            background: "#161616", border: `1px solid ${BORDER}`,
            color: "#444", borderRadius: 7, padding: "4px 10px",
            fontSize: 11, cursor: "pointer", marginLeft: 2,
          }}>← Back</button>
        </div>
      </div>

      {/* Tool activity bar */}
      {toolActivity && (
        <div style={{
          padding: "6px 16px", background: "#0a0a0a",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: O, animation: "tp 1s infinite" }} />
          <style>{`@keyframes tp{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
          <span style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono',monospace" }}>{toolActivity}</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && <div style={{ marginTop: 6 }}><TypingDots /></div>}
        <div ref={chatEnd} />
      </div>

      {/* Quick prompts */}
      {messages.length > 0 && messages.length <= 2 && !loading && (
        <div style={{ padding: "0 16px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => onSend(q)} style={{
              background: "#121212", border: `1px solid ${BORDER}`,
              borderRadius: 99, padding: "6px 12px",
              fontSize: 11, color: "#555", cursor: "pointer", fontFamily: "inherit",
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "12px 16px", borderTop: `1px solid ${BORDER}`,
        display: "flex", gap: 10, flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about meals, macros, add to cart…"
          style={{
            flex: 1, background: CARD,
            border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: "12px 16px", color: "#fff", fontSize: 14,
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 46, height: 46, flexShrink: 0,
          background: loading || !input.trim() ? "#1a1a1a" : O,
          border: "none", borderRadius: 12, fontSize: 18,
          cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>→</button>
      </div>
    </div>
  );
}
