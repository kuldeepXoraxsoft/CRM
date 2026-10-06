import { useState } from "react";
import { Modal, Button, Badge, Textarea } from "../../components/ui";
import { ticketsApi } from "../../api/Ticketsapi";
const pv={Low:"success",Medium:"warning",High:"danger",Urgent:"danger"};
const sv={Open:"primary","In Progress":"warning",Pending:"neutral",Resolved:"success",Closed:"neutral"};
export default function TicketDetailsModal({isOpen,onClose,ticket,onSaved}){
 const [text,setText]=useState("");
 if(!ticket)return null;
 async function comment(){if(!text.trim())return;const t=await ticketsApi.addComment(ticket.id,text);setText("");onSaved(t);}
 return <Modal isOpen={isOpen} onClose={onClose} title={`#${ticket.ticketNumber} ${ticket.title}`} size="lg" footer={<Button onClick={onClose}>Close</Button>}>
  <div className="space-y-5">
   <div className="flex gap-2"><Badge variant={sv[ticket.status]||"neutral"}>{ticket.status}</Badge><Badge variant={pv[ticket.priority]||"neutral"}>{ticket.priority}</Badge><Badge variant="neutral">{ticket.category}</Badge></div>
   <p className="text-sm text-ink-muted whitespace-pre-wrap">{ticket.description||"No description."}</p>
   <div className="grid grid-cols-2 gap-3 text-sm"><div><span className="text-ink-faint">Created by</span><div>{ticket.createdBy?.name||"-"}</div></div><div><span className="text-ink-faint">Assigned to</span><div>{ticket.assignee?.name||"Unassigned"}</div></div></div>
   <div><p className="mb-2 text-sm font-semibold">Comments</p><div className="space-y-2 max-h-48 overflow-y-auto">{ticket.comments?.length?ticket.comments.map(c=><div key={c.id} className="rounded-md bg-canvas p-3"><div className="text-xs font-medium">{c.author?.name}</div><div className="mt-1 text-sm">{c.text}</div></div>):<p className="text-sm text-ink-faint">No comments yet.</p>}</div></div>
   <Textarea rows={3} placeholder="Add an update..." value={text} onChange={e=>setText(e.target.value)}/><Button size="sm" onClick={comment}>Add Comment</Button>
  </div>
 </Modal>
}
