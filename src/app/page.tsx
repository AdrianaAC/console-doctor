"use client";

import { useState } from "react";
import type { DiagnosisResult } from "@/types/diagnosis";

export default function HomePage() {
  const [consoleText, setConsoleText] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-console", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consoleText }),
      });

      const data = await response.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Console Doctor</h1>
        <p className="mt-2 text-zinc-400">
          Paste your console logs and get the likely root cause.
        </p>

        <textarea
          value={consoleText}
          onChange={(e) => setConsoleText(e.target.value)}
          placeholder="Paste console output here..."
          className="mt-6 min-h-[260px] w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 font-mono text-sm outline-none"
        />

        <button
          onClick={handleAnalyze}
          disabled={!consoleText.trim() || loading}
          className="mt-4 rounded-xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Console"}
        </button>

        {result ? (
          <section className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">Root cause</h2>
              <p className="mt-2">{result.rootCause}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">Where</h2>
              <p className="mt-2">{result.where ?? "Unknown"}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">Why</h2>
              <p className="mt-2">{result.why}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">How to fix</h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                {result.fixSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-semibold">Confidence</h2>
              <p className="mt-2">{result.confidence}%</p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}