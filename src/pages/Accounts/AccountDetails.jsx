import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Route,
  UserRound,
  Users,
} from "lucide-react";

import { accountsApi } from "../../api/Accountsapi";
import { Button, Badge, Spinner } from "../../components/ui";
import Tabs from "../../components/ui/Tabs";
import AccountModal from "./AccountModal/AccountModal";
import { useToast } from "../../context/toastContext";
import { ACCOUNT_STATUS_VARIANT } from "../../data/Accountdata";
import AccountDocuments from "./AccountDocuments";

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Date-only (no time) for fields like follow-up date
const formatDateOnly = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function Detail({ label, value, icon: Icon, multiline = false }) {
  const display =
    value === null || value === undefined || value === ""
      ? "Not provided"
      : value;

  return (
    <div className="min-w-0 py-3">
      <p className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {Icon && <Icon size={14} />}
        {label}
      </p>

      <p
        className={`break-words text-sm font-medium text-ink ${
          multiline ? "whitespace-pre-wrap leading-6" : ""
        }`}
      >
        {display}
      </p>
    </div>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-start gap-3 border-b border-border px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-muted">
          <Icon size={18} />
        </span>

        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 py-1">{children}</div>
    </section>
  );
}

export default function AccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Keep toast callbacks in a ref so they never appear in effect deps.
  // If the toast context returns new function identities on each render,
  // putting them in deps causes endless refetch loops.
  const toastRef = useRef({ success, error });
  toastRef.current = { success, error };

 const VALID_TABS = ["customer", "documents", "followup"];

// inside the component
const [searchParams, setSearchParams] = useSearchParams();
const tabParam = searchParams.get("tab");
const activeTab = VALID_TABS.includes(tabParam) ? tabParam : "customer";

