import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";

const OPTION_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  departmentId: true,
  managerId: true,
};

function buildScope(user, purpose = "assignment") {
  if (user.role === "superAdmin") return { status: "Active" };

  if (!user.departmentId) return { id: "__NO_USER__" };

  if (purpose === "meeting") {
    return { status: "Active", departmentId: user.departmentId };
  }

  if (user.role === "admin") {
    return { status: "Active", departmentId: user.departmentId };
  }

  if (user.role === "manager") {
    return {
      status: "Active",
      departmentId: user.departmentId,
      OR: [{ id: user.id }, { managerId: user.id }],
    };
  }

  return { status: "Active", id: user.id };
}

export const listUserOptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const search = req.query.search?.trim();
  const purpose = req.query.purpose === "meeting" ? "meeting" : "assignment";
  const ids = String(req.query.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);

  const baseScope = buildScope(req.user, purpose);
  const searchWhere = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined;

  const where = searchWhere
    ? { AND: [baseScope, searchWhere] }
    : baseScope;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: OPTION_SELECT,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Selected values are fetched separately so a selected user remains visible
  // even after the user changes the search text.
  let selected = [];
  if (ids.length) {
    selected = await prisma.user.findMany({
      where: { ...baseScope, id: { in: ids } },
      select: OPTION_SELECT,
      orderBy: { name: "asc" },
    });
  }

  const map = new Map([...selected, ...users].map((user) => [user.id, user]));
  const data = [...map.values()];

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  });
});
