'use server';

/**
 * @fileOverview A LinkedIn post generator based on the SARI framework.
 *
 * - generateSariPost - A function that generates a LinkedIn post based on the SARI framework.
 * - GenerateSariPostInput - The input type for the generateSariPost function.
 * - GenerateSariPostOutput - The return type for the generateSariPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSariPostInputSchema = z.object({
  storytelling: z.boolean().describe('Whether to include a storytelling element.'),
  authority: z.boolean().describe('Whether to include an authority element.'),
  relevance: z.boolean().describe('Whether to include a relevance element.'),
  invitation: z.boolean().describe('Whether to include an invitation element.'),
});
export type GenerateSariPostInput = z.infer<typeof GenerateSariPostInputSchema>;

const GenerateSariPostOutputSchema = z.object({
  post: z.string().describe('The generated LinkedIn post.'),
});
export type GenerateSariPostOutput = z.infer<typeof GenerateSariPostOutputSchema>;

export async function generateSariPost(input: GenerateSariPostInput): Promise<GenerateSariPostOutput> {
  return generateSariPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSariPostPrompt',
  input: {schema: GenerateSariPostInputSchema},
  output: {schema: GenerateSariPostOutputSchema},
  prompt: `You are a LinkedIn expert. Generate a LinkedIn post based on the following SARI framework elements. Only use the SARI elements that are set to true.

SARI Framework:
Storytelling: {{{storytelling}}}
Authority: {{{authority}}}
Relevance: {{{relevance}}}
Invitation: {{{invitation}}}

Post:`, 
});

const generateSariPostFlow = ai.defineFlow(
  {
    name: 'generateSariPostFlow',
    inputSchema: GenerateSariPostInputSchema,
    outputSchema: GenerateSariPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
