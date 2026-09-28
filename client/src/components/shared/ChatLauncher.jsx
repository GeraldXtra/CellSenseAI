import { useEffect, useRef } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { useChat } from "../../context/ChatContext.jsx";

export default function ChatLauncher() {
  const { pathname } = useLocation();
  const { open, openWindow } = useChat();
  const buttonRef = useRef(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (wasOpen.current && !open && buttonRef.current) buttonRef.current.focus();
    wasOpen.current = open;
  }, [open]);

  if (matchPath("/assistant", pathname) || open) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      className="cs-chat-launcher"
      aria-label="Open the assistant"
      onClick={openWindow}
    >
      <FiMessageCircle aria-hidden="true" />
    </button>
  );
}
