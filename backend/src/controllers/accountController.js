import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildLeadAccountScopeWhere } from "../utils/scope.js";
import { notifyAccountStakeholders } from "../helpers/accountNotificationHelper.js";
import fs from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "../middleware/accountDocumentUpload.js";

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

import { getPagination } from "../utils/pagination.js";

export const listAccounts = asyncHandler(async (req, res) => {
  const where = await buildLeadAccountScopeWhere(req.user);

  const { page, limit, skip } = getPagination(req);

  const search = req.query.search?.trim();

  if (search) {
    where.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        clientAM: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        cyvoraAM: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [accounts, total] = await prisma.$transaction([
    prisma.account.findMany({
      where,
      include: ACCOUNT_INCLUDE,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      skip,
      take: limit,
    }),

    prisma.account.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: accounts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
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

  const parsedDate = new Date(followUpDate);  

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

export const getAccountFollowUpHistory = asyncHandler(
  async (req, res) => {
    const scope = await buildLeadAccountScopeWhere(req.user);

    // Verify that the account exists and is accessible to this user.
    const account = await prisma.account.findFirst({
      where: {
        id: req.params.id,
        ...scope,
      },
      select: { id: true },
    });

    if (!account) {
      throw new ApiError(404, "Account not found.");
    }

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    // Keep page size fixed at 10.
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {
      accountId: account.id,
    };

    const [data, total] = await prisma.$transaction([
      prisma.followUpEntry.findMany({
        where,
        orderBy: [
          { updatedAt: "desc" },
          { id: "desc" },
        ],
        skip,
        take: limit,
      }),

      prisma.followUpEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }
);

async function getAccessibleAccount(req) {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const account = await prisma.account.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
    select: { id: true },
  });

  if (!account) {
    throw new ApiError(404, "Account not found.");
  }

  return account;
}

async function removeStoredDocument(storageName) {
  // Never accept a path supplied by the client.
  if (!/^[a-f0-9-]+\.(pdf|png|jpg|jpeg|webp|doc|docx|xls|xlsx|csv|txt)$/i.test(storageName)) {
    return;
  }

  await fs.unlink(path.join(uploadDir, storageName)).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });
}

export const listAccountDocuments = asyncHandler(async (req, res) => {
  const account = await getAccessibleAccount(req);

  const documents = await prisma.accountDocument.findMany({
    where: { accountId: account.id },
    orderBy: { uploadedAt: "desc" },
  });

  res.json({ data: documents });
});

export const uploadAccountDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please choose a document to upload.");
  }

  try {
    const title = String(req.body.title || "").trim();

    if (!title) {
      throw new ApiError(400, "Document title is required.");
    }

    if (title.length > 150) {
      throw new ApiError(400, "Document title cannot exceed 150 characters.");
    }

    const account = await getAccessibleAccount(req);

    const document = await prisma.accountDocument.create({
      data: {
        title,
        originalName: path.basename(req.file.originalname),
        mimeType: req.file.mimetype,
        size: req.file.size,
        storageName: req.file.filename,
        accountId: account.id,
      },
    });

    res.status(201).json({ document });
  } catch (error) {
    await removeStoredDocument(req.file.filename).catch(() => {});
    throw error;
  }
});

export const downloadAccountDocument = asyncHandler(async (req, res) => {
  const account = await getAccessibleAccount(req);

  const document = await prisma.accountDocument.findFirst({
    where: {
      id: req.params.documentId,
      accountId: account.id,
    },
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  const filePath = path.join(uploadDir, document.storageName);

  try {
    await fs.access(filePath);
  } catch {
    throw new ApiError(404, "The stored document file could not be found.");
  }

  res.download(filePath, document.originalName);
});

export const deleteAccountDocument = asyncHandler(async (req, res) => {
  const account = await getAccessibleAccount(req);

  const document = await prisma.accountDocument.findFirst({
    where: {
      id: req.params.documentId,
      accountId: account.id,
    },
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  await prisma.accountDocument.delete({
    where: { id: document.id },
  });

  await removeStoredDocument(document.storageName).catch((error) => {
    console.error("Could not remove stored document:", error.message);
  });

  res.json({ message: "Document deleted successfully." });
});
