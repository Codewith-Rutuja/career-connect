import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import LoadingCard from "../components/LoadingCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchJobs } from "../services/api";

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useLocalStorage("careerconnect-saved-jobs", []);
  const [filters, setFilters] = useState({ keyword: "", location: "", jobType: "" });
  const hiddenJobLabels = ["live role", "live roles", "offer role", "offer roles", "debug role", "debug roles"];

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const response = await fetchJobs(filters);
        setJobs(response);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [filters]);

  const savedIds = useMemo(() => new Set(savedJobs.map((job) => job._id)), [savedJobs]);
  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const searchableText = [job.title, job.companyName, job.description].filter(Boolean).join(" ").toLowerCase();
        return !hiddenJobLabels.some((label) => searchableText.includes(label));
      }),
    [jobs]
  );

  const toggleSave = (job) => {
    setSavedJobs((current) =>
      current.some((savedJob) => savedJob._id === job._id)
        ? current.filter((savedJob) => savedJob._id !== job._id)
        : [job, ...current]
    );
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <section className="glass-panel p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Job discovery</p>
            <p className="mt-4 font-display text-4xl font-bold">Find jobs that actually match your momentum.</p>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Search across curated opportunities, save the best ones, and review each job with polished detail.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/80 px-5 py-4 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-sm text-slate-500 dark:text-slate-400">Saved jobs</p>
            <p className="font-display text-3xl font-bold">{savedJobs.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr_0.8fr_auto]">
          <InputField
            label="Search"
            placeholder="Job title, skill, company"
            value={filters.keyword}
            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
          />
          <InputField
            label="Location"
            placeholder="Remote, Bengaluru, Hyderabad"
            value={filters.location}
            onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
          />
          <SelectField
            label="Job Type"
            value={filters.jobType}
            onChange={(event) => setFilters((current) => ({ ...current, jobType: event.target.value }))}
            options={[
              { value: "", label: "All Types" },
              { value: "Full-time", label: "Full-time" },
              { value: "Part-time", label: "Part-time" },
              { value: "Contract", label: "Contract" },
              { value: "Internship", label: "Internship" },
              { value: "Remote", label: "Remote" },
            ]}
          />
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="w-full" onClick={() => setFilters({ keyword: "", location: "", jobType: "" })}>
              <SlidersHorizontal size={16} />
              Reset
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : visibleJobs.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {visibleJobs.map((job) => (
              <JobCard key={job._id} job={job} isSaved={savedIds.has(job._id)} onToggleSave={toggleSave} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No jobs match this search yet"
            description="Try widening your location or keyword filters to see more opportunities."
            action={
              <Button type="button" variant="secondary" onClick={() => setFilters({ keyword: "", location: "", jobType: "" })}>
                <Search size={16} />
                Clear filters
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}

export default JobsPage;
