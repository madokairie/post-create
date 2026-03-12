import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { systemPrompt, variationPrompt } = await req.json();

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: variationPrompt,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Variation generation error:', error);
    return NextResponse.json({ error: 'Failed to generate variations' }, { status: 500 });
  }
}
