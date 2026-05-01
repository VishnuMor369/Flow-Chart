import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Loader2, Trash2 } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AiTutorChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Fallback responses when API is unavailable
const FALLBACK_RESPONSES: Record<string, string> = {
  "what should i learn first as a beginner": "Great question! 🚀 Here's a recommended path for beginners:\n\n1. **HTML & CSS** — Learn the building blocks of the web\n2. **JavaScript** — The language of the web, essential for interactivity\n3. **Git & GitHub** — Version control is crucial from day one\n4. **A Frontend Framework** — React, Vue, or Angular\n\nStart with the **Frontend Roadmap** on Routiq for a detailed step-by-step guide!\n\n💡 **Tip:** Build small projects after each topic. Learning by doing is the fastest path to mastery.",
  "explain react hooks simply": "**React Hooks** let you use state and other React features in function components! 🎣\n\nHere are the most important ones:\n\n```javascript\n// useState - Store and update data\nconst [count, setCount] = useState(0);\n\n// useEffect - Run code on mount/update\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n\n// useRef - Reference DOM elements\nconst inputRef = useRef(null);\n```\n\n**Think of it this way:**\n- `useState` = a sticky note for your component\n- `useEffect` = \"do this thing when something changes\"\n- `useRef` = a pointer to an element\n\nCheck out the **Frontend Roadmap** on Routiq for a deeper dive! 📚",
  "how do i become a full stack developer": "Becoming a **Full Stack Developer** is an awesome goal! 🎯 Here's the roadmap:\n\n**Frontend:**\n- HTML, CSS, JavaScript\n- React or Next.js\n- Responsive Design\n\n**Backend:**\n- Node.js + Express (or Python/Django)\n- REST APIs & GraphQL\n- Authentication & Security\n\n**Database:**\n- PostgreSQL or MongoDB\n- ORMs (Prisma, Sequelize)\n\n**DevOps Basics:**\n- Git, CI/CD\n- Docker basics\n- Cloud deployment (Vercel, AWS)\n\nCheck out the **Full Stack Roadmap** on Routiq for the complete path! It takes 6-12 months of consistent learning. You've got this! 💪",
  "what's the best way to learn sql": "SQL is one of the most valuable skills you can learn! 📊\n\n**Start with these fundamentals:**\n\n```sql\n-- SELECT, WHERE, ORDER BY\nSELECT name, age FROM users WHERE age > 18 ORDER BY name;\n\n-- JOINs\nSELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;\n\n-- Aggregations\nSELECT department, AVG(salary)\nFROM employees GROUP BY department;\n```\n\n**Learning path:**\n1. Basic queries (SELECT, INSERT, UPDATE, DELETE)\n2. JOINs and subqueries\n3. Indexes and performance\n4. Window functions\n5. Database design & normalization\n\n🎓 Check out the **SQL Mastery** premium course on Routiq for hands-on practice!",
};

const SYSTEM_PROMPT = `You are Routiq AI Tutor — a friendly, knowledgeable, and encouraging programming mentor. Your role is to help developers learn and grow across all areas of software development including frontend, backend, DevOps, machine learning, blockchain, and more.

Guidelines:
- Keep responses concise but informative (2-4 paragraphs max unless asked for detail)
- Use code examples when relevant, formatted in markdown code blocks
- Be encouraging and supportive
- If asked about roadmaps, suggest the relevant roadmap from Routiq (Frontend, Backend, DevOps, Full Stack, Machine Learning, Blockchain)
- Use emojis sparingly but naturally
- Break complex topics into digestible steps
- Always provide actionable advice`;

const SUGGESTED_QUESTIONS = [
  "What should I learn first as a beginner?",
  "Explain React hooks simply",
  "How do I become a full stack developer?",
  "What's the best way to learn SQL?",
];

