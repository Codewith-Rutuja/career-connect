import { motion } from "framer-motion";
import { Bookmark, BriefcaseBusiness, MapPin, MoveRight, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

function JobCard({ job, isSaved, onToggleSave }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="glass-panel group overflow-hidden p-6 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {job.jobType}
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold">{job.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{job.companyName}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleSave(job)}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
            isSaved
              ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300"
              : "border-white/60 bg-white/70 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
          }`}
          aria-label="Save job"
        >
          <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{job.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.skills?.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          {job.location}
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={16} />
          {job.applicantCount || 0} applicants
        </div>
        <div className="flex items-center gap-2">
          <Wallet size={16} />
          {job.salary || "Compensation discussed"}
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition group-hover:gap-3 dark:text-white"
        >
          View job
          <MoveRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
}

export default JobCard;
