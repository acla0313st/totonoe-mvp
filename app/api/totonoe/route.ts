import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const TONE_PROMPTS: Record<string, string> = {
  soft: `やわらかく整えてください。
以下を徹底してください：
- 催促・要求・命令のニュアンスを完全に消す
- 「〜していただけると助かります」「〜でしょうか」など、相手に選択肢を与える表現にする
- 「お忙しいところ」「お手すきの際に」など、相手への気遣いを一言添える
- 絵文字は使わない
- LINEで送れる自然な日本語にする
- 文章は2〜3文以内に収める`,

  frank: `同僚や友人に送るフランクなトーンに整えてください。
以下を徹底してください：
- 敬語は使わず、タメ口ベースにする
- でも失礼にはならない、親しみやすい言い方
- 「〜してくれる？」「〜だと助かる！」のような軽い表現
- LINEで自然に送れるカジュアルな日本語
- 文章は1〜2文に収める`,

  boss: `上司や目上の人に送る丁寧なトーンに整えてください。
以下を徹底してください：
- 正しい敬語を使う（「〜でしょうか」「〜いただけますでしょうか」）
- 催促・プレッシャーを感じさせない
- 「お忙しいところ恐れ入りますが」など、前置きで気遣いを示す
- でも長すぎず、読みやすい長さにする（3文以内）
- LINEで送れる自然な日本語にする`,
};

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
