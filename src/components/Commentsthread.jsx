import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "./ui";

/**
 * Reusable follow-up comments thread.
 *
 * API comment shape:
 * {
 *   id,
 *   text,
 *   createdAt,
 *   author: {
 *     id,
 *     name
 *   }
 * }
 */
export default function CommentsThread({
  comments = [],
  currentUserName,
  onAddComment,
}) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (!text.trim()) return;

    onAddComment(text.trim());
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {comments.length === 0 ? (
        <p className="text-xs text-ink-faint">
          No updates yet.
        </p>
      ) : (
        <ul className="flex max-h-56 min-w-0 flex-col gap-2.5 overflow-y-auto">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="min-w-0 rounded-md border border-border bg-canvas px-3 py-2.5"
            >
              <div className="flex min-w-0 items-start justify-between gap-2">
                {/* Comment Author */}
                <span className="min-w-0 break-words text-xs font-semibold text-ink">
                  {comment.author?.name ||
                    comment.authorName ||
                    "Unknown User"}
                </span>

                {/* Comment Date */}
                <span className="shrink-0 text-[11px] text-ink-faint">
                  {new Date(comment.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Comment Text */}
              <p className="mt-1 min-w-0 break-words text-sm text-ink-muted">
                {comment.text}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Add Comment */}
      <div className="flex min-w-0 items-end gap-2">
        <textarea
          className="min-w-0 flex-1 resize-y rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          rows={2}
          placeholder={`Write an update as ${
            currentUserName || "you"
          }...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button
          size="sm"
          onClick={handleSubmit}
          title="Add comment"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
}