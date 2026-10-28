import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { listCalendarEvents } from "../controllers/calendarController.js";

const router = Router();

router.use(authenticate);

router.get("/events", listCalendarEvents);

export default router;
