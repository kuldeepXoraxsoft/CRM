import express from "express";
import cors from "cors";

import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import managementRoutes from "./routes/managementRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use("/api/organization", express.json({ limit: "3mb" }), organizationRoutes);
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/tickets", ticketRoutes);
app.use ("/api/calendar",calendarRoutes)
app.use

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use(errorHandler);

export default app;