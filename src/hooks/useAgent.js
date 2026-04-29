// src/hooks/useAgent.js
import { useState, useCallback } from "react";

export function useAgent(macros) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toolActivity, setToolActivity] = useState("");
  const [mode, setMode] = useState(null); // "live" | "demo" | "demo-no-key"

  const callAgent = useCallback(async (history) => {
    setLoading(true);
    setToolActivity("Querying Swiggy MCP servers...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          macroContext: {
            goal: macros.goal,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            consumed: macros.consumed,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Agent call failed");

      if (data.toolsCalled?.length > 0) {
        setToolActivity(`Called: ${data.toolsCalled.join(", ")}`);
        setTimeout(() => setToolActivity(""), 3000);
      } else {
        setToolActivity("");
      }

      if (data.mode) setMode(data.mode);

      const reply = data.reply || "Let me search Swiggy for options that fit your macros.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      return assistantMsg;

    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: `Sorry, ran into an issue: ${err.message}. Try again in a moment.`,
      };
      setMessages(prev => [...prev, errMsg]);
      setToolActivity("");
      return errMsg;
    } finally {
      setLoading(false);
    }
  }, [macros]);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await callAgent(updated);
  }, [messages, callAgent]);

  const startSession = useCallback(async (openingText) => {
    const userMsg = { role: "user", content: openingText };
    setMessages([userMsg]);
    await callAgent([userMsg]);
  }, [callAgent]);

  const reset = useCallback(() => {
    setMessages([]);
    setToolActivity("");
    setMode(null);
  }, []);

  return { messages, loading, toolActivity, mode, sendMessage, startSession, reset };
}
