# 🤖 WebCloner AI — AI-Powered Frontend Website Cloner

> An AI agent that takes any public website URL and automatically recreates its frontend UI in React/Next.js, with natural language modification support.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+
- **Anthropic API Key** ([get one here](https://console.anthropic.com/))

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd website_cloner
npm install
```

### 2. Configure API Key
```bash
# Edit .env.local and add your key:
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```

### 3. Install Puppeteer Browser
```bash
npx puppeteer browsers install chrome
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

```
URL Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    WebCloner AI Agent                     │
│                                                           │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │  Analyzer   │───▶│  Generator   │───▶│  Validator  │  │
│  │ (Puppeteer) │    │   (Claude)   │    │ (File Save) │  │
│  └─────────────┘    └──────────────┘    └─────────────┘  │
│         │                  │                   │          │
│   Screenshot +        React/Next.js        Writes to     │
│   DOM Extract         TypeScript Code      filesystem     │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Next.js Preview (iframe)               │  │
│  │        Serves /cloned route dynamically             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │             AI Modifier (Claude)                     │ │
│  │   Natural language → code modifications → preview   │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **URL Input** → User provides any public website URL
2. **Analysis** (`/api/analyze`) → Puppeteer launches headless Chrome:
   - Takes a 1440×900 screenshot
   - Extracts DOM structure, colors, fonts
   - Identifies sections (hero, nav, features, footer, etc.)
   - Reads navigation items and metadata
3. **Generation** (`/api/generate`) → Sends to Claude claude-opus-4-5:
   - Screenshot (vision analysis)
   - Structured DOM analysis
   - Returns complete React/TypeScript component
4. **Saving** (`/api/save`) → Writes to `app/cloned/page.tsx`
5. **Preview** → Next.js serves the generated page at `/cloned` in an iframe
6. **Modification** (`/api/modify`) → User types natural language instruction → Claude modifies the code → saved and previewed

---

## 📁 Project Structure

```
website_cloner/
├── app/
│   ├── page.tsx                 # Main agent UI
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── cloned/
│   │   └── page.tsx             # Generated website (auto-updated)
│   └── api/
│       ├── analyze/route.ts     # Puppeteer website analysis
│       ├── generate/route.ts    # Claude code generation
│       ├── modify/route.ts      # Natural language modification
│       ├── save/route.ts        # Code persistence
│       └── validate/route.ts    # Error auto-fixing
├── lib/
│   ├── analyzer.ts              # Website analyzer logic
│   └── generator.ts             # AI generation & modification
├── types/
│   └── declarations.d.ts        # TypeScript declarations
├── .env.local                   # API keys (not committed)
└── next.config.ts               # Next.js configuration
```

---

## 🛠️ Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | Full-stack React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **Puppeteer** | Headless browser for website analysis |
| **Claude claude-opus-4-5** | Vision + code generation |
| **Anthropic SDK** | Claude API client |
| **Cheerio** | HTML parsing |

---

## 🤖 AI Model

- **Model**: Claude claude-opus-4-5 (claude-opus-4-5)
- **Capabilities used**: Vision (screenshot analysis) + Code generation
- **Max tokens**: 8192 per generation
- **Modification**: Same model for natural language edits

---

## 💬 Natural Language Modification Examples

After cloning a website, try:
- `"Change the primary color to blue"`
- `"Add a testimonials section"`
- `"Make the navbar sticky"`
- `"Replace the hero with a dark theme"`
- `"Add smooth scroll animations"`
- `"Remove the pricing section"`
- `"Add a contact form"`
- `"Make the footer more detailed"`

---

## ⚙️ Key Implementation Decisions

### Why Puppeteer over `fetch`?
- Handles JavaScript-rendered content (SPAs, React apps)
- Takes actual screenshots for AI vision analysis
- Extracts computed CSS (actual colors, not just raw HTML)
- More accurate DOM analysis

### Why Claude claude-opus-4-5?
- Best-in-class vision understanding for layout analysis
- Large context window for complete component generation
- Excellent at following structural constraints
- High code quality output

### Why write to filesystem instead of a database?
- Next.js hot-reload immediately shows changes
- Simpler architecture for local MVP
- The `/cloned` route auto-updates via filesystem writes
- No build step required — dev server picks up changes

### Code Generation Strategy
1. Send screenshot + structured analysis to Claude
2. Claude sees both visual layout AND DOM structure
3. Returns complete, self-contained React component with Tailwind
4. Fallback component generated if AI call fails

### Error Handling
- Puppeteer timeout fallback (30s → 20s with `load` event)
- AI generation errors fall back to a template component
- Code errors can be auto-fixed via `/api/validate`
- API errors shown in UI with descriptive messages

---

## ⚠️ Limitations

1. **Dynamic websites**: Sites with heavy CORS restrictions or auth walls won't load fully
2. **Exact pixel-perfect match**: AI approximates the design, not a 1:1 copy
3. **Complex animations**: CSS animations are simplified or replaced with Tailwind equivalents
4. **Custom fonts**: Some fonts may not be loaded in the generated code
5. **Images**: Original images are replaced with placeholder images
6. **Rate limits**: Anthropic API has rate limits; large pages may hit token limits
7. **Local only**: No deployment — designed for local preview only

---

## 💰 Cost Awareness

- **Per clone**: ~$0.05–0.15 (screenshot analysis + generation, ~4K–8K tokens)
- **Per modification**: ~$0.02–0.05 (text only, smaller context)
- **Cost reduction strategies**:
  - Cache analysis results to avoid re-running Puppeteer
  - Use Claude Haiku for simple modifications
  - Compress screenshots before sending to API
  - Truncate DOM to relevant sections only

---

## 🔮 Future Improvements

- **Multi-page support**: Clone entire site structure
- **Export to ZIP**: Download generated React project
- **Component library**: Auto-identify reusable components
- **Design tokens**: Extract and apply consistent design system
- **Version history**: Track all modifications with undo support
- **Figma export**: Convert to Figma components
- **Better responsive**: Enhanced mobile/tablet breakpoint handling
