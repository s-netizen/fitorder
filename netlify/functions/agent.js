// netlify/functions/agent.js
// Secure proxy — Anthropic API key never exposed to browser

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Server config error: API key not set. Add ANTHROPIC_API_KEY to Netlify environment variables." }),
    };
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

  const remaining = {
    protein: macroContext.protein - macroContext.consumed.protein,
    carbs: macroContext.carbs - macroContext.consumed.carbs,
    fat: macroContext.fat - macroContext.consumed.fat,
  };

  const systemPrompt = `You are FitOrder — a fitness-aware meal ordering agent on Swiggy's live MCP platform.

User fitness profile:
- Goal: ${macroContext.goal}
- Daily targets: ${macroContext.protein}g protein / ${macroContext.carbs}g carbs / ${macroContext.fat}g fat
- Consumed today: ${macroContext.consumed.protein}g P / ${macroContext.consumed.carbs}g C / ${macroContext.consumed.fat}g F
- Still needed: ${remaining.protein}g protein / ${remaining.carbs}g carbs / ${remaining.fat}g fat

Workflow:
1. Call get_addresses to get user's real addressId — never guess it
2. Search restaurants/menu for high-protein options near user
3. Recommend top 2-3 meals scored against remaining macros — lead with protein
4. On "add to cart" — call update_food_cart directly
5. For supplements/groceries — use Instamart search_products
6. For history — call get_food_orders

Tone: Direct, coach-like. Always cite macro numbers. No fluff.`;

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
          { type: "url", url: "https://mcp.swiggy.com/food", name: "swiggy-food" },
          { type: "url", url: "https://mcp.swiggy.com/im", name: "swiggy-instamart" },
          { type: "url", url: "https://mcp.swiggy.com/dineout", name: "swiggy-dineout" },
        ],
        messages,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, responseText);
      return {
        statusCode: response.status,
        headers: CORS,
        body: JSON.stringify({ error: `Anthropic API error ${response.status}`, detail: responseText }),
      };
    }

    const data = JSON.parse(responseText);
    let replyText = "";
    const toolsCalled = [];

    for (const block of data.content || []) {
      if (block.type === "text") replyText += block.text;
      if (block.type === "mcp_tool_use" || block.type === "tool_use") {
        toolsCalled.push(block.name);
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        reply: replyText || "Searching Swiggy for your macro matches...",
        toolsCalled,
        stopReason: data.stop_reason,
      }),
    };

  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Internal error", detail: err.message }),
    };
  }
};
