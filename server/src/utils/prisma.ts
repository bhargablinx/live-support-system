import { PrismaClient } from "../../generated/prisma/index.js"
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL as string;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;