import prisma from '@/lib/prisma';
import { BcryptPasswordService } from '@/infrastructure/adapters/bcryptPasswordService';
import { generateTemporaryPassword } from '@/infrastructure/adapters/passwordGenerator';
import { PapaCsvFileReader } from '@/infrastructure/adapters/papaCsvFileReader';
import { PrismaUserRepository } from '@/infrastructure/repositories/prismaUserRepository';
import { PrismaDebtorRepository } from '@/infrastructure/repositories/prismaDebtorRepository';
import { PrismaContractRepository } from '@/infrastructure/repositories/prismaContractRepository';
import { PrismaDashboardRepository } from '@/infrastructure/repositories/prismaDashboardRepository';
import { LoginUserUseCase } from '@/application/useCases/loginUserUseCase';
import { RegisterPlatformUserUseCase } from '@/application/useCases/registerPlatformUserUseCase';
import { RegisterUserForActorUseCase } from '@/application/useCases/registerUserForActorUseCase';
import { RegisterDebtorUseCase } from '@/application/useCases/registerDebtorUseCase';
import { RegisterDebtorForActorUseCase } from '@/application/useCases/registerDebtorForActorUseCase';
import { BulkUploadUseCase } from '@/application/useCases/bulkUploadUseCase';
import { BulkUploadForActorUseCase } from '@/application/useCases/bulkUploadForActorUseCase';
import { GetDashboardUseCase } from '@/application/useCases/getDashboardUseCase';
import { ListAdminUsersUseCase } from '@/application/useCases/listAdminUsersUseCase';
import { ListVisibleContractsUseCase } from '@/application/useCases/listVisibleContractsUseCase';

const hasher = new BcryptPasswordService();
const fileReader = new PapaCsvFileReader();

export const userRepository = new PrismaUserRepository(prisma);
export const debtorRepository = new PrismaDebtorRepository(prisma);
export const contractRepository = new PrismaContractRepository(prisma);
export const dashboardRepository = new PrismaDashboardRepository(prisma);

export const loginUserUseCase = new LoginUserUseCase(userRepository, hasher);
export const registerPlatformUserUseCase = new RegisterPlatformUserUseCase(
  userRepository,
  hasher,
  generateTemporaryPassword,
);
export const registerUserForActorUseCase = new RegisterUserForActorUseCase(
  registerPlatformUserUseCase,
);
export const registerDebtorUseCase = new RegisterDebtorUseCase(debtorRepository);
export const registerDebtorForActorUseCase = new RegisterDebtorForActorUseCase(
  registerDebtorUseCase,
);
export const bulkUploadUseCase = new BulkUploadUseCase(fileReader, debtorRepository);
export const bulkUploadForActorUseCase = new BulkUploadForActorUseCase(bulkUploadUseCase);
export const getDashboardUseCase = new GetDashboardUseCase(
  contractRepository,
  dashboardRepository,
);
export const listAdminUsersUseCase = new ListAdminUsersUseCase(
  userRepository,
  contractRepository,
);
export const listVisibleContractsUseCase = new ListVisibleContractsUseCase(contractRepository);
