import { useEffect, useState } from "react";
import {
  Plus,
  Building2,
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import Tabs from "../../components/ui/Tabs";
import ConfirmDialog from "../../components/ConfirmDialog";

import DepartmentModal from "./Departmentmodal/DepartmentModal";
import AdminModal from "./Adminmodal/AdminModal";

import managementApi from "../../api/Managementapi";
import { useToast } from "../../context/toastContext";


export default function Management() {
  const { success, error } = useToast();

  const [departments, setDepartments] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);

  const [departmentModal, setDepartmentModal] = useState({
    isOpen: false,
    mode: "create",
    department: null,
  });

  const [adminModal, setAdminModal] = useState({
    isOpen: false,
    mode: "create",
    admin: null,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    target: null,
  });

  // =====================================================
  // FETCH
  // =====================================================

  useEffect(() => {
    fetchDepartments();
    fetchAdmins();
  }, []);

  async function fetchDepartments() {
    setDepartmentsLoading(true);

    try {
      const response = await managementApi.getDepartments();

      setDepartments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);

      error(
        err?.response?.data?.message ||
          "Failed to load departments."
      );
    } finally {
      setDepartmentsLoading(false);
    }
  }

  async function fetchAdmins() {
    setAdminsLoading(true);

    try {
      const response = await managementApi.getAdmins();

      setAdmins(response.data || []);
    } catch (err) {
      console.error("Failed to fetch admins:", err);

      error(
        err?.response?.data?.message ||
          "Failed to load admins."
      );
    } finally {
      setAdminsLoading(false);
    }
  }

  // =====================================================
  // DEPARTMENT MODAL
  // =====================================================

  function openCreateDepartment() {
    setDepartmentModal({
      isOpen: true,
      mode: "create",
      department: null,
    });
  }

  function openEditDepartment(department) {
    setDepartmentModal({
      isOpen: true,
      mode: "edit",
      department,
    });
  }

  function closeDepartmentModal() {
    setDepartmentModal({
      isOpen: false,
      mode: "create",
      department: null,
    });
  }

  // =====================================================
  // ADMIN MODAL
  // =====================================================

  function openCreateAdmin() {
    setAdminModal({
      isOpen: true,
      mode: "create",
      admin: null,
    });
  }

  function openEditAdmin(admin) {
    setAdminModal({
      isOpen: true,
      mode: "edit",
      admin,
    });
  }

  function closeAdminModal() {
    setAdminModal({
      isOpen: false,
      mode: "create",
      admin: null,
    });
  }

  // =====================================================
  // DEPARTMENT CRUD
  // =====================================================

  async function handleDepartmentSave(form) {
    try {
      if (departmentModal.mode === "create") {
        await managementApi.createDepartment(form);

        success("Department created successfully.");
      } else {
        await managementApi.updateDepartment(
          departmentModal.department.id,
          form
        );

        success("Department updated successfully.");
      }

      closeDepartmentModal();
      fetchDepartments();
    } catch (err) {
      console.error("Failed to save department:", err);

      error(
        err?.response?.data?.message ||
          "Failed to save department."
      );

      throw err;
    }
  }

  function requestDeleteDepartment(department) {
    setConfirmDialog({
      isOpen: true,
      type: "department",
      target: department,
    });
  }

  async function deleteDepartment() {
    if (!confirmDialog.target) return;

    try {
      await managementApi.deleteDepartment(
        confirmDialog.target.id
      );

      success("Department deleted successfully.");

      fetchDepartments();
      closeConfirmDialog();
    } catch (err) {
      console.error("Failed to delete department:", err);

      error(
        err?.response?.data?.message ||
          "Failed to delete department."
      );

      closeConfirmDialog();
    }
  }

  // =====================================================
  // ADMIN CRUD
  // =====================================================

  async function handleAdminSave(form) {
    try {
      if (adminModal.mode === "create") {
        await managementApi.createAdmin(form);

        success("Admin created successfully.");
      } else {
        await managementApi.updateAdmin(
          adminModal.admin.id,
          form
        );

        success("Admin updated successfully.");
      }

      closeAdminModal();
      fetchAdmins();
    } catch (err) {
      console.error("Failed to save admin:", err);

      error(
        err?.response?.data?.message ||
          "Failed to save admin."
      );

      throw err;
    }
  }

  function requestDeleteAdmin(admin) {
    setConfirmDialog({
      isOpen: true,
      type: "admin",
      target: admin,
    });
  }

  async function deleteAdmin() {
    if (!confirmDialog.target) return;

    try {
      await managementApi.deleteAdmin(
        confirmDialog.target.id
      );

      success("Admin deleted successfully.");

      fetchAdmins();
      closeConfirmDialog();
    } catch (err) {
      console.error("Failed to delete admin:", err);

      error(
        err?.response?.data?.message ||
          "Failed to delete admin."
      );

      closeConfirmDialog();
    }
  }

  // =====================================================
  // CONFIRM DIALOG
  // =====================================================

  function closeConfirmDialog() {
    setConfirmDialog({
      isOpen: false,
      type: null,
      target: null,
    });
  }

  async function handleConfirmDelete() {
    if (confirmDialog.type === "department") {
      await deleteDepartment();
      return;
    }

    if (confirmDialog.type === "admin") {
      await deleteAdmin();
    }
  }

  // =====================================================
  // DEPARTMENT TABLE
  // =====================================================

  const departmentColumns = [
    {
      key: "name",
      label: "Department",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="management-icon">
            <Building2 size={18} />
          </div>

          <div>
            <div className="font-medium text-ink">
              {row.name}
            </div>

            <div className="text-xs text-ink-muted">
              Created{" "}
              {row.createdAt
                ? new Date(row.createdAt).toLocaleDateString(
                    "en-IN"
                  )
                : "-"}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: "usersCount",
      label: "Users",
      render: (row) => row._count?.users ?? 0,
    },

    {
      key: "teamsCount",
      label: "Teams",
      render: (row) => row._count?.teams ?? 0,
    },

    {
      key: "leadsCount",
      label: "Leads",
      render: (row) => row._count?.leads ?? 0,
    },

    {
      key: "accountsCount",
      label: "Accounts",
      render: (row) => row._count?.accounts ?? 0,
    },
  ];

  // =====================================================
  // ADMIN TABLE
  // =====================================================

  const adminColumns = [
    {
      key: "name",
      label: "Admin",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="admin-avatar">
            <ShieldCheck size={18} />
          </div>

          <div>
            <div className="font-medium text-ink">
              {row.name}
            </div>

            <div className="text-xs text-ink-muted">
              {row.email}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: "department",
      label: "Department",
      render: (row) =>
        row.department?.name || "-",
    },

    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Active"
              ? "success"
              : "secondary"
          }
        >
          {row.status}
        </Badge>
      ),
    },

    {
      key: "joinedDate",
      label: "Joined",
      render: (row) =>
        row.joinedDate
          ? new Date(
              row.joinedDate
            ).toLocaleDateString("en-IN")
          : "-",
    },
  ];

  // =====================================================
  // TABS
  // =====================================================

  const tabs = [
    {
      id: "departments",
      label: "Departments",
      icon: Building2,
      badge: departments.length,

      content: (
        <section className="mt-4 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Departments
              </h2>

              <p className="mt-0.5 text-xs text-ink-muted">
                Manage company departments.
              </p>
            </div>

            <Button
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={openCreateDepartment}
            >
              Add Department
            </Button>
          </div>

          <div className="p-4">
            <DataTable
              columns={departmentColumns}
              data={departments}
              keyField="id"
              searchable
              searchPlaceholder="Search departments..."
              pageSize={10}
              bodyHeight="50vh"
              emptyTitle={
                departmentsLoading
                  ? "Loading..."
                  : "No Departments"
              }
              emptyMessage={
                departmentsLoading
                  ? "Fetching departments..."
                  : 'Click "Add Department" to create your first department.'
              }
              renderActions={(row) => (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Edit Department"
                    onClick={() =>
                      openEditDepartment(row)
                    }
                  >
                    <Pencil size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    title="Delete Department"
                    onClick={() =>
                      requestDeleteDepartment(row)
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
      ),
    },

    {
      id: "admins",
      label: "Admins",
      icon: ShieldCheck,
      badge: admins.length,

      content: (
        <section className="mt-4 rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Administrators
              </h2>

              <p className="mt-0.5 text-xs text-ink-muted">
                Manage department administrators.
              </p>
            </div>

            <Button
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={openCreateAdmin}
            >
              Add Admin
            </Button>
          </div>

          <div className="p-4">
            <DataTable
              columns={adminColumns}
              data={admins}
              keyField="id"
              searchable
              searchPlaceholder="Search admins..."
              pageSize={10}
              bodyHeight="50vh"
              emptyTitle={
                adminsLoading
                  ? "Loading..."
                  : "No Admins"
              }
              emptyMessage={
                adminsLoading
                  ? "Fetching administrators..."
                  : 'Click "Add Admin" to create your first administrator.'
              }
              renderActions={(row) => (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Edit Admin"
                    onClick={() =>
                      openEditAdmin(row)
                    }
                  >
                    <Pencil size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    title="Delete Admin"
                    onClick={() =>
                      requestDeleteAdmin(row)
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
      ),
    },
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Management
          </h1>

          <p className="page-subtitle">
            Manage departments and administrators.
          </p>
        </div>
      </div>

      <Tabs
        tabs={tabs}
        defaultTabId="departments"
      />

      {/* Department Modal */}
      <DepartmentModal
        isOpen={departmentModal.isOpen}
        mode={departmentModal.mode}
        department={departmentModal.department}
        onClose={closeDepartmentModal}
        onSave={handleDepartmentSave}
      />

      {/* Admin Modal */}
      <AdminModal
        isOpen={adminModal.isOpen}
        mode={adminModal.mode}
        admin={adminModal.admin}
        departments={departments}
        onClose={closeAdminModal}
        onSave={handleAdminSave}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title={
          confirmDialog.type === "department"
            ? "Delete this department?"
            : "Delete this admin?"
        }
        message={
          confirmDialog.type === "department"
            ? `"${confirmDialog.target?.name}" will be permanently removed. This can't be undone.`
            : `"${confirmDialog.target?.name}" will be permanently removed. This can't be undone.`
        }
        confirmLabel="Delete"
      />
    </div>
  );
}