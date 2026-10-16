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
 *
 * On narrow screens the tab bar scrolls horizontally instead of
 * overflowing the page, and the tapped tab is scrolled into view.
 */
export default function Tabs({ tabs, defaultTabId, onChange }) {
  const [activeId, setActiveId] = useState(defaultTabId || tabs[0]?.id);

  function handleTabClick(id, e) {
    setActiveId(id);
    onChange?.(id);

    // Bring a half-visible tab fully into view on mobile
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  return (
    // min-w-0 lets this shrink inside flex/grid parents instead of stretching the page
    <div className="flex min-w-0 flex-col gap-4">
      {/* overflow-x-auto = scrollable tab row; the bracket classes hide the scrollbar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => handleTabClick(tab.id, e)}
              // shrink-0 + whitespace-nowrap = tabs keep their natural width, never squeezed or wrapped
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
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

      {/* min-w-0 so wide content (tables) inside a tab can't push the page wider */}
      <div className="min-w-0">{activeTab?.content}</div>
    </div>
  );
}