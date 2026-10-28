import prisma from "../config/db.js";

export const ORG_ID = "default";

// Public-safe branding info (no image bytes)
export async function getBranding() {
  const org = await prisma.organization.findUnique({
    where: { id: ORG_ID },
    select: { companyName: true, logoMime: true, logoUpdatedAt: true },
  });

  return {
    companyName: org?.companyName?.trim() || "",
    hasLogo: Boolean(org?.logoMime),
    logoVersion: org?.logoUpdatedAt ? org.logoUpdatedAt.getTime() : null,
  };
}

export async function getLogoRecord() {
  return prisma.organization.findUnique({
    where: { id: ORG_ID },
    select: { logoData: true, logoMime: true, logoUpdatedAt: true },
  });
}
