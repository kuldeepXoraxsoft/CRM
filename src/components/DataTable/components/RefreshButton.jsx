import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Refresh Button
 * ============================================================================
 *
 * Features
 * --------
 * ✓ Async refresh
 * ✓ Loading animation
 * ✓ Prevent multiple clicks
 * ✓ Error handling
 *
 */

export default function RefreshButton() {

    const { onRefresh } = useTable();

    const [loading, setLoading] = useState(false);

    async function handleRefresh() {

        if (!onRefresh || loading) return;

        try {

            setLoading(true);

            await onRefresh();

        } catch (error) {

            console.error("Refresh failed:", error);

        } finally {

            setLoading(false);

        }

    }

    return (

        <button
            className="datatable-toolbar-button"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Data"
        >

            <RefreshCw
                size={16}
                className={
                    loading
                        ? "datatable-spin"
                        : ""
                }
            />

            {loading
                ? "Refreshing..."
                : "Refresh"}

        </button>

    );

}