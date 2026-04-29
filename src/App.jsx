import { useState, useCallback } from "react";
import MacroSetup from "./components/MacroSetup.jsx";
import Chat from "./components/Chat.jsx";
import { useAgent } from "./hooks/useAgent.js";

export default function App() {
  const [view, setView] = useState("setup");
  const [macros, setMacros] = useState({
    goal: "recomp", protein: 160, carbs: 180, fat: 60,
    consumed: { protein: 85, carbs: 90, fat: 32 }
  });
  const agent = useAgent(macros);

  // Pass macros AND opening message together so agent always has valid macros
  function handleStart(selectedMacros, openingMessage) {
    setMacros(selectedMacros);
    setView("chat");
    agent.startSession(openingMessage, selectedMacros);
  }

  function handleReset() {
    agent.reset();
    setView("setup");
  }

  if (view === "setup") return <MacroSetup onStart={handleStart} />;

  return (
    <Chat
      macros={macros}
      messages={agent.messages}
      loading={agent.loading}
      toolActivity={agent.toolActivity}
      mode={agent.mode}
      onSend={agent.sendMessage}
      onReset={handleReset}
    />
  );
}
