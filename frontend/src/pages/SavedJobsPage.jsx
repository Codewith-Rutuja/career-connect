import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import Sidebar from "../components/Sidebar";
import Button from "../components/ui/Button";
import { useLocalStorage } from "../hooks/useLocalStorage";

function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useLocalStorage("careerconnect-saved-jobs", []);

  const toggleSave = (job) => {
    setSavedJobs((current) => current.filter((savedJob) => savedJob._id !== job._id));
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <Sidebar />
        <section>
          <div className="glass-panel p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Saved jobs</p>
            <h1 className="mt-4 font-display text-4xl font-bold">Your bookmarked opportunities</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Keep high-potential jobs close so you can review and apply with focus.
            </p>
          </div>
          <div className="mt-8">
            {savedJobs.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {savedJobs.map((job) => (
                  <JobCard key={job._id} job={job} isSaved onToggleSave={toggleSave} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No saved jobs yet"
                description="Bookmark roles from the listings page and they will appear here."
                action={<Button as={Link} to="/jobs">Explore jobs</Button>}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SavedJobsPage;
