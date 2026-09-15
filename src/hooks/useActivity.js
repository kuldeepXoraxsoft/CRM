import { useCallback, useEffect, useState } from "react";

import { activityApi } from "../api/Activityapi";

export function useActivity() {
  const [activities, setActivities] = useState([]);

  const refetch = useCallback(async () => {
    const data = await activityApi.list();
    setActivities(data);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Backend writes activity entries itself (see the backend's
  // controllers + src/utils/activityLogger.js), so any old call site
  // that did logActivity({ message, type }) just needs to refetch now.
  function logActivity() {
    refetch();
  }

  return { activities, logActivity, refetch };
}