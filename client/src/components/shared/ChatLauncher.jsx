import { matchPath, useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { useChat } from "../../context/ChatContext.jsx";

export default function ChatLauncher() {
  const { pathname } = useLocation();
  const { open, openWindow } = useChat();

  if (matchPath("/assistant", pathname) || open) return null;

  return (
    <button
      type="button"
      className="cs-chat-launcher"
      aria-label="Open the assistant"
      onClick={openWindow}
    >
      <FiMessageCircle aria-hidden="true" />
    </button>
  );
}
