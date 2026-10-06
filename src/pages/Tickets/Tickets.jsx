import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, UserRoundCog } from "lucide-react";
import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import { ticketsApi } from "../../api/Ticketsapi";
import TicketModal from "./TicketModal";
import TicketDetailsModal from "./TicketDetailsModal";
import AssignTicketModal from "./AssignTicketModal";
import { useAuth } from "../../context/AuthContext";

const pv = { Low: "success", Medium: "warning", High: "danger", Urgent: "danger" };
const sv = { Open: "primary", "In Progress": "warning", Pending: "neutral", Resolved: "success", Closed: "neutral" };

export default function Tickets() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [assigning, setAssigning] = useState(null);

 const load = async () => {
  setLoading(true);
  try {
    const result = await ticketsApi.list({ page, limit, search });
    setTickets(result.data || []);
    setPagination(result.pagination || { total: 0, totalPages: 0 });
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  load();
}, [page, limit, search]);

  async function save(data) {
    if (editing?.__new) await ticketsApi.create(data);
    else await ticketsApi.update(editing.id, data);
    setEditing(null);
    setPage(1);
    await load();
  }

  const canEdit = (ticket) => currentUser?.role === "admin" || currentUser?.role === "superAdmin" || ticket.createdById === currentUser?.id || ticket.assigneeId === currentUser?.id;
  const canAssign = currentUser?.role === "manager" || currentUser?.role === "admin" || currentUser?.role === "superAdmin";
  const columns = [
    { key: "ticketNumber", label: "#", render: (row) => <span className="font-medium">#{row.ticketNumber}</span> },
    { key: "title", label: "Issue", render: (row) => <div><div className="font-medium text-ink">{row.title}</div><div className="text-xs text-ink-muted">{row.account?.customerName || row.lead?.customerName || row.category}</div></div> },
    { key: "assignee", label: "Assigned To", render: (row) => row.assignee?.name || "Unassigned" },
    { key:"createdBy", label: "Raised By", render: (row) => row.createdBy?.name || "Unassigned"},
    { key: "priority", label: "Priority", render: (row) => <Badge variant={pv[row.priority] || "neutral"}>{row.priority}</Badge> },
    { key: "status", label: "Status", render: (row) => <Badge variant={sv[row.status] || "neutral"}>{row.status}</Badge> },
    { key: "createdAt", label: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN") },
  ];

  return <div className="teams-page">
    <div className="page-header"><div><h1 className="page-title">Tickets</h1><p className="page-subtitle">Track customer and internal issues from creation to resolution.</p></div><Button leftIcon={<Plus size={16} />} onClick={() => setEditing({ __new: true })}>Raise Ticket</Button></div>
    <section className="rounded-lg border border-border bg-surface p-4">
      <DataTable columns={columns} data={tickets} keyField="id" searchable searchPlaceholder="Search tickets..." serverPagination totalItems={pagination.total} currentPage={page} pageSize={limit} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchDebounceMs={350} bodyHeight="55vh" onRowClick={setViewing} emptyTitle={loading ? "Loading..." : "No Tickets"} emptyMessage={loading ? "Fetching tickets..." : "Create your first issue ticket."} renderActions={(row) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setViewing(row)}><Eye size={15} /></Button>{canEdit(row) && <Button variant="ghost" size="sm" onClick={() => setEditing(row)}><Pencil size={15} /></Button>}{canAssign && <Button variant="ghost" size="sm" title="Assign ticket" onClick={() => setAssigning(row)}><UserRoundCog size={15} /></Button>}</div>} />
    </section>
    <TicketModal isOpen={Boolean(editing)} ticket={editing?.__new ? null : editing} onClose={() => setEditing(null)} onSave={save} />
    <TicketDetailsModal isOpen={Boolean(viewing)} ticket={viewing} onClose={() => setViewing(null)} onSaved={(updated) => { setViewing(updated); load(); }} />
    {canAssign && <AssignTicketModal isOpen={Boolean(assigning)} ticket={assigning} onClose={() => setAssigning(null)} onAssign={async (assigneeId) => { const updated = await ticketsApi.assign(assigning.id, assigneeId); setAssigning(null); setViewing((current) => current?.id === updated.id ? updated : current); await load(); }} />}
  </div>;
}
