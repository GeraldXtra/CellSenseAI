import { useEffect, useRef, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { FiArrowRight, FiChevronRight, FiX } from "react-icons/fi";
import { useChat } from "../../context/ChatContext.jsx";
import PhoneImage, { phoneName } from "./PhoneImage.jsx";

const suggestions = [
  "Best camera phone under $400?",
  "Compare Galaxy S24 and OnePlus 12",
  "Which phone has the longest battery?",
];

function formatPrice(price) {
  if (!price || price.current == null) return "";
  const currency = price.currency || "USD";
  return currency === "USD" ? `$${price.current}` : `${price.current} ${currency}`;
}

function PhoneRow({ phone }) {
  return (
    <li className="cs-chat-phone">
      <div className="cs-chat-phone-thumb" aria-hidden="true">
        <PhoneImage phone={phone} />
      </div>
      <div className="cs-chat-phone-body">
        <p className="cs-chat-phone-name">{phoneName(phone)}</p>
        <p className="cs-price cs-chat-phone-price">{formatPrice(phone.price)}</p>
        <Link to={`/phones/${phone.slug}`} className="cs-link-chevron cs-chat-phone-link">
          See details
          <FiChevronRight aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

export default function ChatWindow() {
  const { pathname } = useLocation();
  const { messages, loading, error, open, closeWindow, send } = useChat();
  const [text, setText] = useState("");
  const threadRef = useRef(null);
  const fieldRef = useRef(null);
  const visible = open && !matchPath("/assistant", pathname);

  useEffect(() => {
    if (open && fieldRef.current) fieldRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!loading && fieldRef.current && document.activeElement === document.body) {
      fieldRef.current.focus();
    }
  }, [loading]);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [visible, messages, loading, error]);

  async function handleSubmit(event) {
    event.preventDefault();
    const sent = await send(text);
    if (sent) setText("");
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") closeWindow();
  }

  if (!visible) return null;

  return (
    <div
      className="cs-chat-window"
      role="dialog"
      aria-labelledby="cs-chat-title"
      onKeyDown={handleKeyDown}
    >
      <div className="cs-chat-header">
        <div className="cs-chat-bar">
          <h2 id="cs-chat-title" className="cs-chat-title">
            CellSense assistant
          </h2>
          <Link to="/assistant" className="cs-chat-open" onClick={closeWindow}>
            Open full page
          </Link>
          <button
            type="button"
            className="cs-chat-close"
            aria-label="Close the assistant"
            onClick={closeWindow}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <p className="cs-chat-note">Answers from the same phone data as the site.</p>
      </div>

      <div ref={threadRef} className="cs-chat-thread" role="log" aria-label="Conversation">
        {messages.length === 0 && !loading && (
          <div className="cs-chat-empty">
            <p className="cs-chat-empty-text">
              Ask about a phone, a price or a budget. I answer from the phones on this site.
            </p>
            <div className="cs-chat-chips">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="cs-chat-chip"
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const fromUser = message.role === "user";
          const side = fromUser ? "cs-chat-bubble-user" : "cs-chat-bubble-reply";
          const phones = !fromUser && Array.isArray(message.phones) ? message.phones : [];
          return (
            <div key={index} className="cs-chat-message">
              <p className={`cs-chat-bubble ${side}`}>{message.content}</p>
              {phones.length > 0 && (
                <ul className="cs-chat-phones">
                  {phones.map((phone) => (
                    <PhoneRow key={phone.slug} phone={phone} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {loading && (
          <p className="cs-chat-bubble cs-chat-bubble-reply">
            <span className="cs-chat-dot" />
            <span className="cs-chat-dot" />
            <span className="cs-chat-dot" />
            <span className="visually-hidden">The assistant is typing</span>
          </p>
        )}

        {error && <p className="cs-chat-bubble cs-chat-bubble-error">{error}</p>}
      </div>

      <form className="cs-chat-form" onSubmit={handleSubmit}>
        <label htmlFor="cs-chat-field" className="visually-hidden">
          Your question
        </label>
        <input
          ref={fieldRef}
          id="cs-chat-field"
          type="text"
          className="form-control cs-chat-field"
          placeholder="Ask about a phone, a price or a budget"
          autoComplete="off"
          enterKeyHint="send"
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn btn-primary cs-chat-send"
          aria-label="Send"
          disabled={loading}
        >
          <FiArrowRight aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
