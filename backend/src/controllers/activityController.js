import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listActivity = asyncHandler(async (req, res) => {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { actor: { select: { id: true, name: true } } },
  });

  res.json(activities);
});