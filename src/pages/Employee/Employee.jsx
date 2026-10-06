import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import useDebounce from "../../hooks/useDebouce";
import { employeesApi } from "../../api/Employeeapi";

export default function Employees() {
  const {
    getEmployeeName,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isLoading,
    fetchEmployees,
  } = useEmployees();

  const { getTeamName } = useTeams();
  const { currentUser, can } = useAuth();
  const { logActivity } = useActivity();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    target: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    loadEmployees();
  }, [page, pageSize, debouncedSearch]);

  async function loadEmployees() {
  try {
    const response = await employeesApi.list({
      page,
      limit: pageSize,
      search: debouncedSearch,
    });

    setPagination({
      ...(response?.pagination || {
        page,
        limit: pageSize,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
      data: response?.data || [],
    });
  } catch (error) {
    console.error("Failed to fetch employees:", error);

    setPagination({
      page,
      limit: pageSize,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      data: [],
    });
  }
}

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  function handlePageSizeChange(newSize) {
    setPageSize(Number(newSize));
    setPage(1);
  }

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

    setPage(1);

    await loadEmployees();
  }

  function openEdit(employee) {
    setEditingEmployee(employee);
    setModalOpen(true);
  }

  async function handleEdit(updatedEmployee) {
    const saved = await updateEmployee(updatedEmployee);

    logActivity({
      message: `${currentUser.name} updated ${saved.name}`,
      type: "employee",
    });

    setEditingEmployee(null);
    setModalOpen(false);

    await loadEmployees();
  }

  function requestDelete(employee) {
    setConfirmDialog({
      isOpen: true,
      target: employee,
    });
  }

  function closeConfirmDialog() {
    setConfirmDialog({
      isOpen: false,
      target: null,
    });
  }

  async function handleConfirmDelete() {
    const target = confirmDialog.target;

    if (!target) {
      closeConfirmDialog();
      return;
    }

    await deleteEmployee(target.id);

    logActivity({
      message: `${currentUser.name} removed ${target.name}`,
      type: "employee",
    });

    closeConfirmDialog();

    if (pagination.total === 1 && page > 1) {
      setPage((prev) => prev - 1);
      return;
    }

    await loadEmployees();
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
          <Badge
            variant={row.status === "Active" ? "success" : "neutral"}
          >
            {row.status}
          </Badge>
        ),
      };
    }

    if (col.key === "joinedDate") {
      return {
        ...col,

        render: (row) => {
          if (!row.joinedDate) {
            return "—";
          }

          const date = new Date(row.joinedDate);

          return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
      };
    }

    if (col.key === "managerName") {
      return {
        ...col,

        render: (row) =>
          row.manager?.name ||
          (row.managerId ? getEmployeeName(row.managerId) : "—"),
      };
    }

    if (col.key === "teamName") {
      return {
        ...col,

        render: (row) =>
          row.team?.name ||
          (row.teamId ? getTeamName(row.teamId) : "—"),
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
          <Button
            leftIcon={<Plus size={16} />}
            onClick={openCreate}
          >
            Add Employee
          </Button>
        )}
      </div>

      <section className="rounded-lg border border-border mt-4 bg-surface">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={pagination.data || []}
            keyField="id"

            searchable
            searchPlaceholder="Search by name, email, role..."

            serverPagination

            currentPage={page}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            totalItems={pagination.total || 0}

            showPageSizeSelector

            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}

            bodyHeight="55vh"

            emptyTitle={
              isLoading
                ? "Loading..."
                : "No Employees"
            }

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
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Edit"
                    onClick={() => openEdit(row)}
                  >
                    <Pencil size={16} />
                  </Button>

                  {can("DELETE_EMPLOYEE") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      onClick={() => requestDelete(row)}
                    >
                      <Trash2
                        size={16}
                        className="text-danger-500"
                      />
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