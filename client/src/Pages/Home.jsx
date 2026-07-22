import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CreditCard,
  Wrench,
  Users,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const navItems = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Browse Rentals",
      path: "/rentals",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Contact",
      path: "/contact",
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ left: "10%", top: "20%" }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ right: "10%", top: "40%", animationDelay: "2s" }}
        />
        <div
          className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ left: "50%", bottom: "10%", animationDelay: "4s" }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-red-600 to-orange-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-slate-950 rounded-lg p-2">
              <Building2 className="text-red-500" size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-black bg-linear-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            Rentora
          </h1>
        </div>

        <div className="hidden md:flex gap-12 text-gray-300">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-sm font-medium hover:text-red-500 transition duration-300 relative group"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-red-500 to-orange-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-lg border border-white/20 hover:border-white/40 backdrop-blur transition duration-300 font-medium text-sm">
            <Link to={"/login"}>Login</Link>
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-medium text-sm transition duration-300 shadow-lg shadow-red-600/50">
            <Link to={"/register"}>Get Started</Link>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-32 grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4 animate-fade-in">
            <div className="inline-block">
              <span className="text-sm font-semibold text-red-400 bg-red-950/30 px-4 py-2 rounded-full border border-red-700/50">
                ✨ Smart Property Management
              </span>
            </div>

            <h2 className="text-6xl md:text-7xl font-black leading-tight">
              Manage Properties.
              <span className="block text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 bg-clip-text">
                Simplify Renting.
              </span>
            </h2>
          </div>

          <p className="text-xl text-gray-300 leading-relaxed max-w-lg animate-fade-in animation-delay-200">
            Rentora helps landlords and property managers collect rent, track
            maintenance, manage tenants, and scale their business—all from one
            intelligent platform.
          </p>

          <div className="flex gap-4 pt-4 animate-fade-in animation-delay-400">
            <button className="group flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-red-600/50 hover:shadow-red-600/75">
              Start Managing
              <ArrowRight
                className="group-hover:translate-x-2 transition-transform"
                size={20}
              />
            </button>

            <button className="group flex items-center gap-3 border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur hover:bg-white/5">
              Browse Properties
              <ChevronDown
                className="group-hover:translate-y-1 transition-transform"
                size={20}
              />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10">
            {[
              { number: "5K+", label: "Properties" },
              { number: "50K+", label: "Happy Users" },
              { number: "₹2B+", label: "Rent Collected" },
            ].map((stat, i) => (
              <div
                key={i}
                className="group animate-fade-in"
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                <div className="text-2xl font-black bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image - 3D Floating Card Effect */}
        <div className="relative h-full min-h-96 flex items-center justify-center">
          <div
            className="relative w-full h-full rounded-3xl overflow-hidden group cursor-pointer"
            style={{
              transform: `perspective(1000px) rotateX(${(mousePos.y - window.innerHeight / 2) * 0.02}deg) rotateY(${(mousePos.x - window.innerWidth / 2) * 0.02}deg) translateZ(0px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48 animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl opacity-75 blur-2xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/20 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <Building2
                      size={80}
                      className="text-red-500 mx-auto animate-bounce"
                    />
                    <div className="text-sm font-bold text-gray-300">
                      Modern Property
                    </div>
                    <div className="text-2xl font-black text-red-500">
                      Management
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 animate-float"
                style={{
                  width: "140px",
                  animationDelay: `${i * 0.4}s`,
                  transform: `rotate(${i * 120}deg) translateY(-160px) rotate(-${i * 120}deg)`,
                }}
              >
                <div className="text-xs font-bold text-gray-300 text-center">
                  {["Tenant Portal", "Rent Tracker", "Maintenance"][i - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-black">Everything You Need</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              All the tools to manage properties efficiently, from rent
              collection to maintenance coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CreditCard,
                title: "Smart Rent Collection",
                text: "Automated rent tracking, payment reminders, and instant notifications. Know exactly who paid and who's outstanding.",
                gradient: "from-red-600 to-orange-600",
              },
              {
                icon: Wrench,
                title: "Maintenance Hub",
                text: "Tenants report issues, landlords assign repairs, track status. Everything in one place for quick resolution.",
                gradient: "from-blue-600 to-purple-600",
              },
              {
                icon: Users,
                title: "Tenant Portal",
                text: "Tenants manage leases, pay rent, submit requests. Landlords oversee everything from a unified dashboard.",
                gradient: "from-emerald-600 to-teal-600",
              },
            ].map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-black">Three Simple Steps</h2>
            <p className="text-xl text-gray-400">
              Get started with Rentora in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                number: "01",
                title: "Create Your Property",
                text: "Add buildings, apartments, and set rental rates. Upload lease documents and property details.",
                icon: Building2,
              },
              {
                number: "02",
                title: "Invite Your Tenants",
                text: "Generate tenant invites and manage access. They can create accounts and start using the portal immediately.",
                icon: Users,
              },
              {
                number: "03",
                title: "Start Collecting",
                text: "Automate payments, track rent, handle requests. Watch your operations become significantly more efficient.",
                icon: CreditCard,
              },
            ].map((step, i) => (
              <StepCard key={i} {...step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/80 to-orange-600/80" />
            <div className="absolute inset-0 backdrop-blur-xl" />

            <div className="relative px-12 py-20 text-center space-y-8">
              <h2 className="text-5xl font-black">
                Ready to Transform Your Business?
              </h2>

              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of property managers who've streamlined their
                operations and increased profitability.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <button className="group px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight
                    className="group-hover:translate-x-2 transition-transform"
                    size={20}
                  />
                </button>

                <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2026 Rentora. All rights reserved. Made with ❤️</p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .group:hover .group-hover\:translate-x-2 {
          transform: translateX(8px);
        }

        .group:hover .group-hover\:translate-y-1 {
          transform: translateY(4px);
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, gradient, delay }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `fade-in 0.8s ease-out forwards`,
        animationDelay: `${delay * 150}ms`,
        opacity: 0,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />

      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 group-hover:border-white/30 rounded-2xl p-8 transition-all duration-300 h-full">
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform`}
        >
          <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
            <Icon size={32} className="text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition">
          {title}
        </h3>

        <p className="text-gray-400 group-hover:text-gray-300 transition leading-relaxed">
          {text}
        </p>

        <div className="mt-6 flex items-center text-red-500 font-bold group-hover:gap-3 gap-2 transition-all">
          Learn more
          <ArrowRight
            size={18}
            className="group-hover:translate-x-2 transition-transform"
          />
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, title, text, icon: Icon, index }) {
  return (
    <div
      className="relative group"
      style={{
        animation: `fade-in 0.8s ease-out forwards`,
        animationDelay: `${index * 150}ms`,
        opacity: 0,
      }}
    >
      <div className="relative">
        <div className="absolute -top-8 left-0 w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300" />

        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 group-hover:border-white/30 rounded-2xl p-12 text-center backdrop-blur transition-all duration-300">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-white/20 group-hover:border-white/40 mb-8 transition-all">
            <span className="text-5xl font-black bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              {number}
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition">
            {title}
          </h3>

          <p className="text-gray-400 group-hover:text-gray-300 transition leading-relaxed">
            {text}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            <Check size={20} />
            Ready to go
          </div>
        </div>
      </div>
    </div>
  );
}
