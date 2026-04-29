import { useState } from "react";
const O = "#FC8019";
const BORDER = "#1a1a1a";

export default function Coach({ macros, onApplyTargets }) {
  const [coachLink] = useState("fitorder.app/coach/sanchit-2024");
  const [copied, setCopied] = useState(false);
  const [clientView, setClientView] = useState(false);
  const [coachTargets] = useState({ protein: 180, carbs: 160, fat: 55, goal: "recomp", clientName: "Client" });

  function copyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (clientView) return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap');`}</style>
      <button onClick={() => setClientView(false)} style={{ background: "#111", border: `1px solid ${BORDER}`, color: "#555", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginBottom: 20 }}>← Back</button>

      <div style={{ background: `linear-gradient(135deg, #1a0e00, #0d0d0d)`, border: `1px solid ${O}33`, borderRadius: 16, padding: "20px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>Client View</div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Targets set by your coach</div>
      </div>

      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 16 }}>Your Coach-Set Targets</div>
        {[
          { label: "Protein", val: coachTargets.protein, color: "#4ade80" },
          { label: "Carbs", val: coachTargets.carbs, color: "#60a5fa" },
          { label: "Fat", val: coachTargets.fat, color: O },
        ].map(m => (
          <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>{m.label}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: "'Space Grotesk',sans-serif" }}>{m.val}g</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10 }}>
          <span style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>Goal</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: O, borderRadius: 99, padding: "3px 12px" }}>Recomposition</span>
        </div>
      </div>

      <button onClick={() => { onApplyTargets(coachTargets); setClientView(false); }} style={{
        width: "100%", background: O, color: "#fff", border: "none",
        borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800,
        cursor: "pointer", fontFamily: "inherit",
        boxShadow: `0 6px 24px ${O}44`,
      }}>
        ⚡ Apply These Targets & Find Meals
      </button>
    </div>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap');`}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", marginBottom: 4 }}>Coach Mode</div>
        <div style={{ fontSize: 12, color: "#555" }}>Set targets for your client · They order, you track</div>
      </div>

      {/* How it works */}
      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 14 }}>How It Works</div>
        {[
          { step: "1", icon: "📐", title: "Set targets", desc: "You define protein, carbs, fat goals for your client" },
          { step: "2", icon: "🔗", title: "Share link", desc: "Client opens their personalized FitOrder link" },
          { step: "3", icon: "🍗", title: "They order", desc: "FitOrder shows only meals that fit their targets" },
          { step: "4", icon: "📊", title: "You track", desc: "See their order history and macro compliance" },
        ].map(s => (
          <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: O + "20", border: `1px solid ${O}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Coach link */}
      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}>Your Coach Link</div>
        <div style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Grotesk',monospace", fontSize: 12, color: "#666" }}>{coachLink}</span>
          <button onClick={copyLink} style={{ background: copied ? "#0a200a" : O, color: copied ? "#4ade80" : "#fff", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#444" }}>Share this with your client. Their macros are pre-loaded when they open it.</div>
      </div>

      {/* Current targets being shared */}
      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}>Targets in Your Link</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { l: "Protein", v: macros.protein, c: "#4ade80" },
            { l: "Carbs", v: macros.carbs, c: "#60a5fa" },
            { l: "Fat", v: macros.fat, c: O },
          ].map(m => (
            <div key={m.l} style={{ flex: 1, background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: m.c, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}g</div>
              <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "#555" }}>Adjust these using the sliders on the left, then copy the updated link.</div>
      </div>

      {/* Preview client view */}
      <button onClick={() => setClientView(true)} style={{
        width: "100%", background: "#111", color: "#888",
        border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px",
        fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s", marginBottom: 10,
      }}>
        👤 Preview Client View →
      </button>

      {/* Coming soon features */}
      <div style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px" }}>
        <div style={{ fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10 }}>Coming with Swiggy OAuth</div>
        {[
          "Real-time client order notifications",
          "Weekly compliance report",
          "Multi-client dashboard",
          "Coach-approved restaurant whitelist",
        ].map(f => (
          <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2a2a2a", flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: "#333" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
