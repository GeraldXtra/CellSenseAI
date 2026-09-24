// Layout: the shell around every page with the top bar, the footer, the launcher and the chat window. Owner: Gerald. Renders only the page until it is built.
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWindow from "../osakue/ChatWIndow";
import ChatLauncher from "./ChatLauncher";

export default function Layout() {
  return (
    <div className="cs-app">
      <Navbar />
      <main className="cs-main">
        <Outlet />
      </main>
      <Footer />
      <ChatLauncher />
      <ChatWindow />
    </div>
  );
}
