import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

@Injectable()
@AgentAction({
  type: 'create_account',
  pages: ['wizard/accounts', 'wizard_step2', '*'],
  description: 'Crea una o más cuentas con los datos proporcionados',
  schema: {
    cuentas: [
      {
        nombre: 'string (ej: Cuenta nómina)',
        tipo: 'string (ej: corriente, ahorro, inversión)',
        saldo_inicial: 'number',
        banco: 'string (opcional)'
      }
    ]
  },
})
export class CreateAccountAction implements AgentActionHandler {
  async handle(payload: Record<string, any>) {
    return {
      success: true,
      jsCode: `window.create_account(${JSON.stringify(payload.cuentas || [])})`,
    };
  }
}
