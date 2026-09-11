import { PrismaClient } from '@prisma/client'
import { BcryptPasswordService } from '../src/infrastructure/adapters/bcryptPasswordService'

const prisma = new PrismaClient()
const crypto = new BcryptPasswordService()

async function main() {
  console.log('Seeding database...')

  // 1. Create a dummy admin user
  const passwordHash = await crypto.hash('porthos123');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@porthos.com' },
    update: {
      passwordHash,
      role: 'GLOBAL_ADMIN'
    },
    create: {
      email: 'admin@porthos.com',
      passwordHash,
      name: 'Porthos Admin',
      role: 'GLOBAL_ADMIN',
    },
  })
  console.log('Admin user created:', adminUser.email)

  // 2. Create sample Debtors
  const debtor1 = await prisma.debtor.upsert({
    where: { identification: '1234567890' },
    update: {},
    create: {
      identification: '1234567890',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+1234567890',
      score: 85,
    },
  })

  const debtor2 = await prisma.debtor.upsert({
    where: { identification: '0987654321' },
    update: {},
    create: {
      identification: '0987654321',
      firstName: 'María',
      lastName: 'Gómez',
      email: 'maria.gomez@example.com',
      phone: '+0987654321',
      score: 45,
    },
  })
  
  const debtor3 = await prisma.debtor.upsert({
    where: { identification: '1122334455' },
    update: {},
    create: {
      identification: '1122334455',
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@example.com',
      phone: '+1122334455',
      score: 60,
    },
  })
  console.log('Debtors created')

  // 3. Create sample Contracts
  const contract1 = await prisma.contract.upsert({
    where: { contractCode: 'CONT-2023-001' },
    update: {},
    create: {
      contractCode: 'CONT-2023-001',
      documentUrl: 'https://example.com/contracts/cont-2023-001.pdf',
      conditions: { interestRate: 5, lateFee: 50 },
    },
  })

  const contract2 = await prisma.contract.upsert({
    where: { contractCode: 'CONT-2024-042' },
    update: {},
    create: {
      contractCode: 'CONT-2024-042',
      documentUrl: 'https://example.com/contracts/cont-2024-042.pdf',
      conditions: { interestRate: 3.5, lateFee: 30 },
    },
  })
  console.log('Contracts created')

  const existingDebt1 = await prisma.debt.findFirst({
    where: { debtorId: debtor1.id, contractId: contract1.id },
  })
  const debt1 = existingDebt1 ?? await prisma.debt.create({
    data: {
      debtorId: debtor1.id,
      contractId: contract1.id,
      amount: 1500.00,
      dueDate: new Date('2024-01-15T00:00:00Z'),
      status: 'PENDING',
    },
  })

  const existingDebt2 = await prisma.debt.findFirst({
    where: { debtorId: debtor2.id, contractId: contract2.id },
  })
  const debt2 = existingDebt2 ?? await prisma.debt.create({
    data: {
      debtorId: debtor2.id,
      contractId: contract2.id,
      amount: 450.50,
      dueDate: new Date('2023-11-01T00:00:00Z'),
      status: 'DEFAULTED',
    },
  })

  const existingDebt3 = await prisma.debt.findFirst({
    where: { debtorId: debtor3.id, contractId: contract1.id },
  })
  if (!existingDebt3) {
    await prisma.debt.create({
      data: {
        debtorId: debtor3.id,
        contractId: contract1.id,
        amount: 3200.00,
        dueDate: new Date('2024-05-20T00:00:00Z'),
        status: 'PENDING',
      },
    })
  }
  console.log('Debts created')

  const existingEmail = await prisma.communication.findFirst({
    where: { debtId: debt2.id, type: 'EMAIL' },
  })
  if (!existingEmail) {
    await prisma.communication.create({
      data: {
        debtId: debt2.id,
        type: 'EMAIL',
        status: 'SENT',
        content: 'Estimado/a María Gómez, le recordamos que tiene una deuda pendiente de $450.50.',
      },
    })
  }

  const existingWhatsapp = await prisma.communication.findFirst({
    where: { debtId: debt1.id, type: 'WHATSAPP' },
  })
  if (!existingWhatsapp) {
    await prisma.communication.create({
      data: {
        debtId: debt1.id,
        type: 'WHATSAPP',
        status: 'DELIVERED',
        content: 'Hola Juan, por favor revise el estado de su deuda.',
      },
    })
  }
  console.log('Communications created')

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
