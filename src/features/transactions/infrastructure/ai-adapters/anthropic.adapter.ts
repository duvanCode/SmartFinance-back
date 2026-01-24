import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import {
    IAICategorizer,
    AICategorizationResult,
} from '../../domain/interfaces/ai-categorizer.interface';
import { Category } from '../../../categories/domain/entities/category.entity';

@Injectable()
export class AnthropicCategorizerAdapter implements IAICategorizer {
    private readonly client: Anthropic;
    private readonly logger = new Logger(AnthropicCategorizerAdapter.name);

    constructor(private readonly configService: ConfigService) {
        this.client = new Anthropic({
            apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
        });
    }

    async categorize(
        description: string,
        amount: number,
        availableCategories: Category[],
    ): Promise<AICategorizationResult> {
        try {
            if (!availableCategories.length) {
                throw new Error('No categories available for classification');
            }

            // 1. Build context with available categories
            const categoriesContext = availableCategories.map((c) => ({
                id: c.id,
                name: c.name.getValue(),
            }));

            // 2. prompt engineering (system prompt optimized for JSON)
            const systemPrompt = `
        You are a financial transaction classifier.
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
        4. If amount is negative, it might be a refund or income (context dependent).
      `;

            const userMessage = `
        Transaction: "${description}"
        Amount: ${amount}
        
        Available Categories:
        ${JSON.stringify(categoriesContext, null, 2)}
      `;

            // 3. Call Claude API
            const message = await this.client.messages.create({
                model: 'claude-3-haiku-20240307', // Fast & cheap model for this task
                max_tokens: 300,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
                temperature: 0, // Deterministic output
            });

            // Handle content blocks correctly
            const contentBlock = message.content[0];
            let responseText = '';

            if (contentBlock.type === 'text') {
                responseText = contentBlock.text;
            } else {
                // Fallback or error if unexpected content type
                throw new Error('Unexpected content type from Claude API');
            }

            // 4. Parse JSON safely
            const cleanJson = this.extractJson(responseText);
            const result = JSON.parse(cleanJson);

            // 5. Validate result structure
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
            // Fallback: return null or throw depending on strategy. 
            // For now we rethrow to let UseCase handle it or return a "Unknown" result.
            throw error;
        }
    }

    private extractJson(text: string): string {
        // Helper to extract JSON if model adds markdown blocks ```json ... ```
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : text;
    }
}
