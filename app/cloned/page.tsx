'use client';

import { useState } from 'react';

export default function ClonedPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white font-sans w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 border-b border-gray-100 shadow-xl shadow-black/10 backdrop-blur-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex-shrink-0 flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-xs">Linear – The system for produc</span>
            </div>
            <div className="hidden lg:flex items-center space-x-6 overflow-hidden">
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap">Customers</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap">Now</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap">Contact</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap">Docs</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap">Open app</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block">Sign in</a>
              <a href="#" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              New — Now Available
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Linear – The system for produc
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Purpose-built for planning and building products with AI agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-200">
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
              { icon: '🔒', color: 'blue', title: 'Secure & Reliable', desc: 'Enterprise-grade security with SOC 2 compliance, keeping your data protected at all times.' },
              { icon: '🤝', color: 'green', title: 'Team Collaboration', desc: 'Real-time collaboration tools that keep your entire team aligned and productive.' },
              { icon: '📊', color: 'purple', title: 'Advanced Analytics', desc: 'Deep insights and reporting tools to help you make smarter business decisions.' },
              { icon: '🔧', color: 'orange', title: 'Easy Integration', desc: 'Connect with 200+ tools including Slack, GitHub, Jira, and everything your team already uses.' },
              { icon: '🌍', color: 'cyan', title: 'Global Scale', desc: 'Infrastructure that scales with you, from startup to enterprise, across all geographies.' },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-2xl group-hover:scale-110 transition-transform">
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
                  <img src={`https://picsum.photos/seed/${t.name}/40/40`} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
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
              <div key={i} className={`p-8 rounded-2xl border-2 transition-all ${plan.featured ? 'border-blue-500 shadow-xl shadow-blue-100 scale-105' : 'border-gray-100 hover:border-gray-200'}`}>
                {plan.featured && <div className="text-center mb-4"><span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span></div>}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {f}</li>)}
                </ul>
                <a href="#" className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${plan.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">Join over 50,000 teams already using Linear – The system for produc to build better products faster.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="bg-white text-blue-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
              Start for free →
            </a>
            <a href="#" className="border-2 border-white/30 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all">
              Talk to sales
            </a>
          </div>
          <p className="mt-6 text-blue-200 text-sm">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-white font-bold text-lg">Linear – The system for produc</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">Purpose-built for planning and building products with AI agents.</p>
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
            <p>&copy; 2024 Linear – The system for produc. All rights reserved.</p>
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