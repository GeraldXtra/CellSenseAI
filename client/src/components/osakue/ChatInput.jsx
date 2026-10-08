import { useEffect, useRef } from "react";
import { FiArrowRight } from "react-icons/fi";

export default function ChatInput({ value, onChange, onSubmit, disabled }) {
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!disabled && fieldRef.current && document.activeElement === document.body) {
      fieldRef.current.focus();
    }
  }, [disabled]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!disabled) onSubmit();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!disabled) onSubmit();
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <label htmlFor="chat-input-field" className="visually-hidden">
        Your question
      </label>
      <textarea
        ref={fieldRef}
        id="chat-input-field"
        className="form-control chat-input-field"
        placeholder="Ask about a phone, a price or a budget"
        rows={1}
        autoComplete="off"
        enterKeyHint="send"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        type="submit"
        className="btn btn-primary chat-input-send"
        aria-label="Send"
        disabled={disabled}
      >
        <FiArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}
