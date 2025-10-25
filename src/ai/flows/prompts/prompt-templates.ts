import { readFileSync } from 'fs';
import { join } from 'path';

// Load prompt templates at build time
const PROMPT_DIR = join(process.cwd(), 'docs');

export const PROMPT_TEMPLATES = {
  storytelling: readFileSync(join(PROMPT_DIR, 'storytelling-prompt-fixed.txt'), 'utf-8'),
  authority: readFileSync(join(PROMPT_DIR, 'authority-prompt-fixed.txt'), 'utf-8'),
  relevance: readFileSync(join(PROMPT_DIR, 'relevance-prompt-fixed.txt'), 'utf-8'),
  invitation: readFileSync(join(PROMPT_DIR, 'invitation-prompt-fixed.txt'), 'utf-8'),
} as const;

export type VoiceType = keyof typeof PROMPT_TEMPLATES;

// Field names for each voice type (where user content goes)
export const CONTENT_FIELD_MAP = {
  storytelling: 'YOUR STORY',
  authority: 'YOUR INSIGHT',
  relevance: 'TOPIC',
  invitation: 'FOCUS',
} as const;
