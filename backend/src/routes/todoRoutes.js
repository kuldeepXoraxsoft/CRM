import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import {
  listMyTodos,
  createTodo,
  updateTodo,
  toggleTodoComplete,
  deleteTodo,
} from "../controllers/todoController.js";

const router = Router();

router.use(authenticate);

router.get("/", listMyTodos);
router.post("/", createTodo);
router.patch("/:id", updateTodo);
router.patch("/:id/toggle", toggleTodoComplete);
router.delete("/:id", deleteTodo);

export default router;