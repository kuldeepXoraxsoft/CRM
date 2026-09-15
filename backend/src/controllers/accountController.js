import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildLeadAccountScopeWhere } from "../utils/scope.js";
import { notifyAccountStakeholders } from "../helpers/accountNotificationHelper.js";

const ACCOUNT_INCLUDE = {
  cyvoraAM: {
    select: {
      id: true,
      name: true,
    },
  },
  followUpHistory: {
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  },
};

export const listAccounts = asyncHandler(async (req, res) => {
  const where = await buildLeadAccountScopeWhere(req.user);

  const accounts = await prisma.account.findMany({
    where,
    include: ACCOUNT_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(accounts);
});

export const countAccounts = asyncHandler(async (req, res) => {
  const where = await buildLeadAccountScopeWhere(req.user);

  const count = await prisma.account.count({
    where,
  });

  res.json({ count });
});

export const getAccount = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const account = await prisma.account.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
    include: ACCOUNT_INCLUDE,
  });

  if (!account) {
    throw new ApiError(404, "Account not found.");
  }

  res.json(account);
});

export const createAccount = asyncHandler(async (req, res) => {
  if (!req.body.customerName?.trim()) {
    throw new ApiError(400, "Customer Name is required.");
  }

  // Department is assigned from authenticated backend user.
  // Never trust departmentId from frontend.
  if (req.user.role !== "superAdmin" && !req.user.departmentId) {
    throw new ApiError(
      400,
      "Your account is not assigned to a department."
    );
  }

  const account = await prisma.account.create({
    data: buildAccountData(req.body, req.user, {}, true),
    include: ACCOUNT_INCLUDE,
  });

  await notifyAccountStakeholders({
    account,
    actor: req.user,
    type: "ACCOUNT_UPDATED",
    title: "New account created",
    message: `${req.user.name} created account "${account.customerName}"`,
  });

  res.status(201).json(account);
});

export const updateAccount = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const existing = await prisma.account.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Account not found.");
  }

  const account = await prisma.account.update({
    where: {
      id: req.params.id,
    },
    data: buildAccountData(req.body, req.user, existing, false),
    include: ACCOUNT_INCLUDE,
  });

  await notifyAccountStakeholders({
    account,
    actor: req.user,
    type: "ACCOUNT_UPDATED",
    title: "Account updated",
    message: `${req.user.name} updated account "${account.customerName}"`,
  });

  res.json(account);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const existing = await prisma.account.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Account not found.");
  }

  await prisma.account.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).send();
});

export const updateAccountFollowUp = asyncHandler(async (req, res) => {
  const { followUpDate, remark } = req.body;  

  if (!followUpDate) {
    throw new ApiError(400, "A new follow-up date is required.");
  }

  if (!remark?.trim()) {
    throw new ApiError(
      400,
      "A remark is required for every follow-up update."
    );
  }

  const scope = await buildLeadAccountScopeWhere(req.user);

  const existing = await prisma.account.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Account not found.");
  }

  const parsedDate = new Date(followUpDate);   // ✅ fixed

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid follow-up date.");
  }

  const account = await prisma.account.update({
    where: {
      id: req.params.id,
    },
    data: {
      followUpDate: parsedDate,
      followUpHistory: {
        create: {
          previousDate: existing.followUpDate,
          newDate: parsedDate,
          remark: remark.trim(),
        },
      },
    },
    include: ACCOUNT_INCLUDE,
  });

  await notifyAccountStakeholders({
    account,
    actor: req.user,
    type: "ACCOUNT_UPDATED",
    title: "Account follow-up updated",
    message: `${req.user.name} updated the follow-up for "${account.customerName}"`,
  });

  res.json(account);
});

function buildAccountData(
  body,
  currentUser,
  existing = {},
  isCreate = false
) {
  const data = {
    customerName:
      body.customerName ?? existing.customerName,
    departmentId:existing.departmentId ?? currentUser.departmentId,
    cyvoraAMId:
      body.cyvoraAMId ??
      existing.cyvoraAMId ?? (currentUser.role === "employee" ? currentUser.id : undefined),
    clientAM: body.clientAM ?? existing.clientAM,
    status: body.status ?? existing.status,
    traffic: body.traffic ?? existing.traffic,
    dateAdded: body.dateAdded ? new Date(body.dateAdded) : isCreate ? new Date() : undefined,
    statusNotes: body.statusNotes ?? existing.statusNotes,
    nextStep: body.nextStep ?? existing.nextStep,
    agreementStatus: body.agreementStatus ?? existing.agreementStatus,
    payment: body.payment ?? existing.payment,
    creditLimit: body.creditLimit ?? existing.creditLimit,
    theirRoutes: body.theirRoutes ?? existing.theirRoutes,
    theirRequirements: body.theirRequirements ?? existing.theirRequirements,
    ratesOffered: body.ratesOffered ?? existing.ratesOffered,
    routeListOnSheets: body.routeListOnSheets ?? existing.routeListOnSheets,
    phoneNumber: body.phoneNumber ?? existing.phoneNumber,
    teamsHandle: body.teams ?? body.teamsHandle ?? existing.teamsHandle,
    email: body.email ?? existing.email,
  };

  if (isCreate) { data.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;}

  return data;
}