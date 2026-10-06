import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ==========================================
// DEPARTMENT SELECT
// ==========================================

const DEPARTMENT_SELECT = {
  id: true,
  name: true,
  createdAt: true,

  _count: {
    select: {
      users: true,
      teams: true,
      leads: true,
      accounts: true,
    },
  },
};

// ==========================================
// ADMIN SELECT
// ==========================================

const ADMIN_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  departmentId: true,
  joinedDate: true,
  createdAt: true,

  department: {
    select: {
      id: true,
      name: true,
    },
  },
};

// ==========================================
// DEPARTMENTS
// ==========================================

// GET /api/management/departments
export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: DEPARTMENT_SELECT,
  });

  res.status(200).json({
    success: true,
    data: departments,
  });
});

// POST /api/management/departments
export const createDepartment = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    throw new ApiError(400, "Department name is required.");
  }

  const existing = await prisma.department.findUnique({
    where: {
      name,
    },
  });

  if (existing) {
    throw new ApiError(409, "Department already exists.");
  }

  const department = await prisma.department.create({
    data: {
      name,
    },
    select: DEPARTMENT_SELECT,
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully.",
    data: department,
  });
});

// PUT /api/management/departments/:id
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = req.body.name?.trim();

  if (!name) {
    throw new ApiError(400, "Department name is required.");
  }

  const existing = await prisma.department.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Department not found.");
  }

  const duplicate = await prisma.department.findFirst({
    where: {
      name,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    throw new ApiError(409, "Department already exists.");
  }

  const department = await prisma.department.update({
    where: {
      id,
    },
    data: {
      name,
    },
    select: DEPARTMENT_SELECT,
  });

  res.status(200).json({
    success: true,
    message: "Department updated successfully.",
    data: department,
  });
});

// DELETE /api/management/departments/:id
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const department = await prisma.department.findUnique({
    where: { id },

    include: {
      _count: {
        select: {
          users: true,
          teams: true,
          leads: true,
          accounts: true,
        },
      },
    },
  });

  if (!department) {
    throw new ApiError(404, "Department not found.");
  }

  const { users, teams, leads, accounts } = department._count;

  if (users > 0 || teams > 0 || leads > 0 || accounts > 0) {
    throw new ApiError(
      400,
      "Cannot delete department because it contains users, teams, leads, or accounts."
    );
  }

  await prisma.department.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Department deleted successfully.",
  });
});

// ==========================================
// ADMINS
// ==========================================

// GET /api/management/admins
export const listAdmins = asyncHandler(async (req, res) => {
  const admins = await prisma.user.findMany({
    where: {
      role: "admin",
    },

    orderBy: {
      createdAt: "desc",
    },

    select: ADMIN_SELECT,
  });

  res.status(200).json({
    success: true,
    data: admins,
  });
});

// POST /api/management/admins
export const createAdmin = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    departmentId,
    status = "Active",
  } = req.body;

  const cleanName = name?.trim();
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanName) {
    throw new ApiError(400, "Name is required.");
  }

  if (!cleanEmail) {
    throw new ApiError(400, "Email is required.");
  }

  if (!password) {
    throw new ApiError(400, "Password is required.");
  }

  if (password.length < 6) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters."
    );
  }

  if (!departmentId) {
    throw new ApiError(400, "Department is required.");
  }

  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!department) {
    throw new ApiError(404, "Department not found.");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: cleanEmail,
    },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,

      role: "admin",

      status,

      departmentId,
    },

    select: ADMIN_SELECT,
  });

  res.status(201).json({
    success: true,
    message: "Admin created successfully.",
    data: admin,
  });
});

// PUT /api/management/admins/:id
export const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingAdmin = await prisma.user.findFirst({
    where: {
      id,
      role: "admin",
    },
  });

  if (!existingAdmin) {
    throw new ApiError(404, "Admin not found.");
  }

  const {
    name,
    email,
    password,
    departmentId,
    status,
  } = req.body;

  const data = {};

  if (name !== undefined) {
    const cleanName = name.trim();

    if (!cleanName) {
      throw new ApiError(400, "Name cannot be empty.");
    }

    data.name = cleanName;
  }

  if (email !== undefined) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new ApiError(400, "Email cannot be empty.");
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      throw new ApiError(409, "Email is already registered.");
    }

    data.email = cleanEmail;
  }

  if (password !== undefined && password !== "") {
    if (password.length < 6) {
      throw new ApiError(
        400,
        "Password must be at least 6 characters."
      );
    }

    data.password = await bcrypt.hash(password, 10);
  }

  if (departmentId !== undefined) {
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new ApiError(404, "Department not found.");
    }

    data.departmentId = departmentId;
  }

  if (status !== undefined) {
    data.status = status;
  }

  const admin = await prisma.user.update({
    where: {
      id,
    },

    data,

    select: ADMIN_SELECT,
  });

  res.status(200).json({
    success: true,
    message: "Admin updated successfully.",
    data: admin,
  });
});

// DELETE /api/management/admins/:id
export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await prisma.user.findFirst({
    where: {
      id,
      role: "admin",
    },

    include: {
      _count: {
        select: {
          managedTeams: true,
          leadsAsAM: true,
          accountsAsAM: true,
        },
      },
    },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found.");
  }

  const {
    managedTeams,
    leadsAsAM,
    accountsAsAM,
  } = admin._count;

  if (
    managedTeams > 0 ||
    leadsAsAM > 0 ||
    accountsAsAM > 0
  ) {
    throw new ApiError(
      400,
      "Cannot delete admin because this admin is assigned to teams, leads, or accounts."
    );
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully.",
  });
});