export function AiTutorChat({ isOpen, onClose }: AiTutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! 👋 I'm your **Routiq AI Tutor**. I can help you with programming questions, suggest learning paths, explain concepts, and guide you through your developer journey.\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiText = '';

      // Try Gemini API if key is available
      if (GEMINI_API_KEY) {
        try {
          // Build conversation history — exclude welcome messages
          const allMessages = [...messages, userMessage];
          const conversationHistory = allMessages
            .filter((m) => !m.id.startsWith('welcome'))
            .map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }));

          const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
              contents: conversationHistory,
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch {
          // API failed, will use fallback
        }
      }

      // Fallback to local responses if API didn't return anything
      if (!aiText) {
        const lowerContent = content.trim().toLowerCase().replace(/[?!.]/g, '');
        const fallbackKey = Object.keys(FALLBACK_RESPONSES).find(
          (key) => lowerContent.includes(key) || key.includes(lowerContent)
        );

        if (fallbackKey) {
          aiText = FALLBACK_RESPONSES[fallbackKey];
        } else {
          // Generic intelligent response
          aiText = `Great question about **"${content.trim()}"**! 🤔\n\nHere are some steps to get started:\n\n1. **Break it down** — Identify the core concepts involved\n2. **Start small** — Build a simple project to practice\n3. **Use resources** — Check out our roadmaps on Routiq for structured learning paths\n4. **Practice daily** — Consistency beats intensity\n\nI'd recommend checking out the relevant **Routiq Roadmap** for a complete step-by-step guide. You can find them on the homepage!\n\n💡 Want me to go deeper on any specific part of this topic?`;
        }
        // Simulate a small delay for local responses to feel natural
        await new Promise((r) => setTimeout(r, 800));
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "Oops! Something went wrong. Please try again. 🔄",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content:
          "Chat cleared! 🧹 I'm ready for a fresh conversation. What would you like to learn?",
        timestamp: new Date(),
      },
    ]);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const codeContent = part.replace(/```\w*\n?/g, '').replace(/```$/, '');
        return (
          <pre
            key={i}
            className="bg-black/40 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-[#8bc34a]"
          >
            <code>{codeContent.trim()}</code>
          </pre>
        );
      }
      // Bold
      const formatted = part.split(/(\*\*.*?\*\*)/g).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return (
            <strong key={j} className="text-white font-semibold">
              {seg.slice(2, -2)}
            </strong>
          );
        }
        // Inline code
        return seg.split(/(`[^`]+`)/g).map((s, k) => {
          if (s.startsWith('`') && s.endsWith('`')) {
            return (
              <code
                key={`${j}-${k}`}
                className="bg-white/10 text-[#8bc34a] px-1.5 py-0.5 rounded text-xs font-mono"
              >
                {s.slice(1, -1)}
              </code>
            );
          }
          return s;
        });
      });
      return <span key={i}>{formatted}</span>;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] z-[101] flex flex-col"
            style={{
              background:
                'linear-gradient(165deg, rgba(15,15,15,0.98) 0%, rgba(20,25,15,0.98) 50%, rgba(15,15,15,0.98) 100%)',
              borderLeft: '1px solid rgba(139, 195, 74, 0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8bc34a] to-[#689f38] flex items-center justify-center shadow-lg shadow-[#8bc34a]/20">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#8bc34a] rounded-full border-2 border-[#0f0f0f]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    AI Tutor
                    <Sparkles className="w-3.5 h-3.5 text-[#8bc34a]" />
                  </h3>
                  <p className="text-[#8bc34a]/60 text-xs">
                    Powered by Gemini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(139,195,74,0.3) transparent',
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2.5 ${
                      message.role === 'user'
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 ${
                        message.role === 'assistant'
                          ? 'bg-gradient-to-br from-[#8bc34a]/20 to-[#689f38]/20 border border-[#8bc34a]/20'
                          : 'bg-white/10 border border-white/10'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="w-3.5 h-3.5 text-[#8bc34a]" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-[#8bc34a] text-black rounded-tr-md'
                          : 'bg-white/[0.06] text-gray-200 rounded-tl-md border border-white/5'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {formatMessage(message.content)}
                      </div>
                      <div
                        className={`text-[10px] mt-1.5 ${
                          message.role === 'user'
                            ? 'text-black/40'
                            : 'text-white/20'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 bg-gradient-to-br from-[#8bc34a]/20 to-[#689f38]/20 border border-[#8bc34a]/20">
                    <Bot className="w-3.5 h-3.5 text-[#8bc34a]" />
                  </div>
                  <div className="bg-white/[0.06] border border-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#8bc34a]/60"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#8bc34a]/60"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#8bc34a]/60"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (show only when few messages) */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#8bc34a]/20 text-gray-300 hover:text-[#8bc34a] hover:border-[#8bc34a]/40 hover:bg-[#8bc34a]/5 transition-all duration-200"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#8bc34a]/30 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about programming..."
                  rows={1}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 resize-none outline-none max-h-24 py-1"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    input.trim() && !isLoading
                      ? 'bg-[#8bc34a] text-black hover:bg-[#9ccc65] shadow-lg shadow-[#8bc34a]/20'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2 text-center">
                Routiq AI Tutor • Powered by Gemini 2.0 Flash
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
