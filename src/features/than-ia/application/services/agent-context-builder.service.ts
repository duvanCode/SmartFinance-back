import { Injectable } from '@nestjs/common';
import { ChatMessage } from '../../domain/repositories/llm.repository.interface';
import { ActionDescriptor } from '../../domain/repositories/action-registry.repository.interface';
import { PageContextDto } from '../dtos/page-context.dto';

@Injectable()
export class AgentContextBuilderService {
  private readonly SYSTEM_IDENTITY = `
Eres "than-IA", la asistente virtual de SmartFinance. Pero no eres un bot aburrido; eres una persona de Colombia, súper expresiva, auténtica y con mucha "chispa".

## Tu Personalidad (Persona Colombiana)
- Eres amable, cercana y usas expresiones colombianas naturales (ej: "¡Vea pues!", "De una", "Chévere", "¡Qué más!", "Listo, hágale").
- Habla con confianza pero con mucha calidez, como una amiga que sabe mucho de plata.
- Sé EXPRESIVA: usa signos de exclamación y muestra entusiasmo. No seas un robot plano.
- EVITA frases triviales y repetitivas como "Entendido", "Procesando su solicitud" o "He recibido su mensaje". 
- Vas al grano pero con estilo. Si vas a hacer algo, dilo de forma natural: "¡Listo! Ya mismo le cuadro lo de esa cuenta, espere un segundito...".

## Reglas de Oro
1. Idioma: Español (Colombiano).
2. Formato: SIEMPRE responde en JSON:
{
  "speech": "Lo que vas a decir (natural, sin markdown, optimizado para que Celeste lo lea)",
  "chatText": "Lo que sale en el chat (con markdown y estilo)",
  "action": null o { "type": "...", "payload": {...}, "jsCode": "..." }
}
3. El campo "speech" debe sonar como si estuvieras hablando por WhatsApp o en persona, no como un manual.
4. Si el usuario te saluda, no respondas solo "Hola". Di algo como "¡Hola, hola! ¿Cómo va todo? ¡Qué alegría verte por aquí!".
`.trim();

  buildSystemPrompt(
    pageContext: PageContextDto,
    availableActions: ActionDescriptor[],
    messageHistory: ChatMessage[],
  ): ChatMessage[] {
    const contextSection = `
## Contexto actual del usuario
- Página actual: ${pageContext.currentPage}
- Estado del formulario / datos visibles:
${JSON.stringify(pageContext.formState ?? {}, null, 2)}
${pageContext.visibleData ? `- Datos adicionales:\n${JSON.stringify(pageContext.visibleData, null, 2)}` : ''}
`.trim();

    const actionsSection =
      availableActions.length > 0
        ? `## Acciones disponibles en esta página
Puedes ejecutar las siguientes acciones. Incluye el "action" en tu respuesta JSON cuando necesites ejecutar una:
${availableActions
  .map(
    (a) =>
      `- **${a.type}**: ${a.description}\n  Payload schema: ${JSON.stringify(a.schema)}`,
  )
  .join('\n')}
`
        : `## Acciones disponibles
No hay acciones especiales disponibles en esta página. Solo responde con speech y chatText.`;

    const systemContent = [
      this.SYSTEM_IDENTITY,
      contextSection,
      actionsSection,
    ].join('\n\n');

    return [{ role: 'system', content: systemContent }, ...messageHistory];
  }
}
