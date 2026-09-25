import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiSearch, FiMenu, FiChevronDown, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import AccountMenu from "./AccountMenu";
import FavIconMark from "./../../../public/brand/favicon-mark.png";

const links = [
  { to: "/browse", label: "Browse" },
  { to: "/compare", label: "compare" },
  { to: "/recommend", label: "Recommend" },
  { to: "/assistant", label: "Assistant" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }
  return (
    <header className="cs-topbar">
      <div className="cs-container cs-topbar-inner">
        <Link to="/" className="cs-brand" onClick={closeMenu}>
          <img src={FavIconMark} alt="" className="cs-brand-mark" />
          <span>CellSense AI</span>
        </Link>

        <nav className={menuOpen ? "cs-nav cs-nav-open" : "cs-nav"}>
          {links.map((link) => {
            <NavLink
              key={link.to}
              to={link.to}
              className="cs-nav-link"
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>;
          })}
          {!user && (
            <Link
              to="/login"
              className="cs-nav-link cs-mobile-only"
              onClick={closeMenu}
            >
              Log In
            </Link>
          )}
        </nav>

        <div className="cs-topbar-right">
          {user ? (
            <div className="cs-account">
              <button
                type="button"
                className="cs-account-button"
                onClick={() => setAccountOpen(!accountOpen)}
              >
                {user.name} <FiChevronDown size={14} />
              </button>
              {accountOpen && (
                <AccountMenu onClose={() => setAccountOpen(false)} />
              )}
            </div>
          ) : (
            <Link to="/login" className="cs-nav-link cs-desktop-only">
              Log In
            </Link>
          )}
          <Link
            to="/search"
            className="cs-icon-button cs-mobile-only"
            aria-label="Search"
          >
            <FiSearch />
          </Link>
          <button
            type="button"
            className="cs-icon-button csc-mobile-only"
            aria-label="menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}
