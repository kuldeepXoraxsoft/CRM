import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmployeeModal from "../../components/EmployeeModal";

import { useEmployees } from "../../hooks/useEmployees";
import { useTeams } from "../../hooks/useTeams";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../hooks/useActivity";

import { EMPLOYEE_TABLE_COLUMNS } from "../../data/Employeedata";
import { ROLE_LABELS, ROLE_BADGE_VARIANT } from "../../utils/roles";

export default function Employees() {
  const {
    getVisibleEmployees,
    getEmployeeName,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isLoading,
  } = useEmployees();

  const { getTeamName } = useTeams();
  const { currentUser, can } = useAuth();
  const { logActivity } = useActivity();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, target: null });

  const visibleEmployees = getVisibleEmployees(currentUser).map((emp) => ({
    ...emp,
    managerName: emp.managerId ? getEmployeeName(emp.managerId) : "—",
    teamName: emp.teamId ? getTeamName(emp.teamId) : "—",
  }));

  function openCreate() {
    setEditingEmployee(null);
    setModalOpen(true);
  }

  async function handleCreate(employee) {
    const created = await addEmployee(employee);
    logActivity({
      message: `${currentUser.name} added ${created.name} as a new employee`,
      type: "employee",
    });
    setModalOpen(false);
  }

  function openEdit(employee) {
    setEditingEmployee(employee);
    setModalOpen(true);
  }

  async function handleEdit(updatedEmployee) {
    const saved = await updateEmployee(updatedEmployee);
    logActivity({ message: `${currentUser.name} updated ${saved.name}`, type: "employee" });
    setEditingEmployee(null);
    setModalOpen(false);
  }

  function requestDelete(employee) {
    setConfirmDialog({ isOpen: true, target: employee });
  }

  function closeConfirmDialog() {
    setConfirmDialog({ isOpen: false, target: null });
  }

  async function handleConfirmDelete() {
    if (confirmDialog.target) {
      await deleteEmployee(confirmDialog.target.id);
      logActivity({
        message: `${currentUser.name} removed ${confirmDialog.target.name}`,
        type: "employee",
      });
    }
    closeConfirmDialog();
  }

  const columns = EMPLOYEE_TABLE_COLUMNS.map((col) => {
    if (col.key === "role") {
      return {
        ...col,
        render: (row) => (
          <Badge variant={ROLE_BADGE_VARIANT[row.role] || "neutral"}>
            {ROLE_LABELS[row.role] || row.role}
          </Badge>
        ),
      };
    }

    if (col.key === "status") {
      return {
        ...col,
        render: (row) => (
          <Badge variant={row.status === "Active" ? "success" : "neutral"}>{row.status}</Badge>
        ),
      };
    }
     if (col.key === "joinedDate") {
      return {
        ...col,
        render: (row) => {
          if (!row.joinedDate) return "—";

          const date = new Date(row.joinedDate);

          return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
      };
    }

    return col;
  });

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {currentUser?.role === "admin"
              ? "Everyone across the organization."
              : "Employees reporting to you."}
          </p>
        </div>

        {can("ADD_EMPLOYEE") && (
          <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
            Add Employee
          </Button>
        )}
      </div>

      <section className="rounded-lg border border-border mt-4 bg-surface">
       
        <div className="p-4">
          <DataTable
            columns={columns}
            data={visibleEmployees}
            keyField="id"
            searchable
            searchPlaceholder="Search by name, email, role..."
            pageSize={10}
            bodyHeight="55vh"
            emptyTitle={isLoading ? "Loading..." : "No Employees"}
            emptyMessage={
              isLoading
                ? "Fetching employees..."
                : can("ADD_EMPLOYEE")
                ? 'Click "Add Employee" to add your first team member.'
                : "No employees found."
            }
            renderActions={(row) =>
              can("EDIT_EMPLOYEE") && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(row)}>
                    <Pencil size={16} />
                  </Button>

                  {can("DELETE_EMPLOYEE") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      onClick={() => requestDelete(row)}
                    >
                      <Trash2 size={16} className="text-danger-500" />
                    </Button>
                  )}
                </div>
              )
            }
          />
        </div>
      </section>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        mode={editingEmployee ? "edit" : "create"}
        employee={editingEmployee}
        onSave={editingEmployee ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Remove this employee?"
        message={`"${confirmDialog.target?.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Remove"
      />
    </div>
  );
}