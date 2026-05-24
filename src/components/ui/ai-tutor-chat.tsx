import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Loader2, Trash2, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

// Ollama local API (proxied through Vite to avoid CORS)
const OLLAMA_URL = '/api/ollama/api/chat';
const OLLAMA_MODEL = 'qwen2.5-coder';

// Keyword-based fallback responses when API is unavailable
type FallbackEntry = {
  keywords: string[];
  response: string;
};

const FALLBACK_ENTRIES: FallbackEntry[] = [
  {
    keywords: ['beginner', 'start', 'learn first', 'new to programming', 'where to begin', 'getting started'],
    response: "Great question! 🚀 Here's a recommended path for beginners:\n\n1. **HTML & CSS** — Learn the building blocks of the web\n2. **JavaScript** — The language of the web, essential for interactivity\n3. **Git & GitHub** — Version control is crucial from day one\n4. **A Frontend Framework** — React, Vue, or Angular\n\nStart with the **Frontend Roadmap** on Routiq for a detailed step-by-step guide!\n\n💡 **Tip:** Build small projects after each topic. Learning by doing is the fastest path to mastery.",
  },
  {
    keywords: ['react hook', 'usestate', 'useeffect', 'useref', 'hooks'],
    response: "**React Hooks** let you use state and other React features in function components! 🎣\n\n```javascript\n// useState - Store and update data\nconst [count, setCount] = useState(0);\n\n// useEffect - Run code on mount/update\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n\n// useRef - Reference DOM elements\nconst inputRef = useRef(null);\n```\n\n**Think of it this way:**\n- `useState` = a sticky note for your component\n- `useEffect` = \"do this thing when something changes\"\n- `useRef` = a pointer to an element\n\nCheck out the **Frontend Roadmap** on Routiq for a deeper dive! 📚",
  },
  {
    keywords: ['full stack', 'fullstack', 'full-stack'],
    response: "Becoming a **Full Stack Developer** is an awesome goal! 🎯 Here's the roadmap:\n\n**Frontend:** HTML, CSS, JavaScript, React or Next.js\n**Backend:** Node.js + Express (or Python/Django), REST APIs\n**Database:** PostgreSQL or MongoDB, ORMs (Prisma)\n**DevOps:** Git, Docker basics, Cloud deployment\n\nCheck out the **Full Stack Roadmap** on Routiq for the complete path! 💪",
  },
  {
    keywords: ['sql', 'database', 'query', 'queries', 'postgresql', 'mysql'],
    response: "SQL is one of the most valuable skills! 📊\n\n```sql\nSELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.total > 100\nORDER BY o.total DESC;\n```\n\n**Learning path:**\n1. Basic queries (SELECT, INSERT, UPDATE, DELETE)\n2. JOINs and subqueries\n3. Indexes and performance\n4. Window functions\n5. Database design & normalization\n\n🎓 Check out the **SQL Mastery** course on Routiq!",
  },
  {
    keywords: ['javascript', 'js', 'ecmascript', 'es6'],
    response: "JavaScript is the backbone of web development! 🌟\n\n**Core concepts to master:**\n\n```javascript\n// Destructuring\nconst { name, age } = user;\n\n// Arrow functions\nconst greet = (name) => `Hello, ${name}!`;\n\n// Async/Await\nconst data = await fetch('/api/users').then(r => r.json());\n```\n\n**Key topics:**\n- Variables (let, const), Data types\n- Functions, Closures, Scope\n- DOM Manipulation\n- Promises & Async/Await\n- ES6+ features (destructuring, spread, modules)\n\nThe **Frontend Roadmap** on Routiq covers all of this step-by-step! 🚀",
  },
  {
    keywords: ['python', 'django', 'flask', 'fastapi'],
    response: "Python is an amazing language — versatile and beginner-friendly! 🐍\n\n```python\n# List comprehension\nsquares = [x**2 for x in range(10)]\n\n# Dictionary\nuser = {'name': 'Alice', 'age': 25}\n\n# Function with type hints\ndef greet(name: str) -> str:\n    return f'Hello, {name}!'\n```\n\n**Python paths:**\n- **Web Dev** → Django or FastAPI\n- **Data Science** → Pandas, NumPy, Matplotlib\n- **Machine Learning** → Scikit-learn, TensorFlow, PyTorch\n- **Automation** → Scripts, Web scraping\n\nCheck out the **Backend** or **ML Roadmap** on Routiq! 📚",
  },
  {
    keywords: ['css', 'styling', 'flexbox', 'grid', 'tailwind', 'responsive'],
    response: "CSS is how you make the web beautiful! 🎨\n\n```css\n/* Modern layout with Flexbox */\n.container {\n  display: flex;\n  gap: 1rem;\n  justify-content: center;\n  align-items: center;\n}\n\n/* CSS Grid for complex layouts */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n}\n```\n\n**Key topics:**\n- Box Model & Positioning\n- Flexbox & CSS Grid\n- Responsive Design (Media Queries)\n- CSS Variables (Custom Properties)\n- Animations & Transitions\n\n**Framework options:** Tailwind CSS, CSS Modules, or Styled Components 💅",
  },
  {
    keywords: ['html', 'semantic', 'accessibility', 'a11y'],
    response: "HTML is the foundation of every website! 🏗️\n\n```html\n<main>\n  <article>\n    <h1>Semantic HTML</h1>\n    <p>Using the right elements for the right content.</p>\n    <figure>\n      <img src=\"photo.jpg\" alt=\"Description\" />\n      <figcaption>A meaningful caption</figcaption>\n    </figure>\n  </article>\n</main>\n```\n\n**Must-know topics:**\n- Semantic elements (header, nav, main, article, section)\n- Forms & validation\n- Accessibility (ARIA labels, alt text, focus management)\n- SEO basics (meta tags, headings hierarchy)\n- HTML5 APIs (Canvas, Geolocation, Web Storage)",
  },
  {
    keywords: ['git', 'github', 'version control', 'branch', 'commit', 'merge'],
    response: "Git is essential for every developer! 🔀\n\n```bash\n# Daily workflow\ngit add .\ngit commit -m \"feat: add user auth\"\ngit push origin main\n\n# Branching\ngit checkout -b feature/login\ngit merge feature/login\n\n# Undo mistakes\ngit stash          # Temporarily save changes\ngit reset HEAD~1   # Undo last commit\n```\n\n**Best practices:**\n- Write descriptive commit messages\n- Use feature branches\n- Pull before you push\n- Learn to resolve merge conflicts\n- Use `.gitignore` properly",
  },
  {
    keywords: ['react', 'component', 'jsx', 'props', 'state', 'virtual dom'],
    response: "React is the most popular UI library! ⚛️\n\n```jsx\nfunction TodoApp() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState('');\n\n  const addTodo = () => {\n    setTodos([...todos, { id: Date.now(), text: input }]);\n    setInput('');\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <button onClick={addTodo}>Add</button>\n      {todos.map(t => <p key={t.id}>{t.text}</p>)}\n    </div>\n  );\n}\n```\n\n**Learning path:** Components → Props → State → Hooks → Routing → State Management\n\nCheck the **Frontend Roadmap** for the full React journey! 🗺️",
  },
  {
    keywords: ['node', 'express', 'backend', 'server', 'api', 'rest'],
    response: "Node.js + Express is a powerful backend combo! 🖥️\n\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.get('/api/users', (req, res) => {\n  res.json([{ id: 1, name: 'Alice' }]);\n});\n\napp.post('/api/users', (req, res) => {\n  const { name } = req.body;\n  res.status(201).json({ id: 2, name });\n});\n\napp.listen(3000);\n```\n\n**Key topics:** Routing, Middleware, Authentication (JWT), Error handling, Database integration\n\nExplore the **Backend Roadmap** on Routiq! 🚀",
  },
  {
    keywords: ['docker', 'container', 'kubernetes', 'k8s', 'devops', 'deploy', 'ci/cd'],
    response: "DevOps is all about automating the software lifecycle! 🐳\n\n```dockerfile\n# Simple Dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]\n```\n\n**DevOps roadmap:**\n1. Linux & Terminal basics\n2. Git & CI/CD (GitHub Actions)\n3. Docker & Docker Compose\n4. Kubernetes fundamentals\n5. Cloud (AWS/GCP/Azure)\n6. Monitoring (Prometheus, Grafana)\n\nCheck the **DevOps Roadmap** on Routiq for the full path! ⚙️",
  },
  {
    keywords: ['machine learning', 'ml', 'ai', 'deep learning', 'neural network', 'tensorflow', 'pytorch', 'data science'],
    response: "Machine Learning is a fascinating field! 🤖\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX_train, X_test, y_train, y_test = train_test_split(X, y)\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\naccuracy = model.score(X_test, y_test)\n```\n\n**Learning path:**\n1. Python + NumPy/Pandas\n2. Statistics & Linear Algebra\n3. Classical ML (Scikit-learn)\n4. Deep Learning (PyTorch/TensorFlow)\n5. Specialized areas (NLP, Computer Vision)\n\nCheck out the **ML Roadmap** on Routiq! 🧠",
  },
  {
    keywords: ['blockchain', 'solidity', 'smart contract', 'web3', 'ethereum', 'crypto', 'nft', 'defi'],
    response: "Blockchain development is an exciting frontier! ⛓️\n\n```solidity\n// Simple Smart Contract\npragma solidity ^0.8.0;\n\ncontract SimpleStorage {\n    uint256 private value;\n    \n    function set(uint256 _value) public {\n        value = _value;\n    }\n    \n    function get() public view returns (uint256) {\n        return value;\n    }\n}\n```\n\n**Path:** Cryptography basics → Blockchain concepts → Solidity → Web3.js/Ethers.js → DeFi/NFTs\n\nExplore the **Blockchain Roadmap** on Routiq! 🔗",
  },
  {
    keywords: ['typescript', 'ts', 'type', 'interface', 'generic'],
    response: "TypeScript makes JavaScript more reliable! 💎\n\n```typescript\n// Interfaces\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  role: 'admin' | 'user';\n}\n\n// Generics\nfunction getFirst<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\n// Type narrowing\nfunction greet(input: string | string[]) {\n  if (Array.isArray(input)) {\n    return input.join(', ');\n  }\n  return input;\n}\n```\n\n**Why TypeScript?** Catch bugs at compile time, better IDE support, self-documenting code, and it's used by nearly all major companies! 🏢",
  },
  {
    keywords: ['next', 'nextjs', 'next.js', 'ssr', 'server component', 'app router'],
    response: "Next.js is the React framework for production! 🚀\n\n```tsx\n// app/page.tsx (App Router)\nexport default async function Home() {\n  const data = await fetch('https://api.example.com/posts');\n  const posts = await data.json();\n\n  return (\n    <main>\n      {posts.map(post => (\n        <article key={post.id}>\n          <h2>{post.title}</h2>\n        </article>\n      ))}\n    </main>\n  );\n}\n```\n\n**Key features:** Server Components, App Router, API Routes, SSR/SSG, Image Optimization, Middleware\n\nIt's covered in the **Full Stack Roadmap** on Routiq! 📦",
  },
  {
    keywords: ['interview', 'job', 'resume', 'portfolio', 'career', 'hire', 'salary'],
    response: "Great question about career prep! 💼\n\n**To land a developer job:**\n\n1. **Build projects** — 3-5 polished projects on GitHub\n2. **Portfolio website** — Showcase your best work\n3. **Resume tips** — Keep it 1 page, focus on impact (\"Improved load time by 40%\")\n4. **Interview prep:**\n   - Data structures & algorithms (LeetCode)\n   - System design basics\n   - Behavioral questions (STAR method)\n5. **Network** — LinkedIn, Twitter, dev communities\n\n**Timeline:** With focused effort, 3-6 months of prep alongside building projects.\n\nRoutiq's roadmaps help structure your learning perfectly for this! 🎯",
  },
  {
    keywords: ['project', 'idea', 'build', 'practice', 'portfolio project'],
    response: "Here are project ideas sorted by difficulty! 🛠️\n\n**Beginner:**\n- Todo App with local storage\n- Weather app using a public API\n- Personal portfolio website\n\n**Intermediate:**\n- Blog with authentication (Next.js + MongoDB)\n- E-commerce store with cart & checkout\n- Real-time chat app (Socket.io)\n\n**Advanced:**\n- Full social media platform\n- AI-powered code reviewer\n- Decentralized voting DApp\n\n💡 **Pro tip:** Pick projects that solve a real problem YOU have. That passion shows in interviews and makes development more fun!",
  },
  {
    keywords: ['dsa', 'data structure', 'algorithm', 'leetcode', 'array', 'linked list', 'tree', 'sorting'],
    response: "Data Structures & Algorithms — the key to cracking interviews! 🧮\n\n**Essential data structures:**\n- Arrays & Strings\n- Hash Maps / Sets\n- Stacks & Queues\n- Linked Lists\n- Trees & Graphs\n\n**Must-know algorithms:**\n- Binary Search\n- Two Pointers / Sliding Window\n- BFS & DFS\n- Dynamic Programming\n- Sorting (Quick, Merge)\n\n**Practice plan:**\n1. Start with Easy problems on LeetCode\n2. Do 2-3 problems daily\n3. Learn patterns, not solutions\n4. Review and re-solve after a week\n\nConsistency beats grinding! 💪",
  },
  {
    keywords: ['auth', 'authentication', 'jwt', 'oauth', 'login', 'password', 'session', 'security'],
    response: "Authentication is crucial for any app! 🔐\n\n```javascript\n// JWT example\nconst jwt = require('jsonwebtoken');\n\n// Generate token\nconst token = jwt.sign(\n  { userId: user.id, role: user.role },\n  process.env.JWT_SECRET,\n  { expiresIn: '7d' }\n);\n\n// Verify token (middleware)\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```\n\n**Auth methods:**\n- **Session-based** — Server stores session, cookie on client\n- **JWT** — Stateless tokens, great for APIs\n- **OAuth 2.0** — \"Login with Google/GitHub\"\n- **Passwordless** — Magic links, OTP\n\nAlways hash passwords with **bcrypt** and use HTTPS! 🛡️",
  },
];

