'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, TrendingUp, BarChart3, Zap } from 'lucide-react';

function AnimatedStars() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate stars only on client to avoid hydration mismatch
    const generatedStars = [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: star.left + '%',
            top: star.top + '%',
            animation: `starTwinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: star.delay + 's',
            boxShadow: '0 0 10px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  );
}

function AnimatedRibbons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          style={{
            top: `${(i + 1) * 25}%`,
            left: '-100%',
            width: '100%',
            animation: `ribbonWave ${8 + i * 2}s linear infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = ['#6366f1', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)];
      }

      update() {
        this.y -= this.speedY;
        this.opacity -= 0.01;
        if (this.y < 0 || this.opacity <= 0) {
          this.y = canvas.height;
          this.opacity = Math.random() * 0.5 + 0.2;
        }
      }

      draw() {
        ctx.fillStyle = this.color.slice(0, 7) + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Background Effects */}
      <AnimetionLayer />
      <AnimatedStars />
      <AnimatedRibbons />
      <FloatingParticles />

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
          <Sparkles className="w-10 h-10 text-indigo-400" />
          Lumina
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="btn btn-secondary shadow-lg hover:shadow-xl transition-all duration-300">
            Login
          </Link>
          <Link href="/register" className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8 inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 text-sm font-medium">
            <Zap className="w-4 h-4" />
            Powered by Advanced AI
          </span>
        </div>

        <h1 className="premium-heading premium-heading-glow text-6xl md:text-7xl font-black mb-6 leading-tight animate-pulse">
          AI-Powered Data Analytics
        </h1>

        <p className="text-xl md:text-2xl mb-12 bg-gradient-to-r from-slate-300 via-indigo-200 to-purple-200 bg-clip-text text-transparent max-w-3xl mx-auto font-semibold">
          Transform your CSV files into stunning visual insights with enterprise-grade AI. Upload, analyze, and dominate your data analytics.
        </p>

        <div className="flex gap-4 justify-center mb-12 flex-wrap">
          <Link
            href="/register"
            className="btn btn-primary px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              🚀 Get Started Free
            </span>
          </Link>
          <Link
            href="/login"
            className="btn btn-secondary px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              👋 Sign In
            </span>
          </Link>
        </div>

        {/* Feature Cards - Enhanced */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* Card 1 */}
          <div
            className="premium-card group cursor-pointer transform hover:scale-105 transition-all duration-500 border border-indigo-500/30 group-hover:border-indigo-500/80 group-hover:shadow-lg group-hover:shadow-indigo-500/20"
            style={{ animationDelay: '0s' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:h-full transition-all duration-500 rounded-t-xl" />
            <div className="text-6xl mb-4 animate-bounce group-hover:animate-none transition-all duration-300" style={{ animationDuration: '2s' }}>
              📤
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Lightning Upload
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">Upload CSV files instantly and begin your analytical journey within seconds. Support for files up to 50MB with automatic data validation.</p>
            <div className="mt-4 pt-4 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <p className="text-indigo-300 text-sm font-semibold">✨ Features: Drag & drop, batch upload, auto-detection</p>
            </div>
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-500" />
          </div>

          {/* Card 2 */}
          <div
            className="premium-card group cursor-pointer transform hover:scale-105 transition-all duration-500 border border-purple-500/30 group-hover:border-purple-500/80 group-hover:shadow-lg group-hover:shadow-purple-500/20"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:h-full transition-all duration-500 rounded-t-xl" />
            <div className="text-6xl mb-4 animate-bounce group-hover:animate-none transition-all duration-300" style={{ animationDuration: '2s', animationDelay: '0.2s' }}>
              🤖
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI Intelligence
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">Ask questions in natural language and receive intelligent insights. Powered by Google Gemini and advanced local analytics engine.</p>
            <div className="mt-4 pt-4 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <p className="text-purple-300 text-sm font-semibold">✨ Features: Multi-model AI, real-time responses, context-aware</p>
            </div>
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-500" />
          </div>

          {/* Card 3 */}
          <div
            className="premium-card group cursor-pointer transform hover:scale-105 transition-all duration-500 border border-pink-500/30 group-hover:border-pink-500/80 group-hover:shadow-lg group-hover:shadow-pink-500/20"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-600 to-indigo-600 group-hover:h-full transition-all duration-500 rounded-t-xl" />
            <div className="text-6xl mb-4 animate-bounce group-hover:animate-none transition-all duration-300" style={{ animationDuration: '2s', animationDelay: '0.4s' }}>
              📊
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Premium Charts
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">Beautiful, animated charts with 9 visualization types. Bar, Line, Pie, Area, Radar, Histogram, Funnel, Bubble & Composed charts.</p>
            <div className="mt-4 pt-4 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <p className="text-pink-300 text-sm font-semibold">✨ Features: Interactive, exportable, real-time updates</p>
            </div>
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-pink-400 to-indigo-400 group-hover:w-full transition-all duration-500" />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 mb-32">
          <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-slate-400 text-center text-lg mb-16 max-w-2xl mx-auto">
            Get insights from your data in 4 simple steps. No technical knowledge required.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '1', title: 'Upload', description: 'Drop your CSV file or click to browse. Supports all standard formats.' },
              { number: '2', title: 'Analyze', description: 'Our AI automatically detects patterns and generates insights.' },
              { number: '3', title: 'Explore', description: 'View data through 9 different chart types and perspectives.' },
              { number: '4', title: 'Export', description: 'Download reports, charts, and dashboards for sharing.' }
            ].map((step, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white group-hover:scale-110 transform transition-all duration-300 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2 text-indigo-300">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section - Enhanced */}
        <div className="mt-24 mb-32">
          <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Trusted by Data Analysts
          </h2>
          <p className="text-slate-400 text-center text-lg mb-16 max-w-2xl mx-auto">
            Lumina empowers professionals to make data-driven decisions faster than ever before.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, label: 'Data Points', value: '10M+', description: 'Analyzed monthly' },
              { icon: BarChart3, label: 'Chart Types', value: '9', description: 'Visualization options' },
              { icon: Sparkles, label: 'AI Models', value: '2', description: 'Gemini + Local AI' },
              { icon: Zap, label: 'Speed', value: '< 2s', description: 'Average response time' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="premium-card text-center group hover:scale-105 transform transition-all duration-300" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Icon className="w-10 h-10 mx-auto mb-4 text-indigo-400 animate-pulse group-hover:animate-bounce" />
                  <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500">{stat.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid - Detailed */}
        <div className="mt-24 mb-32">
          <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-slate-400 text-center text-lg mb-16 max-w-2xl mx-auto">
            Everything you need to analyze data professionally
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '📈', title: '9 Chart Types', desc: 'Bar, Line, Pie, Area, Radar, Histogram, Funnel, Bubble & Composed charts for every scenario.' },
              { icon: '🎯', title: 'Smart Analysis', desc: 'Automatic anomaly detection, trend analysis, and pattern recognition powered by AI.' },
              { icon: '💾', title: 'Save Dashboards', desc: 'Create and save custom dashboards. Organize, manage, and revisit your analyses anytime.' },
              { icon: '📤', title: 'Export Reports', desc: 'Download your charts and data in PDF, Excel, JSON, and CSV formats instantly.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your data is encrypted and processed securely. We never store your raw files.' },
              { icon: '⚡', title: 'Real-time Updates', desc: 'Instant analysis updates as you interact with your charts and data.' }
            ].map((feature, idx) => (
              <div key={idx} className="premium-card group hover:scale-102 transform transition-all duration-300 overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-indigo-300 mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section Before Stats */}
        <div className="mt-24 mb-32 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl border border-indigo-500/30 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Data?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of analysts and professionals who trust Lumina for their data insights.
          </p>
          <Link
            href="/register"
            className="inline-block btn btn-primary px-10 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
          >
            🚀 Start Analysis Now - It's Free!
          </Link>
          <p className="text-slate-500 text-sm mt-6">No credit card required. Get started in seconds.</p>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
    </div>
  );
}

function AnimetionLayer() {
  return <div className="absolute inset-0 opacity-5 pointer-events-none" />;
}
