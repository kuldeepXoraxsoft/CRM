import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/permissions.js";
import { listTeams, createTeam, updateTeam, deleteTeam } from "../controllers/teamController.js";

const router = Router();

router.use(authenticate);

router.get("/", listTeams);
router.post("/", authorize("CREATE_TEAM"), createTeam);
router.patch("/:id", authorize("EDIT_TEAM"), updateTeam);
router.delete("/:id", authorize("DELETE_TEAM"), deleteTeam);

export default router;