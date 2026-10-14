import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useChat } from "../../context/ChatContext.jsx";
import ChatThread from "../../components/osakue/ChatThread.jsx";
import ChatInput from "../../components/osakue/ChatInput.jsx";
import "./Assistant.css";

const links = [
  "Best battery under $300",
  "Compare Galaxy S24 and OnePlus 12",
  "Cheapest 5G phone",
];

export default function Assistant() {
  const [searchParams] = useSearchParams();
  const { messages, loading, error, send } = useChat();
  const [text, setText] = useState(() => searchParams.get("q") || "");

  async function handleSubmit() {
    const sent = await send(text);
    if (sent) setText("");
  }

  return (
    <section className="cs-section cs-section-alt assistant">
      <div className="cs-container">
        <h1 className="cs-heading">CellSense assistant</h1>
        <p className="cs-subheading">
          Answers from the same phone data as the site, with the date each price was checked.
        </p>

        <div className="cs-card assistant-card">
          <ChatThread messages={messages} loading={loading} error={error} onSend={send} />
          <ChatInput value={text} onChange={setText} onSubmit={handleSubmit} disabled={loading} />
        </div>

        <ul className="assistant-links">
          {links.map((link) => (
            <li key={link}>
              <button
                type="button"
                className="cs-link-chevron assistant-link"
                onClick={() => send(link)}
                disabled={loading}
              >
                {link}
                <FiChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
