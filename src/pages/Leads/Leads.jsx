import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  UploadCloud,
  Users,
  ArrowRightCircle,
  Pencil,
  Trash2,
  CalendarClock,
} from "lucide-react";

import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import DateSelector from "../../components/ui/DateSelector";
import FollowUpModal from "../../components/FollowUpModal";
import ConfirmDialog from "../../components/ConfirmDialog";

import LeadModal from "./LeadModal";
import BulkUploadModal from "./BulkUploadModal/BulkUploadModal";

import {
  LEAD_TABLE_COLUMNS,
  LEAD_STATUS_VARIANT,
  CONVERTIBLE_STATUSES,
} from "../../data/Leaddata";

import { leadsApi } from "../../api/Leadsapi";
import { toDateInputValue } from "../../utils/formateDate";

import "./Leads.css";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isLeadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [isBulkModalOpen, setBulkModalOpen] = useState(false);

  const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState(null);

  const [dateAddedFilter, setDateAddedFilter] = useState({
    startDate: null,
    endDate: null,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null, // "delete" | "convert"
    target: null,
  });

  /* -----------------------------
      FETCH
  ----------------------------- */

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setIsLoading(true);
    try {
      const data = await leadsApi.list();
      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setIsLoading(false);
    }
  }

  /* -----------------------------
      LEAD CRUD FUNCTIONS
  ----------------------------- */

  async function handleCreateLead(lead) {
    const created = await leadsApi.create(lead);
    setLeads((prev) => [created, ...prev]);
  }

  async function handleEditLead(updatedLead) {
    const saved = await leadsApi.update(updatedLead.id, updatedLead);
    setLeads((prev) => prev.map((lead) => (lead.id === saved.id ? saved : lead)));
    setEditingLead(null);
  }

  async function handleDeleteLead(id) {
    await leadsApi.remove(id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }

  async function handleBulkImport(newLeads) {
    const { leads: created } = await leadsApi.bulkCreate(newLeads);
    setLeads((prev) => [...created, ...prev]);
  }

  /* -----------------------------
      LEAD -> ACCOUNT CONVERSION
      Backend creates the Account and deletes the Lead in one
      transaction. Visiting /accounts fetches fresh, so the new
      account will already be there.
  ----------------------------- */

  async function handleConvertToAccount(lead) {
    await leadsApi.convert(lead.id);
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
  }

  /* -----------------------------
      CONFIRM DIALOG
  ----------------------------- */

  function requestDeleteLead(lead) {
    setConfirmDialog({ isOpen: true, type: "delete", target: lead });
  }

  function requestConvertToAccount(lead) {
    setConfirmDialog({ isOpen: true, type: "convert", target: lead });
  }

  function closeConfirmDialog() {
    setConfirmDialog({ isOpen: false, type: null, target: null });
  }

  async function handleConfirmDialogConfirm() {
    const { type, target } = confirmDialog;

    if (type === "delete") {
      await handleDeleteLead(target.id);
    } else if (type === "convert") {
      await handleConvertToAccount(target);
    }

    closeConfirmDialog();
  }

  /* -----------------------------
      FOLLOW-UP FLOW
      NOTE: no try/catch here - errors must propagate up to
      FollowUpModal so it can show the message and decide whether to
      close itself.
  ----------------------------- */

  function openFollowUp(lead) {
    setFollowUpTarget(lead);
    setFollowUpModalOpen(true);
  }

  async function handleSaveFollowUp(payload) {
    const saved = await leadsApi.followUp(
      followUpTarget.id,
      payload
    );

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === saved.id ? saved : lead
      )
    );

    setFollowUpTarget(saved);
  }

  /* -----------------------------
      OPEN MODALS
  ----------------------------- */

  function openCreateLead() {
    setEditingLead(null);
    setLeadModalOpen(true);
  }

  function openEditLead(lead) {
    setEditingLead(lead);
    setLeadModalOpen(true);
  }

  /* -----------------------------
      DATE ADDED RANGE FILTER
  ----------------------------- */

  const filteredLeads = useMemo(() => {
    const { startDate, endDate } = dateAddedFilter;
    if (!startDate || !endDate) return leads;

    return leads.filter((lead) => {
      const added = toDateInputValue(lead.dateAdded);
      if (!added) return false;
      return added >= startDate && added <= endDate;
    });
  }, [leads, dateAddedFilter]);

  /* -----------------------------
      TABLE COLUMNS
  ----------------------------- */

 const columns = LEAD_TABLE_COLUMNS.map((col) => {
  if (col.key === "status") {
    return {
      ...col,
      render: (row) => (
        <Badge variant={LEAD_STATUS_VARIANT[row.status] || "neutral"}>
          {row.status}
        </Badge>
      ),
    };
  }

  if (col.key === "dateAdded") {
    return {
      ...col,
      render: (row) => toDateInputValue(row.dateAdded) || "-",
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
          <span>{toDateInputValue(row.followUpDate) || "Not set"}</span>

          {row.followUpHistory?.length > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
              {row.followUpHistory.length}
            </span>
          )}
        </button>
      ),
    };
  }

  // Department object -> department.name
  if (col.key === "department") {
    return {
      ...col,
      render: (row) => row.department?.name || "-",
    };
  }

  // Cyvora AM object -> cyvoraAM.name
  if (col.key === "cyvoraAM") {
    return {
      ...col,
      render: (row) => row.cyvoraAM?.name || "-",
    };
  }

  return col;
});

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">
            Manage incoming leads, track their progress, and convert them
            into accounts once the deal is closed.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<UploadCloud size={16} />}
            onClick={() => setBulkModalOpen(true)}
          >
            Bulk Upload
          </Button>

          <Button leftIcon={<Plus size={16} />} onClick={openCreateLead}>
            Add Lead
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        {/* <div className="border-b border-border px-5 py-3.5">
          <DateSelector
            mode="range"
            label="Filter by Date Added"
            value={dateAddedFilter}
            onChange={setDateAddedFilter}
            placeholder="All dates"
          />
        </div> */}

        <div className="p-4">
          <DataTable
            columns={columns}
            data={filteredLeads}
            keyField="id"
            searchable
            searchPlaceholder="Search by customer name, AM, email..."
            pageSize={10}
            bodyHeight="55vh"
            emptyTitle={isLoading ? "Loading..." : "No Leads"}
            emptyMessage={
              isLoading
                ? "Fetching leads from the server..."
                : 'Click "Add Lead" or "Bulk Upload" to add your first leads.'
            }
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                {CONVERTIBLE_STATUSES.includes(row.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Convert to Account"
                    onClick={() => requestConvertToAccount(row)}
                  >
                    <ArrowRightCircle size={16} className="text-success-600" />
                  </Button>
                )}

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
                  title="Edit Lead"
                  onClick={() => openEditLead(row)}
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  title="Delete Lead"
                  onClick={() => requestDeleteLead(row)}
                >
                  <Trash2 size={16} className="text-danger-500" />
                </Button>
              </div>
            )}
          />
        </div>
      </section>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setLeadModalOpen(false);
          setEditingLead(null);
        }}
        mode={editingLead ? "edit" : "create"}
        lead={editingLead}
        onSave={editingLead ? handleEditLead : handleCreateLead}
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onBulkImport={handleBulkImport}
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
        onConfirm={handleConfirmDialogConfirm}
        variant={confirmDialog.type === "delete" ? "danger" : "default"}
        title={
          confirmDialog.type === "delete"
            ? "Delete this lead?"
            : "Convert to Account?"
        }
        message={
          confirmDialog.type === "delete"
            ? `"${confirmDialog.target?.customerName}" will be permanently removed. This can't be undone.`
            : `"${confirmDialog.target?.customerName}" will be moved out of Leads and created as a new Account.`
        }
        confirmLabel={confirmDialog.type === "delete" ? "Delete" : "Convert"}
      />
    </div>
  );
}