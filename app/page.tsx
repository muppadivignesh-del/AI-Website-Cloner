'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Types
interface AnalysisResult {
  url: string;
  screenshot: string;
  html: string;
  title: string;
  colors: string[];
  fonts: string[];
  sections: Array<{
    type: string;
    text: string;
    tag: string;
    hasImage: boolean;
    hasButton: boolean;
    className: string;
  }>;
  navItems: string[];
  metadata: {
    description: string;
    ogImage: string;
    themeColor: string;
    viewport: string;
  };
}

type Step = 'idle' | 'analyzing' | 'generating' | 'saving' | 'done' | 'error';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STEP_LABELS: Record<Step, string> = {
  idle: '',
  analyzing: '🔍 Analyzing website with headless browser...',
  generating: '🤖 AI generating React frontend...',
  saving: '💾 Saving & compiling...',
  done: '✅ Complete!',
  error: '❌ Error occurred',
};

const EXAMPLE_PROMPTS = [
  'Change the primary color to emerald',
  'Add a contact form',
  'Add a testimonials section',
  'Change title to "Next-Gen AI Platform"',
  'Change button text to "Get Started Today"',
  'Add a dark mode toggle button',
  'Add a pricing section',
  'Make the navbar sticky and add a shadow',
  'Replace the hero with a bakery theme',
  'Add an FAQ section',
  'Add newsletter section',
  'Remove the pricing section',
  'Add smooth scroll animations',
];

