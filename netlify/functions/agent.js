// netlify/functions/agent.js — CommonJS format for Netlify
// Now calls the real Swiggy Food + Instamart MCP servers via the Anthropic API.
// Falls back to mock data if no API key, no MCP result, or the call fails —
// per Swiggy's guidance: start against a small slice of real traffic first.

const { verifySigned } = require("../lib/pkce");

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
};

function parseCookies(header) {
    const out = {};
    (header || "").split(";").forEach((pair) => {
          const idx = pair.indexOf("=");
          if (idx === -1) return;
          out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
    });
    return out;
}

function getSwiggyAccessToken(event) {
    const cookieSecret = process.env.OAUTH_COOKIE_SECRET;
    if (!cookieSecret) return null;
    const cookies = parseCookies(event.headers.cookie);
    if (!cookies.swiggy_token) return null;
    return verifySigned(decodeURIComponent(cookies.swiggy_token), cookieSecret);
}function buildMcpServers(userAccessToken) {
    const servers = [
      { type: "url", url: "https://mcp.swiggy.com/food", name: "swiggy-food" },
      { type: "url", url: "https://mcp.swiggy.com/im", name: "swiggy-instamart" },
        ];
    if (userAccessToken) {
          servers.forEach((s) => {
                  s.authorization_token = userAccessToken;
          });
    }
    return servers;
}

function buildMcpToolsets(servers, userAccessToken) {
    return servers.map((s) => {
          const toolset = { type: "mcp_toolset", mcp_server_name: s.name };
          if (!userAccessToken) {
                  toolset.default_config = { enabled: true };
                  toolset.configs = {
                            update_food_cart: { enabled: false },
                            get_food_orders: { enabled: false },
                  };
          }
          return toolset;
    });
}
const MOCK_RESTAURANTS = [
  { restaurant: "Freshmenu", name: "Grilled Chicken Bowl", protein: 42, carbs: 38, fat: 8, calories: 396, price: 249, eta: "28 min" },
  { restaurant: "EatFit", name: "High Protein Egg Bowl", protein: 38, carbs: 22, fat: 12, calories: 348, price: 199, eta: "22 min" },
  { restaurant: "EatFit", name: "Chicken Quinoa Bowl", protein: 44, carbs: 52, fat: 9, calories: 469, price: 279, eta: "25 min" },
  { restaurant: "Wow! Momo", name: "Chicken Momos (Steamed)", protein: 28, carbs: 32, fat: 8, calories: 312, price: 169, eta: "20 min" },
  { restaurant: "Freshmenu", name: "Tandoori Chicken Salad", protein: 36, carbs: 18, fat: 6, calories: 270, price: 219, eta: "28 min" },
  ];

