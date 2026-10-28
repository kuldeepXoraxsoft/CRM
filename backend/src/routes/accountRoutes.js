import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountFollowUp,
  countAccounts,
  getAccountFollowUpHistory,
  listAccountDocuments,
  uploadAccountDocument,
  downloadAccountDocument,
  deleteAccountDocument,
} from "../controllers/accountController.js";
import uploadAccountDocumentFile from "../middleware/accountDocumentUpload.js";

const router = Router();

router.use(authenticate);

router.get("/count", countAccounts);
router.get("/", listAccounts);
router.get("/:id", getAccount);

router.post("/", createAccount);
router.patch("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.post("/:id/follow-up", updateAccountFollowUp);
router.get("/:id/follow-ups", getAccountFollowUpHistory);
router.get("/:id/documents", listAccountDocuments);
router.post(
  "/:id/documents",
  uploadAccountDocumentFile,
  uploadAccountDocument
);
router.get(
  "/:id/documents/:documentId/download",
  downloadAccountDocument
);
router.delete(
  "/:id/documents/:documentId",
  deleteAccountDocument
);

export default router;