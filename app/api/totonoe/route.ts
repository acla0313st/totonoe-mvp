import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TONE_PROMPTS: Record<string, string> = {
  soft: "やわらかく、圧をなくし、相手が傷つかないように整えてください。",
  polite: "丁寧で礼儀正しい表現に整えてください。ビジネスメールとして自然な日本語にしてください。",
  nocatalyst: "催促感・プレッシャーを完全に消してください。相手が快く動けるような言い方にしてください。",
  frank: "フランクで親しみやすいトーンに整えてください。砕けすぎず、でも堅くなりすぎないように。",
  boss: "上司・目上の人への言葉遣いに整えてください。敬語を正しく使い、失礼のない表現にしてください。",
  weak: "言い方の強さを弱めてください。命令口調や断定的な表現を避け、お願いするニュアンスにしてください。",
};

export async function POST(req: NextRequest) {
  const { text, tone } = await req.json();

  if (!text || !tone) {
    return NextResponse.json({ error: "text and tone are required" }, { status: 400 });
  }

  const toneInstruction = TONE_PROMPTS[tone] ?? TONE_PROMPTS.soft;

  const systemPrompt = `あなたは日本語の文章トーン調整の専門家です。
ユーザーが入力した日本語のメッセージを、指定されたトーンに合わせて自然に書き直してください。

ルール：
- 意味・内容・情報は変えない
- 文章の長さは大きく変えない（極端に長くしない）
- 書き直した文章のみを出力する（前置き・説明・コメントは不要）
- 自然な日本語にする

トーン指示：${toneInstruction}`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const result = response.choices[0]?.message?.content ?? "";

  // 計測ログ（後でSupabaseに移す）
  console.log(JSON.stringify({
    event: "totonoe_request",
    tone,
    input_length: text.length,
    output_length: result.length,
    timestamp: new Date().toISOString(),
  }));

  return NextResponse.json({ result });
}
