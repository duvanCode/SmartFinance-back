export enum InputSource {
  MANUAL = 'MANUAL',
  AI_TEXT = 'AI_TEXT',
  AI_AUDIO = 'AI_AUDIO',
}

export function getInputSourceFromString(value: string): InputSource {
  const normalized = value?.toUpperCase()?.trim();
  if (normalized === 'MANUAL') return InputSource.MANUAL;
  if (normalized === 'AI_TEXT') return InputSource.AI_TEXT;
  if (normalized === 'AI_AUDIO') return InputSource.AI_AUDIO;
  throw new Error(`Invalid input source: ${value}. Must be MANUAL, AI_TEXT, or AI_AUDIO`);
}
