"use client";
import React, { useState } from "react";
import Head from "next/head";

type AnalysisResult = {
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  vader_score: number;
  distilbert_confidence: number;
  themes: string[];
  explanation: string;
  comments?: {
    text: string;
    sentiment: string;
    vader: number;
    distilbert: number;
  }[];
  // Add any other fields your API returns
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [manualComments, setManualComments] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "manual">("file");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualComments(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (inputMode === "file") {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch("http://localhost:8000/api/sentiment/", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!manualComments.trim()) return;
        res = await fetch("http://localhost:8000/api/sentiment/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comments: manualComments.split("\n").filter(Boolean),
          }),
        });
      }
      if (!res || !res.ok) throw new Error("Failed to analyze comments");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sentiment Analyzer</title>
      </Head>
      <div className="min-h-screen bg-[#23272f] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <div className="bg-[#343541] rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white text-center">
              Sentiment & Theme Analyzer
            </h1>
            <p className="text-gray-400 mb-6 text-center">
              Upload a CSV file or enter comments manually to analyze customer
              sentiment and extract insights.
            </p>
            <div className="flex justify-center mb-4 gap-2">
              <button
                className={`px-4 py-2 rounded-l-lg font-semibold transition-colors ${
                  inputMode === "file"
                    ? "bg-[#444654] text-white"
                    : "bg-[#23272f] text-gray-400 hover:bg-[#343541]"
                }`}
                onClick={() => setInputMode("file")}
                type="button"
              >
                Upload File
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg font-semibold transition-colors ${
                  inputMode === "manual"
                    ? "bg-[#444654] text-white"
                    : "bg-[#23272f] text-gray-400 hover:bg-[#343541]"
                }`}
                onClick={() => setInputMode("manual")}
                type="button"
              >
                Enter Comments
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              {inputMode === "file" ? (
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#23272f] file:text-gray-200 hover:file:bg-[#343541]"
                />
              ) : (
                <textarea
                  value={manualComments}
                  onChange={handleManualChange}
                  rows={6}
                  placeholder="Enter one comment per line..."
                  className="w-full rounded-lg p-3 bg-[#23272f] text-gray-200 border border-[#444654] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                disabled={
                  loading ||
                  (inputMode === "file" ? !file : !manualComments.trim())
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze"
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 text-red-400 text-center">{error}</div>
            )}
          </div>
          {result && (
            <div className="bg-[#343541] rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-white">
                  Sentiment Distribution
                </h2>
                <div className="flex gap-4 justify-center">
                  <div className="bg-blue-900 rounded-lg px-4 py-2 text-blue-200 font-medium">
                    Positive: {result.sentiment_distribution.positive}%
                  </div>
                  <div className="bg-red-900 rounded-lg px-4 py-2 text-red-200 font-medium">
                    Negative: {result.sentiment_distribution.negative}%
                  </div>
                  <div className="bg-gray-700 rounded-lg px-4 py-2 text-gray-200 font-medium">
                    Neutral: {result.sentiment_distribution.neutral}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#23272f] rounded-lg p-4">
                  <h3 className="font-semibold text-gray-200 mb-1">
                    VADER Score
                  </h3>
                  <p className="text-2xl font-mono text-blue-300">
                    {result.vader_score}
                  </p>
                </div>
                <div className="bg-[#23272f] rounded-lg p-4">
                  <h3 className="font-semibold text-gray-200 mb-1">
                    DistilBERT Confidence
                  </h3>
                  <p className="text-2xl font-mono text-green-300">
                    {result.distilbert_confidence}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">
                  Themes Identified
                </h3>
                <ul className="list-disc ml-6 text-gray-200">
                  {result.themes.map((theme, idx) => (
                    <li key={idx}>{theme}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">
                  Detailed Explanation
                </h3>
                <p className="text-gray-300 whitespace-pre-line">
                  {result.explanation}
                </p>
              </div>
              {result.comments && (
                <div>
                  <h3 className="font-semibold text-gray-200 mb-2">
                    Comments & Sentiments
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 text-gray-300">Comment</th>
                          <th className="px-2 py-1 text-gray-300">Sentiment</th>
                          <th className="px-2 py-1 text-gray-300">VADER</th>
                          <th className="px-2 py-1 text-gray-300">
                            DistilBERT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.comments.map((c, idx) => (
                          <tr key={idx} className="border-t border-[#23272f]">
                            <td
                              className="px-2 py-1 max-w-xs truncate text-gray-200"
                              title={c.text}
                            >
                              {c.text}
                            </td>
                            <td className="px-2 py-1 text-gray-200">
                              {c.sentiment}
                            </td>
                            <td className="px-2 py-1 text-gray-200">
                              {c.vader}
                            </td>
                            <td className="px-2 py-1 text-gray-200">
                              {c.distilbert}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
