import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Send, CheckCircle2, Loader2 } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate a network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

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
            <p className="mt-4 text-neutral-400">
              Drop us a message and we'll get back to you within 24 hours. You can also reach us directly at <a href="mailto:support@rentora.com" className="text-white hover:underline">support@rentora.com</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-[700px] mx-auto">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <CheckCircle2 size={48} className="text-green-400 mb-4" />
              <h3 className="text-xl text-white font-bold mb-2">Message Sent!</h3>
              <p className="text-neutral-400 mb-6 max-w-sm">Thanks for reaching out. We've received your message and will be in touch shortly.</p>
              <button onClick={() => setSubmitted(false)} className="px-6 py-2 text-sm font-medium text-white bg-white/[0.08] rounded-full hover:bg-white/[0.12] transition-colors">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-neutral-300 ml-1">Name</label>
                  <input id="name" type="text" required placeholder="John Doe" className="w-full px-4 py-3.5 text-sm text-white bg-white/[0.08] border border-white/20 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-neutral-300 ml-1">Email</label>
                  <input id="email" type="email" required placeholder="john@example.com" className="w-full px-4 py-3.5 text-sm text-white bg-white/[0.08] border border-white/20 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-neutral-300 ml-1">Message</label>
                <textarea id="message" rows={5} required placeholder="How can we help you?" className="w-full px-4 py-3.5 text-sm text-white bg-white/[0.08] border border-white/20 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all resize-none" />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-black bg-white rounded-full shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
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