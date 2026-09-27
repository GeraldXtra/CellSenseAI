import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiChevronDown, FiMenu, FiSearch, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import AccountMenu from "./AccountMenu.jsx";

const links = [
  { to: "/browse", label: "Browse" },
  { to: "/compare", label: "Compare" },
  { to: "/recommend", label: "Recommend" },
  { to: "/assistant", label: "Assistant" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [seenKey, setSeenKey] = useState(location.key);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);

  if (seenKey !== location.key) {
    setSeenKey(location.key);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const first = navRef.current && navRef.current.querySelector("a, button");
    if (first) first.focus();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return undefined;

    function handlePointerDown(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      if (accountOpen) {
        setAccountOpen(false);
        if (accountButtonRef.current) accountButtonRef.current.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        if (menuButtonRef.current) menuButtonRef.current.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, accountOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

  return (
    <header className="cs-topbar">
      <div className="cs-container cs-topbar-inner">
        <Link to="/" className="cs-brand">
          <img src="/brand/favicon-mark.png" alt="" className="cs-brand-mark" />
          <span>
            CellSense <span className="cs-brand-suffix">AI</span>
          </span>
        </Link>

        <nav
          id="cs-nav"
          ref={navRef}
          className={menuOpen ? "cs-nav cs-nav-open" : "cs-nav"}
          aria-label="Main"
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="cs-nav-link">
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <button
              type="button"
              className="cs-nav-link cs-nav-action cs-mobile-only"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : (
            <Link to="/login" className="cs-nav-link cs-mobile-only">
              Log in
            </Link>
          )}
        </nav>

        <div className="cs-topbar-right">
          {user ? (
            <div className="cs-account cs-desktop-only" ref={accountRef}>
              <button
                type="button"
                ref={accountButtonRef}
                className="cs-account-button"
                aria-expanded={accountOpen}
                aria-controls="cs-account-menu"
                onClick={() => setAccountOpen((open) => !open)}
              >
                {user.name || "Account"}
                <FiChevronDown aria-hidden="true" />
              </button>
              {accountOpen && (
                <AccountMenu onClose={() => setAccountOpen(false)} />
              )}
            </div>
          ) : (
            <Link to="/login" className="cs-nav-link cs-desktop-only">
              Log in
            </Link>
          )}
          <Link to="/search" className="cs-icon-button" aria-label="Search">
            <FiSearch aria-hidden="true" />
          </Link>
          <button
            type="button"
            ref={menuButtonRef}
            className="cs-icon-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="cs-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <FiX aria-hidden="true" />
            ) : (
              <FiMenu aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
