import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { listTickets, getTicket, createTicket, updateTicket, assignTicket, addTicketComment } from "../controllers/ticketController.js";

const router = Router();
router.use(authenticate);
router.get("/", listTickets);
router.get("/:id", getTicket);
router.post("/", createTicket);
router.patch("/:id/assign", assignTicket);
router.patch("/:id", updateTicket);
router.post("/:id/comments", addTicketComment);

export default router;
