import { useMemo, useState } from "react";
import {
  Plus,
  CalendarClock,
  Pencil,
  Trash2,
  Eye,
  UsersRound,
} from "lucide-react";

import { Button, Badge } from "../../components/ui";
import ConfirmDialog from "../../components/ConfirmDialog";

import { useAuth } from "../../context/AuthContext";
import { useDisclosure } from "../../hooks/useDisclosure";

import MeetingModal from "./MeetingModal";
import MeetingDetailsModal from "./MeetingDetailsModal";

import {
  INITIAL_MEETINGS,
  canViewMeeting,
  isHost,
  isUpcoming,
  formatMeetingDateTime,
} from "../../data/meetingData";

import "./meetings.css";

export default function Meetings() {
  const { currentUser } = useAuth();

  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);

  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    target: null,
  });

  const formModal = useDisclosure(false);
  const detailsModal = useDisclosure(false);

  /*
   * -----------------------------------------
   * Visible Meetings
   * -----------------------------------------
   *
   * Visibility is controlled by the existing
   * meeting scope logic.
   */
  const visibleMeetings = useMemo(() => {
    if (!currentUser) return [];

    return meetings.filter((meeting) =>
      canViewMeeting(meeting, currentUser)
    );
  }, [meetings, currentUser]);

  /*
   * -----------------------------------------
   * Sort Meetings
   * -----------------------------------------
   */
  const sortedMeetings = useMemo(() => {
    return [...visibleMeetings].sort(
      (a, b) =>
        new Date(a.dateTime).getTime() -
        new Date(b.dateTime).getTime()
    );
  }, [visibleMeetings]);

  /*
   * -----------------------------------------
   * Create
   * -----------------------------------------
   */
  function openCreate() {
    setEditingMeeting(null);
    formModal.open();
  }

  function handleCreate(meeting) {
    setMeetings((prev) => [meeting, ...prev]);

    formModal.close();
  }

  /*
   * -----------------------------------------
   * Edit
   * -----------------------------------------
   */
  function openEdit(meeting) {
    setEditingMeeting(meeting);
    formModal.open();
  }

  function handleUpdate(updatedMeeting) {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === updatedMeeting.id
          ? updatedMeeting
          : meeting
      )
    );

    setEditingMeeting(null);
    formModal.close();
  }

  /*
   * -----------------------------------------
   * View
   * -----------------------------------------
   */
  function openView(meeting) {
    setViewingMeeting(meeting);
    detailsModal.open();
  }

  /*
   * -----------------------------------------
   * Delete
   * -----------------------------------------
   */
  function requestDelete(meeting) {
    setConfirmDialog({
      isOpen: true,
      target: meeting,
    });
  }

  function closeConfirm() {
    setConfirmDialog({
      isOpen: false,
      target: null,
    });
  }

  function handleConfirmDelete() {
    if (!confirmDialog.target) return;

    setMeetings((prev) =>
      prev.filter(
        (meeting) =>
          meeting.id !== confirmDialog.target.id
      )
    );

    closeConfirm();
  }

  /*
   * -----------------------------------------
   * Cancel
   * -----------------------------------------
   *
   * Backend should eventually handle this
   * through an API call.
   */
  function handleCancel(meeting) {
    setMeetings((prev) =>
      prev.map((item) =>
        item.id === meeting.id
          ? {
              ...item,
              status: "Cancelled",
            }
          : item
      )
    );
  }

  /*
   * -----------------------------------------
   * Status
   * -----------------------------------------
   */
  function getStatusVariant(status) {
    switch (status) {
      case "Scheduled":
        return "neutral";

      case "Cancelled":
        return "danger";

      case "Completed":
        return "success";

      default:
        return "neutral";
    }
  }

  return (
    <div className="teams-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Meetings
          </h1>

          <p className="page-subtitle">
            Schedule and manage meetings with your team.
          </p>
        </div>

        <Button
          leftIcon={<Plus size={16} />}
          onClick={openCreate}
        >
          Schedule Meeting
        </Button>
      </div>

      {/* Empty State */}
      {sortedMeetings.length === 0 ? (
        <div className="teams-empty">
          <CalendarClock
            size={36}
            className="text-ink-faint"
          />

          <h3>No Meetings Yet</h3>

          <p>
            Click "Schedule Meeting" to create your
            first meeting.
          </p>
        </div>
      ) : (
        <div className="teams-grid">
          {sortedMeetings.map((meeting) => {
            const upcoming = isUpcoming(meeting);

            const mine =
              currentUser &&
              (isHost(meeting, currentUser) ||
                meeting.members?.includes(
                  currentUser.id
                ));

            return (
              <div
                key={meeting.id}
                className="team-card"
              >
                {/* Header */}
                <div className="team-card-header">
                  <div className="min-w-0">
                    <h3 className="team-card-name truncate">
                      {meeting.title}
                    </h3>

                    <p className="team-card-manager">
                      {formatMeetingDateTime(
                        meeting.dateTime
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openView(meeting)
                      }
                      title="View meeting"
                    >
                      <Eye size={15} />
                    </Button>

                    {mine && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openEdit(meeting)
                          }
                          title="Edit meeting"
                        >
                          <Pencil size={15} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            requestDelete(meeting)
                          }
                          title="Delete meeting"
                        >
                          <Trash2
                            size={15}
                            className="text-danger-500"
                          />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Meeting Information */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={getStatusVariant(
                        meeting.status
                      )}
                    >
                      {meeting.status}
                    </Badge>

                    {upcoming && (
                      <span className="text-xs text-ink-muted">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {meeting.description && (
                    <p className="line-clamp-2 text-sm text-ink-muted">
                      {meeting.description}
                    </p>
                  )}

                  {meeting.hostName && (
                    <div className="text-xs text-ink-muted">
                      Hosted by{" "}
                      <strong className="text-ink">
                        {meeting.hostName}
                      </strong>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <UsersRound
                      size={14}
                      className="text-ink-faint"
                    />

                    <span className="text-xs text-ink-muted">
                      {meeting.members?.length || 0}{" "}
                      participant
                      {meeting.members?.length === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                </div>

                {/* Cancel */}
                {meeting.status === "Scheduled" &&
                  upcoming &&
                  mine && (
                    <div className="mt-4 border-t border-border pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCancel(meeting)
                        }
                      >
                        Cancel Meeting
                      </Button>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit */}
      <MeetingModal
        isOpen={formModal.isOpen}
        onClose={() => {
          formModal.close();
          setEditingMeeting(null);
        }}
        mode={
          editingMeeting
            ? "edit"
            : "create"
        }
        meeting={editingMeeting}
        currentUser={currentUser}
        onSave={
          editingMeeting
            ? handleUpdate
            : handleCreate
        }
      />

      {/* Details */}
      <MeetingDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => {
          detailsModal.close();
          setViewingMeeting(null);
        }}
        meeting={viewingMeeting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Delete this meeting?"
        message={`"${confirmDialog.target?.title}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