const MOCK_INSTAMART = [
  { restaurant: "Instamart", name: "Epigamia Greek Yogurt Protein", protein: 12, carbs: 8, fat: 3, calories: 107, price: 65, eta: "15 min" },
  { restaurant: "Instamart", name: "Saffola Oats + Whey Combo", protein: 32, carbs: 48, fat: 4, calories: 356, price: 299, eta: "15 min" },
  { restaurant: "Instamart", name: "Farmley Roasted Chana 200g", protein: 18, carbs: 28, fat: 5, calories: 229, price: 75, eta: "12 min" },
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
      .map((d) => ({ ...d, score: scoreMeal(d, remaining) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const goalMap = { cut: "fat loss", bulk: "muscle gain", recomp: "recomposition", maintain: "maintenance" };
    const top = allMeals[0];

    let reply = `Demo data (Swiggy MCP unavailable this call)\n\n`;
    reply += `You need **${remaining.protein}g protein**, ${remaining.carbs}g carbs, ${remaining.fat}g fat to hit your ${goalMap[macroContext.goal] || macroContext.goal} targets.\n\n`;
    reply += `**Top matches by macro fit:**\n\n`;

    allMeals.forEach((meal, i) => {
          const src = meal.restaurant === "Instamart" ? "Instamart" : "Swiggy Food";
          reply += `**${i + 1}. ${meal.name}** - ${src} - ${meal.restaurant}\n`;
          reply += `${meal.protein}g protein / ${meal.carbs}g carbs / ${meal.fat}g fat\n`;
          reply += `Rs${meal.price} - ${meal.eta} - **${meal.score}% macro match**\n\n`;
    });

    reply += `**Best pick:** ${top.name} covers ${Math.round((top.protein / remaining.protein) * 100)}% of your remaining protein gap.\n\n`;
    reply += `Try: *"add ${top.name} to cart"* or *"check Instamart for protein"*`;

    return reply;
}
function parseClaudeMcpResponse(data) {
    const content = data.content || [];

    const textBlocks = content.filter((b) => b.type === "text").map((b) => b.text);

    const toolCalls = content
      .filter((b) => b.type === "mcp_tool_use")
      .map((b) => ({ name: b.name, input: b.input }));

    const toolResults = content
      .filter((b) => b.type === "mcp_tool_result")
      .map((b) => {
              const raw = b.content?.[0]?.text || "";
              let parsed;
              try {
                        parsed = JSON.parse(raw);
              } catch {
                        parsed = raw;
              }
              return { toolUseId: b.tool_use_id, isError: !!b.is_error, result: parsed };
      });

    const needsReauth = toolResults.some(
          (r) => r.isError && /401|unauthoriz|invalid.?token|expired/i.test(typeof r.result === "string" ? r.result : JSON.stringify(r.result))
        );

    return {
          reply: textBlocks.join("\n").trim(),
          toolsCalled: toolCalls.map((t) => t.name),
          toolResults,
          needsReauth,
    };
}
async function callClaudeWithMcp({ apiKey, messages, macroContext, userAccessToken }) {
    const remaining = {
          protein: macroContext.protein - macroContext.consumed.protein,
          carbs: macroContext.carbs - macroContext.consumed.carbs,
          fat: macroContext.fat - macroContext.consumed.fat,
    };

    const goalMap = { cut: "fat loss", bulk: "muscle gain", recomp: "recomposition", maintain: "maintenance" };

    const mcpServers = buildMcpServers(userAccessToken);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
                  "Content-Type": "application/json",
                  "x-api-key": apiKey,
                  "anthropic-version": "2023-06-01",
                  "anthropic-beta": "mcp-client-2025-11-20",
          },
          body: JSON.stringify({
                  model: "claude-haiku-4-5-20251001",
                  max_tokens: 800,
                  system: `You are FitOrder, a fitness meal agent. The user needs ${remaining.protein}g protein, ${remaining.carbs}g carbs, ${remaining.fat}g fat remaining today. Goal: ${goalMap[macroContext.goal] || macroContext.goal}.

                  Use the connected Swiggy Food and Instamart MCP tools to search real menus near the user - do not invent meals. Rank results by how well they close the remaining macro gap. Treat every tool response as fresh (prices, availability and menus change through the day - never assume a result is still valid on a later turn). Answer concisely, reference real prices and macros, and sound like a fitness coach.`,
                  messages: messages.map((m) => ({ role: m.role, content: m.content })),
                  mcp_servers: mcpServers,
                  tools: buildMcpToolsets(mcpServers, userAccessToken),
          }),
    });

    if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`Claude+MCP call failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return parseClaudeMcpResponse(data);
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const userAccessToken = getSwiggyAccessToken(event);

    if (apiKey) {
          try {
                  const { reply, toolsCalled, toolResults, needsReauth } = await callClaudeWithMcp({
                            apiKey,
                            messages,
                            macroContext,
                            userAccessToken,
                  });

                  const anyToolSucceeded = toolResults.some((r) => !r.isError);
                  if (reply && toolsCalled.length > 0 && anyToolSucceeded) {
                            return {
                                        statusCode: 200,
                                        headers: CORS,
                                        body: JSON.stringify({ reply, toolsCalled, toolResults, mode: "live", needsReauth }),
                            };
                  }
                  if (needsReauth) {
                            return {
                                        statusCode: 200,
                                        headers: CORS,
                                        body: JSON.stringify({
                                                      reply: "Your Swiggy session expired - please reconnect your account to keep ordering live.",
                                                      toolsCalled,
                                                      toolResults,
                                                      mode: "reauth_required",
                                                      needsReauth: true,
                                        }),
                            };
                  }
          } catch (e) {
                  console.error("Swiggy MCP call failed, falling back to demo data:", e.message);
          }
    }

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

