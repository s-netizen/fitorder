import { useState } from "react";
const O = "#FC8019";
const BORDER = "#1a1a1a";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MEAL_POOL = [
  { name:"Grilled Chicken Bowl", restaurant:"Freshmenu", protein:42, carbs:38, fat:8, price:249, emoji:"🍗", source:"Swiggy Food" },
  { name:"High Protein Egg Bowl", restaurant:"EatFit", protein:38, carbs:22, fat:12, price:199, emoji:"🍳", source:"Swiggy Food" },
  { name:"Chicken Quinoa Bowl", restaurant:"EatFit", protein:44, carbs:52, fat:9, price:279, emoji:"🥣", source:"Swiggy Food" },
  { name:"Tandoori Chicken Salad", restaurant:"Freshmenu", protein:36, carbs:18, fat:6, price:219, emoji:"🥗", source:"Swiggy Food" },
  { name:"Whey + Oats Combo", restaurant:"Instamart", protein:32, carbs:48, fat:4, price:299, emoji:"💪", source:"Instamart" },
  { name:"Greek Yogurt + Nuts", restaurant:"Instamart", protein:18, carbs:22, fat:14, price:199, emoji:"🥛", source:"Instamart" },
  { name:"Chicken Momos", restaurant:"Wow! Momo", protein:28, carbs:32, fat:8, price:169, emoji:"🥟", source:"Swiggy Food" },
  { name:"Paneer Tikka Wrap", restaurant:"Wow! Momo", protein:24, carbs:42, fat:11, price:179, emoji:"🌯", source:"Swiggy Food" },
  { name:"Roasted Chana Pack", restaurant:"Instamart", protein:18, carbs:28, fat:5, price:75, emoji:"🫘", source:"Instamart" },
];

function generatePlan(macros) {
  return DAYS.map((day, i) => {
    const shuffled = [...MEAL_POOL].sort(() => Math.sin(i * 7 + day.length) - 0.5);
    const meals = [];
    let totalP = 0, totalC = 0, totalF = 0;
    for (const m of shuffled) {
      if (totalP < macros.protein - 20 && meals.length < 3) {
        meals.push(m);
        totalP += m.protein; totalC += m.carbs; totalF += m.fat;
      }
    }
    const cost = meals.reduce((s, m) => s + m.price, 0);
    return { day, meals, totalP, totalC, totalF, cost };
  });
}

export default function WeekPlan({ macros }) {
  const [plan] = useState(() => generatePlan(macros));
  const [selected, setSelected] = useState(0);
  const totalWeeklyCost = plan.reduce((s, d) => s + d.cost, 0);
  const avgProtein = Math.round(plan.reduce((s, d) => s + d.totalP, 0) / 7);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "20px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", marginBottom: 4 }}>
          7-Day Meal Plan
        </div>
        <div style={{ fontSize: 12, color: "#555" }}>Based on your {macros.protein}g protein / {macros.carbs}g carb / {macros.fat}g fat targets</div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Weekly Cost", value: `₹${totalWeeklyCost}`, color: O },
          { label: "Avg Protein/Day", value: `${avgProtein}g`, color: "#4ade80" },
          { label: "Avg Cost/Day", value: `₹${Math.round(totalWeeklyCost/7)}`, color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, flex: 1, overflow: "hidden" }}>
        {/* Day selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
          {plan.map((d, i) => (
            <button key={d.day} onClick={() => setSelected(i)} style={{
              background: selected === i ? O : "#111",
              color: selected === i ? "#fff" : "#555",
              border: `1px solid ${selected === i ? O : BORDER}`,
              borderRadius: 10, padding: "10px 14px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
              textAlign: "left",
            }}>
              <div>{d.day}</div>
              <div style={{ fontSize: 10, color: selected === i ? "rgba(255,255,255,0.7)" : "#333", fontWeight: 400, marginTop: 2 }}>₹{d.cost}</div>
            </button>
          ))}
        </div>

        {/* Day detail */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {plan[selected] && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>{DAYS[selected]}'s Meals</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { l: "P", v: plan[selected].totalP, c: "#4ade80" },
                    { l: "C", v: plan[selected].totalC, c: "#60a5fa" },
                    { l: "F", v: plan[selected].totalF, c: O },
                  ].map(m => (
                    <div key={m.l} style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "3px 8px", fontFamily: "'Space Grotesk',monospace", fontSize: 11 }}>
                      <span style={{ color: m.c, fontWeight: 700 }}>{m.v}g</span>
                      <span style={{ color: "#333" }}> {m.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan[selected].meals.map((meal, i) => {
                const isInsta = meal.source === "Instamart";
                return (
                  <div key={i} style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 22 }}>{meal.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#eee", fontFamily: "'Space Grotesk',sans-serif" }}>{meal.name}</div>
                          <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: "#444" }}>{meal.restaurant}</span>
                            <span style={{ fontSize: 8, fontWeight: 700, background: isInsta ? "#0a1a0a" : "#1a0e00", color: isInsta ? "#4ade80" : O, border: `1px solid ${isInsta ? "#4ade8033" : O+"33"}`, padding: "1px 5px", borderRadius: 99, letterSpacing: "0.06em" }}>
                              {isInsta ? "INSTAMART" : "SWIGGY"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>₹{meal.price}</div>
                        <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>{meal.protein}g P</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ background: "#0d0d0d", border: `1px solid ${O}22`, borderRadius: 10, padding: "10px 14px", marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Day total</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>₹{plan[selected].cost}</span>
                  <span style={{ fontSize: 12, color: "#4ade80" }}>{plan[selected].totalP}g protein covered</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
