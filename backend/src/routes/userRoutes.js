import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { listUserOptions } from "../controllers/userController.js";

const router = Router();
router.use(authenticate);
router.get("/options", listUserOptions);
export default router;
