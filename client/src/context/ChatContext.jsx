import { createContext, useContext, useState } from "react";
import { chat } from "../services/ai.service.js";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  function openWindow() {
    setOpen(true);
  }

  function closeWindow() {
    setOpen(false);
  }

  async function send(text) {
    const content = typeof text === "string" ? text.trim() : "";
    if (!content || loading) return false;

    const history = [...messages, { role: "user", content }];
    setMessages(history);
    setLoading(true);
    setError(null);

    try {
      const data = await chat(
        history.map(({ role, content }) => ({ role, content })),
      );
      setMessages([
        ...history,
        { role: "assistant", content: data.reply, phones: data.phones || [] },
      ]);
      return true;
    } catch (err) {
      setMessages(messages);
      setError(err.message || "Something went wrong. Try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    messages,
    loading,
    error,
    open,
    openWindow,
    closeWindow,
    send,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return context;
}
