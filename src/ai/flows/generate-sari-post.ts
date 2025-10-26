'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateSariPostInputSchema, GenerateSariPostOutputSchema, GenerateSariPostInput, GenerateSariPostOutput } from './sari-post.types';


const prompt = ai.definePrompt({
  name: 'generateSariPostPrompt',
  input: { schema: GenerateSariPostInputSchema },
  // REMOVED: output: { schema: z.string() }, - This was causing a validation error on null responses.
  prompt: `
    You are an expert LinkedIn strategist. Generate a LinkedIn post based on the user's specifications.

    **Voice Type:** {{{voiceType}}}
    **Framework:** {{{framework}}}
    **Word Count:** {{{wordCount}}}
    **Tone:** {{{tone}}}
    **Main Content:**
    {{{content}}}

    Follow the instructions for the selected voice type and framework to generate the post.

    **Output Format:**
    The output must be a single block of text with the following sections clearly marked.

    TITLE:
    (A compelling title for the post)

    POST:
    (The generated LinkedIn post, formatted for readability)

    HASHTAGS:
    (3-5 relevant hashtags)

    ENGAGEMENT PREDICTION:
    (Predict the type of engagement the post will receive)

    QUALITY CHECK:
    (Provide a quality checklist with yes/no answers)

    **VOICE TYPE INSTRUCTIONS:**

    **If voiceType is 'storytelling':**
    Follow the rules for the selected framework:
    *   **BAB (Before-After-Bridge):**
        *   BEFORE: Current/past struggle state
        *   AFTER: Transformed state after change
        *   BRIDGE: How the transformation happened
    *   **Hero's Journey:**
        *   PROBLEM: Challenge faced
        *   STRUGGLE: Obstacles encountered
        *   SOLUTION: Breakthrough discovered
        *   LESSON: What reader should learn
    *   **The Mountain:**
        *   GOAL: What you wanted to achieve
        *   OBSTACLES: What stood in your way
        *   SOLUTIONS: How you overcame them
        *   RESULTS: What you achieved and learned
    *   **Content Generation Rules:**
        1.  Start with 1-2 sentence hook that stops scrolling
        2.  Describe specific visualizable moment or scene
        3.  Show struggle or before state (make it relatable, not abstract)
        4.  Name one turning point or realization
        5.  Show transformation or after state with specific result
        6.  Extract lesson that serves the READER, not just about you
        7.  End with genuine invitation question (not sales CTA)
    *   **Quality Checklist:**
        *   Specific visualizable moment present? Yes or No
        *   Relatable struggle that readers recognize? Yes or No
        *   Clear turning point where things changed? Yes or No
        *   People-first lesson not just tool/tactic? Yes or No
        *   Genuine invitation at end, not sales CTA? Yes or No

    **If voiceType is 'authority':**
    Follow the rules for the selected framework:
    *   **PAS (Problem-Agitate-Solve):**
        *   PROBLEM: What's broken in your industry
        *   AGITATE: Why it matters and consequences
        *   SOLVE: Step-by-step solution with proof
    *   **Thesis-Antithesis-Synthesis:**
        *   THESIS: Common belief in your field
        *   ANTITHESIS: Why it's actually wrong/incomplete
        *   SYNTHESIS: What's actually true with nuance
    *   **4Ps (Picture-Promise-Proof-Push):**
        *   PICTURE: Dream state/desired outcome
        *   PROMISE: What's possible and why
        *   PROOF: Evidence, data, case studies
        *   PUSH: Clear call-to-action
    *   **Content Generation Rules:**
        1.  Start with clear title naming the specific problem or claim
        2.  State the problem or thesis with conviction
        3.  Agitate or challenge: show why current approach is broken
        4.  Provide 4-5 specific, actionable steps or solutions
        5.  Include proof: case study, data point, or lived example
        6.  Back claims with evidence, not just opinion
        7.  End with specific 7-day action or thought shift
    *   **Quality Checklist:**
        *   Claims backed by data or lived proof? Yes or No
        *   Would pass scrutiny from field skeptics? Yes or No
        *   Teaching something, not just promoting? Yes or No
        *   Methodology clear, not just results? Yes or No
        *   Actionable without hiring the author? Yes or No

    **If voiceType is 'relevance':**
    Follow the rules for the selected framework:
    *   **Myth vs. Reality:**
        *   MYTH: Common belief in your industry
        *   REALITY: What's actually true with evidence
        *   WHY IT MATTERS: Impact of following myth vs. reality
    *   **Trend Analysis:**
        *   WHAT'S HAPPENING: Current trend or shift
        *   WHY IT MATTERS: Impact on your audience
        *   WHAT TO DO: Actionable response steps
    *   **AMA (Ask Me Anything):**
        *   OBSERVATION: Pattern you're noticing
        *   HYPOTHESIS: Your theory about why
        *   INVITATION: Genuine question for audience
    *   **Content Generation Rules:**
        1.  Start with title addressing current belief or trend
        2.  State myth or observation with specific examples
        3.  Provide 3 evidence-backed truths or analyses
        4.  Explain why myth persists or trend matters NOW
        5.  Show consequences of following old belief
        6.  Show benefits of embracing new reality
        7.  End with question inviting their perspective or experience
    *   **Quality Checklist:**
        *   Speaks to what audience is experiencing right now? Yes or No
        *   Useful and valuable even without knowing the author? Yes or No
        *   Hook that makes them want to read, not scroll? Yes or No
        *   Can they apply this immediately or today? Yes or No
        *   Backed by evidence, not just opinion? Yes or No

    **If voiceType is 'invitation':**
    Follow the rules for the selected framework:
    *   **The Genuine Question:**
        *   OBSERVATION: Pattern you've genuinely noticed
        *   CURIOSITY: What you're wondering about
        *   INVITATION: Open question for their experience
    *   **Help Me Understand:**
        *   PERSPECTIVE: What you're seeing/thinking
        *   HUMILITY: Acknowledgment you could be wrong
        *   INVITATION: Request for their perspective
    *   **Resource/Gift Frame:**
        *   RECOGNITION: Their likely challenge
        *   OFFERING: Free resource/template you created
        *   INVITATION: Request for feedback on usefulness
    *   **Celebration/Recognition:**
        *   OBSERVATION: Achievement you're celebrating
        *   RECOGNITION: Why it takes courage/effort
        *   INVITATION: Share your story
    *   **Content Generation Rules:**
        1.  Start with title signaling genuine curiosity or celebration
        2.  State observation or recognition with specific examples
        3.  Share your curiosity or recognition of their effort
        4.  Explain why this matters at human level, not just business
        5.  Create psychological safety and openness
        6.  Invite authentic response without pressure
        7.  End with genuine question or celebration
    *   **Quality Checklist:**
        *   Feels like genuine invitation, not disguised sales CTA? Yes or No
        *   Makes people feel SEEN and acknowledged? Yes or No
        *   Call-to-action is something they actually want to do? Yes or No
        *   Creates psychological safety for authentic responses? Yes or No
        *   No pressure or in the tone? Yes or No
  `,
});

