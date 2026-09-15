import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { buildLeadAccountScopeWhere } from "../utils/scope.js";
import { CONVERTIBLE_LEAD_STATUSES } from "../constants/allowedValues.js";
import { notifyLeadStakeholders } from "../helpers/leadNotificationHelper.js";
import { notifyMany } from "../services/notificationService.js";
import { getDepartmentStakeholderIds } from "../helpers/notificationScopeHelper.js";

/* --------------------------------------------------
   COMMON INCLUDE
-------------------------------------------------- */

const LEAD_INCLUDE = {
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

/* --------------------------------------------------
   RESOLVE CYVORA AM NAME -> USER ID
-------------------------------------------------- */

async function resolveCyvoraAMId(cyvoraAM, currentUser) {
  if (!cyvoraAM?.trim()) {
    if (currentUser.role === "employee") {
      return currentUser.id;
    }

    return undefined;
  }

  const where = {
    name: {
      equals: cyvoraAM.trim(),
      mode: "insensitive",
    },
  };

  if (currentUser.role !== "superAdmin") {
    if (!currentUser.departmentId) {
      throw new ApiError(400, "Your account is not assigned to a department.");
    }

    where.departmentId = currentUser.departmentId;
  }

  const am = await prisma.user.findFirst({
    where,
    select: {
      id: true,
      name: true,
      departmentId: true,
    },
  });

  if (!am) {
    throw new ApiError(
      400,
      `Cyvora AM "${cyvoraAM.trim()}" not found in your department.`,
    );
  }

  return am.id;
}

/* --------------------------------------------------
   BUILD LEAD DATA
-------------------------------------------------- */

async function buildLeadData(
  body,
  currentUser,
  existing = {},
  isCreate = false,
) {
  let cyvoraAMId;

  if (existing.cyvoraAMId) {
    cyvoraAMId = existing.cyvoraAMId;
  } else if (body.cyvoraAMId) {

    const amWhere = {
      id: body.cyvoraAMId,
    };

    if (currentUser.role !== "superAdmin") {
      if (!currentUser.departmentId) {
        throw new ApiError(
          400,
          "Your account is not assigned to a department.",
        );
      }

      amWhere.departmentId = currentUser.departmentId;
    }

    const am = await prisma.user.findFirst({
      where: amWhere,
      select: {
        id: true,
        name: true,
        departmentId: true,
      },
    });

    if (!am) {
      throw new ApiError(400, "Selected Company AM not found.");
    }

    cyvoraAMId = am.id;
  } else if (body.cyvoraAM) {

    cyvoraAMId = await resolveCyvoraAMId(body.cyvoraAM, currentUser);
  } else if (currentUser.role === "employee") {

    cyvoraAMId = currentUser.id;
  }

  /* --------------------------------------------------
     DEPARTMENT
  -------------------------------------------------- */

  let departmentId;

  if (currentUser.role === "superAdmin") {
    departmentId = existing.departmentId ?? body.departmentId;

    if (!departmentId) {
      throw new ApiError(400, "Department is required for SuperAdmin.");
    }
  } else {
    /*
     * Never trust departmentId from frontend
     * for normal users.
     */
    departmentId = existing.departmentId ?? currentUser.departmentId;

    if (!departmentId) {
      throw new ApiError(400, "Your account is not assigned to a department.");
    }
  }

  /* --------------------------------------------------
     FINAL DATA
  -------------------------------------------------- */

  return {
    customerName: body.customerName ?? existing.customerName,

    departmentId,

    cyvoraAMId,

    clientAM: body.clientAM ?? existing.clientAM,

    status: body.status ?? existing.status,

    traffic: body.traffic ?? existing.traffic,

    dateAdded: body.dateAdded
      ? new Date(body.dateAdded)
      : isCreate
        ? new Date()
        : undefined,

    statusNotes: body.statusNotes ?? existing.statusNotes,

    nextStep: body.nextStep ?? existing.nextStep,

    dealsInProgress: body.dealsInProgress ?? existing.dealsInProgress,

    agreementStatus: body.agreementStatus ?? existing.agreementStatus,

    payment: body.payment ?? existing.payment,

    creditLimit: body.creditLimit ?? existing.creditLimit,

    theirRoutes: body.theirRoutes ?? existing.theirRoutes,

    theirRequirements: body.theirRequirements ?? existing.theirRequirements,

    ratesOffered: body.ratesOffered ?? existing.ratesOffered,

    routeListOnSheets: body.routeListOnSheets ?? existing.routeListOnSheets,

    leadSource: body.leadSource ?? existing.leadSource,

    phoneNumber: body.phoneNumber ?? existing.phoneNumber,

    teamsHandle: body.teams ?? body.teamsHandle ?? existing.teamsHandle,

    email: body.email ?? existing.email,

    ...(isCreate && {
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    }),
  };
}

/* --------------------------------------------------
   LIST LEADS
-------------------------------------------------- */

export const listLeads = asyncHandler(async (req, res) => {
  const where = await buildLeadAccountScopeWhere(req.user);

  const leads = await prisma.lead.findMany({
    where,
    include: LEAD_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(leads);
});

/* --------------------------------------------------
   GET SINGLE LEAD
-------------------------------------------------- */

export const getLead = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const lead = await prisma.lead.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
    include: LEAD_INCLUDE,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found.");
  }

  res.json(lead);
});

