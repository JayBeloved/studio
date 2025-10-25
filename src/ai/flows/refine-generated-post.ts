'use server';

/**
 * @fileOverview A flow to refine a generated LinkedIn post with additional instructions.
 *
 * - refineGeneratedPost - A function that refines a generated LinkedIn post.
 * - RefineGeneratedPostInput - The input type for the refineGeneratedPost function.
 * - RefineGeneratedPostOutput - The return type for the refineGeneratedPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineGeneratedPostInputSchema = z.object({
  initialPost: z.string().describe('The initially generated LinkedIn post.'),
  refinementInstructions: z.string().describe('Instructions on how to refine the post.'),
});
export type RefineGeneratedPostInput = z.infer<typeof RefineGeneratedPostInputSchema>;

const RefineGeneratedPostOutputSchema = z.object({
  refinedPost: z.string().describe('The refined LinkedIn post.'),
});
export type RefineGeneratedPostOutput = z.infer<typeof RefineGeneratedPostOutputSchema>;

export async function refineGeneratedPost(input: RefineGeneratedPostInput): Promise<RefineGeneratedPostOutput> {
  return refineGeneratedPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineGeneratedPostPrompt',
  input: {schema: RefineGeneratedPostInputSchema},
  output: {schema: RefineGeneratedPostOutputSchema},
  prompt: `You are an expert LinkedIn post writer. You have already generated a LinkedIn post, and the user wants you to refine it based on their additional instructions. Please refine the post based on the following instructions. 

Initial Post: {{{initialPost}}}

Refinement Instructions: {{{refinementInstructions}}}

Refined Post:`,
});

const refineGeneratedPostFlow = ai.defineFlow(
  {
    name: 'refineGeneratedPostFlow',
    inputSchema: RefineGeneratedPostInputSchema,
    outputSchema: RefineGeneratedPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      refinedPost: output!.refinedPost,
    };
  }
);
