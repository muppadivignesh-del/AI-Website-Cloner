import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { AnalysisResult } from './analyzer';
import { fallbackModifyCode } from './modifier-fallback';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Please add it to .env.local');
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface GenerationResult {
  files: Record<string, string>;
  componentList: string[];
  error?: string;
}

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-pro-latest',
  'gemini-2.5-flash',
].filter(Boolean) as string[];

async function callGemini(
  prompt: string,
  imagePart?: { inlineData: { data: string; mimeType: 'image/jpeg' } },
  options?: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const genAI = getGeminiClient();
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
          maxOutputTokens: options?.maxOutputTokens ?? 8192,
          temperature: options?.temperature ?? 0.3,
        },
      });

      const parts = imagePart ? [prompt, imagePart] : [prompt];
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${modelName} failed:`, err?.message?.slice(0, 120));
      // If project has been denied access or 403, all models will fail; break immediately
      if (err?.status === 403 || err?.message?.includes('403') || err?.message?.includes('denied') || err?.message?.includes('PERMISSION_DENIED')) {
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini candidate models failed');
}

export async function generateWebsite(analysis: AnalysisResult): Promise<GenerationResult> {
  const analysisDescription = `
WEBSITE ANALYSIS:
- URL: ${analysis.url}
- Title: ${analysis.title}
- Description: ${analysis.metadata.description}
- Navigation Items: ${analysis.navItems.join(', ')}
- Detected Sections: ${analysis.sections.map(s => `${s.type} (${s.tag})`).join(', ')}
- Primary Fonts: ${analysis.fonts.join(', ')}
- Key Section Content:
${analysis.sections.slice(0, 8).map(s => `  - [${s.type}]: "${s.text.slice(0, 200)}"`).join('\n')}
`;

  const prompt = `You are an expert React/Next.js developer. Your task is to recreate a website's frontend based on a screenshot and analysis data.

WEBSITE ANALYSIS:
${analysisDescription}

CRITICAL RULES:
1. Generate COMPLETE, WORKING React/Next.js TypeScript code using Tailwind CSS
2. Create a single complete page component with ALL sections from the screenshot
3. Use only inline Tailwind classes (no custom CSS files needed)  
4. Make it fully responsive (mobile-first with sm: md: lg: breakpoints)
5. Use semantic HTML5 elements
6. Include ALL sections visible in the screenshot
7. Use realistic placeholder content that matches the original site's theme and content
8. For images, use: https://picsum.photos/seed/[any-word]/[width]/[height] for random beautiful images
9. DO NOT import any external libraries - use only React and Tailwind
10. The default export function must be named 'ClonedPage'
11. Add 'use client'; at the top if you use any hooks/interactivity
12. Make it visually stunning and accurate to the original

Look at the screenshot carefully and recreate ALL visible sections including navbar, hero, features, any content sections, and footer.

OUTPUT FORMAT: Return ONLY a valid JSON object (no markdown, no code blocks, just pure JSON):
{
  "files": {
    "app/cloned/page.tsx": "// full TypeScript React code here - must be escaped JSON string"
  },
  "componentList": ["Navbar", "Hero", "Features", "Footer"]
}`;

  try {
    // Build the message with image
    const imagePart = {
      inlineData: {
        data: analysis.screenshot,
        mimeType: 'image/jpeg' as const,
      },
    };

    const text = await callGemini(prompt, imagePart, { temperature: 0.4 });

    // Try to extract JSON
    let parsed: GenerationResult;
    try {
      // Try direct parse first
      parsed = JSON.parse(text) as GenerationResult;
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      parsed = JSON.parse(jsonMatch[0]) as GenerationResult;
    }

    return parsed;
  } catch (error) {
    console.error('Generation error, using fallback component:', error);
    return {
      files: {
        'app/cloned/page.tsx': generateFallbackComponent(analysis),
      },
      componentList: ['Navbar', 'Hero', 'Features', 'Footer'],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function generateFallbackComponent(analysis: AnalysisResult): string {
  const navItems = analysis.navItems.length > 0
    ? analysis.navItems
    : ['Home', 'About', 'Services', 'Contact'];

  const siteTitle = analysis.title.slice(0, 30) || 'Brand';
  const description = analysis.metadata.description || 'Discover amazing features and services that will transform your experience.';
  
  // Extract color hints from analysis
  const primaryColor = 'blue';

  return `'use client';

