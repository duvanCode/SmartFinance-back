import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

@Injectable()
@AgentAction({
  type: 'delete_account',
  pages: ['wizard/accounts', 'wizard_step2', '*'],
  description: 'Elimina una cuenta que ya está registrada en el formulario',
  schema: {
    cuenta_index: 'number',
  },
})
export class DeleteAccountAction implements AgentActionHandler {
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
      jsCode: `window.delete_account(${index})`,
    };
  }
}