const findBestFallback = (input: string): string | null => {
  const lower = input.toLowerCase().replace(/[?!.,]/g, '');
  let bestMatch: FallbackEntry | null = null;
  let bestScore = 0;

  for (const entry of FALLBACK_ENTRIES) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length; // longer keyword matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch && bestScore > 0 ? bestMatch.response : null;
};

const GENERIC_RESPONSES = [
  (topic: string) => `That's a great topic! 🎯 Here's how I'd approach **${topic}**:\n\n1. **Understand the fundamentals** — Read official docs and watch beginner tutorials\n2. **Build something small** — Apply what you learn immediately with a mini project\n3. **Explore deeper** — Dive into advanced concepts once the basics click\n4. **Join the community** — Ask questions on StackOverflow, Reddit, or Discord\n\nWant me to suggest a specific **Routiq Roadmap** related to this? Just ask! 🗺️`,
  (topic: string) => `Interesting question about **${topic}**! 🤔\n\nHere's a structured approach:\n\n- **Start with "why"** — Understand when and where this is used in real projects\n- **Follow a roadmap** — Routiq has step-by-step guides that cover this area\n- **Practice hands-on** — Theory alone won't stick; build projects as you go\n- **Review regularly** — Spaced repetition helps long-term retention\n\n📚 Explore our roadmaps for a detailed learning path. Would you like me to explain any specific concept?`,
  (topic: string) => `Let me help you with **${topic}**! 💡\n\nThe best way to learn any technical topic:\n\n1. **Watch a crash course** — YouTube has great free tutorials (check our Best Practices page!)\n2. **Read the documentation** — Official docs are always the most accurate source\n3. **Code along** — Don't just watch, type the code yourself\n4. **Build a project** — Apply your knowledge to something real\n5. **Teach someone else** — Explaining solidifies your understanding\n\nWant me to dive into specifics? Feel free to ask follow-up questions! 🚀`,
  (topic: string) => `Great curiosity about **${topic}**! 🌟\n\nHere's what I recommend:\n\n- **Don't skip the basics** — Strong fundamentals make advanced topics much easier\n- **Learn by doing** — Aim for 70% practice, 30% theory\n- **Use multiple resources** — Docs, videos, articles, and interactive exercises\n- **Track your progress** — Use the Routiq roadmaps to check off topics as you master them\n\nWhich specific aspect would you like to explore first? I can provide more targeted guidance! 🎓`,
];

