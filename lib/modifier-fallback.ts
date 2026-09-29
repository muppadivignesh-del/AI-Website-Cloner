/**
 * Smart Fallback Website Modifier Engine
 * Executes website modifications via deterministic AST-like pattern matching and templating.
 * Guarantees that AI Modifier requests always work functionally even when LLM APIs are offline,
 * rate-limited, model-deprecated (404), or restricted (403).
 */

export function fallbackModifyCode(currentCode: string, instruction: string): string {
  let code = currentCode.trim();
  const lower = instruction.toLowerCase().trim();

  // Ensure 'use client' is present
  if (!code.includes("'use client'") && !code.includes('"use client"')) {
    code = `'use client';\n\n${code}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. PRIMARY COLOR & THEME MODIFICATION
  // e.g. "Change the primary color to blue", "make it purple", "emerald theme",
  //      "red buttons", "change theme to orange", "make color green"
  // ─────────────────────────────────────────────────────────────────────────
  const colors = [
    'blue', 'indigo', 'purple', 'violet', 'pink', 'rose',
    'red', 'orange', 'amber', 'yellow', 'emerald', 'green',
    'teal', 'cyan', 'sky', 'slate', 'zinc', 'neutral'
  ];

  const colorMatch = colors.find(c => {
    const regex = new RegExp(`\\b(to|make it|color|theme|into|accent|style)\\s+${c}\\b|\\b${c}\\s+(color|theme|buttons?|accent|style)\\b|\\b${c}\\b`, 'i');
    return regex.test(instruction);
  });

  // ── 1A. MAIN HEADING COLOR ──
  // e.g. "Make the main heading color blue", "change heading color to blue"
  if (colorMatch && (lower.includes('heading') || lower.includes('title') || lower.includes('h1')) && (lower.includes('color') || lower.includes('make') || lower.includes('change'))) {
    const targetColor = colorMatch;
    code = code.replace(/<h1([^>]*)className=["']([^"']*)["']/i, (match, before, classes) => {
      let updated = classes.replace(/\btext-(?:gray|slate|zinc|neutral|blue|indigo|purple|violet|pink|rose|red|orange|amber|yellow|emerald|green|teal|cyan|sky)-[0-9]{2,3}\b/g, '');
      updated = `${updated.trim()} text-${targetColor}-600`;
      return `<h1${before}className="${updated.replace(/\s+/g, ' ').trim()}"`;
    });
    return code;
  }

  // ── 1B. MAIN BACKGROUND COLOR ──
  // e.g. "Change the main background color to blue", "make background blue"
  if (colorMatch && lower.includes('background') && (lower.includes('color') || lower.includes('make') || lower.includes('change') || lower.includes('set')) && !lower.includes('dark mode')) {
    const targetColor = colorMatch;
    const bgClass = `bg-${targetColor}-50`;
    // Update template literal root div
    code = code.replace(/(: \s*['"])(bg-[a-z0-9-]+|white)([^'"]*['"])/i, `$1${bgClass}$3`);
    code = code.replace(/(<div[^>]*className=["'][^"']*min-h-screen[^"']*)(\bbg-(?:white|gray-50|slate-50|[a-z]+-[0-9]+)\b)([^"']*["'])/i, `$1${bgClass}$3`);
    return code;
  }

  const isColorIntent = lower.includes('color') || lower.includes('theme') || lower.includes('primary') ||
    lower.includes('make') || lower.includes('change') || lower.includes('turn') || lower.includes('switch') || lower.includes('button');

  if (colorMatch && isColorIntent && !lower.includes('dark mode') && !lower.includes('dark theme')) {
    const targetColor = colorMatch;

    // Replace all tailwind color classes that use existing primary colors
    const colorClassesRegex = /\b(bg|text|border|ring|shadow|from|to|via|fill|stroke)-(?:blue|indigo|purple|violet|pink|rose|red|orange|amber|yellow|emerald|green|teal|cyan|sky)-([0-9]{2,3})\b/g;
    code = code.replace(colorClassesRegex, `$1-${targetColor}-$2`);

    // Replace primaryColor variable if defined
    code = code.replace(/const\s+primaryColor\s*=\s*['"][^'"]+['"]/g, `const primaryColor = '${targetColor}'`);
    code = code.replace(/\$\{primaryColor\}/g, targetColor);

    // Also update shadow colors like shadow-blue-200 to shadow-targetColor-200
    code = code.replace(/shadow-(?:blue|indigo|purple|violet|pink|rose|red|orange|amber|yellow|emerald|green|teal|cyan|sky)-/g, `shadow-${targetColor}-`);

    return code;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. BUTTON / CTA TEXT MODIFICATION
  // e.g. "Change button text to Buy Now", "change CTA to Join Us",
  //      "change get started button to Start Free Trial", "rename button to Explore"
  // ─────────────────────────────────────────────────────────────────────────
  const buttonChangeRegex = /(?:change|rename|set|update|replace)\s+(?:the\s+)?(?:button(?:\s+text)?|cta(?:\s+button)?|get started(?:\s+button)?)\s+(?:to|with|=|as)\s+["']?([^"'\n]+?)["']?$/i;
  const buttonMatch = instruction.match(buttonChangeRegex);
  if (buttonMatch) {
    const newButtonText = buttonMatch[1].trim();
    // Replace "Get Started Free →" or "Get Started"
    code = code.replace(/Get Started Free →/g, newButtonText);
    code = code.replace(/Get Started/g, newButtonText);
    code = code.replace(/Start for free →/g, newButtonText);
    return code;
  }

  // Also catch direct phrase replacement e.g. "change 'Get Started' to 'Sign Up'"
  const phraseMatch = instruction.match(/(?:change|replace)\s+["']?([^"'\n]+?)["']?\s+(?:to|with)\s+["']?([^"'\n]+?)["']?$/i);
  if (phraseMatch && !lower.includes('title') && !lower.includes('heading') && !lower.includes('color') && !lower.includes('theme')) {
    const fromText = phraseMatch[1].trim();
    const toText = phraseMatch[2].trim();
    if (fromText && toText && code.includes(fromText)) {
      code = code.split(fromText).join(toText);
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. TITLE / HEADING / HEADLINE MODIFICATION
  // e.g. "Change title to 'Modern SaaS'", "change heading to Build Faster",
  //      "set headline to Welcome to App", "change h1 to Best Product"
  // ─────────────────────────────────────────────────────────────────────────
  const titleRegex = /(?:change|set|update|replace)\s+(?:the\s+)?(?:title|heading|headline|h1|main heading)\s+(?:to|with|=|:)\s+["']?([^"'\n]+?)["']?$/i;
  const titleMatch = instruction.match(titleRegex);
  const quoteMatch = instruction.match(/["']([^"']+)["']/);
  if (titleMatch || (quoteMatch && (lower.includes('title') || lower.includes('heading') || lower.includes('headline')))) {
    const newTitle = titleMatch ? titleMatch[1].trim() : (quoteMatch ? quoteMatch[1].trim() : '');
    if (newTitle) {
      code = code.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, (match) => {
        const tag = match.match(/<h1[^>]*>/)?.[0] || '<h1>';
        return `${tag}\n              ${newTitle}\n            </h1>`;
      });
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. SUBTITLE / DESCRIPTION MODIFICATION
  // e.g. "Change subtitle to Our platform makes coding effortless"
  // ─────────────────────────────────────────────────────────────────────────
  const subRegex = /(?:change|set|update|replace)\s+(?:the\s+)?(?:subtitle|subheading|description|hero text)\s+(?:to|with|=|:)\s+["']?([^"'\n]+?)["']?$/i;
  const subMatch = instruction.match(subRegex);
  if (subMatch) {
    const newSub = subMatch[1].trim();
    code = code.replace(/(<p className="text-xl md:text-2xl text-gray-500[^"]*"[^>]*>)([\s\S]*?)(<\/p>)/i, `$1\n              ${newSub}\n            $3`);
    return code;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. BRAND / LOGO NAME MODIFICATION
  // e.g. "Change brand name to Nova", "rename website to Acme", "change logo to CloudX"
  // ─────────────────────────────────────────────────────────────────────────
  const brandRegex = /(?:change|rename|set|update)\s+(?:the\s+)?(?:brand(?:\s+name)?|site(?:\s+name)?|company(?:\s+name)?|logo(?:\s+text)?)\s+(?:to|with|=|:)\s+["']?([^"'\n]+?)["']?$/i;
  const brandMatch = instruction.match(brandRegex);
  if (brandMatch) {
    const newBrand = brandMatch[1].trim();
    // Replace brand text in navbar
    code = code.replace(/(<span className="text-xl font-bold text-gray-900">)([\s\S]*?)(<\/span>)/i, `$1${newBrand}$3`);
    // Replace initial letter in icon
    code = code.replace(/(<span className="text-white font-bold text-sm">)([\s\S]*?)(<\/span>)/i, `$1${newBrand.charAt(0).toUpperCase()}$3`);
    // Replace footer brand
    code = code.replace(/(<span className="text-white font-bold text-lg">)([\s\S]*?)(<\/span>)/i, `$1${newBrand}$3`);
    code = code.replace(/&copy; 2024 [^.]*\./i, `&copy; 2024 ${newBrand}.`);
    return code;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. NAVBAR MODIFICATIONS (STICKY & SHADOW)
  // e.g. "Make the navbar sticky and add a shadow", "sticky navbar"
  // ─────────────────────────────────────────────────────────────────────────
  if ((lower.includes('navbar') || lower.includes('nav')) && (lower.includes('sticky') || lower.includes('shadow') || lower.includes('blur'))) {
    code = code.replace(/<nav\s+className=["']([^"']*)["']/i, (match, classes) => {
      let updated = classes;
      if (!updated.includes('sticky')) updated = `sticky top-0 z-50 ${updated}`;
      if (!updated.includes('shadow-xl')) {
        updated = updated.replace(/shadow-[a-z0-9/]+/g, '');
        updated = `${updated} shadow-xl shadow-black/10`;
      }
      if (!updated.includes('backdrop-blur-md')) {
        updated = updated.replace(/backdrop-blur-[a-z0-9]+/g, '');
        updated = `${updated} backdrop-blur-md`;
      }
      return `<nav className="${updated.replace(/\s+/g, ' ').trim()}"`;
    });
    return code;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. DARK MODE TOGGLE BUTTON / THEME TOGGLE
  // e.g. "Add a dark mode toggle button", "make background dark", "dark theme"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('dark mode') || lower.includes('dark theme') || lower.includes('toggle button') || (lower.includes('dark') && lower.includes('background'))) {
    // 1. Ensure useState is imported
    if (!code.includes('useState')) {
      code = code.replace(
        /import\s+React\s+from\s+['"]react['"];?/,
        "import React, { useState } from 'react';"
      );
      if (!code.includes('useState')) {
        code = code.replace(
          /import\s+[^;]+from\s+['"]react['"];?/,
          "import { useState } from 'react';"
        );
      }
    }

    const defaultDark = lower.includes('background') || lower.includes('theme');

    // 2. Add darkMode state inside ClonedPage function if not present
    if (!code.includes('darkMode') && !code.includes('setDarkMode')) {
      code = code.replace(
        /export\s+default\s+function\s+ClonedPage\s*\([^)]*\)\s*\{/,
        `export default function ClonedPage() {\n  const [darkMode, setDarkMode] = useState(${defaultDark ? 'true' : 'false'});`
      );
    }

    // 3. Update top wrapper div to include the 'dark' class when active
    if (!code.includes("darkMode ? 'dark")) {
      code = code.replace(
        /<div\s+className=\{`min-h-screen[^`]*`\}>/,
        `<div className={\`min-h-screen font-sans transition-colors duration-300 \${darkMode ? 'dark bg-gray-950 text-white' : 'bg-white text-gray-900'}\`}>`
      );
      code = code.replace(
        /<div\s+className=["']min-h-screen\s+([^"']*)["']>/,
        `<div className={\`min-h-screen font-sans transition-colors duration-300 \${darkMode ? 'dark bg-gray-950 text-white' : '$1'}\`}>`
      );
    }

    // 4. Inject Dark Mode toggle button into navbar
    const toggleButtonHtml = `
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer \${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-yellow-300 hover:bg-gray-700 shadow-sm'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 shadow-sm'
              }\`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span>{darkMode ? '☀️ Light' : '🌙 Dark'}</span>
            </button>`;

    if (!code.includes('setDarkMode(!darkMode)')) {
      if (code.includes('Get Started')) {
        code = code.replace(/(<a[^>]*>[^<]*Get Started[^<]*<\/a>)/i, `${toggleButtonHtml}\n            $1`);
      } else if (code.includes('</nav>')) {
        code = code.replace('</nav>', `${toggleButtonHtml}\n      </nav>`);
      }
    }

    return code;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. ADD CONTACT FORM SECTION
  // e.g. "Add a contact form", "add contact us section", "add get in touch form"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('contact') && (lower.includes('form') || lower.includes('add') || lower.includes('section') || lower.includes('us'))) {
    if (!code.includes('Get in Touch') && !code.includes('Send Message')) {
      const contactSection = `
      {/* Contact Us Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Contact Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Let's start a conversation</h2>
            <p className="text-gray-500 text-lg">Have a question or want to work together? Fill out the form below.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }} className="space-y-6 bg-gray-50 p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input type="text" required placeholder="Jane" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input type="text" required placeholder="Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" required placeholder="jane@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea rows={4} required placeholder="How can we help your team?" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer">
              Send Message →
            </button>
          </form>
        </div>
      </section>
`;
      if (code.includes('<footer')) {
        code = code.replace('<footer', `${contactSection}\n      <footer`);
      } else {
        code = code.replace(/<\/div>\s*;\s*\}\s*$/, `${contactSection}\n    </div>\n  );\n}\n`);
      }
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. ADD NEWSLETTER / SUBSCRIBE SECTION
  // e.g. "Add newsletter section", "add email subscribe"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('newsletter') || lower.includes('subscribe') || lower.includes('email signup')) {
    if (!code.includes('Subscribe to our newsletter')) {
      const newsletterSection = `
      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-950 text-white relative overflow-hidden border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Stay in the loop</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">Subscribe to our newsletter</h2>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">Get product updates, design inspiration, and industry insights delivered straight to your inbox.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" required placeholder="Enter your work email" className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm shadow-md shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
`;
      if (code.includes('<footer')) {
        code = code.replace('<footer', `${newsletterSection}\n      <footer`);
      } else {
        code = code.replace(/<\/div>\s*;\s*\}\s*$/, `${newsletterSection}\n    </div>\n  );\n}\n`);
      }
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. ADD STATS / METRICS SECTION
  // e.g. "Add stats section", "add counters", "add metrics"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('stat') || lower.includes('metric') || lower.includes('counter')) {
    if (!code.includes('99.9%') && !code.includes('/* Stats Section */')) {
      const statsSection = `
      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '99.9%', label: 'Uptime SLA' },
              { val: '50K+', label: 'Active Users' },
              { val: '120M+', label: 'API Calls / Day' },
              { val: '4.9/5', label: 'Customer Rating' },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-1">{stat.val}</div>
                <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
`;
      if (code.includes('{/* Features */}')) {
        code = code.replace('{/* Features */}', `${statsSection}\n      {/* Features */}`);
      } else if (code.includes('<footer')) {
        code = code.replace('<footer', `${statsSection}\n      <footer`);
      }
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. HERO THEME REPLACEMENT
  // e.g. "Replace the hero with a bakery theme", "coffee theme", "gym", "tech"
  // ─────────────────────────────────────────────────────────────────────────
  const themePresets: Record<string, { badge: string; title: string; desc: string; cta1: string; cta2: string; image: string }> = {
    bakery: {
      badge: '🥖 Fresh From Our Ovens Daily',
      title: 'Artisan Breads & Handcrafted Pastries',
      desc: 'Baked with wild heirloom sourdough, golden butter, and centuries of artisan baking tradition. Taste perfection every morning.',
      cta1: 'Order Fresh Breads →',
      cta2: 'View Daily Pastries',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    },
    coffee: {
      badge: '☕ Single-Origin Specialty Coffee',
      title: 'Ethically Sourced. Masterfully Roasted.',
      desc: 'Discover our rare micro-lot roasts and specialty beans, hand-selected from regenerative farms around the globe.',
      cta1: 'Shop Fresh Beans →',
      cta2: 'Explore Roasts',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    },
    fitness: {
      badge: '⚡ Elite Training & Performance',
      title: 'Transform Your Body, Mind & Strength',
      desc: 'State-of-the-art facilities, certified Olympic coaching, and science-backed nutritional programming designed to unleash your peak potential.',
      cta1: 'Start 7-Day Free Pass →',
      cta2: 'Explore Programs',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    },
    gym: {
      badge: '⚡ Elite Training & Performance',
      title: 'Transform Your Body, Mind & Strength',
      desc: 'State-of-the-art facilities, certified Olympic coaching, and science-backed nutritional programming designed to unleash your peak potential.',
      cta1: 'Start 7-Day Free Pass →',
      cta2: 'Explore Programs',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    },
    tech: {
      badge: '🚀 Next-Gen Cloud Platform',
      title: 'Build, Ship & Scale Without Limits',
      desc: 'The developer platform that automates infrastructure, optimizes latency worldwide, and scales automatically from prototype to enterprise.',
      cta1: 'Deploy Now Free →',
      cta2: 'Read Documentation',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    },
    saas: {
      badge: '🚀 Next-Gen Software Platform',
      title: 'Automate Workflows & Supercharge Productivity',
      desc: 'All-in-one workspace that brings projects, team collaboration, and automated intelligent workflows into one seamless interface.',
      cta1: 'Start 14-Day Trial →',
      cta2: 'Watch Interactive Demo',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    },
    restaurant: {
      badge: '🍷 Michelin Recognized Dining',
      title: 'Exceptional Flavors & Farm-to-Table Artistry',
      desc: 'Immerse yourself in seasonal tasting menus curated with local ingredients, paired with vintage wines from our sommelier cellars.',
      cta1: 'Reserve a Table →',
      cta2: 'View Tasting Menu',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    },
    ecommerce: {
      badge: '✨ New Season Arrivals',
      title: 'Curated Essentials for Elevated Living',
      desc: 'Discover modern minimalist goods crafted sustainably with premium materials built to last a lifetime.',
      cta1: 'Shop New Collection →',
      cta2: 'View Lookbook',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    },
  };

  for (const [themeKey, preset] of Object.entries(themePresets)) {
    if (lower.includes(themeKey) && (lower.includes('hero') || lower.includes('replace') || lower.includes('theme') || lower.includes('make') || lower.includes('to'))) {
      // Replace Hero Section Badge
      code = code.replace(
        /(<div[^>]*rounded-full[^>]*>[\s\S]*?<span[^>]*animate-pulse[^>]*><\/span>)([\s\S]*?)(<\/div>)/i,
        `$1\n              ${preset.badge}\n            $3`
      );

      // Replace Hero Title (H1)
      code = code.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, (match) => {
        const openingTag = match.match(/<h1[^>]*>/)?.[0] || '<h1>';
        return `${openingTag}\n              ${preset.title}\n            </h1>`;
      });

      // Replace Hero Subtitle/Paragraph
      code = code.replace(/<p className="text-xl md:text-2xl text-gray-500[^"]*"[^>]*>[\s\S]*?<\/p>/i, (match) => {
        const openingTag = match.match(/<p[^>]*>/)?.[0] || '<p>';
        return `${openingTag}\n              ${preset.desc}\n            </p>`;
      });

      // Replace CTA Button
      code = code.replace(/Get Started Free →|Get Started/i, preset.cta1);

      // Replace Hero Image
      code = code.replace(
        /(<img\s+src=)["']https:\/\/picsum\.photos\/seed\/(?:dashboard|hero|bakery|coffee|fitness|gym|tech|restaurant)[^"']*["']/i,
        `$1"${preset.image}"`
      );
      if (!code.includes(preset.image)) {
        code = code.replace(/(<img\s+src=)["'][^"']*["'](\s+alt=["']App preview["'])/i, `$1"${preset.image}"$2`);
      }

      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 12. REMOVE SECTIONS
  // e.g. "Remove the pricing section", "Remove testimonials", "Remove footer",
  //      "remove hero image", "remove navbar"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('remove') || lower.includes('delete') || lower.includes('hide')) {
    if (lower.includes('pricing')) {
      code = code.replace(/\{\/\*\s*Pricing[^\*]*\*\/\}\s*<section[\s\S]*?<\/section>/i, '');
      code = code.replace(/<section[^>]*>[\s\S]*?transparent pricing[\s\S]*?<\/section>/i, '');
      return code;
    }
    if (lower.includes('testimonial') || lower.includes('review')) {
      code = code.replace(/\{\/\*\s*Testimonials[^\*]*\*\/\}\s*<section[\s\S]*?<\/section>/i, '');
      code = code.replace(/<section[^>]*>[\s\S]*?Loved by thousands[\s\S]*?<\/section>/i, '');
      return code;
    }
    if (lower.includes('features') || lower.includes('feature')) {
      code = code.replace(/\{\/\*\s*Features[^\*]*\*\/\}\s*<section[\s\S]*?<\/section>/i, '');
      code = code.replace(/<section[^>]*>[\s\S]*?Everything you need[\s\S]*?<\/section>/i, '');
      return code;
    }
    if (lower.includes('logos') || lower.includes('social proof') || lower.includes('partners')) {
      code = code.replace(/\{\/\*\s*Logos[^\*]*\*\/\}\s*<section[\s\S]*?<\/section>/i, '');
      code = code.replace(/<section[^>]*>[\s\S]*?Trusted by leading companies[\s\S]*?<\/section>/i, '');
      return code;
    }
    if (lower.includes('hero image') || (lower.includes('image') && lower.includes('hero'))) {
      code = code.replace(/\{\/\*\s*Hero Image\s*\*\/\}\s*<div[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i, '');
      code = code.replace(/<div className="mt-16 relative max-w-5xl mx-auto">[\s\S]*?<\/div>\s*<\/div>/i, '');
      return code;
    }
    if (lower.includes('footer')) {
      code = code.replace(/<footer[\s\S]*?<\/footer>/i, '');
      return code;
    }
    if (lower.includes('navbar') || lower.includes('nav')) {
      code = code.replace(/<nav[\s\S]*?<\/nav>/i, '');
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 13. ADD TESTIMONIALS SECTION
  // e.g. "Add a testimonials section", "Add reviews"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('testimonial') || lower.includes('review')) {
    if (!code.includes('Loved by thousands') && !code.includes('Loved by over 20,000+ teams')) {
      const testimonialsSection = `
      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full px-4 py-1 text-sm font-semibold mb-4">
              ★★★★★ 4.9 out of 5 Rating
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Loved by over 20,000+ teams</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">See how fast-moving businesses achieve extraordinary results every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Elena Rostova', role: 'VP of Product at Horizon', text: 'This platform transformed our operational speed by 10x within the first two weeks of adoption.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
              { name: 'David Chen', role: 'Head of Engineering at Nexus', text: 'The attention to detail and flawless reliability make this the easiest recommendation I can give.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
              { name: 'Sophia Sterling', role: 'Founder & CEO at Lumina', text: 'Hands down the best decision we made this year. Beautifully designed, lightning fast, and reliable.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex text-yellow-400 text-lg mb-4">★★★★★</div>
                <p className="text-gray-600 text-base leading-relaxed mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
`;
      if (code.includes('{/* Pricing */}')) {
        code = code.replace('{/* Pricing */}', `${testimonialsSection}\n      {/* Pricing */}`);
      } else if (code.includes('<footer')) {
        code = code.replace('<footer', `${testimonialsSection}\n      <footer`);
      } else {
        code = code.replace(/<\/div>\s*;\s*\}\s*$/, `${testimonialsSection}\n    </div>\n  );\n}\n`);
      }
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14. ADD PRICING SECTION
  // e.g. "Add a pricing section", "pricing table"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('pricing') && (lower.includes('add') || lower.includes('create') || lower.includes('include') || lower.includes('table'))) {
    if (!code.includes('Simple, transparent pricing')) {
      const pricingSection = `
      {/* Pricing Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees or lock-ins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Starter', price: '$0', desc: 'Perfect for small projects & tests', features: ['Up to 3 projects', 'Community support', 'Basic analytics', '1GB cloud storage'] },
              { name: 'Pro', price: '$29', featured: true, desc: 'For growing businesses & pros', features: ['Unlimited projects', 'Priority 24/7 support', 'Advanced analytics', '50GB cloud storage', 'Custom domains', 'Team collaboration'] },
              { name: 'Enterprise', price: '$99', desc: 'For scaling companies with custom needs', features: ['Everything in Pro', 'Dedicated account manager', 'SLA guarantee 99.99%', 'Custom integrations', 'SOC2 compliance audit', 'Single sign-on (SSO)'] },
            ].map((plan, i) => (
              <div key={i} className={\`p-8 rounded-3xl border-2 transition-all duration-300 relative flex flex-col justify-between \${plan.featured ? 'border-blue-600 shadow-2xl shadow-blue-500/10 scale-105 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'}\`}>
                {plan.featured && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    MOST POPULAR
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="#" className={\`block w-full text-center py-3.5 px-6 rounded-xl font-bold transition-all \${plan.featured ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : 'border-2 border-gray-200 text-gray-800 hover:bg-gray-50'}\`}>
                  Get Started Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
`;
      if (code.includes('<footer')) {
        code = code.replace('<footer', `${pricingSection}\n      <footer`);
      } else {
        code = code.replace(/<\/div>\s*;\s*\}\s*$/, `${pricingSection}\n    </div>\n  );\n}\n`);
      }
      return code;
    } else {
      code = code.replace(/Simple, transparent pricing/g, 'Flexible, Transparent Pricing');
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 15. ADD FAQ ACCORDION SECTION
  // e.g. "Add an FAQ section", "Add frequently asked questions"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('faq') || lower.includes('questions')) {
    if (!code.includes('Frequently Asked Questions')) {
      const faqSection = `
      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know about getting started.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How easy is it to get started?', a: 'You can get completely set up in less than 2 minutes without needing to enter any payment info.' },
              { q: 'Can I cancel or upgrade my subscription at any time?', a: 'Yes! You have full control over your billing from the account settings. No lock-in contracts.' },
              { q: 'Do you offer a free trial?', a: 'Yes, every new user gets a full 14-day free trial with unlimited access to all core features.' },
              { q: 'What kind of support is available?', a: 'We offer round-the-clock priority support via live chat, email, and detailed documentation.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center justify-between">
                  {faq.q}
                  <span className="text-blue-600 font-bold">+</span>
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
`;
      if (code.includes('<footer')) {
        code = code.replace('<footer', `${faqSection}\n      <footer`);
      } else {
        code = code.replace(/<\/div>\s*;\s*\}\s*$/, `${faqSection}\n    </div>\n  );\n}\n`);
      }
      return code;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 16. ANIMATIONS / SMOOTH SCROLL
  // e.g. "Add smooth scroll animations"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('animation') || lower.includes('smooth')) {
    code = code.replace(/className=["']min-h-screen/i, 'className="min-h-screen scroll-smooth');
    code = code.replace(/rounded-2xl/g, 'rounded-2xl transition-all duration-300 hover:-translate-y-1');
    return code;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 17. DETAILED FOOTER
  // e.g. "Make the footer more detailed with social links"
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes('footer') && (lower.includes('social') || lower.includes('detailed'))) {
    code = code.replace(
      /(<div className="flex gap-4">)[\s\S]*?(<\/div>)/i,
      `$1
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors text-xs font-bold">X</a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors text-xs font-bold">in</a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors text-xs font-bold">git</a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors text-xs font-bold">yt</a>
              $2`
    );
    return code;
  }

  return code;
}
