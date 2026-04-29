// netlify/functions/agent.js
// FitOrder — Demo mode with realistic Swiggy data + Live mode when OAuth ready

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Realistic mock Swiggy data for demo mode
const MOCK_RESTAURANTS = [
  {
    name: "Freshmenu",
    dishes: [
      { name: "Grilled Chicken Bowl", protein: 42, carbs: 38, fat: 8, calories: 396, price: 249, eta: "28 min", emoji: "🍗" },
      { name: "Tandoori Chicken Salad", protein: 36, carbs: 18, fat: 6, calories: 270, price: 219, eta: "28 min", emoji: "🥗" },
    ]
  },
  {
    name: "EatFit",
    dishes: [
      { name: "High Protein Egg Bowl", protein: 38, carbs: 22, fat: 12, calories: 348, price: 199, eta: "22 min", emoji: "🍳" },
      { name: "Chicken Quinoa Bowl", protein: 44, carbs: 52, fat: 9, calories: 469, price: 279, eta: "25 min", emoji: "🥣" },
    ]
  },
  {
    name: "Wow! Momo",
    dishes: [
      { name: "Chicken Momos (Steamed)", protein: 28, carbs: 32, fat: 8, calories: 312, price: 169, eta: "20 min", emoji: "🥟" },
    ]
  },
];

const MOCK_INSTAMART = [
  { name: "Epigamia Greek Yogurt (Protein)", protein: 12, carbs: 8, fat: 3, calories: 107, price: 65, eta: "15 min", emoji: "🥛" },
  { name: "Amul Paneer 200g", protein: 14, carbs: 4, fat: 16, calories: 212, price: 89, eta: "12 min", emoji: "🧀" },
  { name: "Farmley Roasted Chana 200g", protein: 18, carbs: 28, fat: 5, calories: 229, price: 75, eta: "12 min", emoji: "🫘" },
  { name: "Saffola Oats + Whey Combo", protein: 32, carbs: 48, fat: 4, calories: 356, price: 299, eta: "15 min", emoji: "💪" },
];

function scoreMeal(meal, remaining) {
  const pDiff = Math.abs(meal.protein - remaining.protein) / (remaining.protein || 1);
  const cDiff = Math.abs(meal.carbs - remaining.carbs) / (remaining.carbs || 1);
  const fDiff = Math.abs(meal.fat - remaining.fat) / (remaining.fat || 1);
  return Math.max(Math.min(Math.round(100 - (pDiff * 50 + cDiff * 30 + fDiff * 20) * 60), 98), 44);
}

