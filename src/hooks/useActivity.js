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

  function logActivity() {
    refetch();
  }

  return { activities, logActivity, refetch };
}