const SYSTEM_PROMPT = `You are Routiq AI Tutor — a dedicated guide exclusively for the Routiq platform. 
Your ONLY role is to help users navigate the Routiq roadmaps, explain how to use the Routiq platform, and discuss the specific topics listed within our roadmaps (Frontend, Backend, DevOps, etc.).

STRICT BOUNDARIES:
- DO NOT answer general knowledge questions outside of software development.
- DO NOT provide assistance with homework, general coding bugs not related to a roadmap topic, or write full programs for the user.
- If a user asks something outside the scope of the Routiq platform or roadmaps, politely decline and steer them back to exploring the roadmaps. 
  Example: "I am specifically designed to help you navigate the Routiq roadmaps and platform. I can't answer that, but I'd be happy to guide you through our Frontend or Backend roadmaps!"

Guidelines:
- Keep responses concise but informative.
- Be encouraging and supportive.
- Always tie topics back to how the user can track them on the Routiq platform.`;

const SUGGESTED_QUESTIONS = [
  "How do I use the Routiq roadmaps?",
  "What is the best roadmap for a beginner?",
  "How do I track my progress on Routiq?",
  "Tell me about the Frontend roadmap.",
];

export function AiTutorChat({ isOpen, onClose }: AiTutorChatProps) {
  const { user } = useAuth();
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
      // FAST PATH: show an immediate quick/fallback reply to improve perceived latency
      const pendingId = `pending-${Date.now()}`;
      const quickFallback = findBestFallback(content) || (() => {
        const topicText = content.trim().length > 60 ? content.trim().slice(0, 60) + '…' : content.trim();
        const randomIndex = Math.floor(Math.random() * GENERIC_RESPONSES.length);
        return GENERIC_RESPONSES[randomIndex](topicText);
      })();

      setMessages((prev) => [
        ...prev,
        {
          id: pendingId,
          role: 'assistant',
          content: quickFallback,
          timestamp: new Date(),
        },
      ]);

      let aiText = '';
      let ollamaStreamed = false;

      // Priority 1: Try Ollama (local LLM)
      try {
        const allMessages = [...messages, userMessage];
        const ollamaMessages = [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...allMessages
            .filter((m) => !m.id.startsWith('welcome'))
            .map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
        ];

        const ollamaResponse = await fetch(OLLAMA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: ollamaMessages,
            stream: true,
            options: {
              temperature: 0.7,
              num_predict: 1024,
            },
          }),
        });

          if (ollamaResponse.ok && ollamaResponse.body) {
          const reader = ollamaResponse.body.getReader();
          const decoder = new TextDecoder();
          const messageId = pendingId; // reuse the provisional message id so we update it in-place

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  aiText += parsed.message.content;
                  setMessages((prev) => 
                    prev.map((msg) => 
                      msg.id === messageId 
                        ? { ...msg, content: aiText } 
                        : msg
                    )
                  );
                }
              } catch (e) {
                // ignore partial JSON parse errors
              }
            }
          }
          ollamaStreamed = true;
        }
      } catch {
        // Ollama not available, try next
      }

      // Priority 2: Try Gemini API if Ollama didn't respond
      if (!ollamaStreamed && !aiText && GEMINI_API_KEY) {
        try {
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
            // update the provisional message with the Gemini output
            setMessages((prev) =>
              prev.map((m) => (m.id === pendingId ? { ...m, content: aiText } : m))
            );
          }
        } catch {
          // Gemini API failed
        }
      }

      // Priority 3: Fallback to local keyword responses
      if (!ollamaStreamed && !aiText) {
        const matched = findBestFallback(content);

        if (matched) {
          aiText = matched;
        } else {
          const topicText = content.trim().length > 60 ? content.trim().slice(0, 60) + '…' : content.trim();
          const randomIndex = Math.floor(Math.random() * GENERIC_RESPONSES.length);
          aiText = GENERIC_RESPONSES[randomIndex](topicText);
        }
        await new Promise((r) => setTimeout(r, 800));
      }

      // If Ollama streaming was not used, replace the provisional message with the final text
      if (!ollamaStreamed) {
        setMessages((prev) =>
          prev.map((m) => (m.id === pendingId ? { ...m, content: aiText } : m))
        );
      }
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
            className="bg-black/40 border border-border rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-[#8bc34a]"
          >
            <code>{codeContent.trim()}</code>
          </pre>
        );
      }
      // Bold
      const formatted = part.split(/(\*\*.*?\*\*)/g).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return (
            <strong key={j} className="text-foreground font-semibold">
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
                className="bg-accent text-[#8bc34a] px-1.5 py-0.5 rounded text-xs font-mono"
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

          {/* Login Gate */}
          {!user ? (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[460px] z-[101] flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(165deg, rgba(15,15,15,0.98) 0%, rgba(20,25,15,0.98) 50%, rgba(15,15,15,0.98) 100%)',
                borderLeft: '1px solid rgba(139, 195, 74, 0.15)',
              }}
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8bc34a]/20 to-[#689f38]/20 border border-[#8bc34a]/20 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-[#8bc34a]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Sign in Required</h3>
                <p className="text-muted-foreground text-sm mb-6">Please sign in to access the AI Tutor and get personalized programming help.</p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8bc34a] text-black font-bold text-sm hover:bg-[#9ccc65] transition-colors shadow-lg shadow-[#8bc34a]/20"
                >
                  Sign In to Continue
                </a>
              </div>
            </motion.div>
          ) : (
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8bc34a] to-[#689f38] flex items-center justify-center shadow-lg shadow-[#8bc34a]/20">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#8bc34a] rounded-full border-2 border-[#0f0f0f]" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm flex items-center gap-1.5">
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
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
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
                          : 'bg-accent border border-border'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="w-3.5 h-3.5 text-[#8bc34a]" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-[#8bc34a] text-black rounded-tr-md'
                          : 'bg-white/[0.06] text-gray-200 rounded-tl-md border border-border/50'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {formatMessage(message.content)}
                      </div>
                      <div
                        className={`text-[10px] mt-1.5 ${
                          message.role === 'user'
                            ? 'text-black/40'
                            : 'text-foreground/20'
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
                  <div className="bg-white/[0.06] border border-border/50 rounded-2xl rounded-tl-md px-4 py-3">
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
                      className="text-xs px-3 py-1.5 rounded-full border border-[#8bc34a]/20 text-muted-foreground hover:text-[#8bc34a] hover:border-[#8bc34a]/40 hover:bg-[#8bc34a]/5 transition-all duration-200"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end gap-2 bg-white/[0.04] border border-border rounded-xl px-3 py-2 focus-within:border-[#8bc34a]/30 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about programming..."
                  rows={1}
                  className="flex-1 bg-transparent text-foreground text-sm placeholder:text-gray-500 resize-none outline-none max-h-24 py-1"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    input.trim() && !isLoading
                      ? 'bg-[#8bc34a] text-black hover:bg-[#9ccc65] shadow-lg shadow-[#8bc34a]/20'
                      : 'bg-muted text-gray-600 cursor-not-allowed'
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
                Routiq AI Tutor • Powered by Qwen 2.5 Coder (Ollama)
              </p>
            </div>
          </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
