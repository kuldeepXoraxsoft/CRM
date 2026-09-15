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
export async function buildTaskScopeWhere(currentUser) {
  // SuperAdmin → complete system access
  if (currentUser.role === "superAdmin") {
    return {};
  }

  // Normal users must belong to a department
  if (!currentUser.departmentId) {
    return {
      assignee: {
        departmentId: "__NO_DEPARTMENT__",
      },
    };
  }

  // Admin → all tasks of their department
  if (currentUser.role === "admin") {
    return {
      assignee: {
        departmentId: currentUser.departmentId,
      },
    };
  }

  // Manager → own + direct employees,
  // but only inside the same department
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

    const assigneeIds = [
      currentUser.id,
      ...employees.map((employee) => employee.id),
    ];

    return {
      assigneeId: {
        in: assigneeIds,
      },
      assignee: {
        departmentId: currentUser.departmentId,
      },
    };
  }

  // Employee → only own tasks inside their department
  return {
    assigneeId: currentUser.id,
    assignee: {
      departmentId: currentUser.departmentId,
    },
  };
}