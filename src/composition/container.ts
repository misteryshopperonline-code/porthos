import prisma from '@/lib/prisma';
import { BcryptPasswordService } from '@/infrastructure/adapters/bcryptPasswordService';
import { PapaCsvFileReader } from '@/infrastructure/adapters/papaCsvFileReader';
import { createMessagingAdapter } from '@/infrastructure/adapters/createMessagingAdapter';
import { createAiPdfParser } from '@/infrastructure/adapters/createAiPdfParser';
import { createFileStorage } from '@/infrastructure/adapters/createFileStorage';
import { PrismaUserRepository } from '@/infrastructure/repositories/prismaUserRepository';
import { PrismaDebtorRepository } from '@/infrastructure/repositories/prismaDebtorRepository';
import { PrismaContractRepository } from '@/infrastructure/repositories/prismaContractRepository';
import { PrismaDashboardRepository } from '@/infrastructure/repositories/prismaDashboardRepository';
import { PrismaDebtRepository } from '@/infrastructure/repositories/prismaDebtRepository';
import { PrismaAuditLogRepository } from '@/infrastructure/repositories/prismaAuditLogRepository';
import { PrismaInviteTokenRepository } from '@/infrastructure/repositories/prismaInviteTokenRepository';
import { PrismaCommunicationRepository } from '@/infrastructure/repositories/prismaCommunicationRepository';
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
import { UpdateDebtStatusForActorUseCase } from '@/application/useCases/updateDebtStatusForActorUseCase';
import { SetPasswordWithInviteUseCase } from '@/application/useCases/setPasswordWithInviteUseCase';
import { ListCommunicationsForActorUseCase } from '@/application/useCases/listCommunicationsForActorUseCase';
import { SendDebtReminderForActorUseCase } from '@/application/useCases/sendDebtReminderForActorUseCase';
import { AnalyzeContractPdfForActorUseCase } from '@/application/useCases/analyzeContractPdfForActorUseCase';
import { ListContractDocumentsForActorUseCase } from '@/application/useCases/listContractDocumentsForActorUseCase';

const hasher = new BcryptPasswordService();
const fileReader = new PapaCsvFileReader();
export const messagingAdapter = createMessagingAdapter();
export const aiPdfParser = createAiPdfParser();
export const fileStorage = createFileStorage();

function appBaseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, '') || 'http://localhost:3000';
}

export const userRepository = new PrismaUserRepository(prisma);
export const debtorRepository = new PrismaDebtorRepository(prisma);
export const contractRepository = new PrismaContractRepository(prisma);
export const dashboardRepository = new PrismaDashboardRepository(prisma);
export const debtRepository = new PrismaDebtRepository(prisma);
export const auditLogRepository = new PrismaAuditLogRepository(prisma);
export const inviteTokenRepository = new PrismaInviteTokenRepository(prisma);
export const communicationRepository = new PrismaCommunicationRepository(prisma);

export const loginUserUseCase = new LoginUserUseCase(userRepository, hasher);
export const registerPlatformUserUseCase = new RegisterPlatformUserUseCase(
  userRepository,
  hasher,
  inviteTokenRepository,
  messagingAdapter,
  appBaseUrl,
);
export const registerUserForActorUseCase = new RegisterUserForActorUseCase(
  registerPlatformUserUseCase,
  auditLogRepository,
);
export const registerDebtorUseCase = new RegisterDebtorUseCase(debtorRepository);
export const registerDebtorForActorUseCase = new RegisterDebtorForActorUseCase(
  registerDebtorUseCase,
  auditLogRepository,
);
export const bulkUploadUseCase = new BulkUploadUseCase(fileReader, debtorRepository);
export const bulkUploadForActorUseCase = new BulkUploadForActorUseCase(
  bulkUploadUseCase,
  auditLogRepository,
);
export const getDashboardUseCase = new GetDashboardUseCase(
  contractRepository,
  dashboardRepository,
);
export const listAdminUsersUseCase = new ListAdminUsersUseCase(
  userRepository,
  contractRepository,
);
export const listVisibleContractsUseCase = new ListVisibleContractsUseCase(contractRepository);
export const updateDebtStatusForActorUseCase = new UpdateDebtStatusForActorUseCase(
  debtRepository,
  auditLogRepository,
);
export const setPasswordWithInviteUseCase = new SetPasswordWithInviteUseCase(
  inviteTokenRepository,
  userRepository,
  hasher,
  auditLogRepository,
);
export const listCommunicationsForActorUseCase = new ListCommunicationsForActorUseCase(
  communicationRepository,
);
export const sendDebtReminderForActorUseCase = new SendDebtReminderForActorUseCase(
  debtRepository,
  communicationRepository,
  messagingAdapter,
  auditLogRepository,
);
export const listContractDocumentsForActorUseCase = new ListContractDocumentsForActorUseCase(
  contractRepository,
);
export const analyzeContractPdfForActorUseCase = new AnalyzeContractPdfForActorUseCase(
  contractRepository,
  fileStorage,
  aiPdfParser,
  auditLogRepository,
);
