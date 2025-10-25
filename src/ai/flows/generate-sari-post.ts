'use server';

import { ai } from '@/ai/genkit';
import {
  GenerateSariPostInputSchema,
  GenerateSariPostOutputSchema,
  GenerateSariPostInput,
  GenerateSariPostOutput
} from './sari-post.types';
import { PROMPT_TEMPLATES, CONTENT_FIELD_MAP, VoiceType } from './prompts/prompt-templates';

/**
 * Injects user input into the specific prompt template
 */
function buildPromptWithUserInput(input: GenerateSariPostInput): string {
  const { voiceType, framework, wordCount, tone, content } = input;
  
  let prompt = PROMPT_TEMPLATES[voiceType as VoiceType];
  const contentField = CONTENT_FIELD_MAP[voiceType as VoiceType];
  
  const userInputSection = `
FRAMEWORK: ${framework}

LENGTH: ${wordCount} words

TONE: ${tone}

${contentField}: ${content}
`.trim();
  
  const finalInstructionMarker = `Generate ${voiceType}-driven LinkedIn post now based on user input above.`;
  
  prompt = prompt.replace(
    finalInstructionMarker,
    `${userInputSection}\n\n---\n\n${finalInstructionMarker}`
  );
  
  return prompt;
}

/**
 * Parses the LLM output into structured format
 */
function parseOutputSections(text: string): GenerateSariPostOutput {
  const sections = {
    title: '',
    post: '',
    hashtags: '',
    engagementPrediction: '',
    qualityCheck: '',
  };

  const extractBetween = (fullText: string, startMarker: string, endMarker?: string): string => {
    const start = fullText.indexOf(startMarker);
    if (start === -1) return '';
    
    const contentStart = start + startMarker.length;
    let end = fullText.length;
    
    if (endMarker) {
      const endPos = fullText.indexOf(endMarker, contentStart);
      if (endPos !== -1) end = endPos;
    }
    
    return fullText.substring(contentStart, end).trim();
  };

  sections.title = extractBetween(text, 'TITLE', 'POST');
  sections.post = extractBetween(text, 'POST', 'HASHTAGS');
  sections.hashtags = extractBetween(text, 'HASHTAGS', 'ENGAGEMENT');
  sections.engagementPrediction = extractBetween(text, 'ENGAGEMENT PREDICTION', 'QUALITY');
  sections.qualityCheck = extractBetween(text, 'QUALITY CHECK');

  return sections;
}

/**
 * Main flow using Gemini 2.5 Flash with the complete, templated prompt
 */
const generateSariPostFlow = ai.defineFlow(
  {
    name: 'generateSariPostFlow',
    inputSchema: GenerateSariPostInputSchema,
    outputSchema: GenerateSariPostOutputSchema,
  },
  async (input: GenerateSariPostInput) => {
    const fullPrompt = buildPromptWithUserInput(input);
    
    // FIX #1: Use correct model name matching your genkit config
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',  // CHANGED: was 'gemini-2.5-flash-latest'
      prompt: fullPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
    
    const output = result.text;
    return parseOutputSections(output);
  }
);

export async function generateSariPost(input: GenerateSariPostInput): Promise<GenerateSariPostOutput> {
  return generateSariPostFlow(input);
}
