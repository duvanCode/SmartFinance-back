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
    campo: 'string (nombre, tipo, saldo_inicial, banco)',
    valor: 'string | number',
  },
})
export class UpdateAccountFieldAction implements AgentActionHandler {
  async handle(payload: Record<string, any>) {
    return {
      success: true,
      jsCode: `window.update_account_field(${payload.cuenta_index}, ${JSON.stringify(payload.campo)}, ${JSON.stringify(payload.valor)})`,
    };
  }
}
