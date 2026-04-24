import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany();
  console.log("TEAMS:", JSON.stringify(teams, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
