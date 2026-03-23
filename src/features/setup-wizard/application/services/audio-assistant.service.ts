import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AudioAssistantService {
  private readonly logger = new Logger(AudioAssistantService.name);
  private groq: Groq;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not defined in the environment variables. Audio assistant might fail.');
    }
    
    this.groq = new Groq({
      apiKey: apiKey || 'dummy-key-to-prevent-crash', // Provide a fallback if missing, though it will fail on API call
    });
  }

  async getAssistantText(userId: string, userName: string, step: number): Promise<string> {
    const cacheKey = `wizard_assistant_text_${userId}_step_${step}`;
    
    // Check cache first
    try {
      const cachedText = await this.cacheManager.get<string>(cacheKey);
      if (cachedText) {
        this.logger.log(`Serving assistant text from cache for user ${userId}, step ${step}`);
        return cachedText;
      }
    } catch (err) {
      this.logger.error('Error reading from cache', err);
    }

    this.logger.log(`Generating new assistant text via Groq for user ${userId}, step ${step}`);
    
    let prompt = '';
    if (step === 1) {
      prompt = `Eres un asistente de finanzas personales. Saluda muy breve y naturalmente al usuario "${userName}". Dile que el primer paso para mejorar sus finanzas es conocerlas. (Máximo 2 oraciones, responde en español de América Latina, sin comillas, sin emojis ni asteriscos).`;
    } else if (step === 2) {
      prompt = `Eres un asistente de finanzas personales. Ayuda muy brevemente al usuario a configurar sus cuentas y registrar sus bancos o efectivo actual. (Máximo 2 oraciones, responde en español de América Latina, sin comillas, sin emojis ni asteriscos).`;
    } else {
      prompt = `Eres un asistente financiero. Da un breve mensaje de motivación. (Máximo 2 oraciones, responde en español de América Latina, sin comillas, sin emojis ni asteriscos).`;
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de voz conciso y natural. Nunca uses markdown, marcas de formato, ni signos innecesarios. Habla como una persona real conversando en voz alta.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama3-8b-8192',
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new Error('Groq returned empty response');
      }

      // Cache the generated text for 24 hours (cache-manager default requires time in milliseconds for v5)
      try {
        await this.cacheManager.set(cacheKey, text, 24 * 60 * 60 * 1000);
      } catch (err) {
        this.logger.error('Error writing to cache', err);
      }

      return text;
    } catch (error) {
      this.logger.error('Error calling Groq API', error);
      // Fallback text if the API fails
      if (step === 1) {
        return `Hola ${userName}. El primer paso para mejorar tus finanzas es conocerlas. Bienvenido a SmartFinance.`;
      }
      return 'Por favor, registra los datos de tus cuentas actuales en este formulario.';
    }
  }
}
