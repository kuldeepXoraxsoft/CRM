import { useEffect, useRef, useState } from "react";
import {
    Filter,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import { useTable } from "../context/TableContext";
import { FILTER_OPERATORS } from "../constants";

/**
 * ============================================================================
 * Filter Dropdown
 * ============================================================================
 *
 * Enterprise Filtering UI
 *
 * Supports:
 * ✓ Multiple filters
 * ✓ Different operators
 * ✓ Different column types
 * ✓ Apply
 * ✓ Clear
 */

export default function FilterDropdown() {

    const {
        columns,
        filtering,
    } = useTable();

    const {
        filters,
        setFilters,
    } = filtering;

    const [open, setOpen] = useState(false);

    const [localFilters, setLocalFilters] =
        useState(filters);

    const ref = useRef(null);

    // --------------------------------------------------------

    useEffect(() => {

        function outside(e){

            if(ref.current && !ref.current.contains(e.target)){

                setOpen(false);

            }

        }

        document.addEventListener(
            "mousedown",
            outside
        );

        return ()=>{

            document.removeEventListener(
                "mousedown",
                outside
            )

        }

    },[]);

    // --------------------------------------------------------

    function addFilter(){

        setLocalFilters(prev=>[
            ...prev,
            {
                id:Date.now(),
                field:columns[0]?.field || "",
                operator:"contains",
                value:"",
            }
        ])

    }

    // --------------------------------------------------------

    function updateFilter(id,key,value){

        setLocalFilters(prev=>

            prev.map(filter=>

                filter.id===id
                    ? {...filter,[key]:value}
                    : filter

            )

        )

    }

    // --------------------------------------------------------

    function removeFilter(id){

        setLocalFilters(prev=>

            prev.filter(f=>f.id!==id)

        )

    }

    // --------------------------------------------------------

    function apply(){

        setFilters(localFilters);

        setOpen(false);

    }

    function clear(){

        setLocalFilters([]);

        setFilters([]);

    }

    // --------------------------------------------------------

    return (

        <div
            className="datatable-filter"
            ref={ref}
        >

            <button
                className="datatable-toolbar-button"
                onClick={()=>setOpen(v=>!v)}
            >

                <Filter size={17}/>

                Filters

                {filters?.length>0 && (

                    <span className="datatable-filter-count">

                        {filters?.length}

                    </span>

                )}

            </button>

            {open && (

                <div className="datatable-filter-panel">

                    <div className="datatable-filter-header">

                        <span>

                            Filters

                        </span>

                        <button
                            onClick={()=>setOpen(false)}
                        >

                            <X size={16}/>

                        </button>

                    </div>

                    <div className="datatable-filter-body">

                        {localFilters.map(filter=>(

                            <div
                                key={filter.id}
                                className="datatable-filter-row"
                            >

                                <select
                                    value={filter.field}
                                    onChange={(e)=>

                                        updateFilter(
                                            filter.id,
                                            "field",
                                            e.target.value
                                        )

                                    }
                                >

                                    {columns.map(column=>(

                                        <option
                                            key={column.field}
                                            value={column.field}
                                        >

                                            {column.headerName}

                                        </option>

                                    ))}

                                </select>

                                <select
                                    value={filter.operator}
                                    onChange={(e)=>

                                        updateFilter(
                                            filter.id,
                                            "operator",
                                            e.target.value
                                        )

                                    }
                                >

                                    {FILTER_OPERATORS.map(op=>(

                                        <option
                                            key={op.value}
                                            value={op.value}
                                        >

                                            {op.label}

                                        </option>

                                    ))}

                                </select>

                                <input
                                    value={filter.value}
                                    onChange={(e)=>

                                        updateFilter(
                                            filter.id,
                                            "value",
                                            e.target.value
                                        )

                                    }
                                    placeholder="Value"
                                />

                                <button
                                    onClick={()=>

                                        removeFilter(filter.id)

                                    }
                                >

                                    <Trash2 size={16}/>

                                </button>

                            </div>

                        ))}

                    </div>

                    <div className="datatable-filter-footer">

                        <button
                            onClick={addFilter}
                        >

                            <Plus size={15}/>

                            Add Filter

                        </button>

                        <div>

                            <button
                                onClick={clear}
                            >

                                Clear

                            </button>

                            <button
                                className="primary"
                                onClick={apply}
                            >

                                Apply

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}