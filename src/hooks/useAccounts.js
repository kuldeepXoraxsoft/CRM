import { useCallback, useEffect, useState } from "react";

import { accountsApi } from "../api/Accountsapi";

/**
 * Standalone hook - no Provider needed. Each component that calls this
 * gets its own fetch on mount. That's fine now that the backend is the
 * source of truth: navigate to /accounts and it fetches fresh data,
 * so there's no need to share one cached copy across pages anymore.
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await accountsApi.list();
      setAccounts(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addAccount(payload) {
    // If it already looks saved (has an id - e.g. returned by the Lead
    // convert endpoint), just push it in. Otherwise create it.
    const created = payload?.id ? payload : await accountsApi.create(payload);
    setAccounts((prev) => [created, ...prev]);
    return created;
  }

  async function updateAccount(updatedAccount) {
    const saved = await accountsApi.update(updatedAccount.id, updatedAccount);
    setAccounts((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
    return saved;
  }

  async function deleteAccount(id) {
    await accountsApi.remove(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  async function updateFollowUp(id, payload) {
    const saved = await accountsApi.followUp(id, payload);
    setAccounts((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
    return saved;
  }

  return { accounts, isLoading, addAccount, updateAccount, deleteAccount, updateFollowUp, refetch };
}