import { useState } from "react";
import { Plus, ClipboardList } from "lucide-react";

import { Button } from "../../components/ui";

import TaskModal from "./TaskModal";
import AssignedTaskModal from "./AssignedTaskModal";

import TodoListItem from "./TodoListItem";
import AssignedTaskListItem from "./AssignedTaskListItem";

import {
  INITIAL_TODOS,
  INITIAL_ASSIGNED_TASKS,
} from "../../data/taskData";

import "./tasks.css";

export default function Tasks() {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [assignedTasks, setAssignedTasks] = useState(
    INITIAL_ASSIGNED_TASKS
  );

  const [isTaskModalOpen, setTaskModalOpen] =
    useState(false);

  const [editingTodo, setEditingTodo] =
    useState(null);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [isAssignedModalOpen, setAssignedModalOpen] =
    useState(false);

  /* -----------------------------
      TODO FUNCTIONS
  ----------------------------- */

  function handleCreateTodo(todo) {
    setTodos((prev) => [todo, ...prev]);
  }

  function handleEditTodo(updatedTodo) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === updatedTodo.id
          ? updatedTodo
          : todo
      )
    );

    setEditingTodo(null);
  }

  function handleDeleteTodo(id) {
    setTodos((prev) =>
      prev.filter((todo) => todo.id !== id)
    );
  }

  function handleToggleComplete(id) {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo;

        return {
          ...todo,
          status:
            todo.status === "Completed"
              ? "Pending"
              : "Completed",
        };
      })
    );
  }

  /* -----------------------------
      ASSIGNED TASK FUNCTIONS
  ----------------------------- */

  function handleUpdateAssignedTask(updatedTask) {
    setAssignedTasks((prev) =>
      prev.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task
      )
    );
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

  return (
    <div className="tasks-page">

      {/* Page Header */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            My Tasks
          </h1>

          <p className="page-subtitle">
            Manage your personal todos and
            tasks assigned by your manager.
          </p>

        </div>

      </div>

      {/* Two Column Layout */}

      <div className="tasks-grid">
              {/* ============================
          MY TODO PANEL
      ============================ */}

      <section className="task-panel">

        <div className="task-panel-header">

          <div className="flex items-center gap-2">

            <ClipboardList
              size={20}
              className="text-primary-600"
            />

            <div>
              <h2 className="task-panel-title">
                My Todo
              </h2>

              {/* <p className="task-panel-subtitle">
                Personal reminders & daily work
              </p> */}
            </div>

          </div>

          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={openCreateTodo}
          >
            Add Todo
          </Button>

        </div>

        <div className="task-panel-body">

          {todos.length === 0 ? (

            <div className="empty-state">

              <ClipboardList
                size={42}
                className="text-ink-faint"
              />

              <h3>No Todos</h3>

              <p>
                Click "Add Todo" to create
                your first reminder.
              </p>

            </div>

          ) : (

            todos.map((todo) => (

              <TodoListItem
                key={todo.id}
                todo={todo}
                onToggleComplete={
                  handleToggleComplete
                }
                onEdit={openEditTodo}
                onDelete={handleDeleteTodo}
              />

            ))

          )}

        </div>

      </section>
            {/* ============================
          ASSIGNED TASKS PANEL
      ============================ */}

      <section className="task-panel">

        <div className="task-panel-header">

          <div className="flex items-center gap-2">

            <ClipboardList
              size={20}
              className="text-primary-600"
            />

            <div>

              <h2 className="task-panel-title">
                Assigned by Manager
              </h2>

              {/* <p className="task-panel-subtitle">
                Tasks assigned to you by your manager
              </p> */}

            </div>

          </div>

          <span className="rounded-md bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
            {assignedTasks.length} Tasks
          </span>

        </div>

        <div className="task-panel-body">

          {assignedTasks.length === 0 ? (

            <div className="empty-state">

              <ClipboardList
                size={42}
                className="text-ink-faint"
              />

              <h3>No Assigned Tasks</h3>

              <p>
                Your manager hasn't assigned any
                tasks yet.
              </p>

            </div>

          ) : (

            assignedTasks.map((task) => (

              <AssignedTaskListItem
                key={task.id}
                task={task}
                onView={openAssignedTask}
              />

            ))

          )}

        </div>

      </section>

    </div>
          {/* ============================
          ADD / EDIT TODO MODAL
      ============================ */}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
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

      {/* ============================
          ASSIGNED TASK MODAL
      ============================ */}

      <AssignedTaskModal
        isOpen={isAssignedModalOpen}
        onClose={() => {
          setAssignedModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleUpdateAssignedTask}
      />
    </div>
  );
}