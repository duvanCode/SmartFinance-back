import { PrismaClient, CategoryType } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '../src/features/categories/domain/constants/default-categories.constant';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.category.deleteMany();
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

  // Create default categories using the centralized constant
  for (const dc of DEFAULT_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId: user.id,
        name: dc.name,
        type: dc.type === 'INCOME' ? CategoryType.INCOME : CategoryType.EXPENSE,
        color: dc.color,
        icon: dc.icon,
        isDefault: true,
      },
    });
  }
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
