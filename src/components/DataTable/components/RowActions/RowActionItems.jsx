/**
 * ============================================================================
 * RowActionItem
 * ============================================================================
 *
 * Props
 * -----
 * action
 * row
 * closeMenu
 *
 * Supported Action Object
 *
 * {
 *   id: "edit",
 *   label: "Edit",
 *   icon: <Pencil size={16} />,
 *   onClick: (row) => {},
 *   disabled: (row) => false,
 *   hidden: (row) => false,
 *   danger: false,
 *   divider: false,
 *   shortcut: "Ctrl+E"
 * }
 *
 */

export default function RowActionItem({
    action,
    row,
    closeMenu,
}) {

    const disabled =
        typeof action.disabled === "function"
            ? action.disabled(row)
            : !!action.disabled;

    async function handleClick(e) {

        e.stopPropagation();

        if (disabled) return;

        try {

            await action.onClick?.(row);

        } finally {

            closeMenu();

        }

    }

    if (action.divider) {

        return (

            <div className="datatable-row-divider" />

        );

    }

    return (

        <button
            type="button"
            disabled={disabled}
            onClick={handleClick}
            className={`
                datatable-row-action-item
                ${action.danger ? "danger" : ""}
                ${disabled ? "disabled" : ""}
            `}
        >

            <span className="datatable-row-action-left">

                {action.icon}

                <span>

                    {action.label}

                </span>

            </span>

            {action.shortcut && (

                <span className="datatable-row-shortcut">

                    {action.shortcut}

                </span>

            )}

        </button>

    );

}