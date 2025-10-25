import { z } from 'zod';

export const RefineGeneratedPostInputSchema = z.object({
  initialPost: z.string().describe('The initially generated LinkedIn post.'),
  refinementInstructions: z.string().describe('Instructions on how to refine the post.'),
});
export type RefineGeneratedPostInput = z.infer<typeof RefineGeneratedPostInputSchema>;

export const RefineGeneratedPostOutputSchema = z.object({
  refinedPost: z.string().describe('The refined LinkedIn post.'),
});
export type RefineGeneratedPostOutput = z.infer<typeof RefineGeneratedPostOutputSchema>;