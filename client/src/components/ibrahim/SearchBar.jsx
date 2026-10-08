import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

export default function SearchBar({
  defaultValue = "",
  initialValue,
  onSearch,
  autoFocus = false,
  placeholder = "phone under $400 with a great camera",
}) {
  const start = (initialValue !== undefined ? initialValue : defaultValue) || "";
  const navigate = useNavigate();
  const [text, setText] = useState(start);
  const [seen, setSeen] = useState(start);

  if (start !== seen) {
    setSeen(start);
    setText(start);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const query = text.trim();
    if (!query) return;
    if (onSearch) onSearch(query);
    else navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form className="cs-searchbar" role="search" onSubmit={handleSubmit}>
      <label htmlFor="cs-search-field" className="visually-hidden">
        Search phones
      </label>
      <input
        id="cs-search-field"
        type="search"
        className="form-control cs-searchbar-field"
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        autoFocus={autoFocus}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className="btn btn-primary cs-searchbar-button">
        Search
      </button>
    </form>
  );
}
