# 🤖 WebCloner AI — AI-Powered Frontend Website Cloner

> An autonomous AI agent that takes any public website URL and recreates its frontend UI in React/Next.js, with interactive live preview and natural-language AI modifications.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technologies Used](#-technologies-used)
4. [Architecture & Workflow](#-architecture--workflow)
5. [Installation Steps](#-installation-steps)
6. [Environment & API Key Setup](#-environment--api-key-setup)
7. [How to Run the Project](#-how-to-run-the-project)
8. [How to Clone a Website](#-how-to-clone-a-website)
9. [How to Modify the Generated Website](#-how-to-modify-the-generated-website)
10. [Testing with 3 Real Websites](#-testing-with-3-real-websites)
11. [Project Structure](#-project-structure)
12. [Error Handling & Edge Cases](#-error-handling--edge-cases)

---

## 🌟 Project Overview

**WebCloner AI** is an advanced AI engineering agent designed to analyze, replicate, and dynamically modify real-world websites. Given any public URL:
1. It launches a headless browser to inspect DOM trees, typography, computed color palettes, and responsive layouts.
2. It captures full-resolution screenshots for visual layout comprehension.
3. It generates complete, self-contained, responsive TypeScript/React code styled with Tailwind CSS.
4. It compiles and serves the recreation live in an isolated preview container.
5. It allows users to prompt natural-language modifications (e.g. changing themes, adding contact forms, reordering sections) with instant hot-reloading.

---

## ⚡ Key Features

- **🌐 Any Public URL Cloner**: Analyzes modern SPAs, SSR web apps, and static pages with headless Chromium.
- **📸 Visual & DOM Extraction**: Captures viewport screenshots, semantic section hierarchies (`hero`, `features`, `pricing`, `nav`, `footer`), fonts, and color palettes.
- **🎨 Production React + Tailwind Generation**: Outputs standard TypeScript React components with zero external CSS dependencies.
- **📱 Fully Responsive Design**: Mobile (`375px`), Tablet (`768px`), and Desktop (`1280px+`) viewports guaranteed without horizontal overflow.
- **🪄 Smart AI Modifier Engine**: Instant natural-language code modification powered by LLM models with a deterministic AST/styling fallback engine.
- **🔄 Live Hot-Reloading Preview**: Dynamic iframe preview with cache-busting auto-refresh.
- **🛡️ Robust Error Handling**: Graceful recovery on invalid domains (`ERR_NAME_NOT_RESOLVED`), timeouts, rate-limits, and syntax auto-repair.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **Next.js 16 (Turbopack)** | Full-stack React framework with App Router |
| **React 19 & TypeScript** | Type-safe UI components and agent logic |
| **Tailwind CSS v4** | Modern utility-first styling with responsive breakpoints |
| **Puppeteer (Chromium)** | Headless browser automation, DOM inspection, and screenshot capture |
| **Google Gemini API** | Multimodal vision analysis and AI code generation/modification |
| **Cheerio** | Fast server-side HTML/DOM traversal |
| **Smart Modifier Engine** | Deterministic AST pattern matching and code synthesis |

---

## 🏗️ Architecture & Workflow

```
               [ User Enters Target URL ]
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     WebCloner AI Pipeline                   │
│                                                             │
│  1. Analyzer (src/analyze.ts + lib/analyzer.ts)             │
│     ├── Puppeteer Headless Browser                          │
│     ├── Viewport Screenshot Capture                         │
│     └── DOM Tree, Section & Typography Extraction           │
│                           │                                 │
│                           ▼                                 │
│  2. Generator (src/generate.ts + lib/generator.ts)          │
│     ├── Gemini Multimodal Vision / Claude                   │
│     └── Single-file Responsive React/Tailwind Code          │
│                           │                                 │
│                           ▼                                 │
│  3. Validator (src/validate.ts)                             │
│     ├── Syntax Balance & Export Checks                      │
│     └── Auto-repairs compile issues                         │
│                           │                                 │
│                           ▼                                 │
│  4. Persistence (app/api/save/route.ts)                     │
│     └── Auto-writes to app/cloned/page.tsx                  │
│                           │                                 │
│                           ▼                                 │
│  5. Live Preview (app/page.tsx <iframe src="/cloned">)      │
│     └── Instant cache-busting live rendering                │
│                           │                                 │
│                           ▼                                 │
│  6. AI Modifier (src/modify.ts + lib/modifier-fallback.ts)  │
│     ├── User natural language instructions                  │
│     ├── LLM + Smart Modifier Engine                         │
│     └── Rewrites code and updates preview in real-time      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📥 Installation Steps

### Prerequisites
- **Node.js** v18+ (tested on v20 and v24)
- **npm** v9+
- **Google Gemini API Key** ([Get your free key here](https://aistudio.google.com/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/muppadivignesh-del/AI-Website-Cloner.git
cd AI-Website-Cloner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Puppeteer Chrome Binary
```bash
npx puppeteer browsers install chrome
```

---

## 🔑 Environment & API Key Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and paste your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: You can get a 100% free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). When creating a key, select **"Create API key in a new project"** for immediate activation. You can also paste your API key directly through the **🔑 Update API Key** button in the web application UI.

---

## 🚀 How to Run the Project

Start the local development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🎯 How to Clone a Website

1. Open `http://localhost:3000` in your web browser.
2. In the top URL bar, type or paste any public website address (e.g. `https://example.com` or `https://linear.app`).
3. Click the **Clone Website** button (or press `Enter`).
4. Watch the real-time agent status:
   - `🔍 Analyzing website with headless browser...`
   - `🤖 AI generating React frontend...`
   - `💾 Saving & compiling...`
5. Once complete, the **Live Preview** appears in the main view, with tabs to inspect the generated **Code** and **Analysis** metadata.

---

## ✏️ How to Modify the Generated Website

The built-in **AI Modifier** chat panel on the right allows you to customize the generated website using natural language:

1. Locate the **AI Modifier** sidebar on the right side of the screen.
2. Type an instruction in plain English into the chat box, such as:
   - *"Change the primary color to emerald"*
   - *"Add a contact form"*
   - *"Change title to Next-Gen Platform"*
   - *"Change button text to Buy Now"*
   - *"Add a dark mode toggle button"*
   - *"Add a pricing section"*
   - *"Make the navigation bar sticky"*
   - *"Replace the hero with a bakery theme"*
   - *"Add an FAQ section"*
   - *"Remove the pricing section"*
3. Click the **Send** button (or press `Enter`).
4. The agent updates the code in real-time and refreshes the live preview instantly.

---

## 🧪 Testing with 3 Real Websites

The AI Website Cloner was tested across 3 distinct public websites with different architectures:

| Target URL | Extracted Title | Nav Items Detected | Sections Detected | AI Modifier Instruction Tested | Code Changed? | Preview Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`https://example.com`** | *Example Domain* | 0 (Minimalist structure) | 0 (Single semantic card) | *"Change the main background color to blue."* | **Yes** | `200 OK` |
| **`https://vercel.com`** | *Agentic Infrastructure - Vercel* | 10 Navigation Links | 20 Sections (Hero, Feature grids, Nav) | *"Make the main heading color blue."* | **Yes** | `200 OK` |
| **`https://linear.app`** | *Linear – The system for product development* | 8 Navigation Links | 20 Sections (Feature tiers, Headers, Nav) | *"Make the navigation bar sticky."* | **Yes** | `200 OK` |

### Key Test Takeaways:
1. **Dynamic Generation**: Every URL resulted in distinct analysis trees, navigation counts, and typography tokens rather than static hardcoded templates.
2. **Deterministic Fallback Reliability**: The Smart Modifier Engine ensured that styling, section injections, and typography modifications succeeded reliably even if external cloud APIs faced rate limits or permissions.
3. **Multi-Viewport Compliance**: Tested on Desktop (`1280px`), Tablet (`768px`), and Mobile (`375px`) viewports with zero horizontal overflow.

---

## 📁 Project Structure

```
website_cloner/
├── .env.example                     # Environment template (safe for Git)
├── .gitignore                       # Strict exclusion rules (never commits secrets)
├── README.md                        # Documentation & assignment report
├── package.json                     # Scripts & dependencies
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript compiler configuration
│
├── app/                             # Next.js App Router
│   ├── page.tsx                     # Main user interface & AI Modifier chat
│   ├── layout.tsx                   # Root HTML & body shell
│   ├── globals.css                  # Global Tailwind CSS directives
│   ├── cloned/
│   │   └── page.tsx                 # Auto-updated cloned website preview
│   └── api/
│       ├── analyze/route.ts         # Puppeteer analysis API endpoint
│       ├── generate/route.ts        # AI component generation endpoint
│       ├── modify/route.ts          # Natural language modification endpoint
│       ├── save/route.ts            # Filesystem preview persistence endpoint
│       ├── validate/route.ts        # Error auto-fixing endpoint
│       └── config/route.ts          # API key validation & storage endpoint
│
├── lib/                             # Core Agent Logic
│   ├── analyzer.ts                  # Puppeteer browser navigation & extraction
│   ├── generator.ts                 # React component generation & model pipeline
│   └── modifier-fallback.ts         # Smart Modifier Engine (AST & styling rules)
│
├── src/                             # Modular Architecture (Assignment Specification)
│   ├── agent.ts                     # High-level WebsiteClonerAgent orchestrator
│   ├── analyze.ts                   # Standalone analysis wrapper
│   ├── generate.ts                  # Standalone component generator
│   ├── llm.ts                       # Unified LLM provider client
│   ├── modify.ts                    # Natural language modifier interface
│   ├── server.ts                    # Standalone HTTP server & route handlers
│   └── validate.ts                  # Syntax balance & auto-repair utilities
│
├── public/                          # Static assets & SVG icons
└── types/                           # Global TypeScript declarations
```

---

## 🛡️ Error Handling & Edge Cases

- **Unreachable / Invalid Domains**: Entering an invalid domain like `https://thisisnotarealwebsite12345.com` produces a friendly alert:
  > `"Unable to reach website. The domain does not exist or could not be resolved (ERR_NAME_NOT_RESOLVED). Please verify the URL."`
  The app remains stable and never crashes.
- **Network Timeouts**: Long-loading websites fall back from `networkidle2` to `load` event with graceful timeout recovery.
- **Syntax Validation**: Checks brace balancing and component exports before saving, attempting automated repairs if anomalies are detected.
- **Zero Secret Commits**: [`.gitignore`](.gitignore) is strictly configured to protect `.env`, `.env.local`, API keys, `node_modules`, and build caches from ever reaching version control.
