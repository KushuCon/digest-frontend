"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Globe, ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Types ──────────────────────────────────────────────────────────────────
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  sources?: Source[];
  model?: string;
  webUsed?: boolean;
}

interface Source {
  title: string;
  source: string;
  url: string;
  type: "feed" | "web";
  score?: number;
}

interface Model {
  id: string;
  name: string;
  badge: string;
}

// ── Default free models (shown before API loads) ───────────────────────────
const DEFAULT_MODELS: Model[] = [
  { id: "deepseek/deepseek-r1:free",           name: "DeepSeek R1",      badge: "Reasoning" },
  { id: "deepseek/deepseek-v3:free",           name: "DeepSeek V3",      badge: "Fast" },
  { id: "google/gemini-2.0-flash-exp:free",    name: "Gemini 2.0 Flash", badge: "Google" },
  { id: "qwen/qwen3-235b-a22b:free",           name: "Qwen3 235B",       badge: "Large" },
  { id: "moonshotai/kimi-k2:free",             name: "Kimi K2",          badge: "Long CTX" },
  { id: "minimax/minimax-m1:free",             name: "MiniMax M1",       badge: "Fast" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", badge: "Meta" },
];

// ── Markdown-ish renderer ──────────────────────────────────────────────────
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return <p key={i} className="font-bold text-foreground mt-2">{line.slice(4)}</p>;
        if (line.startsWith("## "))
          return <p key={i} className="font-bold text-foreground text-base mt-2">{line.slice(3)}</p>;
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} className="flex gap-2">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span className="text-foreground/90">{line.slice(2)}</span>
            </div>
          );
        if (line.startsWith("**") && line.endsWith("**"))
          return <p key={i} className="font-semibold text-foreground">{line.slice(2,-2)}</p>;
        if (!line.trim())
          return <div key={i} className="h-1" />;
        // Bold inline
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-foreground/90">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Chatbot component ──────────────────────────────────────────────────────
export function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hi! I'm your market intelligence assistant. Ask me anything about recent news, stocks, earnings, or markets. I have access to your news feed and can search the web in real-time. 🚀",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [useWeb, setUseWeb]   = useState(true);
  const [models, setModels]   = useState<Model[]>(DEFAULT_MODELS);
  const [model, setModel]     = useState(DEFAULT_MODELS[0]);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  // Load models from API
  useEffect(() => {
    fetch("/api/chat/models")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setModels(data);
          setModel(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "0")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:   q,
          history,
          model:   model.id,
          use_web: useWeb,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id:      (Date.now() + 1).toString(),
        role:    "assistant",
        content: data.answer || "Sorry, I couldn't generate a response.",
        sources: data.sources || [],
        model:   data.model,
        webUsed: data.web_used,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, messages, model, useWeb]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Open AI assistant"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-6 z-50 flex flex-col rounded-2xl border border-border bg-background shadow-2xl shadow-black/40"
            style={{ width: "min(420px, calc(100vw - 2rem))", height: "min(600px, calc(100vh - 6rem))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-border shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Market Assistant</div>
                <div className="text-xs text-muted-foreground">RAG + Real-time Web</div>
              </div>

              {/* Web toggle */}
              <button
                onClick={() => setUseWeb((v) => !v)}
                title={useWeb ? "Web search ON" : "Web search OFF"}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-colors ${
                  useWeb ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-border text-muted-foreground"
                }`}
              >
                <Globe className="h-3 w-3" />
                {useWeb ? "Live" : "Feed"}
              </button>

              {/* Close */}
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary/60 border border-border/40 rounded-tl-sm"
                  }`}>
                    {msg.role === "user"
                      ? <p className="text-sm">{msg.content}</p>
                      : <Markdown text={msg.content} />
                    }

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                        <div className="text-xs text-muted-foreground font-medium">Sources:</div>
                        {msg.sources.slice(0, 4).map((s, i) => (
                          <a
                            key={i}
                            href={s.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.type === "web" ? "bg-blue-400" : "bg-green-400"}`} />
                            <span className="truncate">{s.title || s.source}</span>
                            {s.url && <ExternalLink className="h-2.5 w-2.5 shrink-0" />}
                          </a>
                        ))}
                        {msg.webUsed && (
                          <div className="flex items-center gap-1 text-xs text-blue-400/70 mt-1">
                            <Globe className="h-2.5 w-2.5" /> Real-time web search used
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-secondary/60 border border-border/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border shrink-0 space-y-2">
              {/* Model selector */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/40 rounded-lg px-2.5 py-1.5">
                      <Sparkles className="h-3 w-3" />
                      <span className="max-w-[140px] truncate">{model.name}</span>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">{model.badge}</Badge>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {models.map((m) => (
                      <DropdownMenuItem
                        key={m.id}
                        onClick={() => setModel(m)}
                        className={`flex items-center justify-between ${model.id === m.id ? "bg-primary/10" : ""}`}
                      >
                        <span className="text-sm">{m.name}</span>
                        <Badge variant="secondary" className="text-[9px]">{m.badge}</Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-xs text-muted-foreground/50 ml-auto">Free models · session only</span>
              </div>

              {/* Text input */}
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about stocks, news, earnings…"
                  rows={1}
                  className="flex-1 min-h-[38px] max-h-[120px] resize-none bg-secondary/40 border-border/60 text-sm"
                />
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}