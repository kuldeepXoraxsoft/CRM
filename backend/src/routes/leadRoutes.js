import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

import {
  listLeads,
  getLead,
  createLead,
  bulkCreateLeads,
  updateLead,
  deleteLead,
  updateLeadFollowUp,
  convertLeadToAccount,
} from "../controllers/leadController.js";

const router = Router();

router.use(authenticate);

router.get("/", listLeads);

router.get("/:id", getLead);

router.post("/", createLead);

router.post("/bulk", bulkCreateLeads);

router.patch("/:id", updateLead);

router.delete("/:id", deleteLead);

router.post(
  "/:id/follow-up",
  updateLeadFollowUp
);

router.post(
  "/:id/convert",
  convertLeadToAccount
);

export default router;