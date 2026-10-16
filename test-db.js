require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testUrl(url, label) {
  console.log(`\nTesting ${label}...`);
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    const customers = await prisma.customer.findMany({ take: 2 });
    console.log(`[${label}] SUCCESS! Found ${customers.length} customers.`);
    return true;
  } catch (err) {
    console.log(`[${label}] FAILED: ${err.message}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const normalUrl = process.env.DATABASE_URL;
  const poolerUrl = normalUrl.replace('ep-young-credit-axndnmve', 'ep-young-credit-axndnmve-pooler');
  
  await testUrl(poolerUrl, 'Pooler Endpoint');
  await testUrl(normalUrl, 'Direct Endpoint');
}

main();
