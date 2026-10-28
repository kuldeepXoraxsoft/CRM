import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  getOrganization,
  getLogo,
  updateOrganization,
  getEmailConfig,
  saveEmailConfig,
  deleteEmailConfig,
  sendTestEmail,
} from "../controllers/organizationController.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/permissions.js";

const router = Router();

const testEmailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many test emails. Please wait a minute." },
});

// Public: company name + logo (login page and emails use them)
router.get("/", getOrganization);
router.get("/logo", getLogo);

// Company settings
router.put("/", authenticate, authorize("MANAGE_ORGANIZATION"), updateOrganization);

// Department email settings
router.get("/email-config", authenticate, authorize("MANAGE_EMAIL_CONFIG"), getEmailConfig);
router.put("/email-config", authenticate, authorize("MANAGE_EMAIL_CONFIG"), saveEmailConfig);
router.delete("/email-config", authenticate, authorize("MANAGE_EMAIL_CONFIG"), deleteEmailConfig);
router.post(
  "/email-config/test",
  authenticate,
  authorize("MANAGE_EMAIL_CONFIG"),
  testEmailLimiter,
  sendTestEmail
);

export default router;