// ─── API Key Setup Screen ────────────────────────────────────────────────────
function APIKeySetup({ onKeySet, onCancel }: { onKeySet: () => void; onCancel?: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKey(text.trim());
        setError('');
      }
    } catch {
      const input = document.getElementById('api-key-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    }
  };

  const handleSave = async () => {
    let cleanKey = apiKey.trim();
    if (!cleanKey) return;

    if (cleanKey.includes('=')) {
      cleanKey = cleanKey.split('=')[1].trim();
    }
    cleanKey = cleanKey.replace(/^["']|["']$/g, '').trim();

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Failed to save');
      onKeySet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-purple-900/50 mx-auto mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-white">WebCloner AI</h1>
          <p className="text-white/40 mt-2 text-sm">Setup required to get started</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-emerald-400 font-semibold text-sm">Free API Available</p>
              <p className="text-emerald-300/70 text-xs">Google Gemini API — No credit card needed</p>
            </div>
          </div>

          <h2 className="text-white font-semibold mb-2">Enter your Gemini API Key</h2>
          <p className="text-white/40 text-sm mb-6">
            Get your free API key from{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline hover:text-violet-300"
            >
              aistudio.google.com/apikey
            </a>
            {' '}— it takes less than 1 minute.
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {[
              { step: '1', text: 'Go to aistudio.google.com/apikey', link: 'https://aistudio.google.com/apikey' },
              { step: '2', text: 'Sign in with your Google account' },
              { step: '3', text: 'Click "Create API key" → Copy it' },
              { step: '4', text: 'Paste it below and click Save' },
            ].map(({ step, text, link }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <span className="text-violet-400 text-xs font-bold">{step}</span>
                </div>
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-400 hover:text-violet-300 underline">
                    {text}
                  </a>
                ) : (
                  <p className="text-sm text-white/60">{text}</p>
                )}
              </div>
            ))}
          </div>

          <div className="relative mb-4 flex gap-2">
            <div className="relative flex-1">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="AIza... (paste your API key here)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Hide key' : 'Show key'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors text-xs"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="px-3.5 py-3 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              📋 Paste
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || saving}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                '⚡ Save & Launch'
              )}
            </button>
          </div>

          <p className="text-white/20 text-xs text-center mt-4">
            Your API key is saved locally in .env.local and never sent to any third party.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'analysis'>('preview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check API key and auto-load existing cloned code on mount
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then((data: { configured: boolean }) => setApiKeyConfigured(data.configured))
      .catch(() => setApiKeyConfigured(false));

    fetch('/api/save')
      .then(r => r.json())
      .then((data: { success: boolean; code?: string }) => {
        if (data.success && data.code) {
          setGeneratedCode(data.code);
          setStep('done');
          setChatMessages([{
            id: 'init-loaded',
            role: 'assistant',
            content: `👋 Cloned website is loaded and ready! You can describe any change below to modify the design, text, buttons, or sections.`,
            timestamp: new Date(),
          }]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleClone = useCallback(async () => {
    if (!url.trim()) return;
    setError('');
    setAnalysis(null);
    setGeneratedCode('');
    setChatMessages([]);

    // Step 1: Analyze
    setStep('analyzing');
    let analysisResult: AnalysisResult;
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as { success: boolean; analysis: AnalysisResult; error?: string };
      if (!data.success) throw new Error(data.error || 'Analysis failed');
      analysisResult = data.analysis;
      setAnalysis(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('error');
      return;
    }

    // Step 2: Generate
    setStep('generating');
    let code: string;
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisResult }),
      });
      const data = await res.json() as { success: boolean; result: { files: Record<string, string>; componentList: string[] }; error?: string };
      if (!data.success) throw new Error(data.error || 'Generation failed');

      const files = data.result.files;
      const pageCode = files['app/cloned/page.tsx'] || Object.values(files)[0] || '';
      code = pageCode;
      setGeneratedCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('error');
      return;
    }

    // Step 3: Save
    setStep('saving');
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Save failed');

      setPreviewKey(k => k + 1);
      setStep('done');
      setActiveTab('preview');

      setChatMessages([{
        id: '1',
        role: 'assistant',
        content: `✨ Website cloned successfully! I've recreated **"${analysisResult.title}"** with ${analysisResult.sections.length} sections detected. You can now use the chat below to modify it with natural language instructions.`,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setStep('error');
    }
  }, [url]);

  const handleModify = useCallback(async (customInstruction?: string | React.MouseEvent | unknown) => {
    const instruction = (typeof customInstruction === 'string' ? customInstruction : chatInput).trim();
    if (!instruction || isModifying) return;

    let codeToModify = generatedCode;
    if (!codeToModify) {
      try {
        const checkRes = await fetch('/api/save');
        const checkData = await checkRes.json() as { success: boolean; code?: string };
        if (checkData.success && checkData.code) {
          codeToModify = checkData.code;
          setGeneratedCode(codeToModify);
          setStep('done');
        }
      } catch {}
    }

    if (!codeToModify) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: `⚠️ Please clone a website first before using the AI modifier.`,
        timestamp: new Date(),
      }]);
      return;
    }

    setChatInput('');
    setIsModifying(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: instruction,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCode: codeToModify, instruction, url }),
      });
      const data = await res.json() as { success: boolean; code: string; error?: string; source?: string; warning?: string };
      if (!data.success) throw new Error(data.error || 'Modification failed');

      const newCode = data.code;
      setGeneratedCode(newCode);

      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode }),
      });
      setPreviewKey(k => k + 1);

      let successMsg = `✅ Applied: *"${instruction}"*. The preview and code have been updated!`;
      if (data.source === 'fallback') {
        successMsg += ` *(Engine: Smart Modifier)*`;
      }

      setChatMessages(prev => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: successMsg,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: `❌ ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsModifying(false);
    }
  }, [chatInput, generatedCode, isModifying, url]);

  const isRunning = ['analyzing', 'generating', 'saving'].includes(step);

  // Show loading while checking API key
  if (apiKeyConfigured === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show API key setup if not configured
  if (!apiKeyConfigured) {
    return (
      <APIKeySetup
        onKeySet={() => setApiKeyConfigured(true)}
        onCancel={generatedCode ? () => setApiKeyConfigured(true) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d0d18]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/50">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                WebCloner AI
              </span>
              <span className="ml-2 text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                Agent
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40 hidden md:block">Powered by Gemini 2.0 Flash</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <button
              onClick={() => setApiKeyConfigured(false)}
              title="Update Gemini API Key"
              className="text-xs text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span>🔑</span>
              <span>Update API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* URL Input Section */}
      <div className="border-b border-white/5 bg-gradient-to-b from-[#0d0d18] to-[#0a0a0f]">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isRunning && handleClone()}
                placeholder="https://stripe.com — Enter any public website URL to clone"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                disabled={isRunning}
              />
            </div>
            <button
              id="clone-button"
              onClick={handleClone}
              disabled={isRunning || !url.trim()}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 min-w-[140px] justify-center ${
                isRunning || !url.trim()
                  ? 'bg-white/5 text-white/25 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Clone Website
                </>
              )}
            </button>
          </div>

          {/* Quick URL examples */}
          {step === 'idle' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-white/25">Try:</span>
              {['https://vercel.com', 'https://linear.app', 'https://planetscale.com', 'https://railway.app'].map(exUrl => (
                <button
                  key={exUrl}
                  onClick={() => setUrl(exUrl)}
                  className="text-xs text-violet-400/60 hover:text-violet-400 transition-colors border border-white/5 hover:border-violet-500/30 rounded-lg px-2 py-1"
                >
                  {exUrl.replace('https://', '')}
                </button>
              ))}
            </div>
          )}

          {/* Progress Steps */}
          {step !== 'idle' && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {(['analyzing', 'generating', 'saving'] as const).map((s, i) => {
                const stepOrder = ['analyzing', 'generating', 'saving'];
                const currentIdx = stepOrder.indexOf(step === 'done' ? 'saving' : step === 'error' ? 'saving' : step);
                const thisIdx = stepOrder.indexOf(s);
                const isDone = step === 'done' || (step !== 'error' && currentIdx > thisIdx);
                const isCurrent = step === s;

                return (
                  <div key={s} className="flex items-center gap-2">
                    {i > 0 && <div className={`h-px w-8 transition-colors ${isDone ? 'bg-violet-500' : 'bg-white/10'}`} />}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isCurrent ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                      isDone ? 'bg-emerald-500/10 text-emerald-400' :
                      'text-white/25'
                    }`}>
                      {isCurrent && <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />}
                      {isDone && <span>✓</span>}
                      {!isCurrent && !isDone && <span className="w-2 h-2 rounded-full bg-white/20" />}
                      <span className="capitalize">{s}</span>
                    </div>
                  </div>
                );
              })}
              {step === 'done' && <span className="text-emerald-400 text-xs font-medium ml-2">✓ All done!</span>}
              {step === 'error' && <span className="text-red-400 text-xs font-medium ml-2">✗ Failed</span>}
            </div>
          )}

          {/* Status message */}
          {isRunning && (
            <div className="mt-2 text-xs text-white/40">
              {STEP_LABELS[step]}
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left: Preview / Code / Analysis Tabs */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
          {/* Tab Bar */}
          <div className="flex gap-1 px-4 py-3 border-b border-white/5 bg-[#0d0d18] items-center">
            {(['preview', 'code', 'analysis'] as const).map(tab => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {tab === 'preview' && '🖥️ '}
                {tab === 'code' && '📄 '}
                {tab === 'analysis' && '🔍 '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {analysis?.screenshot && (
              <button
                onClick={() => setShowScreenshot(s => !s)}
                className={`ml-auto px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showScreenshot
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                📸 {showScreenshot ? 'Show Clone' : 'Original'}
              </button>
            )}
            {step === 'done' && !showScreenshot && (
              <div className="ml-auto flex items-center gap-2">
                <div className="flex border border-white/10 rounded-lg overflow-hidden">
                  {(['desktop', 'tablet', 'mobile'] as const).map(size => (
                    <button key={size} className="px-3 py-1 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                      {size === 'desktop' ? '🖥' : size === 'tablet' ? '📱' : '📲'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Preview */}
            {activeTab === 'preview' && (
              <div className="w-full h-full">
                {step === 'idle' ? (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-700/20 border border-violet-500/20 flex items-center justify-center mb-6">
                      <span className="text-5xl">🌐</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">AI Website Cloner</h2>
                    <p className="text-white/40 max-w-md mb-8 leading-relaxed text-sm">
                      Enter any public website URL above. Our AI agent will screenshot it, analyze the layout, and generate a complete React/Next.js frontend in seconds.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-white/50 max-w-sm">
                      {[
                        { icon: '📸', text: 'Screenshot analysis' },
                        { icon: '🤖', text: 'AI code generation' },
                        { icon: '🖥️', text: 'Live preview' },
                        { icon: '💬', text: 'Chat modifications' },
                      ].map(f => (
                        <div key={f.text} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                          <span>{f.icon}</span> {f.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isRunning ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="w-20 h-20 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                          {step === 'analyzing' ? '🔍' : step === 'generating' ? '🤖' : '💾'}
                        </div>
                      </div>
                      <p className="text-white/70 font-medium">{STEP_LABELS[step]}</p>
                      <p className="text-white/30 text-sm mt-2">
                        {step === 'analyzing' ? 'Taking screenshot and extracting layout...' :
                         step === 'generating' ? 'Gemini AI is analyzing and writing React code...' :
                         'Compiling your new website...'}
                      </p>
                    </div>
                  </div>
                ) : showScreenshot && analysis?.screenshot ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-400 font-medium flex items-center gap-2">
                      <span>📸</span> Original Website Screenshot (what the AI analyzed)
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-900">
                      <img src={`data:image/jpeg;base64,${analysis.screenshot}`} alt="Original" className="w-full" />
                    </div>
                  </div>
                ) : (
                  <iframe
                    key={previewKey}
                    src={`/cloned?t=${previewKey}`}
                    className="w-full h-full border-0"
                    title="Cloned website preview"
                    id="preview-iframe"
                  />
                )}
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="w-full h-full overflow-auto bg-[#0d0d18]">
                {generatedCode ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 bg-white/3 border-b border-white/5 sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span className="text-xs text-white/40 font-mono">app/cloned/page.tsx</span>
                        <span className="text-xs text-white/20">({generatedCode.split('\n').length} lines)</span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedCode)}
                        className="text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5 flex items-center gap-1"
                      >
                        📋 Copy Code
                      </button>
                    </div>
                    <pre className="p-4 text-xs text-green-300/80 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                      {generatedCode}
                    </pre>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/20 text-sm">
                    Generated code will appear here after cloning a website
                  </div>
                )}
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="w-full h-full overflow-auto p-4 space-y-4">
                {analysis ? (
                  <>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-white/80 mb-3">📋 Page Info</h3>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: 'Title', value: analysis.title },
                          { label: 'URL', value: analysis.url, isUrl: true },
                          { label: 'Description', value: analysis.metadata.description || 'N/A' },
                        ].map(({ label, value, isUrl }) => (
                          <div key={label} className="flex gap-3">
                            <span className="text-white/30 min-w-24 shrink-0">{label}:</span>
                            {isUrl ? (
                              <a href={value} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-xs break-all hover:underline">{value}</a>
                            ) : (
                              <span className="text-white/60 text-xs">{value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-white/80 mb-3">🎨 Colors Detected ({analysis.colors.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.colors.slice(0, 16).map((color, i) => (
                          <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1.5">
                            <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs text-white/40 font-mono">{color.slice(0, 22)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-white/80 mb-3">🔤 Fonts ({analysis.fonts.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.fonts.length > 0 ? analysis.fonts.map((font, i) => (
                          <span key={i} className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1 text-xs text-violet-300">{font}</span>
                        )) : <span className="text-white/30 text-xs">No custom fonts detected</span>}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-white/80 mb-3">🧩 Sections Detected ({analysis.sections.length})</h3>
                      <div className="space-y-2">
                        {analysis.sections.map((section, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white/3 rounded-lg p-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize min-w-20 text-center shrink-0 ${
                              section.type === 'header' ? 'bg-blue-500/20 text-blue-400' :
                              section.type === 'hero' ? 'bg-purple-500/20 text-purple-400' :
                              section.type === 'footer' ? 'bg-gray-500/20 text-gray-400' :
                              section.type === 'nav' ? 'bg-cyan-500/20 text-cyan-400' :
                              section.type === 'features' ? 'bg-green-500/20 text-green-400' :
                              section.type === 'pricing' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-pink-500/20 text-pink-400'
                            }`}>
                              {section.type}
                            </span>
                            <p className="text-xs text-white/40 flex-1 line-clamp-2">{section.text.slice(0, 150)}</p>
                            <div className="flex gap-1 shrink-0">
                              {section.hasImage && <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-white/30" title="Has images">🖼</span>}
                              {section.hasButton && <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-white/30" title="Has buttons">🔘</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-white/80 mb-3">🔗 Navigation Items</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.navItems.length > 0 ? analysis.navItems.map((item, i) => (
                          <span key={i} className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1 text-xs text-violet-300">{item}</span>
                        )) : <span className="text-white/30 text-xs">No nav items detected</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/20 text-sm">
                    Analysis results will appear here after cloning a website
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Chat Modifier */}
        <div className="w-80 flex flex-col bg-[#0d0d18] border-l border-white/5 shrink-0">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                AI Modifier
              </h3>
              <p className="text-xs text-white/25 mt-0.5">Modify with natural language</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-white/30 text-xs mb-4 px-2">
                  {step === 'idle' ? 'Clone a website first, then modify it here' :
                   isRunning ? 'Generating your website...' :
                   step === 'done' ? 'Try a modification below!' :
                   'Something went wrong. Try cloning again.'}
                </p>
                {step === 'done' && (
                  <div className="space-y-2">
                    <p className="text-white/20 text-xs mb-2">Example modifications:</p>
                    {EXAMPLE_PROMPTS.slice(0, 5).map(p => (
                      <button
                        key={p}
                        onClick={() => handleModify(p)}
                        className="w-full text-left text-xs bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/20 rounded-lg px-3 py-2 text-white/40 hover:text-violet-300 transition-all cursor-pointer"
                      >
                        &ldquo;{p}&rdquo;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-white/5 text-white/70 border border-white/10 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isModifying && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-xl rounded-bl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-white/30 ml-1">Modifying...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts when chat has messages */}
          {step === 'done' && chatMessages.length > 0 && (
            <div className="px-3 py-2 border-t border-white/5">
              <div className="flex flex-wrap gap-1">
                {EXAMPLE_PROMPTS.slice(0, 6).map(p => (
                  <button
                    key={p}
                    onClick={() => handleModify(p)}
                    disabled={isModifying}
                    className="text-xs bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/20 rounded-lg px-2 py-1 text-white/30 hover:text-violet-300 transition-all disabled:opacity-30 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleModify()}
                placeholder={
                  isModifying
                    ? 'Modifying website...'
                    : generatedCode || step === 'done'
                    ? 'Describe a change to make (e.g. "Add a contact form", "Change primary color to emerald")...'
                    : 'Clone a website first...'
                }
                disabled={(!generatedCode && step !== 'done') || isModifying}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <button
                id="send-button"
                onClick={handleModify}
                disabled={!chatInput.trim() || (!generatedCode && step !== 'done') || isModifying}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
              >
                {isModifying ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}
