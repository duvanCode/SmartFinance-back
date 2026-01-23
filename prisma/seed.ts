import { PrismaClient, CategoryType } from '@prisma/client';

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

  // Income categories
  const incomeCategories = [
    { name: 'Salary', icon: '💼', color: '#00C853' },
    { name: 'Freelance', icon: '💻', color: '#00E676' },
    { name: 'Investments', icon: '📈', color: '#64DD17' },
    { name: 'Gifts', icon: '🎁', color: '#76FF03' },
    { name: 'Other Income', icon: '💰', color: '#AEEA00' },
  ];

  for (const category of incomeCategories) {
    await prisma.category.create({
      data: {
        userId: user.id,
        name: category.name,
        type: CategoryType.INCOME,
        color: category.color,
        icon: category.icon,
        isDefault: true,
      },
    });
  }

  console.log(`✅ Created ${incomeCategories.length} income categories`);

  // Expense categories
  const expenseCategories = [
    { name: 'Food', icon: '🍔', color: '#FF5722' },
    { name: 'Transport', icon: '🚗', color: '#FF6F00' },
    { name: 'Housing', icon: '🏠', color: '#F44336' },
    { name: 'Utilities', icon: '💡', color: '#E65100' },
    { name: 'Entertainment', icon: '🎬', color: '#D84315' },
    { name: 'Shopping', icon: '🛍️', color: '#BF360C' },
    { name: 'Healthcare', icon: '⚕️', color: '#EF5350' },
    { name: 'Education', icon: '📚', color: '#FF7043' },
    { name: 'Other Expenses', icon: '💸', color: '#FF8A65' },
  ];

  for (const category of expenseCategories) {
    await prisma.category.create({
      data: {
        userId: user.id,
        name: category.name,
        type: CategoryType.EXPENSE,
        color: category.color,
        icon: category.icon,
        isDefault: true,
      },
    });
  }

  console.log(`✅ Created ${expenseCategories.length} expense categories`);
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
