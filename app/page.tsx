"use client";

import { useState } from "react";

const TONES = [
  { key: "soft",  label: "やわらかく" },
  { key: "frank", label: "フランクに" },
  { key: "boss",  label: "上司向け" },
] as const;

type ToneKey = (typeof TONES)[number]["key"];

export default function Home() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<ToneKey>("soft");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/totonoe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, tone }),
      });
      const data = await res.json();
      if (data.result) {
        setOutput(data.result);
      } else {
        setError("エラーが発生しました。もう一度試してください。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);

    // 計測
    console.log(JSON.stringify({ event: "copy", tone, timestamp: new Date().toISOString() }));

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-start px-4 py-12">
      {/* ヘッダー */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">送る前ととのえ</h1>
        <p className="mt-2 text-gray-500 text-sm">言いづらい文章を、自然で角が立たない日本語に。</p>
      </div>

      <div className="w-full max-w-xl space-y-5">
        {/* 入力欄 */}
        <div>
          <textarea
            className="w-full h-32 p-4 rounded-2xl border border-gray-200 bg-white text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-gray-400 shadow-sm"
            placeholder="例：資料まだですか？今日中にください"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* トーンボタン */}
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTone(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tone === t.key
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ととのえるボタン */}
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-base hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {loading ? "ととのえ中…" : "ととのえる"}
        </button>

        {/* エラー */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* 出力欄 */}
        {output && (
          <div className="relative">
            <div className="w-full min-h-24 p-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-gray-800 text-sm whitespace-pre-wrap shadow-sm">
              {output}
            </div>
            <button
              onClick={handleCopy}
              className="absolute bottom-3 right-3 px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-all"
            >
              {copied ? "コピーしました！" : "コピー"}
            </button>
          </div>
        )}
      </div>

      <p className="mt-12 text-xs text-gray-400">ととのえ © 2026</p>
    </main>
  );
}
