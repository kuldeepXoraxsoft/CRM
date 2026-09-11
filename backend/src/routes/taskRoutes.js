import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/permissions.js";
import {
  listAssignedTasks,
  createAssignedTask,
  updateTaskStatus,
  reassignTask,
  addTaskComment,
  deleteAssignedTask,
} from "../controllers/taskController.js";

const router = Router();

router.use(authenticate);

router.get("/", listAssignedTasks);
router.post("/", authorize("ASSIGN_TASK"), createAssignedTask);
router.patch("/:id/status", updateTaskStatus);
router.patch("/:id/reassign", authorize("REASSIGN_TASK"), reassignTask);
router.post("/:id/comments", addTaskComment);
router.delete("/:id", authorize("ASSIGN_TASK"), deleteAssignedTask);

export default router;