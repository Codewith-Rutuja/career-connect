import { CalendarClock, CheckCircle2, MapPin, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import MatchScoreRing from "../components/MatchScoreRing";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import TextAreaField from "../components/ui/TextAreaField";
import { useAuth } from "../context/AuthContext";
import { applyToJob, fetchJobById, getErrorMessage, getMatchScore } from "../services/api";

const readResumeFile = async (file) => {
  if (!file) {
    return "";
  }

  const isTextLike =
    file.type.startsWith("text/") ||
    /\.(txt|md|json|csv)$/i.test(file.name);

  if (!isTextLike) {
    return "";
  }

  return file.text();
};

function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [applyForm, setApplyForm] = useState({
    coverLetter: "",
    resumeText: "",
    resumeFile: "",
  });

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchJobById(id);
        setJob(response);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load this job."));
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, user]);

  useEffect(() => {
    const updateScore = async () => {
      if (!job || user?.role !== "jobseeker") {
        setMatchScore(null);
        return;
      }

      try {
        const score = await getMatchScore({
          resumeText:
            applyForm.resumeText || user.resumeText || user.skills?.join(", ") || "",
          jobSkills: job.skills,
          jobDescription: job.description,
        });
        setMatchScore(score);
      } catch {
        setMatchScore(null);
      }
    };

    updateScore();
  }, [applyForm.resumeText, job, user]);

  const handleResumeFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setResumeUploading(true);
    try {
      const extractedText = await readResumeFile(file);

      setApplyForm((current) => ({
        ...current,
        resumeFile: file.name,
        resumeText: extractedText || current.resumeText || user?.resumeText || "",
      }));

      if (!extractedText) {
        toast.success("Resume file selected. Paste resume text too for better AI scoring.");
      } else {
        toast.success("Resume file selected and text loaded for AI scoring.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to read that resume file."));
    } finally {
      setResumeUploading(false);
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please log in before applying.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await applyToJob({
        jobId: id,
        coverLetter: applyForm.coverLetter,
        resumeText: applyForm.resumeText || user.resumeText || user.skills?.join(", "),
        resumeFile: applyForm.resumeFile || user.resumeFile || "",
      });
      toast.success(response.message || "Application submitted.");
      setApplyForm({
        coverLetter: "",
        resumeText: "",
        resumeFile: "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit your application."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !job) {
    return (
      <div className="py-16 container-shell">
        <div className="p-10 glass-panel animate-pulse">
          <div className="h-4 rounded-full w-28 bg-slate-200 dark:bg-slate-800" />
          <div className="w-2/3 h-10 mt-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="w-full h-4 mt-6 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="w-5/6 h-4 mt-2 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 container-shell sm:py-14">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="p-8 glass-panel md:p-10">
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {job.jobType}
            </span>
            <h1 className="mt-5 text-4xl font-bold font-display">{job.title}</h1>
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{job.companyName}</p>
            <div className="grid gap-3 mt-6 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-3">
              <div className="flex items-center gap-2"><MapPin size={16} />{job.location}</div>
              <div className="flex items-center gap-2"><Wallet size={16} />{job.salary || "Compensation discussed"}</div>
              <div className="flex items-center gap-2"><CalendarClock size={16} />{job.applicantCount || 0} applicants</div>
            </div>
          </div>

          <div className="p-8 glass-panel">
            <h2 className="text-2xl font-bold font-display">Job overview</h2>
            <p className="mt-4 text-sm leading-7 whitespace-pre-line text-slate-600 dark:text-slate-300">{job.description}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {job.skills?.map((skill) => (
                <span key={skill} className="px-3 py-1 text-xs font-semibold border rounded-full border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300">{skill}</span>
              ))}
            </div>
          </div>

          <div className="p-8 glass-panel">
            <h2 className="text-2xl font-bold font-display">About the hiring team</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {job.employer?.companyDescription ||
                "A modern team looking for high-signal candidates with strong collaboration and execution skills."}
            </p>
            <div className="mt-6 rounded-[24px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
              <p className="font-semibold">{job.employer?.companyName || job.companyName}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recruiter: {job.employer?.name || "Hiring Team"}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Contact: {job.employer?.email || "talent@careerconnect.io"}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="p-8 glass-panel">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
              <Sparkles size={16} />
              AI Resume Match
            </div>
            <div className="flex items-center justify-center mt-6">
              <MatchScoreRing score={matchScore?.matchScore || 0} size={170} />
            </div>
            <div className="mt-6 space-y-4">
              {(matchScore?.breakdown || []).map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>{item.label}</span>
                    <span>{item.score}%</span>
                  </div>
                  <div className="h-2 mt-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 mt-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Matched skills</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(matchScore?.matchedSkills || []).map((skill) => (
                    <span key={skill} className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Missing skills</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(matchScore?.missingSkills || []).map((skill) => (
                    <span key={skill} className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            {matchScore?.suggestions?.length ? (
              <div className="mt-6 rounded-[24px] border border-white/60 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/80">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Improvement suggestions</p>
                <div className="mt-4 space-y-3">
                  {matchScore.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="p-4 text-sm rounded-3xl bg-white/90 shadow-soft dark:bg-slate-950/80">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-8 glass-panel">
            <h2 className="text-2xl font-bold font-display">Apply to this job</h2>
            {user?.role === "employer" ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Recruiter accounts can review applications from the dashboard, but cannot apply to jobs.
              </p>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleApply}>
                <TextAreaField
                  label="Cover letter"
                  value={applyForm.coverLetter}
                  onChange={(event) => setApplyForm((current) => ({ ...current, coverLetter: event.target.value }))}
                  placeholder="Why are you a strong fit for this opportunity?"
                />
                <TextAreaField
                  label="Resume text override"
                  value={applyForm.resumeText}
                  onChange={(event) => setApplyForm((current) => ({ ...current, resumeText: event.target.value }))}
                  placeholder="Optional: paste an updated resume summary for better match analysis."
                />
                <label className="block">
                  <span className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Resume file
                  </span>
                  <input
                    type="file"
                    onChange={handleResumeFileChange}
                    className="w-full px-4 py-4 text-sm border border-dashed rounded-2xl border-brand-200 bg-brand-50/60 text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-brand-500/20 dark:bg-brand-500/5 dark:text-slate-300 dark:file:bg-brand-500"
                  />
                </label>
                <InputField
                  label="Selected resume"
                  value={applyForm.resumeFile || user?.resumeFile || "No file selected"}
                  disabled
                  className="opacity-80"
                />
                {!user && <InputField label="Note" value="Please log in first to apply." disabled className="opacity-80" />}
                <div className="flex justify-center pt-1">
                  <Button
                    type="submit"
                    loading={submitting || resumeUploading}
                    disabled={!user}
                    className="w-auto min-w-[220px] px-8"
                  >
                    <CheckCircle2 size={16} />
                    Submit application
                  </Button>
                </div>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobDetailsPage;
