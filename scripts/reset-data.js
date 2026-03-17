// scripts/reset-data.js
// 모든 데이터를 초기화하고 admin 계정만 남김
// 실행: node scripts/reset-data.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
  console.log('🗑️  Clearing all data...');

  // 순서 중요: FK 의존성 역순으로 삭제
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.userToolOwnership.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.user.deleteMany();

  // admin 계정만 재생성
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin123', 10),
      name: '관리자',
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  });

  console.log('✅ Reset complete! Only admin account remains.');
  console.log('   Login: admin@example.com / admin123');
}

reset().catch(console.error).finally(() => prisma.$disconnect());
