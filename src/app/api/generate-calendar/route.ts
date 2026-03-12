import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { conceptSheet, channels, startDate, daysCount } = await req.json();

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `あなたはローンチスケジュール設計の専門家です。
コンセプトシートの発信戦略に基づいて、投稿カレンダーを設計してください。
必ず以下のJSON形式で出力してください。他のテキストは含めないでください。`,
      messages: [{
        role: 'user',
        content: `以下のコンセプトシートに基づいて、${startDate}から${daysCount}日分の投稿カレンダーを作成してください。

使用媒体: ${channels.join(', ')}

コンセプトシート:
${conceptSheet}

以下のJSON配列形式で出力してください:
[
  {
    "date": "YYYY-MM-DD",
    "channel": "instagram_feed|instagram_reel|x_short|x_long|youtube|threads|email|line",
    "phase": "pre_pre|pre|launch",
    "theme": "テーマ概要"
  }
]

チェーン設計も意識して、同じメッセージを角度を変えて媒体をまたいで届ける設計にしてください。`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse calendar' }, { status: 500 });
    }

    const slots = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Calendar generation error:', error);
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}
