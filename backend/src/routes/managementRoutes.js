import { Router } from "express";

import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/managementController.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/permissions.js";

const router = Router();

router.use(authenticate);

// ==========================================
// DEPARTMENTS
// ==========================================

router.get(
  "/departments",
  authorize("VIEW_DEPARTMENTS"),
  listDepartments
);

router.post(
  "/departments",
  authorize("ADD_DEPARTMENT"),
  createDepartment
);

router.put(
  "/departments/:id",
  authorize("EDIT_DEPARTMENT"),
  updateDepartment
);

router.delete(
  "/departments/:id",
  authorize("DELETE_DEPARTMENT"),
  deleteDepartment
);

// ==========================================
// ADMINS
// ==========================================

router.get(
  "/admins",
  authorize("VIEW_ADMINS"),
  listAdmins
);

router.post(
  "/admins",
  authorize("ADD_ADMIN"),
  createAdmin
);

router.put(
  "/admins/:id",
  authorize("EDIT_ADMIN"),
  updateAdmin
);

router.delete(
  "/admins/:id",
  authorize("DELETE_ADMIN"),
  deleteAdmin
);

export default router;