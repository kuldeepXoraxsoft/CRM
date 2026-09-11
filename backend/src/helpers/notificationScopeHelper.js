import prisma from "../config/db.js";

export async function getDepartmentStakeholderIds({
  departmentId,
  cyvoraAMId,
  actorId,
}) {
  const recipientIds = new Set();

  // Company AM
  if (cyvoraAMId) {
    recipientIds.add(cyvoraAMId);

    // AM's manager
    const am = await prisma.user.findUnique({
      where: { id: cyvoraAMId },
      select: {
        managerId: true,
      },
    });

    if (am?.managerId) {
      recipientIds.add(am.managerId);
    }
  }

  // Department scope
  if (departmentId) {
    const departmentUsers = await prisma.user.findMany({
      where: {
        departmentId,
        status: "Active",
        role: {
          in: ["manager", "admin"],
        },
      },
      select: {
        id: true,
      },
    });

    departmentUsers.forEach((user) => {
      recipientIds.add(user.id);
    });
  }

  // Actor ko notification nahi
  if (actorId) {
    recipientIds.delete(actorId);
  }

  return [...recipientIds];
}