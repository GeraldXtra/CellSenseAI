import { useCallback, useEffect, useState } from "react";

export function useAsync(task, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ data: current.data, loading: true, error: null }));

    Promise.resolve()
      .then(() => task())
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error?.message || "Something went wrong",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [...deps, attempt]);

  const reload = useCallback(() => {
    setAttempt((count) => count + 1);
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload,
  };
}

export default useAsync;
