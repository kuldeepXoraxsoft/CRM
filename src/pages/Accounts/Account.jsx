import { useEffect, useMemo, useState } from "react";
import { Plus, Briefcase, Pencil, Trash2, CalendarClock } from "lucide-react";

import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import DateSelector from "../../components/ui/DateSelector";
import FollowUpModal from "../../components/FollowUpModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/toastContext";
import AccountModal from "./AccountModal/AccountModal";

import { accountsApi } from "../../api/accountsApi";
import {
  ACCOUNT_TABLE_COLUMNS,
  ACCOUNT_STATUS_VARIANT,
} from "../../data/Accountdata";
import { toDateInputValue } from "../../utils/formateDate";

import "./Account.css";

export default function Account() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState(null);

  const [dateAddedFilter, setDateAddedFilter] = useState({
    startDate: null,
    endDate: null,
  });

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, target: null });
  const { success, error } = useToast();

  /* -----------------------------
      FETCH
  ----------------------------- */

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setIsLoading(true);
    try {
      const data = await accountsApi.list();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setIsLoading(false);
    }
  }

  /* -----------------------------
      CRUD
  ----------------------------- */

  async function handleCreateAccount(account) {
  try {
    const created = await accountsApi.create(account);

    setAccounts((prev) => [created, ...prev]);

    success("Account created successfully.");
  } catch (err) {
    console.error("Failed to create account:", err);

    error(
      err?.response?.data?.message ||
        "Failed to create account."
    );
    throw err;
  }
}

  async function handleEditAccount(updatedAccount) {
  try {
    const saved = await accountsApi.update(
      updatedAccount.id,
      updatedAccount
    );

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === saved.id ? saved : a
      )
    );

    setEditingAccount(null);

    success("Account updated successfully.");
  } catch (err) {
    console.error("Failed to update account:", err);

    error(
      err?.response?.data?.message ||
        "Failed to update account."
    );

    throw err;
  }
}

  async function handleDeleteAccount(id) {
  try {
    await accountsApi.remove(id);

    setAccounts((prev) =>
      prev.filter((a) => a.id !== id)
    );

    success("Account deleted successfully.");
  } catch (err) {
    console.error("Failed to delete account:", err);

    error(
      err?.response?.data?.message ||
        "Failed to delete account."
    );

    throw err;
  }
}

  function requestDeleteAccount(account) {
    setConfirmDialog({ isOpen: true, target: account });
  }

  function closeConfirmDialog() {
    setConfirmDialog({ isOpen: false, target: null });
  }

  async function handleConfirmDelete() {
    if (confirmDialog.target) {
      await handleDeleteAccount(confirmDialog.target.id);
    }
    closeConfirmDialog();
  }

  function openFollowUp(account) {
    setFollowUpTarget(account);
    setFollowUpModalOpen(true);
  }

  async function handleSaveFollowUp(payload) {
  try {
    const saved = await accountsApi.followUp(
      followUpTarget.id,
      payload
    );

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === saved.id ? saved : account
      )
    );

    success("Follow-up updated successfully.");
  } catch (err) {
    console.error("Failed to update follow-up:", err);

    error(
      err?.response?.data?.message ||
        "Failed to update follow-up."
    );

    throw err;
  }
}

  function openCreateAccount() {
    setEditingAccount(null);
    setAccountModalOpen(true);
  }

  function openEditAccount(account) {
    setEditingAccount(account);
    setAccountModalOpen(true);
  }

  const filteredAccounts = useMemo(() => {
    const { startDate, endDate } = dateAddedFilter;
    if (!startDate || !endDate) return accounts;

    return accounts.filter((account) => {
      const added = toDateInputValue(account.dateAdded);
      if (!added) return false;
      return added >= startDate && added <= endDate;
    });
  }, [accounts, dateAddedFilter]);

 const columns = ACCOUNT_TABLE_COLUMNS.map((col) => {
  if (col.key === "cyvoraAM") {
    return {
      ...col,
      render: (row) => row.cyvoraAM?.name || "—",
    };
  }

  if (col.key === "status") {
    return {
      ...col,
      render: (row) => (
        <Badge variant={ACCOUNT_STATUS_VARIANT[row.status] || "neutral"}>
          {row.status}
        </Badge>
      ),
    };
  }

  if (col.key === "followUpDate") {
    return {
      ...col,
      render: (row) => (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-ink hover:bg-canvas"
          onClick={(e) => {
            e.stopPropagation();
            openFollowUp(row);
          }}
        >
          <span>
            {toDateInputValue(row.followUpDate) || "Not set"}
          </span>

          {row.followUpHistory?.length > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
              {row.followUpHistory.length}
            </span>
          )}
        </button>
      ),
    };
  }

  return col;
});

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">
            Live and onboarded clients — converted from Leads or added
            directly.
          </p>
        </div>

        <Button leftIcon={<Plus size={16} />} onClick={openCreateAccount}>
          Add Account
        </Button>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border px-5 py-3.5">
          <DateSelector
            mode="range"
            label="Filter by Date Added"
            value={dateAddedFilter}
            onChange={setDateAddedFilter}
            placeholder="All dates"
          />
        </div>

        <div className="p-4">
          <DataTable
            columns={columns}
            data={filteredAccounts}
            keyField="id"
            searchable
            searchPlaceholder="Search by customer name, AM, email..."
            pageSize={10}
            bodyHeight="55vh"
            emptyTitle={isLoading ? "Loading..." : "No Accounts"}
            emptyMessage={
              isLoading
                ? "Fetching accounts from the server..."
                : 'Convert a Live lead, or click "Add Account" to create one directly.'
            }
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Update Follow-up"
                  onClick={() => openFollowUp(row)}
                >
                  <CalendarClock size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  title="Edit Account"
                  onClick={() => openEditAccount(row)}
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  title="Delete Account"
                  onClick={() => requestDeleteAccount(row)}
                >
                  <Trash2 size={16} className="text-danger-500" />
                </Button>
              </div>
            )}
          />
        </div>
      </section>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setEditingAccount(null);
        }}
        mode={editingAccount ? "edit" : "create"}
        account={editingAccount}
        onSave={editingAccount ? handleEditAccount : handleCreateAccount}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setFollowUpModalOpen(false);
          setFollowUpTarget(null);
        }}
        entity={followUpTarget}
        onSave={handleSaveFollowUp}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Delete this account?"
        message={`"${confirmDialog.target?.customerName}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}