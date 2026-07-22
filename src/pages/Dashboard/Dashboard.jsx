import { useState } from "react";
import {
  Users,
  DollarSign,
  Briefcase,
  CheckCircle,
  Plus,
} from "lucide-react";

import Button from "../../components/ui/Button";

import StatCard from "./Statcard";
import TaskRow from "./TaskRow";
import NewTaskModal from "./Newtaskmodal";

import {
  TASKS,
} from "../../data/mockData";

export default function Dashboard() {
  const [tasks, setTasks] = useState(TASKS);

  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleCreate(task) {
    setTasks((prev) => [task, ...prev]);
  }

  function handleDelete(id) {
    setTasks((prev) =>
      prev.filter((task) => task.id !== id)
    );
  }

  function handleToggle(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                task.status === "completed"
                  ? "pending"
                  : "completed",
            }
          : task
      )
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-primary-600">
            Dashboard
            </h1>

          <p className="text-ink-muted mt-1">
            Welcome back 👋
          </p>
        </div>

        <Button
          variant = "primary"
          size = "sm"
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          New Task
        </Button>

      </div>

      {/* Stats */}

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          label="Accounts"
          value="20"
          change="+8.2%"
          icon={<Users size={18} />}
        />

        <StatCard
          label="Leads"
          value="120"
          change="+13%"
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="Completed Tasks"
          value="320"
          change="+11%"
          icon={<CheckCircle size={18} />}
        />

      </div>

      {/* Main Content */}

      <div className="grid gap-4 xl:grid-cols-3">

        {/* Tasks */}

        <div className="xl:col-span-2 rounded-lg border  border-border bg-surface">

         <div className="border-b border-border px-5 py-4 ">

            <h2 className="font-semibold text-ink">
              Recent Tasks
            </h2>

          </div>

          <div>

            {tasks.map((task) => (

              <TaskRow
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onToggleComplete={handleToggle}
              />

            ))}

          </div>

        </div>

        {/* Right Panel */}

        <div className="rounded-lg border border-border bg-surface p-5">

          <h2 className="font-semibold text-ink">
            Activity
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <p className="font-medium">
                New Lead Added
              </p>

              <p className="text-sm text-ink-muted">
                Sarah Wilson created a lead.
              </p>
            </div>

            <div>
              <p className="font-medium">
                Deal Closed
              </p>

              <p className="text-sm text-ink-muted">
                Acme Inc. closed for $24,000.
              </p>
            </div>

            <div>
              <p className="font-medium">
                Meeting Scheduled
              </p>

              <p className="text-sm text-ink-muted">
                Tomorrow at 10:30 AM.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Modal */}

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />

    </div>
  );
}