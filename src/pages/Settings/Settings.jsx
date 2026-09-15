import { useState } from "react";
import { User, Palette, Bell, Building2, Save } from "lucide-react";

import { Button } from "../../components/ui";
import Tabs from "../../components/ui/Tabs";

import ProfileSection from "./ProfileSection";
import PreferencesSection from "./Preferencessection";
import NotificationsSection from "./Notificationssection";
import OrganizationSection from "./Organizationsection";

import { SAMPLE_SETTINGS } from "../../data/Settingsdata";
import { useAuth } from "../../context/AuthContext";

import "./settings.css";

export default function Settings() {
  const { can } = useAuth();

  const [settings, setSettings] = useState(SAMPLE_SETTINGS);
  const [savedMessage, setSavedMessage] = useState("");

  function updateSection(section, updates) {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }

  function handleSaveAll() {
    // TODO: wire to PATCH /api/settings once that endpoint exists on
    // the backend - for now this just confirms locally.
    setSavedMessage("Settings saved.");
    setTimeout(() => setSavedMessage(""), 2500);
  }

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      content: (
        <ProfileSection
          profile={settings.profile}
          onChange={(updates) => updateSection("profile", updates)}
        />
      ),
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Palette,
      content: (
        <PreferencesSection
          preferences={settings.preferences}
          onChange={(updates) => updateSection("preferences", updates)}
        />
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      content: (
        <NotificationsSection
          notifications={settings.notifications}
          onChange={(updates) => updateSection("notifications", updates)}
        />
      ),
    },
  ];

  // Organization settings are only relevant to Managers/Admins.
  if (can("ADD_EMPLOYEE")) {
    tabs.push({
      id: "organization",
      label: "Organization",
      icon: Building2,
      content: (
        <OrganizationSection
          organization={settings.organization}
          onChange={(updates) => updateSection("organization", updates)}
        />
      ),
    });
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage your profile, preferences, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-xs font-medium text-success-600">{savedMessage}</span>
          )}
          <Button leftIcon={<Save size={16} />} onClick={handleSaveAll}>
            Save Changes
          </Button>
        </div>
      </div>

      <section className="settings-panel">
        <Tabs tabs={tabs} defaultTabId="profile" />
      </section>
    </div>
  );
}