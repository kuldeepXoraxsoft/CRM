import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

import RowActionItem from "./RowActionItems";

/**
 * ============================================================================
 * Row Action Menu
 * ============================================================================
 *
 * Props
 * -----
 * row
 * actions
 *
 * Action Example
 *
 * {
 *     label:"Edit",
 *     icon:<Pencil size={16}/>,
 *     onClick:(row)=>{},
 *     hidden:(row)=>false,
 *     disabled:(row)=>false,
 *     danger:true
 * }
 *
 */

export default function RowActionMenu({
    row,
    actions = [],
}) {

    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);

    // ---------------------------------------------------------

    useEffect(() => {

        function outside(e){

            if(
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ){

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
            );

        }

    },[]);

    // ---------------------------------------------------------

    const visibleActions = actions.filter(action=>{

        if(action.hidden){

            return !action.hidden(row);

        }

        return true;

    });

    return (

        <div
            className="datatable-row-actions"
            ref={menuRef}
        >

            <button
                className="datatable-row-action-button"
                onClick={(e)=>{

                    e.stopPropagation();

                    setOpen(v=>!v);

                }}
            >

                <MoreVertical size={18}/>

            </button>

            {open && (

                <div className="datatable-row-action-menu">

                    {visibleActions.map(action=>(

                        <RowActionItem

                            key={action.label}

                            action={action}

                            row={row}

                            closeMenu={()=>

                                setOpen(false)

                            }

                        />

                    ))}

                </div>

            )}

        </div>

    );

}