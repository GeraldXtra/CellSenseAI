// useAsync: runs an async function and gives data, loading, error and reload. Owner: Gerald.
import { useEffect, useState } from "react";

export function useAsync(task, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    task()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active)
          setState({
            data: null,
            loading: false,
            error: err.message || "Something went wrong",
          });
      });

    return () => {
      active = false;
    };
  }, [...deps, attempt]);

  function reload() {
    setAttempt((count) => count + 1);
  }

  return { ...state, reload };
}

export default useAsync;
