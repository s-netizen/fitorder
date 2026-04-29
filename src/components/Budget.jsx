import { useState, useEffect } from "react";
const O = "#FC8019";
const BORDER = "#1a1a1a";

const MOCK_ORDERS = [
  { date: "Apr 28", name: "Grilled Chicken Bowl", restaurant: "Freshmenu", price: 249, protein: 42, carbs: 38, fat: 8, emoji: "🍗" },
  { date: "Apr 27", name: "Whey + Oats Combo", restaurant: "Instamart", price: 299, protein: 32, carbs: 48, fat: 4, emoji: "💪" },
  { date: "Apr 26", name: "High Protein Egg Bowl", restaurant: "EatFit", price: 199, protein: 38, carbs: 22, fat: 12, emoji: "🍳" },
  { date: "Apr 25", name: "Chicken Quinoa Bowl", restaurant: "EatFit", price: 279, protein: 44, carbs: 52, fat: 9, emoji: "🥣" },
  { date: "Apr 24", name: "Paneer Tikka Wrap", restaurant: "Wow! Momo", price: 179, protein: 24, carbs: 42, fat: 11, emoji: "🌯" },
  { date: "Apr 23", name: "Tandoori Chicken Salad", restaurant: "Freshmenu", price: 219, protein: 36, carbs: 18, fat: 6, emoji: "🥗" },
  { date: "Apr 22", name: "Chicken Momos", restaurant: "Wow! Momo", price: 169, protein: 28, carbs: 32, fat: 8, emoji: "🥟" },
  { date: "Apr 21", name: "Greek Yogurt + Nuts", restaurant: "Instamart", price: 199, protein: 18, carbs: 22, fat: 14, emoji: "🥛" },
  { date: "Apr 20", name: "Grilled Chicken Bowl", restaurant: "Freshmenu", price: 249, protein: 42, carbs: 38, fat: 8, emoji: "🍗" },
  { date: "Apr 19", name: "Roasted Chana Pack", restaurant: "Instamart", price: 75, protein: 18, carbs: 28, fat: 5, emoji: "🫘" },
];

function Bar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: "#1a1a1a", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}/>
    </div>
  );
}

export default function Budget({ macros }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate MCP call to get_food_orders
    setLoading(true);
    setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: O, animation: `b 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
      </div>
      <style>{`@keyframes b{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ fontSize: 12, color: "#444" }}>Calling get_food_orders() on Swiggy MCP...</div>
    </div>
  );

  const totalSpend = orders.reduce((s, o) => s + o.price, 0);
  const totalProtein = orders.reduce((s, o) => s + o.protein, 0);
  const proteinPerRupee = (totalProtein / totalSpend).toFixed(2);
  const avgOrderValue = Math.round(totalSpend / orders.length);

  // Best and worst value
  const withRatio = orders.map(o => ({ ...o, ratio: o.protein / o.price }));
  const best = [...withRatio].sort((a, b) => b.ratio - a.ratio)[0];
  const worst = [...withRatio].sort((a, b) => a.ratio - b.ratio)[0];

  // Spend by restaurant
  const byRestaurant = {};
  orders.forEach(o => { byRestaurant[o.restaurant] = (byRestaurant[o.restaurant] || 0) + o.price; });
  const topRestaurants = Object.entries(byRestaurant).sort((a, b) => b[1] - a[1]);

  // Macro efficiency score (0-100)
  const efficiencyScore = Math.min(Math.round((proteinPerRupee / 0.25) * 100), 100);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap');`}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", marginBottom: 4 }}>Budget Tracker</div>
        <div style={{ fontSize: 11, color: "#444", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }}/>
          Pulled from get_food_orders() · Last {orders.length} orders
        </div>
      </div>

      {/* Big stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Total Spent", value: `₹${totalSpend}`, sub: "last 10 orders", color: O },
          { label: "Protein/Rupee", value: `${proteinPerRupee}g`, sub: "efficiency ratio", color: "#4ade80" },
          { label: "Avg Order", value: `₹${avgOrderValue}`, sub: "per order", color: "#60a5fa" },
          { label: "Macro Score", value: `${efficiencyScore}%`, sub: "efficiency rating", color: efficiencyScore >= 70 ? "#4ade80" : efficiencyScore >= 40 ? O : "#f87171" },
        ].map(s => (
          <div key={s.label} style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Efficiency score bar */}
      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Macro Efficiency</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: efficiencyScore >= 70 ? "#4ade80" : O }}>{efficiencyScore >= 70 ? "Excellent" : efficiencyScore >= 40 ? "Good" : "Improve"}</div>
        </div>
        <Bar pct={efficiencyScore} color={efficiencyScore >= 70 ? "#4ade80" : efficiencyScore >= 40 ? O : "#f87171"} height={8}/>
        <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>
          You get <span style={{ color: "#4ade80", fontWeight: 700 }}>{proteinPerRupee}g protein per ₹1</span> spent. Target: 0.25g/₹
        </div>
      </div>

      {/* Best / Worst value */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Best Value</div>
          <div style={{ fontSize: 14 }}>{best.emoji}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#eee", marginTop: 4 }}>{best.name}</div>
          <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>{(best.ratio * 100).toFixed(0)}g P per ₹100</div>
          <div style={{ fontSize: 11, color: "#444" }}>₹{best.price}</div>
        </div>
        <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 9, color: "#f87171", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Lowest Efficiency</div>
          <div style={{ fontSize: 14 }}>{worst.emoji}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#eee", marginTop: 4 }}>{worst.name}</div>
          <div style={{ fontSize: 11, color: "#f87171", marginTop: 2 }}>{(worst.ratio * 100).toFixed(0)}g P per ₹100</div>
          <div style={{ fontSize: 11, color: "#444" }}>₹{worst.price}</div>
        </div>
      </div>

      {/* Spend by restaurant */}
      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Spend by Restaurant</div>
        {topRestaurants.map(([name, spend]) => (
          <div key={name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>{name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>₹{spend}</span>
            </div>
            <Bar pct={(spend / totalSpend) * 100} color={O} height={5}/>
          </div>
        ))}
      </div>

      {/* Order history */}
      <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Recent Orders</div>
        {orders.map((o, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < orders.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{o.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd" }}>{o.name}</div>
                <div style={{ fontSize: 10, color: "#444" }}>{o.date} · {o.restaurant}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>₹{o.price}</div>
              <div style={{ fontSize: 10, color: "#4ade80" }}>{o.protein}g P</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
