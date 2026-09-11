import prisma from "../config/db.js";


export async function buildLeadAccountScopeWhere(currentUser) {
  // SuperAdmin is the only global user.
  if (currentUser.role === "superAdmin") {
    return {};
  }

  // Every normal user must belong to a department.
  if (!currentUser.departmentId) {
    return {
      departmentId: "__NO_DEPARTMENT__",
    };
  }

  // Department Admin
  if (currentUser.role === "admin") {
    return {
      departmentId: currentUser.departmentId,
    };
  }

  // Manager
  if (currentUser.role === "manager") {
    const employees = await prisma.user.findMany({
      where: {
        managerId: currentUser.id,
        departmentId: currentUser.departmentId,
      },
      select: {
        id: true,
      },
    });

    const ids = [
      currentUser.id,
      ...employees.map((employee) => employee.id),
    ];

    return {
      departmentId: currentUser.departmentId,
      cyvoraAMId: {
        in: ids,
      },
    };
  }

  // Employee
  return {
    departmentId: currentUser.departmentId,
    cyvoraAMId: currentUser.id,
  };
}

export async function buildTeamScopeWhere(currentUser) {
  if (currentUser.role === "superAdmin") {
    return {};
  }

  if (!currentUser.departmentId) {
    return {
      departmentId: "__NO_DEPARTMENT__",
    };
  }

  if (currentUser.role === "admin") {
    return {
      departmentId: currentUser.departmentId,
    };
  }

  if (currentUser.role === "manager") {
    return {
      departmentId: currentUser.departmentId,
      managerId: currentUser.id,
    };
  }

  return {
    departmentId: currentUser.departmentId,
    id: currentUser.teamId || "__NO_TEAM__",
  };
}