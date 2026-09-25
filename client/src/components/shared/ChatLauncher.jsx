import { useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";

export default function ChatLauncher() {
  const { pathName } = useLocation();
  const { open, openWindow } = useChat();

  if (pathName === "/assistant" || open) return null;

  function handleClick() {
    if (openWindow) openWindow();
  }

  return (
    <button
      type="button"
      className="cs-chat-launcher"
      aria-label="Open the assistant"
      onClick={handleClick}
    >
      <FiMessageCircle />
    </button>
  );
}
