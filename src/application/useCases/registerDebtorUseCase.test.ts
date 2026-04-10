import { describe, it, expect, vi } from 'vitest';
import { RegisterDebtorUseCase } from './registerDebtorUseCase';
import { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';

describe('RegisterDebtorUseCase', () => {
  it('debe fallar si faltan datos de la deuda (contrato o monto)', async () => {
    const mockRepo = {} as DebtorRepositoryPort;
    const useCase = new RegisterDebtorUseCase(mockRepo);
    
    const result = await useCase.execute({
      identification: '123456789',
      firstName: 'Juan',
      lastName: 'Perez',
      contractId: '',
      amount: 0,
      dueDate: new Date()
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Información de deuda o contrato faltante.');
  });

  it('debe delegar exitosamente al repositorio para crear o actualizar el deudor junto a su deuda', async () => {
    const mockDebtor = {
      id: 'deudor-falso-1',
      identification: '123456789',
      firstName: 'Juan',
      lastName: 'Perez',
      email: null,
      phone: null,
      score: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mockRepo = {
      upsertWithDebt: vi.fn().mockResolvedValue(mockDebtor)
    } as unknown as DebtorRepositoryPort;
    
    const useCase = new RegisterDebtorUseCase(mockRepo);
    
    const testDate = new Date('2026-12-31');
    const result = await useCase.execute({
      identification: '123456789',
      firstName: 'Juan',
      lastName: 'Perez',
      contractId: 'contrato-x',
      amount: 1540.50,
      dueDate: testDate
    });
    
    expect(result.success).toBe(true);
    expect(result.debtor?.id).toBe('deudor-falso-1');
    expect(mockRepo.upsertWithDebt).toHaveBeenCalledTimes(1);
    expect(mockRepo.upsertWithDebt).toHaveBeenCalledWith(
      expect.objectContaining({ identification: '123456789', firstName: 'Juan' }),
      expect.objectContaining({ contractId: 'contrato-x', amount: 1540.50, dueDate: testDate })
    );
  });
});
