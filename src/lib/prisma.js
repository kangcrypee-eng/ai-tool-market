const { PrismaClient } = require('@prisma/client');
const g = globalThis;
const prisma = g.prisma ?? new PrismaClient();
g.prisma = prisma; // cache in all environments including production
module.exports = { prisma };
