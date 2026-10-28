import { useCallback, useEffect, useState } from "react";

import { calendarApi } from "../api/Calendarapi";

/**
 * Fetches calendar events for [rangeStart, rangeEnd) and refetches when the
 * range, scope or `refreshKey` changes. `isLoading` is derived (the data on
 * screen doesn't match the current request yet), so old events stay visible
 * while the next month loads instead of flashing empty.
 */
export default function useCalendarEvents({ rangeStart, rangeEnd, scope, refreshKey }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    events: [],
    truncated: false,
    error: "",
    loadedKey: null,
  });

  const from = rangeStart.getTime();
  const to = rangeEnd.getTime();
  const requestKey = `${from}|${to}|${scope}|${refreshKey ?? ""}|${reloadKey}`;

  useEffect(() => {
    let ignore = false;

    calendarApi
      .events({ from: new Date(from), to: new Date(to), scope })
      .then((response) => {
        if (ignore) return;

        setState({
          events: response?.data || [],
          truncated: Boolean(response?.truncated),
          error: "",
          loadedKey: requestKey,
        });
      })
      .catch((err) => {
        if (ignore) return;

        setState((prev) => ({
          ...prev,
          error: err?.response?.data?.message || "Couldn't load the calendar.",
          loadedKey: requestKey,
        }));
      });

    return () => {
      ignore = true;
    };
  }, [from, to, scope, requestKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    events: state.events,
    truncated: state.truncated,
    error: state.error,
    isLoading: state.loadedKey !== requestKey,
    retry,
  };
}
