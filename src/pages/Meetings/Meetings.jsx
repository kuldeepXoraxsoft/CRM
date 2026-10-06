import { useEffect, useState } from "react";
import { Plus, CalendarClock, Eye, Pencil, Trash2 } from "lucide-react";
import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import { meetingsApi } from "../../api/Meetingsapi";
import { useAuth } from "../../context/AuthContext";
import MeetingModal from "./MeetingModal";
import MeetingDetailsModal from "./MeetingDetailsModal";
import "./meetings.css";

const STATUS_VARIANT = { Scheduled: "primary", Completed: "success", Cancelled: "danger" };

export default function Meetings() {
  const { currentUser } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState({ isOpen: false, target: null });

  async function load() {
    setLoading(true);
    try {
      const result = await meetingsApi.list({ page, limit, search });
      setMeetings(result.data || []);
      setPagination(result.pagination || { total: 0, totalPages: 0 });
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, limit, search]);

  async function save(data) {
    if (editing && !editing.__new) {
      await meetingsApi.update(editing.id, data);
    } else {
      await meetingsApi.create(data);
    }

    setPage(1);
    setEditing(null);
    await load();
  }

  async function remove() {
    if (!confirm.target) return;
    await meetingsApi.remove(confirm.target.id);
    setConfirm({ isOpen: false, target: null });
    await load();
  }

  const canEdit = (meeting) => currentUser?.role === "admin" || meeting.hostId === currentUser?.id;
  const columns = [
    { key: "title", label: "Meeting", render: (row) => <div><div className="font-medium text-ink">{row.title}</div><div className="text-xs text-ink-muted">{row.account?.customerName || row.lead?.customerName || "Internal"}</div></div> },
    { key: "startAt", label: "Date & Time", render: (row) => new Date(row.startAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) },
    { key: "host", label: "Host", render: (row) => row.host?.name || "-" },
    { key: "participants", label: "Participants", render: (row) => row.participants?.length || 0 },
    { key: "status", label: "Status", render: (row) => <Badge variant={STATUS_VARIANT[row.status] || "neutral"}>{row.status}</Badge> },
    { key: 'meetingUrl', label: "Location/Link", render: (row) => <div>
              {row.meetingUrl ? (
                <a
                  href={row.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  Join Meeting
                </a>
              ) : (
                row.location || "-"
              )}
            </div>  },
  ];

  return <div className="teams-page">
    <div className="page-header"><div><h1 className="page-title">Meetings</h1><p className="page-subtitle">Schedule meetings, invite users and track responses.</p></div><Button leftIcon={<Plus size={16} />} onClick={() => setEditing({ __new: true })}>Schedule Meeting</Button></div>
    <section className="rounded-lg border border-border bg-surface p-4">
      <DataTable columns={columns} data={meetings} keyField="id" searchable searchPlaceholder="Search meetings..." serverPagination totalItems={pagination.total} currentPage={page} pageSize={limit} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchDebounceMs={350} bodyHeight="55vh" onRowClick={setViewing} emptyTitle={loading ? "Loading..." : "No Meetings"} emptyMessage={loading ? "Fetching meetings..." : "Schedule your first meeting."} renderActions={(row) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setViewing(row)}><Eye size={15} /></Button>{canEdit(row) && <><Button variant="ghost" size="sm" onClick={() => setEditing(row)}><Pencil size={15} /></Button><Button variant="ghost" size="sm" onClick={() => setConfirm({ isOpen: true, target: row })}><Trash2 size={15} className="text-danger-500" /></Button></>}</div>} />
    </section>
    <MeetingModal isOpen={Boolean(editing)} meeting={editing?.__new ? null : editing} onClose={() => setEditing(null)} onSave={save} />
    <MeetingDetailsModal isOpen={Boolean(viewing)} meeting={viewing} onClose={() => setViewing(null)} onSaved={(updated) => { setViewing(updated); load(); }} />
    <ConfirmDialog isOpen={confirm.isOpen} onClose={() => setConfirm({ isOpen: false, target: null })} onConfirm={remove} variant="danger" title="Delete this meeting?" message={`"${confirm.target?.title}" will be permanently removed.`} confirmLabel="Delete" />
  </div>;
}
