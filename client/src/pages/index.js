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

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* Card 1 */}
          <div
            className="premium-card group cursor-pointer transform hover:scale-105 transition-all duration-500"
            style={{ animationDelay: '0s' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:h-full transition-all duration-500 rounded-t-xl" />
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
              📤
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Lightning Upload
            </h3>
            <p className="text-slate-300 text-lg">Upload CSV files instantly and begin your analytical journey within seconds.</p>
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-500" />
          </div>

          {/* Card 2 */}
          <div
            className="premium-card group cursor-pointer transform hover:scale-105 transition-all duration-500"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:h-full transition-all duration-500 rounded-t-xl" />
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.2s' }}>
              🤖
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI Intelligence
            </h3>
            <p className="text-slate-300 text-lg">Ask questions in natural language and receive intelligent insights powered by Gemini.</p>
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-500" />
          </div>

          {/* Card 3 */}
          <div
            className="premium-card group cursor-pointer transform hover:scale-105 transition-all duration-500"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-600 to-indigo-600 group-hover:h-full transition-all duration-500 rounded-t-xl" />
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.4s' }}>
              📊
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Premium Charts
            </h3>
            <p className="text-slate-300 text-lg">Beautiful, animated charts with 5 visualization types that captivate and inform.</p>
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-pink-400 to-indigo-400 group-hover:w-full transition-all duration-500" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid md:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, label: 'Data Points', value: '10M+' },
            { icon: BarChart3, label: 'Chart Types', value: '5' },
            { icon: Sparkles, label: 'AI Models', value: 'Gemini' },
            { icon: Zap, label: 'Speed', value: 'Real-time' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="premium-card text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <Icon className="w-8 h-8 mx-auto mb-2 text-indigo-400 animate-pulse" />
                <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
              </div>
            );
          })}
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
