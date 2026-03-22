const { prisma } = require('./prisma');

async function createNotification({ userId, type, message, linkUrl }) {
  try {
    await prisma.notification.create({
      data: { userId, type, message, linkUrl },
    });
  } catch (e) {
    console.error('Notification create error:', e.message);
  }
}

module.exports = { createNotification };
