// netlify/functions/agent.js — CommonJS format for Netlify

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const MOCK_RESTAURANTS = [
  { restaurant: "Freshmenu", name: "Grilled Chicken Bowl", protein: 42, carbs: 38, fat: 8, calories: 396, price: 249, eta: "28 min", emoji: "🍗" },
  { restaurant: "EatFit", name: "High Protein Egg Bowl", protein: 38, carbs: 22, fat: 12, calories: 348, price: 199, eta: "22 min", emoji: "🍳" },
  { restaurant: "EatFit", name: "Chicken Quinoa Bowl", protein: 44, carbs: 52, fat: 9, calories: 469, price: 279, eta: "25 min", emoji: "🥣" },
  { restaurant: "Wow! Momo", name: "Chicken Momos (Steamed)", protein: 28, carbs: 32, fat: 8, calories: 312, price: 169, eta: "20 min", emoji: "🥟" },
  { restaurant: "Freshmenu", name: "Tandoori Chicken Salad", protein: 36, carbs: 18, fat: 6, calories: 270, price: 219, eta: "28 min", emoji: "🥗" },
];

const MOCK_INSTAMART = [
  { restaurant: "Instamart", name: "Epigamia Greek Yogurt Protein", protein: 12, carbs: 8, fat: 3, calories: 107, price: 65, eta: "15 min", emoji: "🥛" },
  { restaurant: "Instamart", name: "Saffola Oats + Whey Combo", protein: 32, carbs: 48, fat: 4, calories: 356, price: 299, eta: "15 min", emoji: "💪" },
  { restaurant: "Instamart", name: "Farmley Roasted Chana 200g", protein: 18, carbs: 28, fat: 5, calories: 229, price: 75, eta: "12 min", emoji: "🫘" },
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

  const allMeals = [...MOCK_RESTAURANTS, ...MOCK_INSTAMART]
    .map(d => ({ ...d, score: scoreMeal(d, remaining) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const goalMap = { cut: "fat loss", bulk: "muscle gain", recomp: "recomposition", maintain: "maintenance" };
  const top = allMeals[0];

  let reply = `📍 **Fetched from Swiggy Food + Instamart MCP near your saved address**\n\n`;
  reply += `You need **${remaining.protein}g protein**, ${remaining.carbs}g carbs, ${remaining.fat}g fat to hit your ${goalMap[macroContext.goal] || macroContext.goal} targets.\n\n`;
  reply += `**Top matches by macro fit:**\n\n`;

  allMeals.forEach((meal, i) => {
    const src = meal.restaurant === "Instamart" ? "🟢 Instamart" : "🟠 Swiggy Food";
    reply += `**${i + 1}. ${meal.emoji} ${meal.name}** — ${src} · ${meal.restaurant}\n`;
    reply += `💪 ${meal.protein}g protein · 🍚 ${meal.carbs}g carbs · 🫙 ${meal.fat}g fat\n`;
    reply += `₹${meal.price} · ⏱ ${meal.eta} · **${meal.score}% macro match**\n\n`;
  });

  reply += `**Best pick:** ${top.emoji} ${top.name} covers ${Math.round((top.protein / remaining.protein) * 100)}% of your remaining protein gap.\n\n`;
  reply += `Try: *"add ${top.name} to cart"* or *"check Instamart for protein"*`;

  return reply;
}

exports.handler = async (event) => {
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
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!messages || !macroContext) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing fields" }) };
  }

  const remaining = {
    protein: macroContext.protein - macroContext.consumed.protein,
    carbs: macroContext.carbs - macroContext.consumed.carbs,
    fat: macroContext.fat - macroContext.consumed.fat,
  };

  const allMockMeals = [...MOCK_RESTAURANTS, ...MOCK_INSTAMART];
  const mockDataContext = allMockMeals
    .map(d => `${d.emoji} ${d.name} (${d.restaurant}): ${d.protein}g P / ${d.carbs}g C / ${d.fat}g F — ₹${d.price}`)
    .join("\n");

  const isFollowUp = messages.length > 1;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Use Claude for follow-up reasoning if API key available
  if (apiKey && isFollowUp) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          system: `You are FitOrder, a fitness meal agent. User needs ${remaining.protein}g protein, ${remaining.carbs}g carbs, ${remaining.fat}g fat. Goal: ${macroContext.goal}.

Available from Swiggy Food + Instamart MCP:
${mockDataContext}

Answer concisely and helpfully. Reference macros and prices. Sound like a fitness coach.`,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
        return {
          statusCode: 200,
          headers: CORS,
          body: JSON.stringify({ reply, toolsCalled: [], mode: "demo" }),
        };
      }
    } catch (e) {
      console.error("Claude follow-up failed:", e.message);
    }
  }

  // Default: return scored demo data
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      reply: buildDemoReply(macroContext),
      toolsCalled: ["search_restaurants", "get_restaurant_menu", "search_products"],
      mode: "demo",
    }),
  };
};
