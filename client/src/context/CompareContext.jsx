import { createContext, useContext, useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";

const CompareContext = createContext(null);
const STORAGE_KEY = "cs_compare";
const MAX = 3;

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function readIds(search) {
  const ids = new URLSearchParams(search).get("ids");
  return ids ? ids.split(",") : [];
}

function clean(list) {
  const result = [];
  for (const item of list) {
    const slug = typeof item === "string" ? item.trim() : "";
    if (slug && !result.includes(slug) && result.length < MAX) {
      result.push(slug);
    }
  }
  return result;
}

function same(a, b) {
  return a.length === b.length && a.every((slug, index) => slug === b[index]);
}

export function CompareProvider({ children }) {
  const location = useLocation();
  const urlSearch = matchPath("/compare", location.pathname) ? location.search : "";
  const [slugs, setSlugs] = useState(() => clean([...readIds(urlSearch), ...readSaved()]));
  const [seenSearch, setSeenSearch] = useState(urlSearch);

  if (seenSearch !== urlSearch) {
    setSeenSearch(urlSearch);
    const ids = readIds(urlSearch);
    if (ids.length) {
      const next = clean([...ids, ...slugs]);
      if (!same(next, slugs)) setSlugs(next);
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      return;
    }
  }, [slugs]);

  function add(slug) {
    if (slugs.includes(slug)) return true;
    if (slugs.length >= MAX) return false;
    setSlugs((current) => clean([...current, slug]));
    return true;
  }

  function remove(slug) {
    setSlugs((current) => current.filter((item) => item !== slug));
  }

  function clear() {
    setSlugs([]);
  }

  function has(slug) {
    return slugs.includes(slug);
  }

  const value = {
    slugs,
    add,
    remove,
    clear,
    has,
    max: MAX,
    isFull: slugs.length >= MAX,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used inside CompareProvider");
  }
  return context;
}
