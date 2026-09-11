-- AlterEnum
CREATE TYPE "DebtStatus" AS ENUM ('PENDING', 'PAID', 'DEFAULTED');
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS');
CREATE TYPE "CommunicationStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- Debt.amount: Float -> Decimal(14,2)
ALTER TABLE "Debt" ALTER COLUMN "amount" TYPE DECIMAL(14,2) USING ROUND("amount"::numeric, 2);

-- Debt.status: String -> DebtStatus
ALTER TABLE "Debt"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "DebtStatus" USING (
    CASE
      WHEN "status" IN ('PENDING', 'PAID', 'DEFAULTED') THEN "status"::"DebtStatus"
      ELSE 'PENDING'::"DebtStatus"
    END
  ),
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"DebtStatus";

-- Communication.type / status -> enums
ALTER TABLE "Communication"
  ALTER COLUMN "type" TYPE "CommunicationType" USING (
    CASE
      WHEN "type" IN ('EMAIL', 'WHATSAPP', 'SMS') THEN "type"::"CommunicationType"
      ELSE 'EMAIL'::"CommunicationType"
    END
  );

ALTER TABLE "Communication"
  ALTER COLUMN "status" TYPE "CommunicationStatus" USING (
    CASE
      WHEN "status" IN ('SENT', 'DELIVERED', 'READ', 'FAILED') THEN "status"::"CommunicationStatus"
      ELSE 'SENT'::"CommunicationStatus"
    END
  );

CREATE INDEX IF NOT EXISTS "Debt_contractId_status_idx" ON "Debt"("contractId", "status");
CREATE INDEX IF NOT EXISTS "Debt_debtorId_idx" ON "Debt"("debtorId");
CREATE INDEX IF NOT EXISTS "Communication_debtId_sentAt_idx" ON "Communication"("debtId", "sentAt");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
