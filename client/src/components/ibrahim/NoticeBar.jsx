import { FiInfo } from "react-icons/fi";

export default function NoticeBar({ children }) {
  return (
    <div className="cs-notice notice-bar" role="status">
      <FiInfo className="notice-bar-icon" aria-hidden="true" />
      <p className="notice-bar-text">{children}</p>
    </div>
  );
}
