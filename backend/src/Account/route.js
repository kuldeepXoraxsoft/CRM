import { Router } from "express";

import { authenticate } from "../middleware/auth";
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountFollowUp,
  countAccounts,
} from ".controller.js";

const router = Router();

router.use(authenticate);

router.get("/count", countAccounts);
router.get("/", listAccounts);
router.get("/:id", getAccount);

router.post("/", createAccount);
router.patch("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.post("/:id/follow-up", updateAccountFollowUp);

export default router;