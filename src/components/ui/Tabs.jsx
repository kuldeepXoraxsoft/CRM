import { useState } from "react";

/**
 * Reusable tabs component. Use it anywhere content needs to be split
 * into switchable sections - Tasks (To-do / Assigned), a detail page
 * with multiple views, etc.
 *
 * Usage:
 * <Tabs
 *   defaultTabId="todo"
 *   tabs={[
 *     { id: "todo", label: "My To-do", icon: ClipboardList, badge: todos.length, content: <...> },
 *     { id: "assigned", label: "Assigned Tasks", icon: ClipboardList, badge: tasks.length, content: <...> },
 *   ]}
 * />
 *
 * `badge` is optional (shows a small count pill next to the label).
 * `icon` is optional (a lucide-react component, not an element).
 */
export default function Tabs({ tabs, defaultTabId, onChange }) {
  const [activeId, setActiveId] = useState(defaultTabId || tabs[0]?.id);

  function handleTabClick(id) {
    setActiveId(id);
    onChange?.(id);
  }

  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {Icon && <Icon size={15} />}
              {tab.label}
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`ml-1 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "bg-canvas text-ink-faint"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>{activeTab?.content}</div>
    </div>
  );
}