import { useState } from 'react';

export default function ClonedPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white font-sans w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex-shrink-0 flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-${primaryColor}-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">${siteTitle.slice(0, 1).toUpperCase()}</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-xs">${siteTitle}</span>
            </div>
            <div className="hidden lg:flex items-center space-x-6 overflow-hidden">
              ${navItems.slice(0, 6).map(item => `<a href="#" className="text-gray-600 hover:text-${primaryColor}-600 text-sm font-medium transition-colors whitespace-nowrap">${item}</a>`).join('\n              ')}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block">Sign in</a>
              <a href="#" className="bg-${primaryColor}-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-${primaryColor}-700 transition-colors shrink-0">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-${primaryColor}-50 via-white to-indigo-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-${primaryColor}-50 text-${primaryColor}-700 border border-${primaryColor}-200 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-${primaryColor}-500 rounded-full animate-pulse" />
              New — Now Available
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              ${siteTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              ${description.slice(0, 150)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="bg-${primaryColor}-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-${primaryColor}-700 transition-all transform hover:scale-105 shadow-lg shadow-${primaryColor}-200">
                Get Started Free →
              </a>
              <a href="#" className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-400">No credit card required · Free 14-day trial</p>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 bg-gray-200 rounded-md h-5 ml-4" />
              </div>
              <img src="https://picsum.photos/seed/dashboard/1200/600" alt="App preview" className="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale">
            {['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix'].map(co => (
              <span key={co} className="text-xl font-bold text-gray-400">{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Powerful features built for modern teams and businesses of all sizes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', color: 'yellow', title: 'Lightning Fast', desc: 'Optimized for peak performance with blazing fast response times and minimal latency.' },
              { icon: '🔒', color: '${primaryColor}', title: 'Secure & Reliable', desc: 'Enterprise-grade security with SOC 2 compliance, keeping your data protected at all times.' },
              { icon: '🤝', color: 'green', title: 'Team Collaboration', desc: 'Real-time collaboration tools that keep your entire team aligned and productive.' },
              { icon: '📊', color: 'purple', title: 'Advanced Analytics', desc: 'Deep insights and reporting tools to help you make smarter business decisions.' },
              { icon: '🔧', color: 'orange', title: 'Easy Integration', desc: 'Connect with 200+ tools including Slack, GitHub, Jira, and everything your team already uses.' },
              { icon: '🌍', color: 'cyan', title: 'Global Scale', desc: 'Infrastructure that scales with you, from startup to enterprise, across all geographies.' },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-${primaryColor}-200 hover:shadow-xl hover:shadow-${primaryColor}-50 transition-all duration-300">
                <div className="w-12 h-12 bg-${primaryColor}-50 rounded-xl flex items-center justify-center mb-5 text-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by thousands</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-2xl">★</span>)}
            </div>
            <p className="text-gray-500">4.9/5 from over 10,000+ reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah K.', role: 'CTO at TechCorp', text: 'This has completely transformed how our team works. The ROI was immediately apparent. Absolutely essential tool.' },
              { name: 'Michael R.', role: 'Product Lead', text: 'I have tried dozens of similar tools and nothing comes close. The interface is incredible and the features are exactly what we needed.' },
              { name: 'Emma L.', role: 'Startup Founder', text: 'From day one it just worked. The onboarding was smooth and support team is exceptional. Highly recommend!' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={\`https://picsum.photos/seed/\${t.name}/40/40\`} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-xl">Choose the plan that works best for your team.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 'Free', desc: 'Perfect for individuals', features: ['Up to 3 projects', 'Basic analytics', 'Email support', '2GB storage'] },
              { name: 'Pro', price: '$29/mo', desc: 'Best for small teams', featured: true, features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '50GB storage', 'Team collaboration', 'API access'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Audit logs'] },
            ].map((plan, i) => (
              <div key={i} className={\`p-8 rounded-2xl border-2 transition-all \${plan.featured ? 'border-${primaryColor}-500 shadow-xl shadow-${primaryColor}-100 scale-105' : 'border-gray-100 hover:border-gray-200'}\`}>
                {plan.featured && <div className="text-center mb-4"><span className="bg-${primaryColor}-100 text-${primaryColor}-700 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span></div>}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {f}</li>)}
                </ul>
                <a href="#" className={\`block text-center py-3 px-6 rounded-xl font-semibold transition-all \${plan.featured ? 'bg-${primaryColor}-600 text-white hover:bg-${primaryColor}-700' : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'}\`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-${primaryColor}-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-${primaryColor}-100 text-xl mb-10 max-w-2xl mx-auto">Join over 50,000 teams already using ${siteTitle} to build better products faster.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="bg-white text-${primaryColor}-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-${primaryColor}-50 transition-all transform hover:scale-105 shadow-lg">
              Start for free →
            </a>
            <a href="#" className="border-2 border-white/30 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all">
              Talk to sales
            </a>
          </div>
          <p className="mt-6 text-${primaryColor}-200 text-sm">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-${primaryColor}-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">${siteTitle.slice(0, 1).toUpperCase()}</span>
                </div>
                <span className="text-white font-bold text-lg">${siteTitle}</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">${description.slice(0, 100)}</p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                  <a key={s} href="#" className="hover:text-white transition-colors text-sm">{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="hover:text-white transition-colors text-sm">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; 2024 ${siteTitle}. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;
}

export interface ModifyResult {
  code: string;
  changed: boolean;
  source: 'gemini' | 'fallback';
  warning?: string;
}

export async function modifyWebsite(
  currentCode: string,
  instruction: string,
  url: string
): Promise<ModifyResult> {
  const prompt = `You are an expert React/Next.js developer. Modify the following React component code based on the user instruction.

RULES:
1. Return ONLY the complete modified TypeScript/React code (no markdown, no code blocks, just the raw code)
2. Keep ALL existing functionality unless explicitly asked to remove something
3. Maintain the same overall structure and style
4. Use Tailwind CSS for all styling
5. The code must be complete and self-contained
6. Keep the default export function name the same (ClonedPage)
7. Add 'use client'; at the top if you add hooks

User instruction: "${instruction}"

Current code:
${currentCode}

Return ONLY the complete modified code:`;

  try {
    const text = await callGemini(prompt, undefined, { temperature: 0.3 });
    let code = text;

    // Remove markdown code blocks if present
    const codeMatch = code.match(/```(?:tsx?|jsx?|typescript|javascript)?\n?([\s\S]+?)\n?```/);
    if (codeMatch) {
      code = codeMatch[1];
    }

    if (!code || code.trim().length < 50) {
      throw new Error('Empty response from AI');
    }

    const changed = code.trim() !== currentCode.trim();
    return {
      code,
      changed,
      source: 'gemini',
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Gemini API call failed';
    console.warn('Gemini API call failed for modifyWebsite, executing with fallback modifier engine:', errMessage);

    // Guarantees user changes succeed via smart fallback engine
    const fallbackCode = fallbackModifyCode(currentCode, instruction);
    const changed = fallbackCode.trim() !== currentCode.trim();

    return {
      code: fallbackCode,
      changed,
      source: 'fallback',
      warning: changed
        ? `Applied via Smart Modifier Engine.`
        : `Could not modify for: "${instruction}". If you have a Gemini API key, please verify it in Settings or try instructions like: "Change primary color to purple", "Add a contact form", "Change title to My App", "Add a pricing section", etc.`,
    };
  }
}

export async function fixCodeErrors(code: string, errors: string): Promise<string> {
  const prompt = `Fix the following React/Next.js TypeScript code that has errors.

RULES:
1. Fix ALL the reported errors
2. Return ONLY the complete fixed code (no markdown, just the code)
3. Keep all the original functionality
4. Use Tailwind CSS only, no external library imports except React

Errors:
${errors}

Code to fix:
${code}

Return ONLY the fixed code:`;

  try {
    const text = await callGemini(prompt, undefined, { temperature: 0.1 });
    let code = text;
    const codeMatch = code.match(/```(?:tsx?|jsx?|typescript|javascript)?\n?([\s\S]+?)\n?```/);
    if (codeMatch) code = codeMatch[1];
    return code;
  } catch (error) {
    console.warn('Fix error with Gemini failed:', error);
    return code;
  }
}
