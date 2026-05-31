import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { candidateHighlights, recruiterHighlights } from "../assets/mockData";
import Button from "../components/ui/Button";
import StatCard from "../components/StatCard";

const features = [
  {
    icon: WandSparkles,
    title: "AI-powered match intelligence",
    description:
      "Instantly visualize fit with animated match scoring, skill overlap, and what candidates should improve next.",
  },
  {
    icon: BriefcaseBusiness,
    title: "A streamlined job discovery flow",
    description:
      "Search, filter, save, and apply across beautifully designed listings crafted for speed and clarity.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Recruiter control center",
    description:
      "Track roles, applications, candidate quality, and hiring momentum through a recruiter-first dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Protected and role-aware",
    description:
      "JWT-backed authentication keeps recruiter and candidate experiences secure, focused, and personalized.",
  },
];

function LandingPage() {
  return (
    <div className="py-10 container-shell sm:py-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 shadow-soft dark:bg-slate-900/80 dark:text-brand-300"
          >
            <Sparkles size={14} />
            Hiring made simpler
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 max-w-3xl font-display text-5xl font-black leading-[1.02] text-ink sm:text-6xl lg:text-7xl dark:text-white"
          >
            Connecting talent with opportunity.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300"
          >
            CareerConnect helps students, job seekers, and recruiters connect through a clear
            hiring experience with AI-assisted fit scoring, modern dashboards, and fast,
            thoughtful workflows.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="flex flex-col gap-4 mt-8 sm:flex-row"
          >
            <Button as={Link} to="/register" className="px-6">
              Create account
              <ArrowRight size={16} />
            </Button>
            <Button as={Link} to="/jobs" variant="secondary" className="px-6">
              Explore jobs
            </Button>
          </motion.div>
          <div className="flex flex-wrap gap-3 mt-10">
            {["Role-based dashboards", "Animated fit score", "Bookmarks", "Resume lab"].map((item) => (
              <span
                key={item}
                className="px-4 py-2 text-sm border rounded-full border-white/60 bg-white/70 text-slate-600 shadow-soft dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative p-6 overflow-hidden glass-panel"
          >
            <div className="absolute inset-0 opacity-50 pointer-events-none mesh-grid" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">AI Match Preview</p>
                  <h2 className="mt-1 text-2xl font-bold font-display">Frontend Engineer</h2>
                </div>
                <div className="px-3 py-1 text-sm font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  89% strong fit
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="flex items-center justify-center rounded-[28px] border border-white/60 bg-white/80 p-6 dark:border-white/10 dark:bg-slate-900/80">
                  <div className="relative">
                    <div className="h-36 w-36 rounded-full border-[14px] border-brand-100 dark:border-brand-500/10" />
                    <div className="absolute inset-3 rounded-full border-[14px] border-transparent border-t-emerald-500 border-r-emerald-400" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-4xl font-bold font-display text-emerald-500">89%</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        match
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 rounded-[28px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Tailwind", "REST APIs", "Motion", "UI Systems"].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="pt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {["TypeScript", "Testing"].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Candidate replies" value="3.1x faster" />
            <StatCard label="Qualified applications" value="82%" accent="amber" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 mt-20 md:grid-cols-3">
        {candidateHighlights.concat(recruiterHighlights).map((item, index) => (
          <motion.div
            key={`${item.label}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="gradient-ring rounded-[28px] p-6"
          >
            <p className="text-4xl font-bold font-display">{item.value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
          </motion.div>
        ))}
      </section>

      <section className="mt-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Product highlights</p>
          <h2 className="mt-4 text-4xl font-bold font-display">Designed like a modern startup product.</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Every key flow, from first login to recruiter review, is tuned for polish, clarity,
            and momentum.
          </p>
        </div>
        <div className="grid gap-5 mt-10 lg:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 glass-panel"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-xl font-bold font-display">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col gap-6 p-8 glass-panel md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Ready to move?</p>
            <h2 className="mt-4 text-4xl font-bold font-display">Launch your next career chapter.</h2>
            <p className="max-w-2xl mt-3 text-slate-600 dark:text-slate-300">
              Sign in as a job seeker or recruiter and start using the full CareerConnect experience.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button as={Link} to="/register">Start free</Button>
            <Button as={Link} to="/jobs" variant="secondary">Browse jobs</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 mt-20 lg:grid-cols-3">
        {[
          "Students can discover higher-quality opportunities and understand fit before applying.",
          "Recruiters get cleaner visibility into applicants, roles, and hiring momentum from one place.",
          "Every interaction is built with strong motion, polished surfaces, and responsive detail.",
        ].map((quote) => (
          <div key={quote} className="p-6 glass-panel">
            <BadgeCheck className="text-brand-500" />
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{quote}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default LandingPage;
