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

    async extractTransactions(
        text: string,
        availableCategories: Category[],
    ): Promise<AICategorizationResult[]> {
        try {
            if (!availableCategories.length) {
                throw new Error('No categories available for extraction');
            }

            const categoriesContext = availableCategories.map((c) => ({
                id: c.id,
                name: c.name.getValue(),
            }));

            const systemPrompt = `
                You are a financial transaction parser.
                Your task is to analyze a natural language text or transcription and extract multiple transactions.
                You must map each extracted transaction to the most relevant category from the provided list.

                Rules:
                1. You MUST return ONLY a valid JSON ARRAY. No markdown, no explanations outside JSON.
                2. Each item in the array must be:
                   {
                     "description": "Extracted description (e.g., 'Uber trip')",
                     "amount": number (positive for expense),
                     "categoryId": "UUID from the provided list",
                     "confidence": number between 0.0 and 1.0,
                     "reasoning": "Short explanation"
                   }
                3. If a transaction mentions "ayer" (yesterday) or specific dates, include them in description for now (handling date parsing is handled separately or you can suggest ISO date if requested, but for now stick to structure).
                4. Ignore conversational filler (e.g., "Hi", "Please record").
                5. If no transactions found, return empty array [].
            `;

            const userMessage = `
                Text to parse: "${text}"
                
                Available Categories:
                ${JSON.stringify(categoriesContext, null, 2)}
            `;

            const message = await this.client.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
                temperature: 0,
            });

            const contentBlock = message.content[0];
            let responseText = '';

            if (contentBlock.type === 'text') {
                responseText = contentBlock.text;
            } else {
                throw new Error('Unexpected content type from Claude API');
            }

            const cleanJson = this.extractJson(responseText);
            const results = JSON.parse(cleanJson);

            if (!Array.isArray(results)) {
                throw new Error('AI response is not a JSON array');
            }

            return results.map(result => ({
                categoryId: result.categoryId,
                confidence: result.confidence,
                reasoning: result.reasoning,
                // Passing extra fields via casting or need to update interface? 
                // Interface only has AICategorizationResult. 
                // We might need to extend the return type or DTO later.
                // For now, let's assume the Caller handles description/amount mapping if we return them, 
                // but the Interface AICategorizationResult ONLY expects category data.
                // WAIT: The requirement says "extract JSON with array of transactions".
                // The interface I updated returns AICategorizationResult[], which lacks amount/description.
                // I need to update the interface to include amount/description or create a new Type.
                // For this step I will cast it to any or extend the return object.
                ...result
            }));

        } catch (error) {
            this.logger.error(`AI Extraction failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    private extractJson(text: string): string {
        // Helper to extract JSON if model adds markdown blocks ```json ... ```
        const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
        return match ? match[0] : text;
    }
}
