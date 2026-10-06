import { useCallback, useEffect, useState } from "react";

import { teamsApi } from "../api/Teamsapi";

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teamsApi.list();
      setTeams(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addTeam(team) {
    const created = await teamsApi.create(team);
    setTeams((prev) => [created, ...prev]);
    return created;
  }

  async function updateTeam(updatedTeam) {
    const saved = await teamsApi.update(updatedTeam.id, updatedTeam);
    setTeams((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    return saved;
  }

  async function deleteTeam(id) {
    await teamsApi.remove(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }

  function getVisibleTeams() {
    return teams;
  }

  function getTeamName(id) {
    return teams.find((t) => t.id === id)?.name || "";
  }

  return { teams, isLoading, addTeam, updateTeam, deleteTeam, getVisibleTeams, getTeamName, refetch };
}