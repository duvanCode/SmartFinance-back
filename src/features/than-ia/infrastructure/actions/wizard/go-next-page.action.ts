import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

@Injectable()
@AgentAction({
  type: 'go_next_page',
  pages: ['wizard/welcome', 'wizard/accounts', '*'],
  description: 'Avanza al siguiente paso del wizard (formulario de cuentas)',
  schema: {},
})
export class GoNextPageAction implements AgentActionHandler {
  async handle() {
    return {
      success: true,
      jsCode: `window.go_next_page()`,
    };
  }
}