function handleTabChange(tabId) {
  // replace: true so every tab click doesn't add a browser-history entry
  setSearchParams({ tab: tabId }, { replace: true });
}
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState(EMPTY_PAGINATION);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Reset all per-account state when navigating to a different account.
  useEffect(() => {
    setAccount(null);
    setLoading(true);
    setHistory([]);
    setHistoryPage(1);
    setHistoryPagination(EMPTY_PAGINATION);
  }, [id]);

  const loadAccount = useCallback(
    async (isCancelled = () => false) => {
      try {
        // accountsApi.get() already returns response.data.
        const result = await accountsApi.get(id);
        if (isCancelled()) return;
        setAccount(result?.data ?? result);
      } catch (err) {
        if (isCancelled()) return;
        console.error("Failed to load account:", err);
        setAccount(null);
        toastRef.current.error(
          err?.response?.data?.message || "Unable to load this account."
        );
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [id]
  );

  // Only the initial load shows the full-page spinner; refreshes update in place
  // so the page (and an open modal) doesn't unmount/flicker.
  useEffect(() => {
    let cancelled = false;
    loadAccount(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadAccount, refreshKey]);

  // Follow-up history: fetched only when the tab is open, and re-fetched on
  // Refresh / after an account edit (refreshKey).
  useEffect(() => {
    if (activeTab !== "followup") return;

    let cancelled = false;

    async function loadFollowUpHistory() {
      setHistoryLoading(true);

      try {
        const result = await accountsApi.getFollowUpHistory(id, historyPage);
        if (cancelled) return;

        setHistory(result?.data || []);
        setHistoryPagination(
          result?.pagination || { ...EMPTY_PAGINATION, page: historyPage }
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load follow-up history:", err);
        setHistory([]);
        setHistoryPagination((previous) => ({
          ...previous,
          page: historyPage,
          hasNextPage: false,
          hasPreviousPage: historyPage > 1,
        }));

        toastRef.current.error(
          err?.response?.data?.message || "Failed to load follow-up history."
        );
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadFollowUpHistory();

    return () => {
      cancelled = true;
    };
  }, [id, historyPage, activeTab, refreshKey]);

  async function handleSaveAccount(payload) {
    try {
      await accountsApi.update(account.id, payload);

      setEditOpen(false);
      setRefreshKey((current) => current + 1);
      toastRef.current.success("Account updated successfully.");
    } catch (err) {
      toastRef.current.error(
        err?.response?.data?.message || "Failed to update account."
      );
      throw err;
    }
  }

  if (loading && !account) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-ink-muted">
        <Spinner />
        Loading account details...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-8 text-center">
        <Building2 size={32} className="mx-auto mb-3 text-ink-muted" />

        <h1 className="text-lg font-semibold text-ink">Account not found</h1>

        <p className="mt-2 text-sm text-ink-muted">
          This account may have been removed, or you may not have access.
        </p>

        <Button
          className="mt-5"
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/accounts")}
        >
          Back to accounts
        </Button>
      </div>
    );
  }

  const statusVariant = ACCOUNT_STATUS_VARIANT[account.status] || "neutral";
  const createdDate = formatDate(account.dateAdded || account.createdAt);
  const followUpDate = account.followUpDate
    ? formatDateOnly(account.followUpDate)
    : "Not scheduled";

  const rangeStart =
    historyPagination.total === 0
      ? 0
      : (historyPage - 1) * historyPagination.limit + 1;
  const rangeEnd = Math.min(
    historyPage * historyPagination.limit,
    historyPagination.total
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 pb-8">
      <Link
        to="/accounts"
        className="inline-flex w-fit items-center gap-2 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={16} />
        Accounts
      </Link>

      {/* Account header */}
      <header className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-canvas text-ink-muted">
              <Building2 size={27} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {account.customerName || "Unnamed account"}
                </h1>

                <Badge variant={statusVariant} dot>
                  {account.status || "Unknown status"}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-ink-muted">
                Account details and customer relationship overview
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock size={14} />
                  Added {createdDate}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <UserRound size={14} />
                  {account.cyvoraAM?.name || "No company AM assigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={15} />}
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              Refresh
            </Button>

            <Button
              leftIcon={<Pencil size={15} />}
              onClick={() => setEditOpen(true)}
            >
              Edit account
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Agreement",
              value: account.agreementStatus || "Not set",
              icon: FileText,
            },
            {
              label: "Payment terms",
              value: account.payment || "Not set",
              icon: CheckCircle2,
            },
            {
              label: "Credit limit",
              value: account.creditLimit ?? "Not set",
              icon: Users,
            },
            {
              label: "Next follow-up",
              value: followUpDate,
              icon: Clock3,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg bg-canvas/70 p-3.5">
              <p className="text-xs text-ink-muted">{label}</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon size={16} className="shrink-0 text-ink-muted" />
                <span className="break-words">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        {/* key={id} remounts Tabs (back to the first tab) when the account changes */}
        <Tabs
         key={id}
         defaultTabId={activeTab}
         onChange={handleTabChange}
          tabs={[
             {
              id: "followup",
              label: "Follow-up",
              icon: CalendarClock,
              badge: historyPagination.total > 0 ? historyPagination.total : undefined,
              content: (
                <Section
                  title="Follow-up history"
                  description="Complete history of follow-up date changes and remarks."
                  icon={CalendarClock}
                >
                  {historyLoading ? (
                    <div className="flex items-center justify-center gap-3 py-10 text-sm text-ink-muted">
                      <Spinner />
                      Loading follow-up history...
                    </div>
                  ) : history.length > 0 ? (
                    <>
                      <ol className="max-h-[700px] divide-y divide-border overflow-y-auto">
                        {history.map((item) => (
                          <li key={item.id} className="py-4">
                            <div className="flex items-start gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-muted">
                                <Clock3 size={16} />
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-ink-muted">
                                  Recorded {formatDate(item.updatedAt)}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                  <span className="text-ink-muted">{formatDate(item.previousDate)}</span>
                                  <span className="text-ink-muted">→</span>
                                  <span className="font-semibold text-ink">{formatDate(item.newDate)}</span>
                                </div>

                                <div className="mt-2 rounded-lg bg-canvas/70 p-3">
                                  <p className="text-xs font-medium text-ink-muted">Remark</p>
                                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink">
                                    {item.remark || "No remark provided."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>

                      {/* Pagination */}
                      <div className="flex flex-col gap-3 border-t border-border py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-ink-muted">
                          Showing {rangeStart}–{rangeEnd} of {historyPagination.total} follow-ups
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={historyLoading || !historyPagination.hasPreviousPage}
                            onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowLeft size={15} />
                            Previous
                          </button>

                          <span className="min-w-[80px] text-center text-xs text-ink-muted">
                            Page {historyPage} of {historyPagination.totalPages || 1}
                          </span>

                          <button
                            type="button"
                            disabled={historyLoading || !historyPagination.hasNextPage}
                            onClick={() => setHistoryPage((page) => page + 1)}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Next
                            <ArrowLeft className="rotate-180" size={15} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center">
                      <CalendarClock size={24} className="mx-auto text-ink-muted" />
                      <p className="mt-3 text-sm font-medium text-ink">No follow-up history yet</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        Follow-up date changes and remarks will appear here.
                      </p>
                    </div>
                  )}
                </Section>
              ),
            },
            {
              id: "customer",
              label: "Customer Information",
              icon: Users,
              content: (
                <div className="space-y-5">
                  <Section
                    title="Customer information"
                    description="Primary contact and account ownership details."
                    icon={Users}
                  >
                    <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
                      <Detail label="Customer name" value={account.customerName} icon={Building2} />
                      <Detail label="Company account manager" value={account.cyvoraAM?.name} icon={UserRound} />
                      <Detail label="Client account manager" value={account.clientAM} icon={Users} />
                      <Detail label="Email address" value={account.email} icon={Mail} />
                      <Detail label="Phone number" value={account.phoneNumber} icon={Phone} />
                      <Detail label="Teams handle" value={account.teamsHandle} icon={UserRound} />
                    </div>
                  </Section>

                  <Section
                    title="Traffic & requirements"
                    description="Operational context and commercial requirements."
                    icon={Route}
                  >
                    <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
                      <Detail label="Traffic" value={account.traffic} icon={Route} multiline />
                      <Detail label="Routes" value={account.theirRoutes} icon={MapPin} multiline />
                      <Detail label="Customer requirements" value={account.theirRequirements} multiline />
                      <Detail label="Rates offered" value={account.ratesOffered} multiline />
                      <Detail label="Route list / sheet details" value={account.routeListOnSheets} multiline />
                      <Detail label="Next step" value={account.nextStep} icon={CheckCircle2} multiline />
                    </div>

                    {account.statusNotes && (
                      <div className="border-t border-border py-3">
                        <Detail label="Status notes" value={account.statusNotes} multiline />
                      </div>
                    )}
                  </Section>

                  <Section
                    title="Account summary"
                    description="Key dates and commercial status."
                    icon={Building2}
                  >
                    <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
                      <Detail label="Date added" value={createdDate} icon={CalendarClock} />
                      <Detail label="Account status" value={account.status} />
                      <Detail label="Agreement status" value={account.agreementStatus} icon={FileText} />
                      <Detail label="Payment terms" value={account.payment} icon={CheckCircle2} />
                      <Detail label="Credit limit" value={account.creditLimit} />
                    </div>
                  </Section>
                </div>
              ),
            },
            {
              id: "documents",
              label: "Documents",
              icon: FileText,
              content: <AccountDocuments accountId={id} />,
            },
           
          ]}
        />
      </div>

      <AccountModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        account={account}
        onSave={handleSaveAccount}
      />
    </div>
  );
}