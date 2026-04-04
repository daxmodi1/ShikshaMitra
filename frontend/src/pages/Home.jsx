import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Pricing", href: "#plans" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <section
        id="home"
        className="relative min-h-screen overflow-hidden bg-[#0b0b10]"
      >
        {/* ✅ Background image now covers the full section (min-h-screen) */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-fixed"
            style={{ backgroundImage: 'url("/Div [bg-hero].png")' }}
          />
          <div className="absolute left-1/2 top-0 h-[330px] w-px -translate-x-[615px] bg-white/10" />
          <div className="absolute left-1/2 top-0 h-[330px] w-px translate-x-[615px] bg-white/10" />
        </div>

        <nav className="relative z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Shiksha Mitra" className="h-10 w-10 ring-white/10" />
              <div>
                <span className="text-base font-semibold tracking-wide text-white">Shiksha Mitra</span>
              </div>
            </div>

            <div className="hidden items-center gap-8 text-[1.05rem] text-white/58 md:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-full border border-white/30 bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white md:inline-flex"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-full bg-[#f7eff4] px-6 py-2.5 text-sm font-semibold text-[#17131b] transition hover:scale-[1.02]"
              >
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl px-8 pb-2 pt-8 md:pb-4 md:pt-12">
          <div className="mx-auto max-w-3xl text-center">

            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 backdrop-blur">
              <img src="/logo_with_bg.svg" alt="" className="h-5 w-5" />
              AI support for Indian classrooms, schools, and teacher mentors
            </div>

            <h1 className="mx-auto max-w-3xl bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-4xl font-medium leading-[0.98] tracking-[-0.04em] text-transparent sm:text-5xl md:text-[4.4rem]">
              AI for{" "}
              <span className="font-instrument-serif text-[1.08em] italic font-normal tracking-[-0.04em] text-white/95">
                teachers
              </span>{" "}
              building what&apos;s next.
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/58">
              Shiksha Mitra helps teachers plan, solve, and act with confidence.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#111216] transition hover:scale-[1.02]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.02] px-7 py-3 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Explore features
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
