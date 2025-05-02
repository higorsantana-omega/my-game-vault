import { PrismaClient } from '@prisma/client'

import * as bcrypt from 'bcryptjs'

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

const prisma = new PrismaClient()

const adminUser = {
  email: 'admin@example.com',
  name: 'Admin User',
  password: 'Admin@123'
}

async function main() {
  console.log('Seeding database...')

  console.log('Creating admin user...')

  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {},
    create: {
      email: adminUser.email,
      name: adminUser.name,
      password: await hashPassword(adminUser.password)
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    return prisma.$disconnect()
  })
