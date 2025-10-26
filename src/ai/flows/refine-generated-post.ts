'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { RefineGeneratedPostInputSchema, RefineGeneratedPostOutputSchema, RefineGeneratedPostInput, RefineGeneratedPostOutput } from './refine-post.types';


const prompt = ai.definePrompt({
  name: 'refineGeneratedPostPrompt',
  input: { schema: RefineGeneratedPostInputSchema },
  // REMOVED: output: { schema: z.string() }, - This was causing a validation error on null responses.
  prompt: `You are an expert LinkedIn post writer. You have already generated a LinkedIn post, and the user wants you to refine it based on their additional instructions. Please refine the post based on the following instructions. 

Initial Post: {{{initialPost}}}

Refinement Instructions: {{{refinementInstructions}}}

IMPORTANT: Only output the full, refined text of the post. Do not include any other explanatory text, headings, or markdown.

Refined Post:`,
});

const refineGeneratedPostFlow = ai.defineFlow(
  {
    name: 'refineGeneratedPostFlow',
    inputSchema: RefineGeneratedPostInputSchema,
    outputSchema: RefineGeneratedPostOutputSchema,
  },
  async (input) => {
    // The prompt now returns a raw string, not an object.
    const output = await prompt(input);
    if (!output) {
      throw new Error("AI returned empty output during refinement.");
    }
    // Wrap the raw string output in the expected object structure.
    return { 
      refinedPost: output.text 
    };
  }
);

export async function refineGeneratedPost(input: RefineGeneratedPostInput): Promise<RefineGeneratedPostOutput> {
  return refineGeneratedPostFlow(input);
}
