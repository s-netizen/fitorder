import { useState, useCallback, useRef } from "react";

export function useAgent(macros) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toolActivity, setToolActivity] = useState("");
  const [mode, setMode] = useState(null);
  const macrosRef = useRef(macros); // always up-to-date macros without stale closure
  macrosRef.current = macros;

  const callAgent = useCallback(async (history, overrideMacros) => {
    setLoading(true);
    setToolActivity("Querying Swiggy MCP servers...");

    const m = overrideMacros || macrosRef.current;

    // Guard: if macros not set, bail early
    if (!m || !m.goal) {
      setMessages(prev => [...prev, { role: "assistant", content: "Please set your macro targets first." }]);
      setLoading(false);
      setToolActivity("");
      return;
    }

    const payload = {
      messages: history.map(msg => ({ role: msg.role, content: msg.content })),
      macroContext: {
        goal: m.goal,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        consumed: m.consumed,
      },
    };

    try {
      const res = await fetch("/.netlify/functions/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON response: ${text.slice(0, 100)}`);
      }

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      if (data.toolsCalled?.length > 0) {
        setToolActivity(`Called: ${data.toolsCalled.join(", ")}`);
        setTimeout(() => setToolActivity(""), 3000);
      } else {
        setToolActivity("");
      }

      if (data.mode) setMode(data.mode);

      const reply = data.reply || "Let me find meals that fit your macros.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      return assistantMsg;

    } catch (err) {
      console.error("Agent error:", err);
      const errMsg = {
        role: "assistant",
        content: `⚠️ ${err.message}\n\nMake sure the site is fully deployed on Netlify and ANTHROPIC_API_KEY is set in environment variables.`,
      };
      setMessages(prev => [...prev, errMsg]);
      setToolActivity("");
      return errMsg;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await callAgent(updated);
  }, [messages, callAgent]);

  const startSession = useCallback(async (openingText, overrideMacros) => {
    const userMsg = { role: "user", content: openingText };
    setMessages([userMsg]);
    await callAgent([userMsg], overrideMacros);
  }, [callAgent]);

  const reset = useCallback(() => {
    setMessages([]);
    setToolActivity("");
    setMode(null);
  }, []);

  return { messages, loading, toolActivity, mode, sendMessage, startSession, reset };
}