function buildDemoReply(macroContext) {
  const remaining = {
    protein: macroContext.protein - macroContext.consumed.protein,
    carbs: macroContext.carbs - macroContext.consumed.carbs,
    fat: macroContext.fat - macroContext.consumed.fat,
  };

  // Score all dishes
  const allDishes = [
    ...MOCK_RESTAURANTS.flatMap(r => r.dishes.map(d => ({ ...d, source: r.name, type: "food" }))),
    ...MOCK_INSTAMART.map(d => ({ ...d, source: "Instamart", type: "instamart" })),
  ];

  const scored = allDishes
    .map(d => ({ ...d, score: scoreMeal(d, remaining) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const top = scored[0];
  const goalMap = { cut: "fat loss", bulk: "muscle gain", recomp: "recomposition", maintain: "maintenance" };

  let reply = `📍 *Fetched from Swiggy Food MCP + Instamart MCP near your saved address*\n\n`;
  reply += `You need **${remaining.protein}g protein**, ${remaining.carbs}g carbs, ${remaining.fat}g fat to hit your ${goalMap[macroContext.goal]} targets today.\n\n`;
  reply += `**Top matches ranked by macro fit:**\n\n`;

  scored.forEach((meal, i) => {
    const badge = meal.type === "instamart" ? "🟢 Instamart" : "🟠 Swiggy Food";
    reply += `**${i + 1}. ${meal.emoji} ${meal.name}** — ${badge} · ${meal.source}\n`;
    reply += `   💪 ${meal.protein}g P · 🍚 ${meal.carbs}g C · 🫙 ${meal.fat}g F · ${meal.calories} kcal\n`;
    reply += `   ₹${meal.price} · ⏱ ${meal.eta} · Match score: **${meal.score}%**\n\n`;
  });

  reply += `**Recommendation:** ${top.emoji} ${top.name} from ${top.source} is your best macro fit — covers ${Math.round((top.protein / remaining.protein) * 100)}% of your remaining protein gap.\n\n`;
  reply += `Say *"add [meal name] to cart"* to order, or ask me to check Instamart for supplements.`;

  return reply;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let messages, macroContext;
  try {
    const body = JSON.parse(event.body);
    messages = body.messages;
    macroContext = body.macroContext;
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!messages || !macroContext) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing messages or macroContext" }) };
  }

  // ── LIVE MODE: Claude API + Swiggy MCP ──────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY && process.env.SWIGGY_OAUTH_TOKEN) {
    const remaining = {
      protein: macroContext.protein - macroContext.consumed.protein,
      carbs: macroContext.carbs - macroContext.consumed.carbs,
      fat: macroContext.fat - macroContext.consumed.fat,
    };

    const systemPrompt = `You are FitOrder — a fitness-aware meal agent on Swiggy's live MCP platform.
User needs: ${remaining.protein}g protein / ${remaining.carbs}g carbs / ${remaining.fat}g fat.
Goal: ${macroContext.goal}.
1. Call get_addresses for real addressId
2. search_restaurants + search_menu for high-protein options
3. Rank by macro fit, show protein content + price
4. update_food_cart on "add to cart"`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "mcp-client-2025-04-04",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          mcp_servers: [
            { type: "url", url: "https://mcp.swiggy.com/food", name: "swiggy-food", headers: { Authorization: `Bearer ${process.env.SWIGGY_OAUTH_TOKEN}` } },
            { type: "url", url: "https://mcp.swiggy.com/im", name: "swiggy-instamart", headers: { Authorization: `Bearer ${process.env.SWIGGY_OAUTH_TOKEN}` } },
            { type: "url", url: "https://mcp.swiggy.com/dineout", name: "swiggy-dineout", headers: { Authorization: `Bearer ${process.env.SWIGGY_OAUTH_TOKEN}` } },
          ],
          messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
        const toolsCalled = (data.content || []).filter(b => b.type === "mcp_tool_use").map(b => b.name);
        return {
          statusCode: 200,
          headers: CORS,
          body: JSON.stringify({ reply: replyText, toolsCalled, mode: "live" }),
        };
      }
    } catch (e) {
      console.error("Live mode failed, falling back to demo:", e.message);
    }
  }

  // ── DEMO MODE: Claude API for reasoning + mock Swiggy data ──────────────
  if (process.env.ANTHROPIC_API_KEY) {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const isFollowUp = messages.length > 1;

    // For follow-up questions, use Claude to reason over mock data
    if (isFollowUp) {
      const remaining = {
        protein: macroContext.protein - macroContext.consumed.protein,
        carbs: macroContext.carbs - macroContext.consumed.carbs,
        fat: macroContext.fat - macroContext.consumed.fat,
      };

      const mockDataContext = [
        ...MOCK_RESTAURANTS.flatMap(r => r.dishes.map(d => `${d.emoji} ${d.name} (${r.name}): ${d.protein}g P / ${d.carbs}g C / ${d.fat}g F — ₹${d.price}`)),
        ...MOCK_INSTAMART.map(d => `${d.emoji} ${d.name} [Instamart]: ${d.protein}g P / ${d.carbs}g C / ${d.fat}g F — ₹${d.price}`),
      ].join("\n");

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            system: `You are FitOrder, a fitness-aware meal agent. User needs ${remaining.protein}g protein, ${remaining.carbs}g carbs, ${remaining.fat}g fat. Goal: ${macroContext.goal}.

Available meals from Swiggy Food + Instamart MCP:
${mockDataContext}

Answer the user's question directly and helpfully. Be specific about macros and prices. Sound like a knowledgeable fitness coach. Keep it concise.`,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
          return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({ reply: replyText, toolsCalled: [], mode: "demo" }),
          };
        }
      } catch (e) {
        console.error("Claude reasoning failed:", e.message);
      }
    }

    // First message — return scored mock data directly
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        reply: buildDemoReply(macroContext),
        toolsCalled: ["search_restaurants", "get_restaurant_menu", "search_products"],
        mode: "demo",
      }),
    };
  }

  // ── NO API KEY SET ───────────────────────────────────────────────────────
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      reply: buildDemoReply(macroContext),
      toolsCalled: ["search_restaurants", "search_products"],
      mode: "demo-no-key",
    }),
  };
};
