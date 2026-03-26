import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';
import { CreateTransactionUseCase } from '@features/transactions/application/use-cases/create-transaction.use-case';
import { TransactionType } from '@features/transactions/domain/enums/transaction-type.enum';
import { InputSource } from '@features/transactions/domain/enums/input-source.enum';

@AgentAction({
  type: 'CREATE_TRANSACTION',
  pages: ['*'],
  description:
    'Crea una transacción (ingreso o gasto) para el usuario. Úsala cuando el usuario diga que gastó, pagó, recibió o quiera registrar un movimiento de dinero.',
  schema: {
    amount: 'number (monto positivo)',
    type: '"INCOME" | "EXPENSE"',
    description: 'string (descripción de la transacción)',
    categoryId: 'string (UUID de la categoría)',
    accountId: 'string (UUID de la cuenta)',
    date: 'string (fecha ISO 8601, ej: "2026-03-26")',
  },
})
@Injectable()
export class CreateTransactionAction implements AgentActionHandler {
  constructor(private readonly createTransaction: CreateTransactionUseCase) {}

  async handle(
    payload: Record<string, unknown>,
    userId: string,
  ): Promise<{ success: boolean; message?: string; jsCode?: string; data?: unknown }> {
    const result = await this.createTransaction.execute({
      userId,
      amount: Number(payload['amount']),
      type: String(payload['type']) as TransactionType,
      description: String(payload['description'] ?? ''),
      categoryId: String(payload['categoryId'] ?? ''),
      accountId: String(payload['accountId'] ?? ''),
      date: String(payload['date'] ?? new Date().toISOString().split('T')[0]),
      source: InputSource.AI_TEXT,
    });

    return {
      success: true,
      message: `Transacción creada: ${result.description} por $${result.amount}`,
      data: result,
    };
  }
}
