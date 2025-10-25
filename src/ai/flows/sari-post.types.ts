import { z } from 'zod';

export const GenerateSariPostInputSchema = z.object({
  voiceType: z.enum(['storytelling', 'authority', 'relevance', 'invitation']),
  framework: z.string(), // BAB, Hero, Mountain, PAS, Thesis, etc.
  wordCount: z.number().min(100).max(1000),
  tone: z.string(), // vulnerable, analytical, etc.
  content: z.string().min(50), // User's story, insight, topic, or focus
});

export const GenerateSariPostOutputSchema = z.object({
  title: z.string(),
  post: z.string(),
  hashtags: z.string(),
  engagementPrediction: z.string(),
  qualityCheck: z.string(),
});

export type GenerateSariPostInput = z.infer<typeof GenerateSariPostInputSchema>;
export type GenerateSariPostOutput = z.infer<typeof GenerateSariPostOutputSchema>;
