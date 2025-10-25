'use server';

import {ai} from '@/ai/genkit';
import { RefineGeneratedPostInputSchema, RefineGeneratedPostOutputSchema, RefineGeneratedPostInput, RefineGeneratedPostOutput } from './refine-post.types';


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

export async function refineGeneratedPost(input: RefineGeneratedPostInput): Promise<RefineGeneratedPostOutput> {
  return refineGeneratedPostFlow(input);
}