/* --------------------------------------------------
   CREATE LEAD
-------------------------------------------------- */

export const createLead = asyncHandler(async (req, res) => {
  if (!req.body.customerName?.trim()) {
    throw new ApiError(400, "Customer Name is required.");
  }

  const data = await buildLeadData(req.body, req.user, {}, true);

  const lead = await prisma.lead.create({
    data,
    include: LEAD_INCLUDE,
  });

  await notifyLeadStakeholders({
    lead,
    actor: req.user,
    type: "LEAD_ASSIGNED",
    title: "New lead assigned",
    message: `${req.user.name} assigned lead "${lead.customerName}" to ${
      lead.cyvoraAM?.name || "you"
    }`,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} created a new lead "${lead.customerName}"`,
    "lead",
    req.user.departmentId,
  );

  res.status(201).json(lead);
});

/* --------------------------------------------------
   BULK CREATE LEADS
-------------------------------------------------- */

export const bulkCreateLeads = asyncHandler(async (req, res) => {
  const { leads } = req.body;

  if (!Array.isArray(leads) || leads.length === 0) {
    throw new ApiError(400, "Provide a non-empty array of leads.");
  }

  const validLeads = leads.filter((lead) => lead && lead.customerName?.trim());

  if (validLeads.length === 0) {
    throw new ApiError(400, "Every lead needs a Customer Name.");
  }

  const leadData = await Promise.all(
    validLeads.map((lead) => buildLeadData(lead, req.user, {}, true)),
  );

  const created = await prisma.$transaction(
    leadData.map((data) =>
      prisma.lead.create({
        data,
        include: LEAD_INCLUDE,
      }),
    ),
  );

  await Promise.all(
    created.map((lead) =>
      notifyLeadStakeholders({
        lead,
        actor: req.user,
        type: "LEAD_ASSIGNED",
        title: "New lead assigned",
        message: `${req.user.name} assigned lead "${lead.customerName}" to ${
          lead.cyvoraAM?.name || "you"
        }`,
      }),
    ),
  );

  await logActivity(
    req.user.id,
    `${req.user.name} imported ${created.length} leads`,
    "lead",
    req.user.departmentId,
  );

  res.status(201).json({
    count: created.length,
    leads: created,
  });
});

/* --------------------------------------------------
   UPDATE LEAD
-------------------------------------------------- */

export const updateLead = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const existing = await prisma.lead.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Lead not found.");
  }

  const data = await buildLeadData(req.body, req.user, existing, false);

  const updated = await prisma.lead.update({
    where: {
      id: existing.id,
    },
    data,
    include: LEAD_INCLUDE,
  });

  await notifyLeadStakeholders({
    lead: updated,
    actor: req.user,
    type: "LEAD_UPDATED",
    title: "Lead updated",
    message: `${req.user.name} updated lead "${updated.customerName}"`,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} updated lead "${updated.customerName}"`,
    "lead",
    req.user.departmentId,
  );

  res.json(updated);
});

/* --------------------------------------------------
   DELETE LEAD
-------------------------------------------------- */

export const deleteLead = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const existing = await prisma.lead.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Lead not found.");
  }

  await prisma.lead.delete({
    where: {
      id: existing.id,
    },
  });

  await logActivity(
    req.user.id,
    `${req.user.name} deleted lead "${existing.customerName}"`,
    "lead",
    req.user.departmentId,
  );

  res.status(204).send();
});

/* --------------------------------------------------
   UPDATE FOLLOW UP
-------------------------------------------------- */

