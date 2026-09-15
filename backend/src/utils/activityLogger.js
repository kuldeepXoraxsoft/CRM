import prisma from "../config/db.js";

export async function logActivity( actorId, message, type = "general", departmentId = null 
  
) {
  try {
    await prisma.activity.create({
      data: {
        actorId,
        message,
        type,
        departmentId,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
}