// src/hooks/useAgent.js
import { useState, useCallback } from "react";

export function useAgent(macros) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toolActivity, setToolActivity] = useState("");

  const callAgent = useCallback(async (history) => {
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(m => ({
            role: m.role,
            content: typeof m.content === "string" ? m.content : m.content,
          })),
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

      // Show tool activity if tools were called
      if (data.toolsCalled?.length > 0) {
        const toolNames = data.toolsCalled.join(", ");
        setToolActivity(`Called: ${toolNames}`);
        setTimeout(() => setToolActivity(""), 3000);
      }

      const reply = data.reply || "Let me search Swiggy for options that fit your macros.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);

      return assistantMsg;
    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: `⚠️ Connection issue: ${err.message}\n\nMake sure the Swiggy MCP is connected and your Swiggy account is authenticated.`,
      };
      setMessages(prev => [...prev, errMsg]);
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
  }, []);

  return { messages, loading, toolActivity, sendMessage, startSession, reset };
}
