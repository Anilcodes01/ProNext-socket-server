import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to database");

    const userCount = await prisma.user.count();
    console.log(
      `Database connection verified. Current user count: ${userCount}`
    );
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}
