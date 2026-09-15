import { useMemo, useState } from "react";
import { Plus, Route as RouteIcon, Pencil, Trash2 } from "lucide-react";

import { Button, Badge, Select } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";

import RouteModal from "./RouteModal";

import {
  INITIAL_ROUTES,
  ROUTE_TABLE_COLUMNS,
  ROUTE_TYPE_OPTIONS,
  ROUTE_TYPE_VARIANT,
  CONTENT_TYPE_OPTIONS,
  CONTENT_TYPE_VARIANT,
  ROUTE_STATUS_OPTIONS,
  ROUTE_STATUS_VARIANT,
} from "../../data/Routedata";


import "./routes.css";

const ALL_OPTION = { value: "", label: "All" };

export default function AccountRoutes() {
  const [routes, setRoutes] = useState(INITIAL_ROUTES);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, target: null });

  // Filters
  const [routeTypeFilter, setRouteTypeFilter] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* -----------------------------
      CRUD FUNCTIONS
  ----------------------------- */

  function handleCreate(route) {
    setRoutes((prev) => [route, ...prev]);
  }

  function handleEdit(updatedRoute) {
    setRoutes((prev) =>
      prev.map((route) => (route.id === updatedRoute.id ? updatedRoute : route))
    );
    setEditingRoute(null);
  }

  function handleDelete(id) {
    setRoutes((prev) => prev.filter((route) => route.id !== id));
  }

  function requestDelete(route) {
    setConfirmDialog({ isOpen: true, target: route });
  }

  function handleConfirmDelete() {
    if (confirmDialog.target) {
      handleDelete(confirmDialog.target.id);
    }
    setConfirmDialog({ isOpen: false, target: null });
  }

  function openCreate() {
    setEditingRoute(null);
    setModalOpen(true);
  }

  function openEdit(route) {
    setEditingRoute(route);
    setModalOpen(true);
  }

  /* -----------------------------
      FILTERS
  ----------------------------- */

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (routeTypeFilter && route.routeType !== routeTypeFilter) return false;
      if (contentTypeFilter && route.contentType !== contentTypeFilter) return false;
      if (statusFilter && route.status !== statusFilter) return false;
      return true;
    });
  }, [routes, routeTypeFilter, contentTypeFilter, statusFilter]);

  /* -----------------------------
      TABLE COLUMNS
  ----------------------------- */

  const columns = ROUTE_TABLE_COLUMNS.map((col) => {
    if (col.key === "routeType") {
      return {
        ...col,
        render: (row) => (
          <Badge variant={ROUTE_TYPE_VARIANT[row.routeType] || "neutral"}>
            {row.routeType}
          </Badge>
        ),
      };
    }

    if (col.key === "contentType") {
      return {
        ...col,
        render: (row) => (
          <Badge variant={CONTENT_TYPE_VARIANT[row.contentType] || "neutral"}>
            {row.contentType}
          </Badge>
        ),
      };
    }

    if (col.key === "status") {
      return {
        ...col,
        render: (row) => (
          <Badge variant={ROUTE_STATUS_VARIANT[row.status] || "neutral"}>{row.status}</Badge>
        ),
      };
    }

    if (col.key === "costRate" || col.key === "sellingRate") {
      return { ...col, render: (row) => (row[col.key] ? `$${row[col.key]}` : "-") };
    }

    if (col.key === "dlr") {
      return { ...col, render: (row) => (row.dlr ? `${row.dlr}%` : "-") };
    }

    return col;
  });

  return (
    <div className="routes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Routes</h1>
          <p className="page-subtitle">
            Vendor route catalog — connection type, content allowed, cost vs.
            selling rate, and current status.
          </p>
        </div>

        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Add Route
        </Button>
      </div>

      <section className="routes-panel">
        <div className="routes-panel-filters">
          
          <Select
            label="Route Type"
            options={[ALL_OPTION, ...ROUTE_TYPE_OPTIONS]}
            value={routeTypeFilter}
            onChange={(e) => setRouteTypeFilter(e.target.value)}
          />

          <Select
            label="Content Type"
            options={[ALL_OPTION, ...CONTENT_TYPE_OPTIONS]}
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
          />

          <Select
            label="Status"
            options={[ALL_OPTION, ...ROUTE_STATUS_OPTIONS]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        <div className="routes-panel-body">
          <DataTable
            columns={columns}
            data={filteredRoutes}
            keyField="id"
            searchable
            searchPlaceholder="Search by destination, vendor, network..."
            pageSize={10}
            bodyHeight="55vh"
            emptyTitle="No Routes"
            emptyMessage='Click "Add Route" to add your first route.'
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(row)}>
                  <Pencil size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  title="Delete"
                  onClick={() => requestDelete(row)}
                >
                  <Trash2 size={16} className="text-danger-500" />
                </Button>
              </div>
            )}
          />
        </div>
      </section>

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRoute(null);
        }}
        mode={editingRoute ? "edit" : "create"}
        route={editingRoute}
        onSave={editingRoute ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, target: null })}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Delete this route?"
        message={`The ${confirmDialog.target?.destination} route via ${confirmDialog.target?.vendor} will be permanently removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}