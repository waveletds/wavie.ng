/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { User, Transaction } from "../types.js";
import { Bot, User as UserIcon, Send, Sparkles, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface WavieAssistantProps {
  user: User;
  onClose?: () => void;
}

export default function WavieAssistant({ user }: WavieAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: `Hello ${user.fullName}! 👋 I am **Wavie AI**, your premium financial companion. I have complete secure intelligence over your current wallet balance (₦${user.balanceMain.toLocaleString()}) and recent spending history.\n\nAsk me anything! For example:\n* *"How can I budget my ₦${user.balanceMain.toLocaleString()} this month?"*\n* *"What savings tips do you have for an average Nigerian dealing with inflation?"*\n* *"How do I track my peer pressure expenses?"*`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "Inflation survival budgeting plan",
    "How to manage an urgent 2K request",
    "Explain 'Ajo' automated savings",
    "Where is my money going? Spend diagnostics"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;
    setErrorMsg(null);
    const userMsg: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          prompt: messageText,
          chatHistory: messages.slice(-10) // Send the last few exchanges for context
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve AI advice details");
      }

      setMessages((prev) => [...prev, { role: "model", content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Something went wrong while reaching Wavie AI.");
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `⚠️ **System Integration Alert:** I couldn't reach my core system brain because the **GEMINI_API_KEY** was not detected or is invalid on the server.\n\nTo unlock my full financial forecasting, spending intelligence, and clever Nigerian financial advises, simply go to the **Settings Panel (gear icon on your top right in AI Studio) -> Secrets** and add your \`GEMINI_API_KEY\`! It takes less than 30 seconds to activate. 🚀`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* AI Header */}
      <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-400">
            <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Wavie AI Finance</h3>
            <p className="text-[10px] text-emerald-100 font-mono">Secured Companion • Online</p>
          </div>
        </div>
        <div className="bg-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500 text-emerald-100">
          GenAI v2.5
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "model" && (
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 text-xs shadow-sm font-bold mt-1">
                W
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
              }`}
            >
              {/* Parse Markdown-like bullets and bold */}
              <div className="space-y-1.5 whitespace-pre-wrap">
                {m.content.split("\n").map((line, lIdx) => {
                  let cleaned = line;
                  // Handle list bullet points
                  const isBullet = cleaned.startsWith("* ") || cleaned.startsWith("- ");
                  if (isBullet) cleaned = cleaned.replace(/^[*|-]\s?/, "");

                  // Bold parser **Text**
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const parts = [];
                  let lastIdx = 0;
                  let match;

                  while ((match = boldRegex.exec(cleaned)) !== null) {
                    if (match.index > lastIdx) {
                      parts.push(cleaned.substring(lastIdx, match.index));
                    }
                    parts.push(
                      <strong key={match.index} className={m.role === "user" ? "text-white font-bold" : "text-emerald-900 font-bold"}>
                        {match[1]}
                      </strong>
                    );
                    lastIdx = boldRegex.lastIndex;
                  }
                  if (lastIdx < cleaned.length) {
                    parts.push(cleaned.substring(lastIdx));
                  }

                  return (
                    <div key={lIdx} className={isBullet ? "pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-500" : ""}>
                      {parts.length > 0 ? parts : cleaned}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 text-xs shadow-sm font-bold">
              W
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-3.5 py-3 text-xs shadow-sm text-slate-500 flex items-center gap-2">
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span>Wavie AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested chips if starting / waiting */}
      {!loading && messages.length < 5 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="bg-white border border-slate-200 hover:border-emerald-500 rounded-full px-3 py-1.5 text-[10px] text-slate-600 hover:text-emerald-700 whitespace-nowrap font-medium transition-all flex-shrink-0 shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask about savings, budgets, 'Ajo'..."
          disabled={loading}
          className="flex-1 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-full px-4 py-2 text-xs outline-none"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-sm transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
