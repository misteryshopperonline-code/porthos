-- Deduplicate Debt rows before @@unique([debtorId, contractId]).
-- Keep one survivor per pair (newest createdAt, then max id).
-- Re-point Communications from doomed debts to the survivor so FK stays valid.

WITH ranked AS (
  SELECT
    id,
    "debtorId",
    "contractId",
    ROW_NUMBER() OVER (
      PARTITION BY "debtorId", "contractId"
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "Debt"
),
survivor AS (
  SELECT id, "debtorId", "contractId"
  FROM ranked
  WHERE rn = 1
),
doomed AS (
  SELECT id, "debtorId", "contractId"
  FROM ranked
  WHERE rn > 1
)
UPDATE "Communication" c
SET "debtId" = s.id
FROM doomed d
JOIN survivor s
  ON s."debtorId" = d."debtorId"
 AND s."contractId" = d."contractId"
WHERE c."debtId" = d.id;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "debtorId", "contractId"
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "Debt"
)
DELETE FROM "Debt"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX "Debt_debtorId_contractId_key" ON "Debt"("debtorId", "contractId");