/**
 * Manually parses the raw string output from the AI into a structured object.
 * This is more robust than relying on the model to return perfect JSON.
 */
function parseAiOutput(rawOutput: string): GenerateSariPostOutput {
    const sections = {
        title: '',
        post: '',
        hashtags: '',
        engagementPrediction: '',
        qualityCheck: '',
    };

    // Use regex to find content for each section by its heading
    const titleMatch = rawOutput.match(/TITLE:([\s\S]*?)(?=POST:|$)/i);
    if (titleMatch) sections.title = titleMatch[1].trim();

    const postMatch = rawOutput.match(/POST:([\s\S]*?)(?=HASHTAGS:|$)/i);
    if (postMatch) sections.post = postMatch[1].trim();

    const hashtagsMatch = rawOutput.match(/HASHTAGS:([\s\S]*?)(?=ENGAGEMENT PREDICTION:|$)/i);
    if (hashtagsMatch) sections.hashtags = hashtagsMatch[1].trim();

    const engagementMatch = rawOutput.match(/ENGAGEMENT PREDICTION:([\s\S]*?)(?=QUALITY CHECK:|$)/i);
    if (engagementMatch) sections.engagementPrediction = engagementMatch[1].trim();

    const qualityMatch = rawOutput.match(/QUALITY CHECK:([\s\S]*?$)/i);
    if (qualityMatch) sections.qualityCheck = qualityMatch[1].trim();

    // Fallback if parsing fails to find a post
    if (!sections.post) {
        // If no sections are found, assume the entire output is the post.
        if (!sections.title && !sections.hashtags && !sections.engagementPrediction && !sections.qualityCheck) {
            return { ...sections, post: rawOutput.trim() };
        }
    }

    return sections;
}

const generateSariPostFlow = ai.defineFlow(
  {
    name: 'generateSariPostFlow',
    inputSchema: GenerateSariPostInputSchema,
    outputSchema: GenerateSariPostOutputSchema,
  },
  async (input) => {
    // The prompt now returns a raw string, not an object.
    const output = await prompt(input);
    if (!output) {
      throw new Error("AI returned empty output.");
    }
    return parseAiOutput(output.text);
  }
);

export async function generateSariPost(input: GenerateSariPostInput): Promise<GenerateSariPostOutput> {
    return generateSariPostFlow(input);
}
