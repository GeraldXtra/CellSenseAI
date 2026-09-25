// CompareContext: the compare list of up to three phone slugs kept in the browser. Owner: Gerald. Pass through until it is built.
import { createContext, useContext, useEffect, useState } from "react";

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

function readUrl() {
  const ids = new URLSearchParams(window.location.search).get("ids");
  return ids ? ids.split(",") : [];
}

function clean(list) {
  const result = [];
  for (const slug of list) {
    if (slug && !result.includes(slug) && result.length < MAX) {
      result.push(slug);
    }
  }
  return result;
}

export function CompareProvider({ children }) {
  const [slugs, setSlugs] = useState(() =>
    clean([...readUrl(), ...readSaved()]),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs]);

  function add(slug) {
    setSlugs((current) => clean([...current, slug]));
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

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
