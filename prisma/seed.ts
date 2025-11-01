import { PrismaClient } from '@prisma/client';
import { Currency, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FLOCKNODE database...');

  // Create HOUSE accounts for operations
  const houseOperationsFC = await prisma.account.upsert({
    where: {
      type_label_currency: {
        type: AccountType.HOUSE,
        label: 'OPERATIONS',
        currency: Currency.FC,
      },
    },
    update: {},
    create: {
      type: AccountType.HOUSE,
      label: 'OPERATIONS',
      currency: Currency.FC,
      decimals: 2,
      balanceMinor: 0n,
    },
  });

  const houseOperationsUSDC = await prisma.account.upsert({
    where: {
      type_label_currency: {
        type: AccountType.HOUSE,
        label: 'OPERATIONS',
        currency: Currency.USDC,
      },
    },
    update: {},
    create: {
      type: AccountType.HOUSE,
      label: 'OPERATIONS',
      currency: Currency.USDC,
      decimals: 6,
      balanceMinor: 0n,
    },
  });

  const houseClearingFC = await prisma.account.upsert({
    where: {
      type_label_currency: {
        type: AccountType.HOUSE,
        label: 'CLEARING',
        currency: Currency.FC,
      },
    },
    update: {},
    create: {
      type: AccountType.HOUSE,
      label: 'CLEARING',
      currency: Currency.FC,
      decimals: 2,
      balanceMinor: 1000000000n, // Start with 10M FC for testing
    },
  });

  const houseClearingUSDC = await prisma.account.upsert({
    where: {
      type_label_currency: {
        type: AccountType.HOUSE,
        label: 'CLEARING',
        currency: Currency.USDC,
      },
    },
    update: {},
    create: {
      type: AccountType.HOUSE,
      label: 'CLEARING',
      currency: Currency.USDC,
      decimals: 6,
      balanceMinor: 10000000000000n, // Start with 10M USDC for testing
    },
  });

  console.log('✅ Created HOUSE accounts');

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@flocknode.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@flocknode.com',
      kycStatus: 'APPROVED',
      riskScore: 10,
    },
  });

  // Create user accounts
  const userAccountFC = await prisma.account.upsert({
    where: {
      type_label_currency: {
        type: AccountType.USER,
        label: null,
        currency: Currency.FC,
      },
    },
    update: {},
    create: {
      type: AccountType.USER,
      currency: Currency.FC,
      decimals: 2,
      balanceMinor: 100000n, // Start with 1000 FC for testing
      userId: testUser.id,
    },
  });

  const userAccountUSDC = await prisma.account.upsert({
    where: {
      type_label_currency: {
        type: AccountType.USER,
        label: null,
        currency: Currency.USDC,
      },
    },
    update: {},
    create: {
      type: AccountType.USER,
      currency: Currency.USDC,
      decimals: 6,
      balanceMinor: 1000000000n, // Start with 1000 USDC for testing
      userId: testUser.id,
    },
  });

  console.log('✅ Created test user and accounts');

  // Create some prop templates
  const propTemplates = [
    {
      game: 'UFC5',
      type: 'THRESHOLD',
      label: 'Player A ≥ 5 takedowns by Round 2',
      conditionJson: {
        event: 'STAT.takedowns',
        subject: 'playerA',
        comparator: '>=',
        value: 5,
        window: { type: 'ROUND', end: 2 }
      },
      minEntryMinor: 100n, // $1.00 FC
      maxEntryMinor: 100000n, // $1000 FC
      feeBps: 500, // 5%
      cutoffPolicy: 'ROUND<2',
      enabled: true,
    },
    {
      game: 'VALORANT',
      type: 'RACE',
      label: 'First to 10 kills',
      conditionJson: {
        event: 'STAT.kills',
        subject: 'playerA',
        comparator: '>=',
        value: 10,
        window: { type: 'MATCH', end: 'END' }
      },
      minEntryMinor: 50n, // $0.50 FC
      maxEntryMinor: 50000n, // $500 FC
      feeBps: 500,
      cutoffPolicy: 'CLOCK<=1:00',
      enabled: true,
    },
    {
      game: 'ACC',
      type: 'ACCURACY',
      label: 'Player accuracy ≥ 85% by lap 10',
      conditionJson: {
        event: 'STAT.accuracy',
        subject: 'playerA',
        comparator: '>=',
        value: 85,
        window: { type: 'CLOCK', end: '10:00' }
      },
      minEntryMinor: 200n, // $2.00 FC
      maxEntryMinor: 200000n, // $2000 FC
      feeBps: 500,
      cutoffPolicy: 'CLOCK<=5:00',
      enabled: true,
    },
  ];

  for (const template of propTemplates) {
    await prisma.propTemplate.upsert({
      where: {
        game_label: {
          game: template.game,
          label: template.label,
        },
      },
      update: {},
      create: template,
    });
  }

  console.log('✅ Created prop templates');

  console.log('🎉 Database seeded successfully!');
  console.log(`
📊 Summary:
- HOUSE accounts: 4 (FC/USDC Operations & Clearing)
- Test user: ${testUser.email} (${testUser.username})
- User accounts: 2 (1000 FC, 1000 USDC)
- Prop templates: ${propTemplates.length}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
