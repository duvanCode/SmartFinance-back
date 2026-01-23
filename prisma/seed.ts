import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.user.deleteMany();
    console.log('✅ Cleaned existing data');
  }

  // Create sample user
  const user = await prisma.user.create({
    data: {
      email: 'demo@smartfinance.com',
      name: 'Demo User',
      googleId: 'demo-google-id-123456789',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User',
    },
  });

  console.log(`✅ Created user: ${user.name} (${user.email})`);

  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
