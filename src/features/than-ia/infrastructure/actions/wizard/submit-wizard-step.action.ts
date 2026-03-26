import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

@AgentAction({
  type: 'SUBMIT_WIZARD_STEP',
  pages: ['wizard/accounts'],
  description:
    'Envía el formulario del paso actual del wizard de configuración. Úsala cuando el usuario haya confirmado todos los datos y quiera avanzar al siguiente paso.',
  schema: {},
})
@Injectable()
export class SubmitWizardStepAction implements AgentActionHandler {
  async handle(
    _payload: Record<string, unknown>,
    _userId: string,
  ): Promise<{ success: boolean; message?: string; jsCode?: string }> {
    const jsCode = `
(function() {
  var btn = document.querySelector('[data-wizard-submit]')
    || document.querySelector('button[type="submit"]');
  if (btn) btn.click();
})();
`.trim();

    return {
      success: true,
      message: 'Enviando el formulario del wizard.',
      jsCode,
    };
  }
}
