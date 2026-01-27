import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
    IAICategorizer,
    AICategorizationResult,
} from '../../domain/interfaces/ai-categorizer.interface';
import { Category } from '../../../categories/domain/entities/category.entity';

@Injectable()
export class GroqCategorizerAdapter implements IAICategorizer {
    private readonly client: OpenAI;
    private readonly logger = new Logger(GroqCategorizerAdapter.name);
    private readonly model: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GROQ_API_KEY');
        this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.1-8b-instant';

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            this.logger.warn(
                'GROQ_API_KEY is not configured or still has the placeholder value. ' +
                'AI features like text extraction and smart categorization will be unavailable.'
            );
        }

        this.client = new OpenAI({
            apiKey: apiKey || 'dummy-key',
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }

    private checkAvailability() {
        const apiKey = this.configService.get<string>('GROQ_API_KEY');
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            throw new Error(
                'Groq AI is not configured. Please add a valid GROQ_API_KEY to your .env file.'
            );
        }
    }

    async categorize(
        description: string,
        amount: number,
        availableCategories: Category[],
    ): Promise<AICategorizationResult> {
        try {
            this.checkAvailability();
            if (!availableCategories.length) {
                throw new Error('No categories available for classification');
            }

            const categoriesContext = availableCategories.map((c) => ({
                id: c.id,
                name: c.name.getValue(),
            }));

            const systemPrompt = `You are a financial transaction classifier.
Your task is to analyze a transaction description and amount, and map it to the most relevant category from the provided list.

Rules:
1. You MUST return ONLY a valid JSON object. No markdown, no explanations outside JSON.
2. The JSON structure must be:
   {
     "categoryId": "UUID from the provided list",
     "confidence": number between 0.0 and 1.0,
     "reasoning": "Short explanation why this category matches"
   }
3. If the transaction is ambiguous or doesn't fit well, use a lower confidence score.
4. If amount is negative, it might be a refund or income (context dependent).`;

            const userMessage = `Transaction: "${description}"
Amount: ${amount}

Available Categories:
${JSON.stringify(categoriesContext, null, 2)}`;

            const completion = await this.client.chat.completions.create({
                model: this.model,
                max_tokens: 300,
                temperature: 0,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
            });

            const responseText = completion.choices[0]?.message?.content || '';

            const cleanJson = this.extractJson(responseText);
            const result = JSON.parse(cleanJson);

            if (!result.categoryId || typeof result.confidence !== 'number') {
                throw new Error('Invalid AI response structure');
            }

            return {
                categoryId: result.categoryId,
                confidence: result.confidence,
                reasoning: result.reasoning || 'AI suggestion',
            };
        } catch (error) {
            this.logger.error(`AI Categorization failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async extractTransactions(
        text: string,
        availableCategories: Category[],
    ): Promise<AICategorizationResult[]> {
        try {
            this.checkAvailability();
            if (!availableCategories.length) {
                throw new Error('No categories available for extraction');
            }

            const categoriesContext = availableCategories.map((c) => ({
                id: c.id,
                name: c.name.getValue(),
                type: c.type,
            }));

            const systemPrompt = `You are a financial transaction parser for a Colombian user.
Your task is to analyze a natural language text or transcription and extract multiple transactions.
You must map each extracted transaction to the most relevant category from the provided list.

CRITICAL NUMBER FORMAT RULES for Colombian context:
- In Colombia, periods (.) are used as THOUSANDS separators and commas (,) for decimals
- Examples:
  * "50.000" or "50000" = FIFTY THOUSAND (50000)
  * "50,000" = FIFTY with decimals (50.00)
  * "1.500.000" = ONE MILLION FIVE HUNDRED THOUSAND (1500000)
  * "pollo 50.000" or "pollo, 50.000" = chicken for 50 thousand pesos
- ALWAYS interpret numbers with periods as thousands separators in the Colombian context
- When you see "X.XXX" format, treat it as thousands (e.g., 50.000 = 50000)

Rules:
1. You MUST return ONLY a valid JSON ARRAY. No markdown, no explanations outside JSON.
2. Each item in the array must be:
   {
     "description": "Extracted description (e.g., 'Pollo')",
     "amount": number (positive value, correctly parsed: 50.000 → 50000),
     "type": "INCOME" or "EXPENSE" (based on context: salary/payment received = INCOME, spending/purchase = EXPENSE),
     "categoryId": "UUID from the provided list",
     "date": "YYYY-MM-DD format if mentioned, or null",
     "confidence": number between 0.0 and 1.0,
     "reasoning": "Short explanation"
   }
3. Determine type based on context: words like "pagaron", "salario", "ingreso", "recibí" indicate INCOME. Words like "gasté", "compré", "pagué" indicate EXPENSE.
4. Parse dates: "ayer" = yesterday, "hoy" = today, "20 de enero" = "2026-01-20", etc.
5. Ignore conversational filler (e.g., "Hi", "Please record").
6. If no transactions found, return empty array [].`;

            const userMessage = `Text to parse: "${text}"

Available Categories:
${JSON.stringify(categoriesContext, null, 2)}`;

            const completion = await this.client.chat.completions.create({
                model: this.model,
                max_tokens: 1000,
                temperature: 0,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
            });

            const responseText = completion.choices[0]?.message?.content || '';

            const cleanJson = this.extractJson(responseText);
            const results = JSON.parse(cleanJson);

            if (!Array.isArray(results)) {
                throw new Error('AI response is not a JSON array');
            }

            return results.map(result => ({
                categoryId: result.categoryId,
                confidence: result.confidence,
                reasoning: result.reasoning,
                description: result.description,
                amount: result.amount,
                type: result.type || 'EXPENSE',
                date: result.date || null,
            }));

        } catch (error) {
            this.logger.error(`AI Extraction failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    private extractJson(text: string): string {
        const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
        return match ? match[0] : text;
    }
}
