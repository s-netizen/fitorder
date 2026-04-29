// src/App.jsx
import { useState } from "react";
import MacroSetup from "./components/MacroSetup.jsx";
import Chat from "./components/Chat.jsx";
import { useAgent } from "./hooks/useAgent.js";

export default function App() {
  const [view, setView] = useState("setup");
  const [macros, setMacros] = useState(null);
  const agent = useAgent(macros || {});

  function handleStart(selectedMacros, openingMessage) {
    setMacros(selectedMacros);
    setView("chat");
    // Small delay to let macros propagate before agent call
    setTimeout(() => {
      agent.startSession(openingMessage);
    }, 100);
  }

  function handleReset() {
    agent.reset();
    setView("setup");
    setMacros(null);
  }

  if (view === "setup") {
    return <MacroSetup onStart={handleStart} />;
  }

  return (
    <Chat
      macros={macros}
      messages={agent.messages}
      loading={agent.loading}
      toolActivity={agent.toolActivity}
      onSend={agent.sendMessage}
      onReset={handleReset}
    />
  );
}
