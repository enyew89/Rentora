import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const footerLinks = {
    Product: ["Features", "Pricing"],
    Company: ["About", "Contact"],
    Legal: ["Privacy", "Terms"],
  };

  return (
    <div className="min-h-screen bg-transparent text-neutral-300 font-sans selection:bg-white/20">
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#060606]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-[1400px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-lg shadow-white/10 transition-shadow duration-300">
              <Building2 className="text-[#060606]" size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Rentora
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-5 py-2 text-sm font-medium text-neutral-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold text-black bg-white rounded-full shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] active:scale-100 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.08] text-white">
              Property management
              <br />
              that just works
            </h1>

            <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">
              Collect rent, track maintenance, and manage tenants from one dashboard.
            </p>

            <div className="mt-10">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-semibold text-black bg-white rounded-full shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] active:scale-100 transition-all duration-200"
              >
                Start for free
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>


        </div>
      </section>



      <footer className="border-t border-white/[0.06] bg-[#060606]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white">
                <Building2 className="text-[#060606]" size={14} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-white">Rentora</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
              {Object.values(footerLinks).flat().map((link) => (
                <a key={link} href="#" className="hover:text-neutral-300 transition-colors">{link}</a>
              ))}
            </div>
            <p className="text-xs text-neutral-600">&copy; {new Date().getFullYear()} Rentora</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


