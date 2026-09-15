import { useState } from "react";
import { Plus, UsersRound, Pencil, Trash2 } from "lucide-react";

import { Button, Badge } from "../../components/ui";
import ConfirmDialog from "../../components/ConfirmDialog";

import TeamModal from "../../components/TeamModal";

import { useTeams } from "../../hooks/useTeams";
import { useEmployees } from "../../hooks/useEmployees";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../hooks/useActivity";

import "./teams.css";

export default function Teams() {
  const { teams, isLoading, addTeam, updateTeam, deleteTeam } = useTeams();
  const { getEmployeeName } = useEmployees();
  const { currentUser, can } = useAuth();
  const { logActivity } = useActivity();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, target: null });

  function openCreate() {
    setEditingTeam(null);
    setModalOpen(true);
  }

  function openEdit(team) {
    setEditingTeam(team);
    setModalOpen(true);
  }

  async function handleCreate(team) {
    const created = await addTeam(team);
    logActivity({
      message: `${currentUser.name} created a new team "${created.name}"`,
      type: "team",
    });
  }

  async function handleEdit(updatedTeam) {
    await updateTeam(updatedTeam);
    setEditingTeam(null);
  }

  function requestDelete(team) {
    setConfirmDialog({ isOpen: true, target: team });
  }

  async function handleConfirmDelete() {
    if (confirmDialog.target) {
      await deleteTeam(confirmDialog.target.id);
    }
    setConfirmDialog({ isOpen: false, target: null });
  }

  return (
    <div className="teams-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Group employees under a manager.</p>
        </div>

        {can("CREATE_TEAM") && (
          <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
            Create Team
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="teams-empty">
          <p>Loading teams...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="teams-empty">
          <UsersRound size={36} className="text-ink-faint" />
          <h3>No Teams Yet</h3>
          <p>Click "Create Team" to set one up.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <div>
                  <h3 className="team-card-name">{team.name}</h3>
                  <p className="team-card-manager">
                    Managed by <strong>{team.manager?.name || getEmployeeName(team.managerId)}</strong>
                  </p>
                </div>

                {can("EDIT_TEAM") && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(team)}>
                      <Pencil size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => requestDelete(team)}>
                      <Trash2 size={15} className="text-danger-500" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="team-card-members">
                {(team.members || []).length === 0 ? (
                  <p className="text-xs text-ink-faint">No members yet.</p>
                ) : (
                  team.members.map((member) => (
                    <Badge key={member.id} variant="neutral">
                      {member.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTeam(null);
        }}
        mode={editingTeam ? "edit" : "create"}
        team={editingTeam}
        onSave={editingTeam ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, target: null })}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Delete this team?"
        message={`"${confirmDialog.target?.name}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}