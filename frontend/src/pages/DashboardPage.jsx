import { BriefcaseBusiness, PlusCircle, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";
import MatchScoreRing from "../components/MatchScoreRing";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import TextAreaField from "../components/ui/TextAreaField";
import { useAuth } from "../context/AuthContext";
import { createJob, deleteJob, fetchDashboard, getErrorMessage, updateJob } from "../services/api";

function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    skills: "",
    location: "",
    salary: "",
    jobType: "Full-time",
  });
  const [editingJobId, setEditingJobId] = useState(null);
  const [submittingJob, setSubmittingJob] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetchDashboard();
      setDashboard(response);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const seekerStats = useMemo(() => {
    const applications = dashboard?.applications || [];
    return {
      total: applications.length,
      underReview: applications.filter((item) => item.status === "under_review").length,
      shortlisted: applications.filter((item) => item.status === "shortlisted").length,
      interviewScheduled: applications.filter((item) => item.status === "interview_scheduled").length,
      offerSent: applications.filter((item) => item.status === "offer_sent").length,
      hired: applications.filter((item) => item.status === "hired").length,
    };
  }, [dashboard]);

  const recruiterStats = useMemo(() => {
    const jobs = dashboard?.jobs || [];
    const applications = dashboard?.applications || [];
    return {
      jobs: jobs.length,
      applications: applications.length,
      shortlisted: applications.filter((item) => item.status === "shortlisted").length,
      interviewScheduled: applications.filter((item) => item.status === "interview_scheduled").length,
      hired: applications.filter((item) => item.status === "hired").length,
    };
  }, [dashboard]);

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setSubmittingJob(true);

    try {
      if (editingJobId) {
        await updateJob(editingJobId, jobForm);
        toast.success("Job updated successfully.");
        setEditingJobId(null);
      } else {
        await createJob(jobForm);
        toast.success("Job posted successfully.");
      }

      setJobForm({
        title: "",
        description: "",
        skills: "",
        location: "",
        salary: "",
        jobType: "Full-time",
      });
      loadDashboard();
    } catch (error) {
      toast.error(getErrorMessage(error, editingJobId ? "Unable to update the job." : "Unable to create the job."));
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJobId(job._id);
    setJobForm({
      title: job.title || "",
      description: job.description || "",
      skills: job.skills?.join(", ") || "",
      location: job.location || "",
      salary: job.salary || "",
      jobType: job.jobType || "Full-time",
    });
  };

  const handleDeleteJob = async (id) => {
    setSubmittingJob(true);
    try {
      await deleteJob(id);
      toast.success("Job deleted successfully.");
      if (editingJobId === id) {
        setEditingJobId(null);
        setJobForm({
          title: "",
          description: "",
          skills: "",
          location: "",
          salary: "",
          jobType: "Full-time",
        });
      }
      loadDashboard();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete the job."));
    } finally {
      setSubmittingJob(false);
    }
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-8">
          <section className="glass-panel p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Dashboard</p>
            <h1 className="mt-4 font-display text-4xl font-bold">
              {user?.role === "employer" ? "Recruiter command center" : "Your career momentum, organized"}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              {user?.role === "employer"
                ? "Track posted jobs, review applicants, and keep hiring decisions moving."
                : "Review your applications, interview progress, and AI fit insights in one place."}
            </p>
          </section>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="glass-panel h-32 animate-pulse" />
              ))}
            </div>
          ) : user?.role === "employer" ? (
            <>
              <div className="grid gap-5 md:grid-cols-4">
                <StatCard label="Open jobs" value={recruiterStats.jobs} />
                <StatCard label="Applications" value={recruiterStats.applications} accent="amber" />
                <StatCard label="Interviews" value={recruiterStats.interviewScheduled} accent="sky" />
                <StatCard label="Hired" value={recruiterStats.hired} accent="emerald" />
              </div>

              <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="glass-panel p-8">
                  <div className="flex items-center gap-3">
                    <PlusCircle className="text-brand-500" />
                    <div>
                      <h2 className="font-display text-2xl font-bold">Post a new job</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Publish a polished job card directly from the dashboard.
                      </p>
                    </div>
                  </div>
                  <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateJob}>
                    <InputField label="Job title" value={jobForm.title} onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))} required />
                    <InputField label="Location" value={jobForm.location} onChange={(event) => setJobForm((current) => ({ ...current, location: event.target.value }))} required />
                    <InputField label="Salary" value={jobForm.salary} onChange={(event) => setJobForm((current) => ({ ...current, salary: event.target.value }))} />
                    <SelectField
                      label="Job type"
                      value={jobForm.jobType}
                      onChange={(event) => setJobForm((current) => ({ ...current, jobType: event.target.value }))}
                      options={[
                        { value: "Full-time", label: "Full-time" },
                        { value: "Part-time", label: "Part-time" },
                        { value: "Contract", label: "Contract" },
                        { value: "Internship", label: "Internship" },
                        { value: "Remote", label: "Remote" },
                      ]}
                    />
                    <InputField
                      label="Skills"
                      value={jobForm.skills}
                      onChange={(event) => setJobForm((current) => ({ ...current, skills: event.target.value }))}
                      className="md:col-span-2"
                      helperText="Separate skills with commas."
                    />
                    <TextAreaField
                      label="Description"
                      value={jobForm.description}
                      onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))}
                      className="md:col-span-2"
                      required
                    />
                    <div className="md:col-span-2">
                      <Button type="submit" loading={submittingJob}>{editingJobId ? "Update job" : "Publish job"}</Button>
                      {editingJobId && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="ml-3"
                          onClick={() => {
                            setEditingJobId(null);
                            setJobForm({
                              title: "",
                              description: "",
                              skills: "",
                              location: "",
                              salary: "",
                              jobType: "Full-time",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                  {dashboard?.jobs?.length ? (
                    <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/80">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Posted jobs</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage job postings, edit details, or remove outdated positions.</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{dashboard.jobs.length} live</span>
                      </div>
                      <div className="space-y-4">
                        {dashboard.jobs.map((job) => (
                          <div key={job._id} className="rounded-[24px] border border-white/70 bg-white p-4 dark:border-white/10 dark:bg-slate-900/80">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{job.title}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{job.location} • {job.jobType}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="secondary" onClick={() => handleEditJob(job)}>
                                  Edit
                                </Button>
                                <Button type="button" variant="outline" onClick={() => handleDeleteJob(job._id)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="glass-panel p-8">
                  <div className="flex items-center gap-3">
                    <UsersRound className="text-brand-500" />
                    <div>
                      <h2 className="font-display text-2xl font-bold">Recent applicants</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Quickly review the latest candidate activity.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {dashboard?.applications?.length ? (
                      dashboard.applications.slice(0, 5).map((application) => (
                        <div key={application._id} className="rounded-[24px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{application.applicant?.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{application.job?.title}</p>
                            </div>
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                              {application.status}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-slate-500 dark:text-slate-400">Match score</div>
                            <div className="text-lg font-bold text-emerald-500">{application.matchScore || 0}%</div>
                          </div>
                          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            Resume: {application.resumeFile || application.applicant?.resumeFile || "Resume text submitted"}
                          </div>
                          {!!application.coverLetter && (
                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {application.coverLetter}
                            </p>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(application.matchedSkills || []).slice(0, 4).map((skill) => (
                              <span key={skill} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                                {skill}
                              </span>
                            ))}
                            {(application.missingSkills || []).slice(0, 3).map((skill) => (
                              <span key={skill} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                                Missing: {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No applicants yet"
                        description="Once people start applying, this space will show their progress and fit."
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className="glass-panel p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Candidate ranking</p>
                    <h2 className="mt-2 font-display text-2xl font-bold">Top applicants by AI match</h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Auto-sorted by highest fit score.</p>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400">
                        <th className="pb-3 pr-6">Candidate</th>
                        <th className="pb-3 pr-6">Role</th>
                        <th className="pb-3 pr-6">Match</th>
                        <th className="pb-3 pr-6">Status</th>
                        <th className="pb-3">Key skills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.applications
                        .slice()
                        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                        .slice(0, 8)
                        .map((application) => (
                          <tr key={application._id} className="rounded-[28px] border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-slate-900/80">
                            <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-100">{application.applicant?.name}</td>
                            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{application.job?.title}</td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                {application.matchScore || 0}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{application.status}</td>
                            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                              {(application.matchedSkills || []).slice(0, 3).join(", ") || "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-4">
                <StatCard label="Applications" value={seekerStats.total} />
                <StatCard label="Under review" value={seekerStats.underReview} accent="amber" />
                <StatCard label="Shortlisted" value={seekerStats.shortlisted} accent="rose" />
                <StatCard label="Offers" value={seekerStats.offerSent} accent="emerald" />
              </div>

              <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="glass-panel p-8">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-brand-500" />
                    <div>
                      <h2 className="font-display text-2xl font-bold">Resume strength</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Based on your current profile and application history.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <MatchScoreRing score={Math.min(98, 55 + (user?.skills?.length || 0) * 6)} size={180} />
                  </div>
                  <div className="mt-6 rounded-[24px] border border-white/60 bg-white/80 p-5 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
                    Add richer project details, highlight measurable outcomes, and keep your top skills aligned with target jobs to improve match quality.
                  </div>
                </div>

                <div className="glass-panel p-8">
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness className="text-brand-500" />
                    <div>
                      <h2 className="font-display text-2xl font-bold">Recent applications</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Track every application and hiring-stage update.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    {dashboard?.applications?.length ? (
                      dashboard.applications.map((application) => (
                        <div key={application._id} className="rounded-[24px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-display text-xl font-bold">{application.job?.title}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {[application.job?.companyName, application.job?.location].filter(Boolean).join(" | ")}
                              </p>
                            </div>
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                              {application.status}
                            </span>
                          </div>
                          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            Resume used: {application.resumeFile || "Profile resume text"}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(application.matchedSkills || []).slice(0, 4).map((skill) => (
                              <span key={skill} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">{skill}</span>
                            ))}
                          </div>
                          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            Match score: <span className="font-semibold text-slate-900 dark:text-white">{application.matchScore || 0}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No applications yet"
                        description="Start exploring roles and your activity will show up here."
                      />
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
