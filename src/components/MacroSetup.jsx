// src/components/MacroSetup.jsx
import { useState } from "react";

const O = "#FC8019";
const BORDER = "#1e1e1e";
const CARD = "#141414";

const GOALS = {
  cut: "Fat Loss",
  bulk: "Muscle Gain",
  recomp: "Recomposition",
  maintain: "Maintain",
};

function Slider({ label, val, max, color, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          {label}
        </span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color }}>
          {val}g
        </span>
      </div>
      <input
        type="range" min={20} max={max} value={val}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: color, height: 3 }}
      />
    </div>
  );
}

export default function MacroSetup({ onStart }) {
  const [macros, setMacros] = useState({
    goal: "recomp",
    protein: 160, carbs: 180, fat: 60,
    consumed: { protein: 85, carbs: 90, fat: 32 },
  });

  const rem = {
    p: macros.protein - macros.consumed.protein,
    c: macros.carbs - macros.consumed.carbs,
    f: macros.fat - macros.consumed.fat,
  };

  function handleStart() {
    const opening = `I'm on a ${GOALS[macros.goal]} plan. I still need ${rem.p}g protein, ${rem.c}g carbs, and ${rem.f}g fat today. Find me the best high-protein meal options from Swiggy near me. Search restaurants and also check Instamart for any useful protein sources.`;
    onStart(macros, opening);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", fontFamily: "'DM Sans',sans-serif", color: "#fff" }}>
      {/* Hero */}
      <div style={{
        padding: "48px 24px 32px", textAlign: "center",
        background: `radial-gradient(ellipse at top, ${O}12 0%, transparent 60%)`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{
          width: 54, height: 54, background: O, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, margin: "0 auto 16px",
          boxShadow: `0 0 48px ${O}44`,
        }}>⚡</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>FitOrder</h1>
        <p style={{ fontSize: 13, color: "#444", letterSpacing: "0.05em" }}>
          Fitness-Aware Meal Agent · Swiggy Builders Club
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginTop: 14, background: "#0a1f0a", border: "1px solid #1a3a1a",
          borderRadius: 99, padding: "5px 14px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
          <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: "0.06em" }}>
            Live · Swiggy Food + Instamart MCP
          </span>
        </div>
      </div>

      <div style={{ padding: "28px 20px", maxWidth: 440, margin: "0 auto" }}>

        {/* Goal selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
            Your Goal
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(GOALS).map(([k, v]) => (
              <button key={k} onClick={() => setMacros(m => ({ ...m, goal: k }))} style={{
                flex: 1,
                background: macros.goal === k ? O : "#161616",
                color: macros.goal === k ? "#fff" : "#444",
                border: `1px solid ${macros.goal === k ? O : BORDER}`,
                borderRadius: 10, padding: "10px 2px",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s", fontFamily: "inherit",
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* Daily targets */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>
            Daily Targets
          </div>
          <Slider label="Protein" val={macros.protein} max={300} color="#4ade80"
            onChange={v => setMacros(m => ({ ...m, protein: v }))} />
          <Slider label="Carbs" val={macros.carbs} max={400} color="#60a5fa"
            onChange={v => setMacros(m => ({ ...m, carbs: v }))} />
          <Slider label="Fat" val={macros.fat} max={150} color={O}
            onChange={v => setMacros(m => ({ ...m, fat: v }))} />
        </div>

        {/* Already consumed */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
            Already Eaten Today
          </div>
          <div style={{ fontSize: 11, color: "#2a2a2a", marginBottom: 14 }}>What have you consumed so far?</div>
          <Slider label="Protein eaten" val={macros.consumed.protein} max={macros.protein} color="#4ade80"
            onChange={v => setMacros(m => ({ ...m, consumed: { ...m.consumed, protein: v } }))} />
          <Slider label="Carbs eaten" val={macros.consumed.carbs} max={macros.carbs} color="#60a5fa"
            onChange={v => setMacros(m => ({ ...m, consumed: { ...m.consumed, carbs: v } }))} />
          <Slider label="Fat eaten" val={macros.consumed.fat} max={macros.fat} color={O}
            onChange={v => setMacros(m => ({ ...m, consumed: { ...m.consumed, fat: v } }))} />
        </div>

        {/* Remaining summary */}
        <div style={{
          background: "linear-gradient(135deg, #1a0e00, #100700)",
          border: `1px solid ${O}22`, borderRadius: 16,
          padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 8,
        }}>
          {[
            { label: "Protein", val: rem.p, unit: "g", color: "#4ade80" },
            { label: "Carbs", val: rem.c, unit: "g", color: "#60a5fa" },
            { label: "Fat", val: rem.f, unit: "g", color: O },
            { label: "kcal", val: rem.p * 4 + rem.c * 4 + rem.f * 9, unit: "", color: "#c084fc" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: s.color }}>
                {s.val}{s.unit}
              </div>
              <div style={{ fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleStart} style={{
          width: "100%", background: O, color: "#fff",
          border: "none", borderRadius: 14, padding: "17px",
          fontSize: 15, fontWeight: 800, cursor: "pointer",
          letterSpacing: "0.02em", fontFamily: "inherit",
          boxShadow: `0 8px 32px ${O}40`,
        }}>
          Find My Meals on Swiggy →
        </button>

        <p style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "#2a2a2a" }}>
          Calls live Swiggy Food + Instamart MCP · Requires Swiggy account
        </p>
      </div>
    </div>
  );
}
