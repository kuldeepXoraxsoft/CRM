import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/permissions.js";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = Router();

router.use(authenticate);

router.get("/", listEmployees);
router.post("/", authorize("ADD_EMPLOYEE"), createEmployee);
router.patch("/:id", authorize("EDIT_EMPLOYEE"), updateEmployee);
router.delete("/:id", authorize("DELETE_EMPLOYEE"), deleteEmployee);

export default router;