import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  CheckCircle,
  Plus,
  ListChecks,
  Activity,
  ClipboardList,
  UserPlus,
  Pencil,
  Trash2,
  Circle,
  CheckCircle2,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "./Statcard";
import RecentActivityWidget from "./RecentActivityWidget";

import TaskModal from "../Tasks/TaskModal";
import AssignedTaskModal from "../Tasks/AssignedTaskModal";
import AssignTaskModal from "../Tasks/AssignTaskModal";

import { todosApi } from "../../api/todosApi";
import { tasksApi } from "../../api/tasksApi";
import { accountsApi } from "../../api/accountsApi";

import { useAuth } from "../../context/AuthContext";
import { useEmployees } from "../../hooks/useEmployees";

import { toDateInputValue } from "../../utils/formateDate";

/* --------------------------------
   HELPERS
-------------------------------- */

function formatStatus(status) {
  if (!status) return "Unknown";

  return String(status)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLabel(value) {
  if (!value) return "-";

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusVariant(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed") {
    return "success";
  }

  if (
    normalized === "in-progress" ||
    normalized === "in progress"
  ) {
    return "primary";
  }

  if (normalized === "pending") {
    return "warning";
  }

  return "neutral";
}

function getPriorityVariant(priority) {
  const normalized = String(priority || "").toLowerCase();

  if (normalized === "high") {
    return "danger";
  }

  if (normalized === "medium") {
    return "warning";
  }

  if (normalized === "low") {
    return "neutral";
  }

  return "neutral";
}

function isCompleted(status) {
  const normalized = String(status || "").toLowerCase();

  return normalized === "completed";
}

/* --------------------------------
   DASHBOARD
-------------------------------- */

export default function Dashboard() {
  const { currentUser, can } = useAuth();
  const [ accounts , setAccounts ] = useState(0); 
  const { getVisibleEmployees } = useEmployees();

  const [todos, setTodos] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isAssignedModalOpen, setIsAssignedModalOpen] =
    useState(false);

  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] =
    useState(false);

  const visibleEmployees = getVisibleEmployees(currentUser);

  /* --------------------------------
      FETCH DASHBOARD TASKS
  -------------------------------- */

  useEffect(() => {
    fetchDashboardTasks();
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const data = await accountsApi.count();
      setAccounts(data.count);
    } catch (error) {
      console.error("Failed to load accounts count:", error);
    }
  }

  async function fetchDashboardTasks() {
    setIsLoadingTodos(true);
    setIsLoadingTasks(true);

    try {
      const [todosData, tasksData] = await Promise.all([
        todosApi.list(),
        tasksApi.list(),
      ]);

      setTodos(todosData || []);
      setAssignedTasks(tasksData || []);
    } catch (error) {
      console.error(
        "Failed to load dashboard tasks:",
        error
      );
    } finally {
      setIsLoadingTodos(false);
      setIsLoadingTasks(false);
    }
  }

  /* --------------------------------
      TODO
  -------------------------------- */

  async function handleCreateTodo(todo) {
    try {
      const created = await todosApi.create(todo);

      setTodos((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  async function handleEditTodo(updatedTodo) {
    try {
      const saved = await todosApi.update(
        updatedTodo.id,
        updatedTodo
      );

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === saved.id ? saved : todo
        )
      );

      setEditingTodo(null);
      setIsTodoModalOpen(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  async function handleDeleteTodo(id) {
    try {
      await todosApi.remove(id);

      setTodos((prev) =>
        prev.filter((todo) => todo.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  async function handleToggleTodo(id) {
    try {
      const saved = await todosApi.toggle(id);

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === saved.id ? saved : todo
        )
      );
    } catch (error) {
      console.error(
        "Failed to update todo status:",
        error
      );
    }
  }

  /* --------------------------------
      ASSIGNED TASK
  -------------------------------- */

  function openAssignedTask(task) {
    setSelectedTask(task);
    setIsAssignedModalOpen(true);
  }

  function handleUpdateAssignedTask(updatedTask) {
    setAssignedTasks((prev) =>
      prev.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task
      )
    );

    setSelectedTask(updatedTask);
  }

  async function handleAssignTask(formData) {
    try {
      const created = await tasksApi.create(formData);

      setAssignedTasks((prev) => [
        created,
        ...prev,
      ]);

      setIsAssignTaskModalOpen(false);
    } catch (error) {
      console.error(
        "Failed to assign task:",
        error
      );
    }
  }

  /* --------------------------------
      STATS
  -------------------------------- */

  const completedTodos = todos.filter((todo) =>
    isCompleted(todo.status)
  ).length;

  const completedAssignedTasks = assignedTasks.filter(
    (task) => isCompleted(task.status)
  ).length;

  const completedTasksCount =
    completedTodos + completedAssignedTasks;

  /* --------------------------------
      TODO MODAL
  -------------------------------- */

  function openCreateTodo() {
    setEditingTodo(null);
    setIsTodoModalOpen(true);
  }

  function openEditTodo(todo) {
    setEditingTodo(todo);
    setIsTodoModalOpen(true);
  }

  return (
    <div className="min-w-0 space-y-4">
      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-primary-600">
            Dashboard
          </h1>

          <p className="mt-1 break-words text-xs text-ink-muted">
            Welcome back, {currentUser?.name} 👋
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={18} />}
            onClick={openCreateTodo}
          >
            New Todo
          </Button>

          {can("ASSIGN_TASK") && (
            <Button
              size="sm"
              leftIcon={<UserPlus size={16} />}
              onClick={() =>
                setIsAssignTaskModalOpen(true)
              }
            >
              Assign Task
            </Button>
          )}
        </div>
      </div>

      {/* --------------------------------
          STATS
      -------------------------------- */}

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Accounts"
          value={String(accounts)}
          icon={<Briefcase size={18} />}
        />

        <StatCard
          label={
            currentUser?.role === "admin"
              ? "Employees"
              : "Your Team"
          }
          value={String(visibleEmployees.length)}
          icon={<Users size={18} />}
        />

        <StatCard
          label="Completed Tasks"
          value={String(completedTasksCount)}
          icon={<CheckCircle size={18} />}
        />
      </div>

      {/* --------------------------------
          TODO + ASSIGNED TASKS
      -------------------------------- */}

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        {/* --------------------------------
            MY TODOS
        -------------------------------- */}

        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex min-w-0 items-center gap-2">
              <ListChecks
                size={17}
                className="shrink-0 text-primary-600"
              />

              <h2 className="break-words font-semibold text-ink">
                My To-do
              </h2>
            </div>

            <span className="shrink-0 text-xs text-ink-faint">
              {todos.length}
            </span>
          </div>

          <div className="min-w-0">
            {isLoadingTodos ? (
              <div className="px-5 py-8 text-center text-sm text-ink-muted">
                Loading todos...
              </div>
            ) : todos.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-ink-muted">
                  No todos yet.
                </p>

                <Button
                  size="sm"
                  className="mt-3"
                  onClick={openCreateTodo}
                >
                  Add Todo
                </Button>
              </div>
            ) : (
              <div className="max-h-[430px] overflow-y-auto">
                {todos.slice(0, 8).map((todo) => {
                  const completed = isCompleted(
                    todo.status
                  );

                  return (
                    <div
                      key={todo.id}
                      className="flex min-w-0 items-start gap-3 border-b border-border px-5 py-4 last:border-b-0"
                    >
                      {/* Complete */}

                      <button
                        type="button"
                        className="mt-0.5 shrink-0"
                        onClick={() =>
                          handleToggleTodo(todo.id)
                        }
                        title={
                          completed
                            ? "Mark as pending"
                            : "Mark as completed"
                        }
                      >
                        {completed ? (
                          <CheckCircle2
                            size={19}
                            className="text-success-500"
                          />
                        ) : (
                          <Circle
                            size={19}
                            className="text-ink-faint hover:text-primary-500"
                          />
                        )}
                      </button>

                      {/* Content */}

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`break-words text-sm font-semibold ${
                            completed
                              ? "text-ink-faint line-through"
                              : "text-ink"
                          }`}
                        >
                          {todo.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-ink-muted">
                            Due:{" "}
                            {toDateInputValue(
                              todo.dueDate
                            ) || "-"}
                          </span>

                          {todo.priority && (
                            <Badge
                              size="sm"
                              variant={getPriorityVariant(
                                todo.priority
                              )}
                              dot
                            >
                              {formatLabel(
                                todo.priority
                              )}
                            </Badge>
                          )}

                          <Badge
                            size="sm"
                            variant={getStatusVariant(
                              todo.status
                            )}
                            dot
                          >
                            {formatStatus(
                              todo.status
                            )}
                          </Badge>
                        </div>

                        {todo.notes && (
                          <p className="mt-2 break-words text-xs text-ink-faint">
                            {todo.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() =>
                            openEditTodo(todo)
                          }
                        >
                          <Pencil size={15} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={() =>
                            handleDeleteTodo(
                              todo.id
                            )
                          }
                        >
                          <Trash2
                            size={15}
                            className="text-danger-500"
                          />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------
            ASSIGNED TASKS
        -------------------------------- */}

        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex min-w-0 items-center gap-2">
              <ClipboardList
                size={17}
                className="shrink-0 text-primary-600"
              />

              <h2 className="break-words font-semibold text-ink">
                Assigned Tasks
              </h2>
            </div>

            <span className="shrink-0 text-xs text-ink-faint">
              {assignedTasks.length}
            </span>
          </div>

          <div className="min-w-0">
            {isLoadingTasks ? (
              <div className="px-5 py-8 text-center text-sm text-ink-muted">
                Loading assigned tasks...
              </div>
            ) : assignedTasks.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-muted">
                No assigned tasks yet.
              </div>
            ) : (
              <div className="max-h-[430px] overflow-y-auto">
                {assignedTasks
                  .slice(0, 6)
                  .map((task) => (
                    <DashboardAssignedTask
                      key={task.id}
                      task={task}
                      onView={openAssignedTask}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------
          RECENT ACTIVITY
      -------------------------------- */}

      <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity
            size={17}
            className="text-primary-600"
          />

          <h2 className="font-semibold text-ink">
            Recent Activity
          </h2>
        </div>

        <RecentActivityWidget />
      </div>

      {/* --------------------------------
          TODO MODAL
      -------------------------------- */}

      <TaskModal
        isOpen={isTodoModalOpen}
        onClose={() => {
          setIsTodoModalOpen(false);
          setEditingTodo(null);
        }}
        mode={editingTodo ? "edit" : "create"}
        todo={editingTodo}
        onSave={
          editingTodo
            ? handleEditTodo
            : handleCreateTodo
        }
      />

      {/* --------------------------------
          ASSIGNED TASK MODAL
      -------------------------------- */}

      <AssignedTaskModal
        isOpen={isAssignedModalOpen}
        onClose={() => {
          setIsAssignedModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleUpdateAssignedTask}
      />

      {/* --------------------------------
          ASSIGN TASK MODAL
      -------------------------------- */}

      {can("ASSIGN_TASK") && (
        <AssignTaskModal
          isOpen={isAssignTaskModalOpen}
          onClose={() =>
            setIsAssignTaskModalOpen(false)
          }
          onSave={handleAssignTask}
        />
      )}
    </div>
  );
}

/* --------------------------------
   ASSIGNED TASK ROW
-------------------------------- */

function DashboardAssignedTask({ task, onView }) {
  const latestComment =
    task.comments?.length > 0
      ? task.comments[task.comments.length - 1]
      : null;

  return (
    <div className="border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Content */}

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold text-ink">
            {task.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-muted">
              By: {task.assignedBy?.name || "-"}
            </span>

            <span className="text-xs text-ink-muted">
              To: {task.assignee?.name || "-"}
            </span>

            <span className="text-xs text-ink-muted">
              Due:{" "}
              {toDateInputValue(task.dueDate) || "-"}
            </span>

            {task.priority && (
              <Badge
                size="sm"
                variant={getPriorityVariant(
                  task.priority
                )}
                dot
              >
                {formatLabel(task.priority)}
              </Badge>
            )}

            <Badge
              size="sm"
              variant={getStatusVariant(
                task.status
              )}
              dot
            >
              {formatStatus(task.status)}
            </Badge>
          </div>

          {/* Manager Instructions */}

          {task.managerNotes && (
            <p className="mt-2 break-words text-xs text-ink-faint">
              <span className="font-medium text-ink-muted">
                Instructions:
              </span>{" "}
              {task.managerNotes}
            </p>
          )}

          {/* Latest Comment */}

          {latestComment && (
            <div className="mt-2 min-w-0 rounded-md bg-canvas p-2.5">
              <p className="text-[11px] font-semibold text-primary-600">
                {latestComment.author?.name ||
                  latestComment.authorName ||
                  "Unknown User"}
              </p>

              <p className="mt-0.5 break-words text-xs text-ink-muted">
                {latestComment.text}
              </p>
            </div>
          )}
        </div>

        {/* View / Update */}

        <Button
          size="sm"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => onView(task)}
        >
          View / Update
        </Button>
      </div>
    </div>
  );
}