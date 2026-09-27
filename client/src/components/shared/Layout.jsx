import { useEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ChatLauncher from "./ChatLauncher.jsx";
import ChatWindow from "../osakue/ChatWindow.jsx";

export default function Layout() {
  const { key, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }
    if (navigationType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [key, hash, navigationType]);

  return (
    <div className="cs-app">
      <Navbar />
      <main className="cs-main">
        <Outlet />
      </main>
      <Footer />
      <ChatWindow />
      <ChatLauncher />
    </div>
  );
}
