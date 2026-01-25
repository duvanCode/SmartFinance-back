export interface ISpeechToText {
    transcribe(buffer: Buffer): Promise<string>;
}

export const SPEECH_TO_TEXT = Symbol('SPEECH_TO_TEXT');
