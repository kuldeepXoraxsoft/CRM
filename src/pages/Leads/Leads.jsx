import { useEffect, useState } from "react";
import {
  Plus,
  UploadCloud,
  ArrowRightCircle,
  Pencil,
  Trash2,
  CalendarClock,
} from "lucide-react";

import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
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
import useDebounce from "../../hooks/useDebouce";

import "./Leads.css";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* -----------------------------
      SERVER PAGINATION
  ----------------------------- */

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* -----------------------------
      SERVER SEARCH
  ----------------------------- */

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  /* -----------------------------
      MODALS
  ----------------------------- */

  const [isLeadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [isBulkModalOpen, setBulkModalOpen] = useState(false);

  const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState(null);

  /* -----------------------------
      CONFIRM DIALOG
  ----------------------------- */

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    target: null,
  });

  /* -----------------------------
      FETCH
  ----------------------------- */

  useEffect(() => {
    fetchLeads();
  }, [page, pageSize, debouncedSearch, refreshKey]);

  async function fetchLeads() {
    setIsLoading(true);

    try {
      const response = await leadsApi.list({
        page,
        limit: pageSize,
        search: debouncedSearch,
      });

      setLeads(response?.data || []);

      setPagination(
        response?.pagination || {
          page,
          limit: pageSize,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Failed to fetch leads:", err);

      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }

  function refreshLeads() {
    setRefreshKey((prev) => prev + 1);
  }

  /* -----------------------------
      SEARCH
  ----------------------------- */

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  /* -----------------------------
      PAGINATION
  ----------------------------- */

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  function handlePageSizeChange(newSize) {
    setPageSize(Number(newSize));
    setPage(1);
  }

  /* -----------------------------
      LEAD CRUD
  ----------------------------- */

  async function handleCreateLead(lead) {
    try {
      await leadsApi.create(lead);

      setPage(1);
      refreshLeads();
    } catch (err) {
      console.error("Failed to create lead:", err);
      throw err;
    }
  }

  async function handleEditLead(updatedLead) {
    try {
      await leadsApi.update(
        updatedLead.id,
        updatedLead
      );

      setEditingLead(null);
      setLeadModalOpen(false);

      refreshLeads();
    } catch (err) {
      console.error("Failed to update lead:", err);
      throw err;
    }
  }

  async function handleDeleteLead(id) {
    try {
      await leadsApi.remove(id);

      /*
       * If the deleted lead was the only item
       * on the current page, move back one page.
       */
      if (leads.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }

      refreshLeads();
    } catch (err) {
      console.error("Failed to delete lead:", err);
      throw err;
    }
  }

  async function handleBulkImport(newLeads) {
    try {
      await leadsApi.bulkCreate(newLeads);

      setPage(1);
      refreshLeads();
    } catch (err) {
      console.error("Failed to bulk import leads:", err);
      throw err;
    }
  }

  /* -----------------------------
      LEAD -> ACCOUNT
  ----------------------------- */

  async function handleConvertToAccount(lead) {
    try {
      await leadsApi.convert(lead.id);

      if (leads.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }

      refreshLeads();
    } catch (err) {
      console.error(
        "Failed to convert lead to account:",
        err
      );

      throw err;
    }
  }

  /* -----------------------------
      CONFIRM DIALOG
  ----------------------------- */

  function requestDeleteLead(lead) {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      target: lead,
    });
  }

  function requestConvertToAccount(lead) {
    setConfirmDialog({
      isOpen: true,
      type: "convert",
      target: lead,
    });
  }

  function closeConfirmDialog() {
    setConfirmDialog({
      isOpen: false,
      type: null,
      target: null,
    });
  }

  async function handleConfirmDialogConfirm() {
    const { type, target } = confirmDialog;

    if (!target) {
      closeConfirmDialog();
      return;
    }

    try {
      if (type === "delete") {
        await handleDeleteLead(target.id);
      }

      if (type === "convert") {
        await handleConvertToAccount(target);
      }
    } finally {
      closeConfirmDialog();
    }
  }

  /* -----------------------------
      FOLLOW-UP
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

    /*
     * Update the current row immediately.
     * No need to fetch the entire page just for
     * the follow-up response.
     */
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === saved.id ? saved : lead
      )
    );

    setFollowUpTarget(saved);
  }

  /* -----------------------------
      MODAL HELPERS
  ----------------------------- */

  function openCreateLead() {
    setEditingLead(null);
    setLeadModalOpen(true);
  }

  function openEditLead(lead) {
    setEditingLead(lead);
    setLeadModalOpen(true);
  }

  function closeLeadModal() {
    setLeadModalOpen(false);
    setEditingLead(null);
  }

  function closeFollowUpModal() {
    setFollowUpModalOpen(false);
    setFollowUpTarget(null);
  }

  /* -----------------------------
      TABLE COLUMNS
  ----------------------------- */

  const columns = LEAD_TABLE_COLUMNS.map((col) => {
    if (col.key === "status") {
      return {
        ...col,
        render: (row) => (
          <Badge
            variant={
              LEAD_STATUS_VARIANT[row.status] ||
              "neutral"
            }
          >
            {row.status}
          </Badge>
        ),
      };
    }

    if (col.key === "dateAdded") {
      return {
        ...col,
        render: (row) =>
          toDateInputValue(row.dateAdded) || "-",
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
              {toDateInputValue(row.followUpDate) ||
                "Not set"}
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

    if (col.key === "department") {
      return {
        ...col,
        render: (row) =>
          row.department?.name || "-",
      };
    }

    if (col.key === "cyvoraAM") {
      return {
        ...col,
        render: (row) =>
          row.cyvoraAM?.name || "-",
      };
    }

    return col;
  });

  /* -----------------------------
      RENDER
  ----------------------------- */

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Leads
          </h1>

          <p className="page-subtitle">
            Manage incoming leads, track their
            progress, and convert them into accounts
            once the deal is closed.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<UploadCloud size={16} />}
            onClick={() =>
              setBulkModalOpen(true)
            }
          >
            Bulk Upload
          </Button>

          <Button
            leftIcon={<Plus size={16} />}
            onClick={openCreateLead}
          >
            Add Lead
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={leads}
            keyField="id"

            searchable
            searchPlaceholder="Search by customer name, AM, email..."

            serverPagination
            currentPage={page}
            totalItems={pagination.total}

            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSizeSelector

            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}

            bodyHeight="55vh"

            emptyTitle={
              isLoading
                ? "Loading..."
                : "No Leads"
            }

            emptyMessage={
              isLoading
                ? "Fetching leads from the server..."
                : search
                ? "No leads match your search."
                : 'Click "Add Lead" or "Bulk Upload" to add your first leads.'
            }

            renderActions={(row) => (
              <div className="flex items-center gap-1">
                {CONVERTIBLE_STATUSES.includes(
                  row.status
                ) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Convert to Account"
                    onClick={() =>
                      requestConvertToAccount(row)
                    }
                  >
                    <ArrowRightCircle
                      size={16}
                      className="text-success-600"
                    />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  title="Update Follow-up"
                  onClick={() =>
                    openFollowUp(row)
                  }
                >
                  <CalendarClock size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  title="Edit Lead"
                  onClick={() =>
                    openEditLead(row)
                  }
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  title="Delete Lead"
                  onClick={() =>
                    requestDeleteLead(row)
                  }
                >
                  <Trash2
                    size={16}
                    className="text-danger-500"
                  />
                </Button>
              </div>
            )}
          />
        </div>
      </section>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={closeLeadModal}
        mode={
          editingLead ? "edit" : "create"
        }
        lead={editingLead}
        onSave={
          editingLead
            ? handleEditLead
            : handleCreateLead
        }
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() =>
          setBulkModalOpen(false)
        }
        onBulkImport={handleBulkImport}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={closeFollowUpModal}
        entity={followUpTarget}
        onSave={handleSaveFollowUp}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDialogConfirm}
        variant={
          confirmDialog.type === "delete"
            ? "danger"
            : "default"
        }
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
        confirmLabel={
          confirmDialog.type === "delete"
            ? "Delete"
            : "Convert"
        }
      />
    </div>
  );
}