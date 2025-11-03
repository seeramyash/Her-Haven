import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Per-tab session ID (reset when tab closes)
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem("sessionId");
    if (existing) return existing;
    const id = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    sessionStorage.setItem("sessionId", id);
    return id;
  });

  const chat = async (message, images, audio, model = 'llama') => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, sessionId, images, audio, model }),
      });
      const json = await res.json().catch(() => ({}));
      const resp = Array.isArray(json?.messages) ? json.messages : [];

      if (!res.ok) {
        console.error("/chat failed:", json?.error || res.statusText);
        return; // do not push invalid messages
      }
      if (resp.length === 0) {
        console.warn("/chat returned no messages");
        return;
      }
      setMessages((messages) => [...messages, ...resp]);
    } catch (err) {
      console.error("chat() error:", err);
    } finally {
      setLoading(false);
    }
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        sessionId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
