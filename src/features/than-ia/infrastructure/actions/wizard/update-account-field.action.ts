import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

@Injectable()
@AgentAction({
  type: 'update_account_field',
  pages: ['wizard/accounts', 'wizard_step2', '*'],
  description: 'Modifica el valor de un campo en una cuenta del formulario ya existente',
  schema: {
    cuenta_index: 'number',
    campo: 'string (nombre, tipo, saldo_inicial, banco, cupo)',
    valor: 'string | number',
  },
})
export class UpdateAccountFieldAction implements AgentActionHandler {
  async handle(payload: Record<string, any>) {
    let index = payload.cuenta_index ?? payload.index ?? payload.cuenta ?? 0;
    if (typeof index === 'string' && !isNaN(parseInt(index, 10))) {
      index = parseInt(index, 10);
    }
    if (typeof index !== 'number' || isNaN(index)) {
      index = 0;
    }

    return {
      success: true,
      jsCode: `window.update_account_field(${index}, ${JSON.stringify(payload.campo || 'nombre')}, ${JSON.stringify(payload.valor || '')})`,
    };
  }
}
