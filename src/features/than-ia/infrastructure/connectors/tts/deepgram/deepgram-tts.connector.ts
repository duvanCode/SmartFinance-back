import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import {
  ITTSRepository,
  VoiceConfig,
} from '../../../../domain/repositories/tts.repository.interface';

@Injectable()
export class DeepgramTTSConnector implements ITTSRepository {
  private readonly logger = new Logger(DeepgramTTSConnector.name);
  private readonly apiKey: string;
  private readonly defaultVoice: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('DEEPGRAM_API_KEY', '');
    this.defaultVoice = this.config.get<string>(
      'DEEPGRAM_VOICE',
      'aura-asteria-en',
    );
  }

  async *synthesize(text: string, voice: VoiceConfig): AsyncIterable<Buffer> {
    if (!text.trim()) return;

    const voiceModel = voice.voice ?? this.defaultVoice;
    this.logger.log(`Synthesizing via Deepgram stream [model=${voiceModel}]`);

    const url = new URL(`https://api.deepgram.com/v1/speak`);
    url.searchParams.set('model', voiceModel);
    url.searchParams.set('encoding', 'linear16');
    url.searchParams.set('sample_rate', '24000');

    const body = JSON.stringify({ text });
    const options: https.RequestOptions = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    // Yield chunks in real-time as they arrive from the HTTP response stream
    yield* this.streamFromHttp(options, body);
  }

  private async *streamFromHttp(
    options: https.RequestOptions,
    body: string,
  ): AsyncIterable<Buffer> {
    // Bridge Node.js event-based HTTP stream into an async generator
    const queue: Array<Buffer | Error | null> = [];
    let notify: (() => void) | null = null;
    let done = false;

    const push = (item: Buffer | Error | null) => {
      queue.push(item);
      if (notify) { notify(); notify = null; }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        push(new Error(`Deepgram TTS status ${res.statusCode}`));
        done = true;
        return;
      }
      res.on('data', (chunk: Buffer) => push(chunk));
      res.on('end', () => { done = true; push(null); });
      res.on('error', (err) => { done = true; push(err); });
    });

    req.on('error', (err) => { done = true; push(err); });
    req.write(body);
    req.end();

    // Drain the queue, waiting for new items when empty
    while (true) {
      if (queue.length === 0) {
        if (done) break;
        await new Promise<void>((resolve) => { notify = resolve; });
        continue;
      }
      const item = queue.shift()!;
      if (item === null) break;           // stream ended normally
      if (item instanceof Error) throw item;
      yield item;
    }
  }
}
