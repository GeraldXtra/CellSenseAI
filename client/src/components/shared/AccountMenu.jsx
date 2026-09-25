import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccountMenu() {
  const { logout } = useAuth();

  function handleLogOut() {
    if (logout) logout();
    onclose();
  }
  return (
    <div className="cs-account-menu" role="menu">
      <Link
        to="/dashboard"
        className="cs-account-item"
        role="menuitem"
        onClick={onclose}
      >
        Dashboard
      </Link>
      <button
        type="button"
        className="cs-account-item"
        role="menuitem"
        onClick={handleLogOut}
      >
        Log Out
      </button>
    </div>
  );
}