export const updateLeadFollowUp = asyncHandler(async (req, res) => {
  const { followUpDate, remark } = req.body;

  const scope = await buildLeadAccountScopeWhere(req.user);

  const lead = await prisma.lead.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found.");
  }

  if (!followUpDate) {
    throw new ApiError(400, "Follow-up date is required.");
  }

  if (!remark?.trim()) {
    throw new ApiError(400, "Remark is required when changing follow-up date.");
  }

  const parsedDate = new Date(followUpDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid follow-up date.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.followUpEntry.create({          
      data: {
        leadId: lead.id,
        previousDate: lead.followUpDate,      
        newDate: parsedDate,                 
        remark: remark.trim(),
      },
    });

    return tx.lead.update({
      where: { id: lead.id },
      data: { followUpDate: parsedDate },
      include: LEAD_INCLUDE,
    });
  });

  await notifyLeadStakeholders({
    lead: updated,
    actor: req.user,
    type: "FOLLOW_UP_REMINDER",
    title: "Lead follow-up updated",
    message: `${req.user.name} updated follow-up for "${updated.customerName}"`,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} updated follow-up for "${updated.customerName}"`,
    "lead",
    req.user.departmentId,
  );

  res.json(updated);
});

/* --------------------------------------------------
   CONVERT LEAD -> ACCOUNT
-------------------------------------------------- */

export const convertLeadToAccount = asyncHandler(async (req, res) => {
  const scope = await buildLeadAccountScopeWhere(req.user);

  const lead = await prisma.lead.findFirst({
    where: {
      id: req.params.id,
      ...scope,
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found.");
  }

  if (!CONVERTIBLE_LEAD_STATUSES.includes(lead.status)) {
    throw new ApiError(
      400,
      "This lead cannot be converted to an account."
    );
  }

  // Department is required for CRM scope.
  if (!lead.departmentId) {
    throw new ApiError(
      400,
      "Lead is not assigned to a department and cannot be converted."
    );
  }

  const account = await prisma.$transaction(async (tx) => {
    const created = await tx.account.create({
      data: {
        customerName: lead.customerName,

        department: {
          connect: {
            id: lead.departmentId,
          },
        },

        ...(lead.cyvoraAMId
          ? {
              cyvoraAM: {
                connect: {
                  id: lead.cyvoraAMId,
                },
              },
            }
          : {}),

        clientAM: lead.clientAM,
        status: lead.status,
        traffic: lead.traffic,
        dateAdded: lead.dateAdded,
        followUpDate: lead.followUpDate,
        statusNotes: lead.statusNotes,
        nextStep: lead.nextStep,
        agreementStatus: lead.agreementStatus,
        payment: lead.payment,
        creditLimit: lead.creditLimit,
        theirRoutes: lead.theirRoutes,
        theirRequirements: lead.theirRequirements,
        ratesOffered: lead.ratesOffered,
        routeListOnSheets: lead.routeListOnSheets,
        // leadSource: lead.leadSource,
        phoneNumber: lead.phoneNumber,
        teamsHandle: lead.teamsHandle,
        email: lead.email,

        convertedFromLead: {
          connect: {
            id: lead.id,
          },
        },

        convertedAt: new Date(),
      },
    });

    // Remove the original lead after account creation.
    await tx.lead.delete({
      where: {
        id: lead.id,
      },
    });

    return created;
  });

  const stakeholderIds = await getDepartmentStakeholderIds({
    departmentId: lead.departmentId,
    cyvoraAMId: lead.cyvoraAMId,
    actorId: req.user.id,
  });

  await notifyMany({
    userIds: stakeholderIds,
    type: "LEAD_CONVERTED",
    title: "Lead converted",
    message: `${req.user.name} converted "${lead.customerName}" into an account.`,
    entityType: "account",
    entityId: account.id,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} converted lead "${lead.customerName}" to account`,
    "lead",
    req.user.departmentId,
  );

  res.status(201).json(account);
});
export const downloadLeadSample = asyncHandler(async (req, res) => {
  const headers = [
    "Customer Name",
    "Cyvora AM",
    "Client AM",
    "Status",
    "Traffic",
    "Date Added",
    "Follow Up Date",
    "Status Notes",
    "Next Step",
    "Deals In Progress",
    "Agreement Status",
    "Payment",
    "Credit Limit",
    "Their Routes",
    "Their Requirements",
    "Rates Offered",
    "Route List On Sheets",
    "Lead Source",
    "Phone Number",
    "Teams Handle",
    "Email",
  ];

  const sampleRow = [
    "ABC Logistics",
    "Arun Arya",
    "Rahul Sharma",
    "New Lead",
    "High",
    "2026-09-14",
    "2026-09-20",
    "Interested in our services",
    "Share quotation",
    "Initial discussion",
    "Not Sent",
    "Pending",
    "500000",
    "Delhi - Mumbai",
    "Regular freight requirement",
    "₹1200",
    "Yes",
    "Website",
    "9876543210",
    "ABC Teams",
    "rahul@example.com",
  ];

  const escapeCsvValue = (value) => {
    const stringValue = String(value ?? "");

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const csv = [
    headers.map(escapeCsvValue).join(","),
    sampleRow.map(escapeCsvValue).join(","),
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="lead-import-sample.csv"'
  );

  res.status(200).send("\uFEFF" + csv);
});