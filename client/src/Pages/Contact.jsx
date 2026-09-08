import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Send } from "lucide-react";

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const footerLinks = {
  Product: ["Features", "Pricing"],
  Company: ["About", "Contact"],
  Legal: ["Privacy", "Terms"],
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-neutral-300 font-sans selection:bg-white/20">
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#060606]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-[1400px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-lg shadow-white/10 transition-shadow duration-300">
              <Building2 className="text-[#060606]" size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Rentora</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.path === "/contact"
                    ? "text-white bg-white/[0.06]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex px-5 py-2 text-sm font-medium text-neutral-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all duration-200">
              Log in
            </Link>
            <Link to="/register" className="px-5 py-2 text-sm font-semibold text-black bg-white rounded-full shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] active:scale-100 transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Contact us</h1>
            <p className="mt-4 text-neutral-400">Drop us a message and we'll get back to you.</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-[700px] mx-auto">
          {submitted ? (
            <div className="text-center py-16">
              <p className="text-lg text-white font-medium mb-2">Thanks, we'll be in touch.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-neutral-400 hover:text-white transition-colors">Send another</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Name" className="w-full px-4 py-3 text-sm text-white bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-all" />
                <input type="email" required placeholder="Email" className="w-full px-4 py-3 text-sm text-white bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-all" />
              </div>
              <textarea rows={4} required placeholder="Your message" className="w-full px-4 py-3 text-sm text-white bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-all resize-none" />
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-white rounded-full shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] active:scale-100 transition-all">
                <Send size={14} />
                Send
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
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