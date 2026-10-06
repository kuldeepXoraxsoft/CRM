import { Router } from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

export default router;