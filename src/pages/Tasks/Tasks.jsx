import { useEffect, useState } from "react";
import {
  Plus,
  ClipboardList,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Eye,
  UserPlus,
} from "lucide-react";

import { Button, Badge } from "../../components/ui";
import DataTable from "../../components/ui/DataTable";
import Tabs from "../../components/ui/Tabs";
import ConfirmDialog from "../../components/ConfirmDialog";

import TaskModal from "./TaskModal";
import AssignedTaskModal from "./AssignedTaskModal";
import AssignTaskModal from "./AssignTaskModal";

import { todosApi } from "../../api/todosApi";
import { tasksApi } from "../../api/tasksApi";
import { toDateInputValue } from "../../utils/formateDate";
import { useAuth } from "../../context/AuthContext";

import "./tasks.css";

const PRIORITY_VARIANT = { High: "danger", Medium: "warning", Low: "success" };
const STATUS_VARIANT = { Pending: "warning", "In Progress": "primary", Completed: "success" };

export default function Tasks() {
  const { can } = useAuth();

  const [todos, setTodos] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isAssignedModalOpen, setAssignedModalOpen] = useState(false);

  const [isAssignTaskModalOpen, setAssignTaskModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, target: null });

  /* -----------------------------
      FETCH
  ----------------------------- */

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    try {
      const [todosData, tasksData] = await Promise.all([todosApi.list(), tasksApi.list()]);
      setTodos(todosData);
      setAssignedTasks(tasksData);
    } finally {
      setIsLoading(false);
    }
  }

  /* -----------------------------
      TODO FUNCTIONS
  ----------------------------- */

  async function handleCreateTodo(todo) {
    const created = await todosApi.create(todo);
    setTodos((prev) => [created, ...prev]);
  }

  async function handleEditTodo(updatedTodo) {
    const saved = await todosApi.update(updatedTodo.id, updatedTodo);
    setTodos((prev) => prev.map((todo) => (todo.id === saved.id ? saved : todo)));
    setEditingTodo(null);
  }

  async function handleDeleteTodo(id) {
    await todosApi.remove(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  async function handleToggleComplete(id) {
    const saved = await todosApi.toggle(id);
    setTodos((prev) => prev.map((todo) => (todo.id === saved.id ? saved : todo)));
  }

  /* -----------------------------
      ASSIGNED TASK FUNCTIONS
  ----------------------------- */

  function handleUpdateAssignedTask(updatedTask) {
    setAssignedTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }

  // Manager/Admin creates + assigns a brand new task.
  async function handleAssignTask(formData) {
    const created = await tasksApi.create(formData);
    setAssignedTasks((prev) => [created, ...prev]);
  }

  /* -----------------------------
      OPEN MODALS
  ----------------------------- */

  function openCreateTodo() {
    setEditingTodo(null);
    setTaskModalOpen(true);
  }

  function openEditTodo(todo) {
    setEditingTodo(todo);
    setTaskModalOpen(true);
  }

  function openAssignedTask(task) {
    setSelectedTask(task);
    setAssignedModalOpen(true);
  }

  /* -----------------------------
      CONFIRM DIALOG (todo delete)
  ----------------------------- */

  function requestDeleteTodo(todo) {
    setConfirmDialog({ isOpen: true, target: todo });
  }

  function closeConfirmDialog() {
    setConfirmDialog({ isOpen: false, target: null });
  }

  async function handleConfirmDeleteTodo() {
    if (confirmDialog.target) {
      await handleDeleteTodo(confirmDialog.target.id);
    }
    closeConfirmDialog();
  }

  /* -----------------------------
      TABLE COLUMNS
  ----------------------------- */

  const todoColumns = [
    {
      key: "complete",
      label: "",
      width: "36px",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleComplete(row.id);
          }}
        >
          {row.status === "Completed" ? (
            <CheckCircle2 size={19} className="text-success-500" />
          ) : (
            <Circle size={19} className="text-ink-faint hover:text-primary-500" />
          )}
        </button>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <span className={row.status === "Completed" ? "text-ink-faint line-through" : "text-ink"}>
          {row.title}
        </span>
      ),
    },
    { key: "dueDate", label: "Due Date", render: (row) => toDateInputValue(row.dueDate) || "-" },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{row.priority}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => (
        <span className="line-clamp-1 block max-w-xs text-ink-muted">{row.notes || "—"}</span>
      ),
    },
  ];

  const assignedColumns = [
    { key: "title", label: "Title" },
    {
      key: "assignedBy",
      label: "Assigned By",
      render: (row) => row.assignedBy?.name || "-",
    },
    {
      key: "assignee",
      label: "Assigned To",
      render: (row) => row.assignee?.name || "-",
    },
    { key: "dueDate", label: "Due Date", render: (row) => toDateInputValue(row.dueDate) || "-" },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{row.priority}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    },
    {
      key: "latestUpdate",
      label: "Latest Update",
      render: (row) => {
        const latest = row.comments?.length ? row.comments[row.comments.length - 1].text : null;
        return (
          <span className="line-clamp-1 block max-w-xs text-ink-muted">
            {latest || "No updates yet"}
          </span>
        );
      },
    },
  ];

  /* -----------------------------
      TABS
  ----------------------------- */

  const tabs = [
    {
      id: "todo",
      label: "My To-do",
      icon: ClipboardList,
      badge: todos.length,
      content: (
         
      <section className="rounded-lg border border-border mt-4 bg-surface">
          <div className="p-4">
          <DataTable
            columns={todoColumns}
            data={todos}
            keyField="id"
            searchable
            searchPlaceholder="Search todos..."
            pageSize={10}
            bodyHeight="50vh"
            onRowClick={openEditTodo}
            emptyTitle={isLoading ? "Loading..." : "No Todos"}
            emptyMessage={
              isLoading ? "Fetching your todos..." : 'Click "Add Todo" to create your first reminder.'
            }
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" title="Edit" onClick={() => openEditTodo(row)}>
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Delete"
                  onClick={() => requestDeleteTodo(row)}
                >
                  <Trash2 size={16} className="text-danger-500" />
                </Button>
              </div>
            )}
          />
          </div>
          </section>
      ),
    },
    {
      id: "assigned",
      label: "Assigned Tasks",
      icon: ClipboardList,
      badge: assignedTasks.length,
      content: (
         
      <section className="rounded-lg border border-border mt-4 bg-surface">
        <div className="p-4">
          <DataTable
            columns={assignedColumns}
            data={assignedTasks}
            keyField="id"
            searchable
            searchPlaceholder="Search assigned tasks..."
            pageSize={10}
            bodyHeight="50vh"
            onRowClick={openAssignedTask}
            emptyTitle={isLoading ? "Loading..." : "No Assigned Tasks"}
            emptyMessage={
              isLoading
                ? "Fetching assigned tasks..."
                : can("ASSIGN_TASK")
                ? 'Click "Assign Task" to give someone their first task.'
                : "Your manager hasn't assigned any tasks yet."
            }
            renderActions={(row) => (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye size={15} />}
                onClick={() => openAssignedTask(row)}
              >
                View / Update
              </Button>
            )}
          />
          </div>
          </section>
      ),
    },
  ];

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            Manage your personal todos and tasks assigned by your manager.
          </p>
        </div>

        <div className="page-header-actions">
          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={openCreateTodo}
          >
            Add Todo
          </Button>

          {can("ASSIGN_TASK") && (
            <Button
              size="sm"
              leftIcon={<UserPlus size={16} />}
              onClick={() => setAssignTaskModalOpen(true)}
            >
              Assign Task
            </Button>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} defaultTabId="todo" />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTodo(null);
        }}
        mode={editingTodo ? "edit" : "create"}
        todo={editingTodo}
        onSave={editingTodo ? handleEditTodo : handleCreateTodo}
      />

      <AssignedTaskModal
        isOpen={isAssignedModalOpen}
        onClose={() => {
          setAssignedModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleUpdateAssignedTask}
      />

      {can("ASSIGN_TASK") && (
        <AssignTaskModal
          isOpen={isAssignTaskModalOpen}
          onClose={() => setAssignTaskModalOpen(false)}
          onSave={handleAssignTask}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDeleteTodo}
        variant="danger"
        title="Delete this todo?"
        message={`"${confirmDialog.target?.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}