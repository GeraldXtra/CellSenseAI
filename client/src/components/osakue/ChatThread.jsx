import { useEffect, useRef } from "react";
import PhoneCard from "../shared/PhoneCard.jsx";

const suggestions = [
  "Best camera phone under $400?",
  "Compare Galaxy S24 and OnePlus 12",
  "Which phone has the longest battery?",
];

export default function ChatThread({ messages, loading, error, onSend }) {
  const endRef = useRef(null);
  const count = messages.length;

  useEffect(() => {
    if ((count > 0 || loading || error) && endRef.current) {
      endRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [count, loading, error]);

  if (count === 0 && !loading && !error) {
    return (
      <div className="chat-thread chat-thread-empty">
        <p className="chat-empty-text">
          Ask about a phone, a price or a budget. I answer from the phones on this site.
        </p>
        <div className="chat-empty-chips">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="cs-chat-chip chat-chip"
              onClick={() => onSend(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-thread" role="log" aria-label="Conversation">
      {messages.map((message, index) => {
        const fromUser = message.role === "user";
        const side = fromUser ? "cs-chat-bubble-user" : "cs-chat-bubble-reply";
        const phones = !fromUser && Array.isArray(message.phones) ? message.phones : [];
        return (
          <div key={index} className="chat-message">
            <p className={`cs-chat-bubble chat-bubble ${side}`}>{message.content}</p>
            {phones.length > 0 && (
              <div className="cs-grid chat-phones">
                {phones.map((phone) => (
                  <PhoneCard key={phone.slug} phone={phone} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {loading && (
        <p className="cs-chat-bubble chat-bubble cs-chat-bubble-reply">
          <span className="cs-chat-dot" />
          <span className="cs-chat-dot" />
          <span className="cs-chat-dot" />
          <span className="visually-hidden">The assistant is typing</span>
        </p>
      )}

      {error && <p className="cs-chat-bubble chat-bubble cs-chat-bubble-error">{error}</p>}

      <div ref={endRef} />
    </div>
  );
}
