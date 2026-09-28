import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AccountMenu({ onClose }) {
  const { logout } = useAuth();

  function close() {
    if (onClose) onClose();
  }

  function handleLogout() {
    logout();
    close();
  }

  return (
    <div id="cs-account-menu" className="cs-account-menu">
      <Link to="/dashboard" className="cs-account-item" onClick={close}>
        Dashboard
      </Link>
      <button type="button" className="cs-account-item" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
