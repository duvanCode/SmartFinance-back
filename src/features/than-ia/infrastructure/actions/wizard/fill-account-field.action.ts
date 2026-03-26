import { Injectable } from '@nestjs/common';
import {
  AgentAction,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

@AgentAction({
  type: 'FILL_ACCOUNT_FIELD',
  pages: ['wizard/accounts'],
  description:
    'Rellena un campo del formulario de cuentas en el wizard de configuración inicial. Úsala cuando el usuario dicte o escriba el nombre, tipo, saldo, banco u otro dato de su cuenta.',
  schema: {
    field: 'name | type | balance | bankName | creditLimit | currency',
    value: 'string | number',
    label: 'string (optional, human-readable label for confirmation)',
  },
})
@Injectable()
export class FillAccountFieldAction implements AgentActionHandler {
  async handle(
    payload: Record<string, unknown>,
    _userId: string,
  ): Promise<{ success: boolean; message?: string; jsCode?: string }> {
    const field = String(payload['field'] ?? '');
    const value = payload['value'];
    const label = String(payload['label'] ?? field);

    if (!field || value === undefined) {
      return { success: false, message: 'Campo o valor faltante en el payload.' };
    }

    // Build the JS code that the client will execute to fill the form field
    const jsCode = `
(function() {
  var fieldId = 'wizard-account-${field}';
  var el = document.getElementById(fieldId);
  if (!el) el = document.querySelector('[data-wizard-field="${field}"]');
  if (el) {
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      || Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) nativeInputValueSetter.call(el, ${JSON.stringify(String(value))});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.focus();
  }
})();
`.trim();

    return {
      success: true,
      message: `Campo "${label}" actualizado con: ${value}`,
      jsCode,
    };
  }
}
