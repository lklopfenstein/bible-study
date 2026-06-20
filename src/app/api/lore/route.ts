import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const { book, chapter } = await request.json();

    if (!book || !chapter) {
      return NextResponse.json({ error: 'Book and chapter required' }, { status: 400 });
    }

    // Determine if we have an OPENAI_API_KEY available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback response if no API key is provided
      return NextResponse.json({
        hero: {
          name: "Unknown Hero",
          title: "Waiting for API Key",
          stats: { strength: 0, wisdom: 0, courage: 0 },
          weapon: "None",
          description: "Please configure OPENAI_API_KEY to generate epic lore!"
        },
        tactics: "Add an OpenAI key to your environment variables to unlock dynamic battle tactics and lore.",
        creatures: []
      });
    }

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        hero: z.object({
          name: z.string(),
          title: z.string(),
          stats: z.object({
            strength: z.number().min(1).max(100),
            wisdom: z.number().min(1).max(100),
            courage: z.number().min(1).max(100),
          }),
          weapon: z.string(),
          description: z.string(),
        }).nullable(),
        tactics: z.string().nullable(),
        creatures: z.array(z.string()).optional()
      }),
      prompt: `Generate exciting, gamified "RPG-style" lore for ${book} ${chapter} from the Bible. 
      Tailor this to a 13-year-old boy who loves fantasy, action, and stats.
      Identify the main character in this chapter (if any) and give them RPG stats (1-100). 
      If there is a battle or intense situation, describe the "tactics".
      If there are any cool creatures or relics mentioned, list them.`
    });

    return NextResponse.json(result.object);

  } catch (error) {
    console.error('Lore generation error:', error);
    return NextResponse.json({ error: 'Failed to generate lore' }, { status: 500 });
  }
}
