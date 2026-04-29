// netlify/functions/agent.js
// Secure proxy — API key never exposed to browser

export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    const { messages, macroContext } = JSON.parse(event.body);

    if (!messages || !macroContext) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing messages or macroContext" }),
      };
    }

    const systemPrompt = `You are FitOrder — a fitness-aware meal ordering agent running live on Swiggy's MCP platform.

User's fitness profile:
- Goal: ${macroContext.goal}
- Daily targets: ${macroContext.protein}g protein / ${macroContext.carbs}g carbs / ${macroContext.fat}g fat
- Already consumed today: ${macroContext.consumed.protein}g P / ${macroContext.consumed.carbs}g C / ${macroContext.consumed.fat}g F
- Remaining needed: ${macroContext.protein - macroContext.consumed.protein}g P / ${macroContext.carbs - macroContext.consumed.carbs}g C / ${macroContext.fat - macroContext.consumed.fat}g F

Your workflow:
1. Call get_addresses first to get the user's saved delivery location
2. Search for meals using search_restaurants or search_menu with protein-forward queries
3. Score options against remaining macros — prioritize protein gap first, then calories
4. Recommend top 2-3 options with estimated macros and price
5. If user says "add to cart" or "order this" — call update_food_cart directly
6. For grocery/supplement needs — use Instamart search_products
7. For past orders — use get_food_orders to show history or suggest reorders

Tone: Direct, coach-like, specific. Always reference actual macro numbers.
Format: Use clear sections when showing multiple meal options. Include protein content prominently.`;

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

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return {
        statusCode: response.status,
        headers: CORS,
        body: JSON.stringify({ error: "Agent error", detail: err }),
      };
    }

    const data = await response.json();

    // Extract text and tool activity from content blocks
    let replyText = "";
    let toolsCalled = [];

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
        reply: replyText,
        toolsCalled,
        stopReason: data.stop_reason,
        rawContent: data.content,
      }),
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal error", detail: err.message }),
    };
  }
};
