import { useEffect } from "react";

/**
 * ============================================================================
 * Server Table Controller
 * ============================================================================
 *
 * Automatically requests new data whenever
 * pagination / sorting / filtering changes.
 *
 */

export default function useServerTable({

    enabled,

    page,

    pageSize,

    sortModel,

    filters,

    globalSearch,

    onFetch,

}) {

    useEffect(() => {

        if (!enabled) return;

        onFetch?.({

            page,

            pageSize,

            sortModel,

            filters,

            search: globalSearch,

        });

    }, [

        enabled,

        page,

        pageSize,

        sortModel,

        filters,

        globalSearch,

        onFetch,

    ]);

}