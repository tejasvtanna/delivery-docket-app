const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.driver.create({
    data: { name: 'John Doe', license: 'ABC123' }
  })
  await prisma.docket.create({
    data: { orderId: 'ORD001', status: 'Pending', driverId: 1 }
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
