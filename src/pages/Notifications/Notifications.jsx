import NotificationCenter from "../../components/Notifications/NotificationCenter";
import "./notification.css";

export default function Notifications() {
  return (
    <div className="notifications-page">
      {/* Page Header */}

      <div className="notifications-page-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>

          <p className="notifications-subtitle">
            Stay updated with your tasks, meetings, leads and important system
            activities.
          </p>
        </div>
      </div>

      {/* Notification Center */}

      <NotificationCenter />
    </div>
  );
}