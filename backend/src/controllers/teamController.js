import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { buildTeamScopeWhere } from "../utils/scope.js";

const TEAM_SELECT = {
  id: true,
  name: true,
  departmentId: true,
  createdAt: true,

  manager: {
    select: {
      id: true,
      name: true,
    },
  },

  members: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};


export const listTeams = asyncHandler(async (req, res) => {
  const where = await buildTeamScopeWhere(req.user);

  const teams = await prisma.team.findMany({
    where,
    select: TEAM_SELECT,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(teams);
});


export const createTeam = asyncHandler(async (req, res) => {
  const {
    name,
    managerId,
    memberIds = [],
    departmentId: requestedDepartmentId,
  } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Team name is required.");
  }

  if (!Array.isArray(memberIds)) {
    throw new ApiError(400, "memberIds must be an array.");
  }

  const departmentId =
    req.user.role === "superAdmin"
      ? requestedDepartmentId
      : req.user.departmentId;

  if (!departmentId) {
    throw new ApiError(400, "Department is required.");
  }

  // Make sure department actually exists.
  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
    select: {
      id: true,
    },
  });

  if (!department) {
    throw new ApiError(400, "Selected department not found.");
  }

  // Manager can only create a team for himself.
  const finalManagerId =
    req.user.role === "manager" ? req.user.id : managerId;

  if (!finalManagerId) {
    throw new ApiError(400, "Please pick a manager.");
  }

  // Validate manager belongs to the same department.
  const manager = await prisma.user.findFirst({
    where: {
      id: finalManagerId,
      departmentId,
      role: {
        in: ["manager", "admin"],
      },
      status: "Active",
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!manager) {
    throw new ApiError(
      400,
      "Selected manager does not belong to this department."
    );
  }

  // Validate every member belongs to the same department.
  const uniqueMemberIds = [...new Set(memberIds)].filter(Boolean);

  if (uniqueMemberIds.length > 0) {
    const members = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueMemberIds,
        },
        departmentId,
        status: "Active",
      },
      select: {
        id: true,
      },
    });

    if (members.length !== uniqueMemberIds.length) {
      throw new ApiError(
        400,
        "One or more selected members do not belong to this department."
      );
    }
  }

  const team = await prisma.team.create({
    data: {
      name: name.trim(),
      departmentId,
      managerId: finalManagerId,

      members: {
        connect: uniqueMemberIds.map((memberId) => ({
          id: memberId,
        })),
      },
    },

    select: TEAM_SELECT,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} created a new team "${team.name}"`,
    "team"
  );

  res.status(201).json(team);
});


export const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, managerId, memberIds } = req.body;
  const scope = await buildTeamScopeWhere(req.user);

  const existing = await prisma.team.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });
 
  if (!existing) {
    throw new ApiError(404, "Team not found.");
  }

  const data = {
    name: name?.trim() || existing.name,
  };

  /**
   * Only Admin and SuperAdmin can change team manager.
   *
   * Manager cannot transfer his team to another manager.
   */
  if (
    (req.user.role === "admin" || req.user.role === "superAdmin") &&
    managerId
  ) {
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        departmentId: existing.departmentId,
        role: {
          in: ["manager", "admin"],
        },
        status: "Active",
      },
      select: {
        id: true,
      },
    });

    if (!manager) {
      throw new ApiError(
        400,
        "Selected manager does not belong to this department."
      );
    }

    data.managerId = managerId;
  }

  /**
   * Validate members before replacing team members.
   *
   * Members must belong to the same department as the team.
   */
  if (Array.isArray(memberIds)) {
    const uniqueMemberIds = [...new Set(memberIds)].filter(Boolean);

    if (uniqueMemberIds.length > 0) {
      const members = await prisma.user.findMany({
        where: {
          id: {
            in: uniqueMemberIds,
          },
          departmentId: existing.departmentId,
          status: "Active",
        },
        select: {
          id: true,
        },
      });

      if (members.length !== uniqueMemberIds.length) {
        throw new ApiError(
          400,
          "One or more selected members do not belong to this department."
        );
      }
    }

    data.members = {
      set: uniqueMemberIds.map((memberId) => ({
        id: memberId,
      })),
    };
  }

  const updated = await prisma.team.update({
    where: {
      id: existing.id,
    },
    data,
    select: TEAM_SELECT,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} updated team "${updated.name}"`,
    "team"
  );

  res.json(updated);
});


export const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const scope = await buildTeamScopeWhere(req.user);

  const existing = await prisma.team.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Team not found.");
  }

  await prisma.$transaction(async (tx) => {
    // Remove team assignment from all members first.
    await tx.user.updateMany({
      where: {
        teamId: existing.id,
      },
      data: {
        teamId: null,
      },
    });

    await tx.team.delete({
      where: {
        id: existing.id,
      },
    });
  });

  await logActivity(
    req.user.id,
    `${req.user.name} deleted team "${existing.name}"`,
    "team"
  );

  res.status(204).send();
});

