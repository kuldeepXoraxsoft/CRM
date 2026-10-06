import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listActivity = asyncHandler(async (req, res) => {
  const where =
    req.user.role === "superAdmin"
      ? {}
      : {
          departmentId: req.user.departmentId,
        };

  const activities = await prisma.activity.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(activities);
});