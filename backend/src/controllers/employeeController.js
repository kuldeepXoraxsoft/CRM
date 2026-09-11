import bcrypt from "bcryptjs";

import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { ROLES } from "../constants/allowedValues.js";

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  departmentId: true,
  managerId: true,
  teamId: true,
  joinedDate: true,
  manager: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
};

export const listEmployees = asyncHandler(async (req, res) => {
  const { role, id, departmentId } = req.user;

  let where = {};

  if (role === "admin") {
 where = { departmentId: departmentId, };
  } 
  else if (role === "manager") { where = { OR: [ { managerId: id }, { id }, ], };
  } 
  else if (role === "employee") { where = { id, }; }

  const employees = await prisma.user.findMany({
    where,
    select: SAFE_SELECT,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(employees);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, role, managerId, teamId, status } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }

  if (role && !ROLES.includes(role)) {
    throw new ApiError(400, "Invalid role.");
  }

  // A manager can only create Employees, and only directly under themself.
  let finalRole = role || "employee";
  let finalManagerId = managerId || null;

  if (req.user.role === "manager") {
    finalRole = "employee";
    finalManagerId = req.user.id;
  }

  const hashed = await bcrypt.hash(password, 10);

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: finalRole,
      departmentId: req.user.departmentId,
      managerId: finalManagerId,
      teamId: teamId || null,
      status: status || "Active",
    },
    select: SAFE_SELECT,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} added ${employee.name} as a new employee`,
    "employee"
  );

  res.status(201).json(employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, managerId, teamId, status } = req.body;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Employee not found.");

  const data = {
    name: name ?? existing.name,
    email: email ?? existing.email,
    managerId: managerId ?? existing.managerId,
    teamId: teamId ?? existing.teamId,
    status: status ?? existing.status,
  };

  // Only an admin can change someone's role.
  if (req.user.role === "admin" && role) {
    if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role.");
    data.role = role;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: SAFE_SELECT,
  });

  await logActivity(req.user.id, `${req.user.name} updated ${updated.name}`, "employee");

  res.json(updated);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Employee not found.");

  await prisma.user.delete({ where: { id } });

  await logActivity(req.user.id, `${req.user.name} removed ${existing.name}`, "employee");

  res.status(204).send();
});