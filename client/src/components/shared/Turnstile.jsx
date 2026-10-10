import { useEffect, useRef, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

const MESSAGES = {
  loading: "Loading the security check",
  ready: "Tick the box to show you are human",
  done: "Security check done",
  error: "The security check could not load. Check your connection, then try again.",
};

let scriptPromise = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;

    function fail() {
      scriptPromise = null;
      script.remove();
      reject(new Error(MESSAGES.error));
    }

    script.addEventListener("load", () => {
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    });
    script.addEventListener("error", fail);
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function Turnstile({ onToken, resetKey }) {
  const boxRef = useRef(null);
  const widgetRef = useRef(null);
  const onTokenRef = useRef(onToken);
  const seenResetKey = useRef(resetKey);
  const [status, setStatus] = useState("loading");
  const [rendered, setRendered] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  function sendToken(token) {
    if (onTokenRef.current) onTokenRef.current(token);
  }

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let active = true;

    loadTurnstile()
      .then((turnstile) => {
        const box = boxRef.current;
        if (!active || !box || !box.isConnected) return;
        widgetRef.current = turnstile.render(box, {
          sitekey: SITE_KEY,
          theme: "light",
          size: "flexible",
          appearance: "always",
          callback: (token) => {
            if (!active) return;
            setStatus("done");
            sendToken(token);
          },
          "expired-callback": () => {
            if (!active) return;
            setStatus("ready");
            sendToken("");
          },
          "timeout-callback": () => {
            if (!active) return;
            setStatus("ready");
            sendToken("");
          },
          "error-callback": () => {
            if (active) {
              setStatus("error");
              sendToken("");
            }
            return true;
          },
        });
        setRendered(true);
        setStatus((current) => (current === "loading" ? "ready" : current));
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      const id = widgetRef.current;
      widgetRef.current = null;
      if (id != null && window.turnstile) window.turnstile.remove(id);
    };
  }, [attempt]);

  useEffect(() => {
    if (seenResetKey.current === resetKey) return;
    seenResetKey.current = resetKey;
    sendToken("");
    if (widgetRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      setStatus("ready");
    }
  }, [resetKey]);

  function handleRetry() {
    sendToken("");
    if (widgetRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      setStatus("ready");
      return;
    }
    setStatus("loading");
    setAttempt((count) => count + 1);
  }

  if (!SITE_KEY) {
    return (
      <div className="cs-turnstile cs-turnstile-error">
        <p className="cs-turnstile-status" role="status">
          The security check is not set up yet.
        </p>
      </div>
    );
  }

  const empty = status === "error" && !rendered;

  return (
    <div className={`cs-turnstile cs-turnstile-${status}`}>
      <div ref={boxRef} className={empty ? "cs-turnstile-box cs-turnstile-empty" : "cs-turnstile-box"} />
      <p className="cs-turnstile-status" role="status" aria-live="polite">
        {status === "done" && <FiCheckCircle aria-hidden="true" />}
        <span>{MESSAGES[status]}</span>
      </p>
      {status === "error" && (
        <button
          type="button"
          className="btn btn-outline-primary cs-turnstile-retry"
          onClick={handleRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
