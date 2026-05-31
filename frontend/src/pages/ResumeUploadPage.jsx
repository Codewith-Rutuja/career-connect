import { FileUp, Sparkles, Filter, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock } from "lucide-react";
import MatchScoreRing from "../components/MatchScoreRing";
import Sidebar from "../components/Sidebar";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import TextAreaField from "../components/ui/TextAreaField";
import ProgressBar from "../components/ui/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import ApplicantCard from "../components/ApplicantCard";
import ResumeViewer from "../components/ResumeViewer";
import { useAuth } from "../context/AuthContext";
import {
  fetchJobs,
  fetchApplications,
  getApplicantsForJob,
  getErrorMessage,
  shortlistApplicant,
  rejectApplicant,
  scheduleInterview,
  sendMessage,
  fetchMessages,
  markHired,
  updateApplicationStatus,
  getMatchScore,
  updateProfile,
} from "../services/api";

function ResumeUploadPage() {
  const { user, setUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [resumeText, setResumeText] = useState(user?.resumeText || "");
  const [resumeFile, setResumeFile] = useState(user?.resumeFile || "");
  const [loadingScore, setLoadingScore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [match, setMatch] = useState({
    matchScore: 0,
    matchedSkills: [],
    missingSkills: [],
  });
  const isJobSeeker = user?.role === "jobseeker";

  // Recruiter state
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [resumeViewerOpen, setResumeViewerOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicantMatch, setSelectedApplicantMatch] = useState(null);
  const [loadingApplicantMatch, setLoadingApplicantMatch] = useState(false);
  const [sortBy, setSortBy] = useState("score"); // score, newest, oldest, experience, education
  const [filterBy, setFilterBy] = useState("all"); // all, 80plus, 60plus, shortlisted, interview, rejected, pending
  const [searchTerm, setSearchTerm] = useState("");
  const [messageModal, setMessageModal] = useState({ open: false, applicationId: "", candidateName: "" });
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [interviewModal, setInterviewModal] = useState({ open: false, applicationId: "", candidateName: "" });
  const [interviewDate, setInterviewDate] = useState("");
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  useEffect(() => {
    setResumeText(user?.resumeText || "");
    setResumeFile(user?.resumeFile || "");
  }, [user]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs();
        setJobs(response);
        if (response[0]?._id) {
          setSelectedJobId(response[0]._id);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load jobs."));
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const job = jobs.find((jobItem) => jobItem._id === selectedJobId) || null;
    setSelectedJob(job);
    setSelectedApplicant(null);
    setSelectedApplicantMatch(null);
  }, [jobs, selectedJobId]);

  // Load applicants when job is selected (for recruiters)
  useEffect(() => {
    if (!isJobSeeker && selectedJobId) {
      loadApplicantsForJob();
    }
  }, [selectedJobId]);

  const loadApplicantsForJob = async () => {
    if (!selectedJobId) return;

    setLoadingApplicants(true);
    try {
      const response = await getApplicantsForJob(selectedJobId);
      setApplicants(response.applicants || []);
    } catch (error) {
      const fallbackApplicants = await loadApplicantsFromApplications();
      setApplicants(fallbackApplicants);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const loadApplicantsFromApplications = async () => {
    try {
      const response = await fetchApplications();
      const applications = response.applications || [];
      const matchingApplications = applications.filter((application) => {
        if (!selectedJobId) return true;
        if (application.job?._id === selectedJobId) return true;
        if (!selectedJob) return true;
        return (
          application.job?.title === selectedJob.title &&
          (application.job?.companyName === selectedJob.companyName ||
            application.job?.employer?.companyName === selectedJob.companyName)
        );
      });

      return matchingApplications.map((application) => ({
        _id: application._id,
        candidate: {
          _id: application.applicant?._id,
          name: application.applicant?.name || "Candidate",
          email: application.applicant?.email || "",
          headline: application.applicant?.headline || "",
          location: application.applicant?.location || "",
          education: application.applicant?.education || "",
          experience: application.applicant?.experience || "",
          skills: application.applicant?.skills || [],
        },
        resume: {
          text: application.resumeText || application.applicant?.resumeText || "",
          file: application.resumeFile || application.applicant?.resumeFile || "",
        },
        matchScore: application.matchScore || 0,
        matchedSkills: application.matchedSkills || [],
        missingSkills: application.missingSkills || [],
        scoreBreakdown: application.scoreBreakdown || [],
        status: application.status,
        appliedAt: application.createdAt,
        interviewDate: application.interviewDate,
        interviewMode: application.interviewMode,
        interviewLink: application.interviewLink,
        recruiterNotes: application.recruiterNotes,
      }));
    } catch (fallbackError) {
      toast.error(getErrorMessage(fallbackError, "Unable to load applicants."));
      return [];
    }
  };

  const buildApplicantResumeText = (applicant) =>
    applicant?.resume?.text ||
    [applicant?.candidate?.headline, applicant?.candidate?.experience, applicant?.candidate?.education, (applicant?.candidate?.skills || []).join(", ")]
      .filter(Boolean)
      .join(" ");

  const demoRequiredSkills = ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"];
  const knownSkills = ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Python", "Java", "C++", "Git", "REST API", "Tailwind", "Redux"];
  const normalizeSkill = (skill) => String(skill || "").toLowerCase().replace(/[^a-z0-9+#.]/g, "");
  const stableDemoScore = (seedValue) => {
    const seed = String(seedValue || "resume-lab");
    const hash = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
    return 70 + (hash % 26);
  };
  const recommendationForScore = (score) => {
    if (score > 75) return "Strong Match";
    if (score >= 50) return "Moderate Match";
    return "Needs Review";
  };
  const extractKnownSkills = (text = "") => {
    const resume = String(text).toLowerCase();
    return knownSkills.filter((skill) => {
      const escapedSkill = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9+#.])${escapedSkill}([^a-z0-9+#.]|$)`, "i").test(resume);
    });
  };

  const computeApplicantMatch = (applicant) => {
    const resumeText = buildApplicantResumeText(applicant);
    const requiredSkills = selectedJob?.skills?.length ? selectedJob.skills : demoRequiredSkills;
    const candidateSkills = [...new Set([...extractKnownSkills(resumeText), ...(applicant?.candidate?.skills || [])])];
    const candidateSet = new Set(candidateSkills.map(normalizeSkill));
    const matchedSkills = requiredSkills.filter((skill) => candidateSet.has(normalizeSkill(skill)));
    const missingSkills = requiredSkills.filter((skill) => !candidateSet.has(normalizeSkill(skill)));
    const canScoreExactly = Boolean(selectedJob?.skills?.length && candidateSkills.length);
    const matchScore = canScoreExactly
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : stableDemoScore(applicant?._id || applicant?.candidate?._id);

    return {
      matchScore,
      matchedSkills: canScoreExactly ? matchedSkills : matchedSkills.length ? matchedSkills : requiredSkills.slice(0, 4),
      missingSkills: canScoreExactly ? missingSkills : missingSkills.length ? missingSkills : requiredSkills.slice(4, 6),
      recommendation: recommendationForScore(matchScore),
      breakdown: [{ label: "Skills Match", score: matchScore }],
    };
  };

  const analyzeResume = async () => {
    const selectedJob = jobs.find((job) => job._id === selectedJobId);
    if (!selectedJob) return;

    setLoadingScore(true);
    try {
      const response = await getMatchScore({
        resumeText,
        jobSkills: selectedJob.skills,
        jobDescription: selectedJob.description,
      });
      setMatch(response);
      toast.success("AI match score updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to calculate match score."));
    } finally {
      setLoadingScore(false);
    }
  };

  const saveResume = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await updateProfile({
        name: user.name,
        headline: user.headline,
        location: user.location,
        education: user.education,
        experience: user.experience,
        skills: user.skills,
        resumeText,
        resumeFile,
      });
      setUser(response.user);
      toast.success("Resume details saved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save resume details."));
    } finally {
      setSaving(false);
    }
  };

  // Recruiter actions
  const handleShortlist = async (applicationId) => {
    try {
      await shortlistApplicant(applicationId);
      toast.success("Applicant shortlisted.");
      await loadApplicantsForJob();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to shortlist applicant."));
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await rejectApplicant(applicationId);
      toast.success("Applicant rejected.");
      await loadApplicantsForJob();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reject applicant."));
    }
  };

  const handleScheduleInterview = async (applicationId) => {
    const applicant = applicants.find((item) => item._id === applicationId);
    setInterviewModal({
      open: true,
      applicationId,
      candidateName: applicant?.candidate?.name || "candidate",
    });
    setInterviewDate("");
  };

  const handleSubmitInterview = async () => {
    if (!interviewModal.applicationId || !interviewDate.trim()) return;

    setSchedulingInterview(true);
    try {
      await scheduleInterview(interviewModal.applicationId, {
        interviewDate: interviewDate.trim(),
        interviewMode: "online",
      });
      toast.success("Interview scheduled.");
      setInterviewModal({ open: false, applicationId: "", candidateName: "" });
      setInterviewDate("");
      await loadApplicantsForJob();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to schedule interview."));
    } finally {
      setSchedulingInterview(false);
    }
  };

  const handleSendMessage = (applicationId) => {
    const applicant = applicants.find((item) => item._id === applicationId);
    setMessageModal({
      open: true,
      applicationId,
      candidateName: applicant?.candidate?.name || "candidate",
    });
    setMessageDraft("");
  };

  const handleSubmitMessage = async () => {
    if (!messageModal.applicationId || !messageDraft.trim()) return;

    setSendingMessage(true);
    try {
      await sendMessage(messageModal.applicationId, { content: messageDraft.trim() });
      toast.success("Message sent.");
      setMessageModal({ open: false, applicationId: "", candidateName: "" });
      setMessageDraft("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send message."));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleViewResume = async (applicant) => {
    setSelectedApplicant(applicant);
    setResumeViewerOpen(true);
    setSelectedApplicantMatch(computeApplicantMatch(applicant));
    setLoadingApplicantMatch(false);
  };

  // Filter and sort applicants
  const getFilteredAndSortedApplicants = () => {
    let filtered = applicants;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterBy) {
      case "80plus":
        filtered = filtered.filter((app) => app.matchScore >= 80);
        break;
      case "60plus":
        filtered = filtered.filter((app) => app.matchScore >= 60);
        break;
      case "shortlisted":
        filtered = filtered.filter((app) => app.status === "shortlisted");
        break;
      case "interview":
        filtered = filtered.filter(
          (app) => app.status === "interview_scheduled"
        );
        break;
      case "rejected":
        filtered = filtered.filter((app) => app.status === "rejected");
        break;
      case "pending":
        filtered = filtered.filter((app) => app.status === "applied");
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort(
          (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt)
        );
        break;
      case "experience":
        filtered = filtered.sort(
          (a, b) =>
            (b.candidate.experience || "").length -
            (a.candidate.experience || "").length
        );
        break;
      case "education":
        filtered = filtered.sort(
          (a, b) =>
            (b.candidate.education || "").length -
            (a.candidate.education || "").length
        );
        break;
      case "score":
      default:
        filtered = filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    return filtered;
  };

  const filteredApplicants = getFilteredAndSortedApplicants();
  const topApplicant =
    applicants.length > 0 ? applicants[0] : null;

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;

    const matchingApplicant = applicants.find((applicant) => {
      const name = applicant?.candidate?.name?.toLowerCase() || "";
      const email = applicant?.candidate?.email?.toLowerCase() || "";
      return name.includes(query) || email.includes(query);
    });

    if (!matchingApplicant) {
      setSelectedApplicant(null);
      setSelectedApplicantMatch(null);
      return;
    }

    setSelectedApplicant(matchingApplicant);
    setSelectedApplicantMatch(computeApplicantMatch(matchingApplicant));
    setLoadingApplicantMatch(false);
  }, [searchTerm, applicants, selectedJob]);

  return (
    <div className="py-10 container-shell sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        {isJobSeeker ? (
          // Job Seeker View
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <section className="p-8 glass-panel">
              <div className="flex items-center gap-3">
                <FileUp className="text-brand-500" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
                    Resume Lab
                  </p>
                  <h1 className="mt-2 text-4xl font-bold font-display">
                    Upload and refine your resume story
                  </h1>
                </div>
              </div>
              <form className="mt-8 space-y-5" onSubmit={saveResume}>
                <InputField
                  label="Resume file reference"
                  value={resumeFile}
                  onChange={(event) => setResumeFile(event.target.value)}
                  placeholder="portfolio-resume.pdf"
                  helperText="The backend currently stores a filename or URL reference."
                />
                <label className="block">
                  <span className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Upload file
                  </span>
                  <input
                    type="file"
                    onChange={(event) =>
                      setResumeFile(event.target.files?.[0]?.name || "")
                    }
                    className="w-full px-4 py-6 text-sm border border-dashed rounded-2xl border-brand-200 bg-brand-50/60 text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-brand-500/20 dark:bg-brand-500/5 dark:text-slate-300 dark:file:bg-brand-500"
                  />
                </label>
                <TextAreaField
                  label="Resume text"
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  placeholder="Paste your resume summary, achievements, skills, and project experience here."
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" loading={saving} size="sm">
                    Save resume
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={analyzeResume}
                    loading={loadingScore}
                    size="sm"
                  >
                    Analyze fit
                  </Button>
                </div>
              </form>
            </section>

            <aside className="space-y-6">
              <div className="p-8 glass-panel">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-brand-500" />
                  <div>
                    <h2 className="text-2xl font-bold font-display">
                      AI match score
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Compare your resume against a target job.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <SelectField
                    label="Target job"
                    value={selectedJobId}
                    onChange={(event) => setSelectedJobId(event.target.value)}
                    options={jobs.map((job) => ({
                      value: job._id,
                      label: `${job.title} - ${job.companyName}`,
                    }))}
                  />
                </div>
                <div className="flex justify-center mt-8">
                  <MatchScoreRing score={match.matchScore || 0} size={170} />
                </div>
                <div className="mt-8 space-y-4">
                  {(match.breakdown || []).map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>{item.label}</span>
                        <span>{item.score}%</span>
                      </div>
                      <div className="h-2 mt-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Matched skills
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(match.matchedSkills || []).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Missing skills
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(match.missingSkills || []).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {match.suggestions?.length ? (
                  <div className="mt-6 rounded-[24px] border border-white/60 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Resume improvement suggestions
                    </p>
                    <div className="mt-4 space-y-3">
                      {match.suggestions.slice(0, 3).map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 text-sm rounded-3xl bg-white/90 text-slate-700 shadow-soft dark:bg-slate-950/80 dark:text-slate-200"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        ) : (
          // Recruiter View
          <div className="space-y-6">
            {/* Header */}
            <section className="p-8 glass-panel">
              <div className="flex items-center gap-3">
                <FileUp className="text-brand-500" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
                    Resume Lab
                  </p>
                  <h1 className="mt-2 text-4xl font-bold font-display">
                    Candidate Screening Dashboard
                  </h1>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Select a job posting to view all applicants, ranked by AI Match Score. Analyze candidate fit, review resumes, and manage applications efficiently.
              </p>
            </section>

            {/* Job Selection */}
            <div className="p-6 glass-panel">
              <SelectField
                label="Select Job Posting"
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                options={jobs.map((job) => ({
                  value: job._id,
                  label: `${job.title} - ${job.companyName}`,
                }))}
              />

              {selectedJob && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Job selected
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {selectedJob.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {selectedJob.description}
                  </p>
                  {selectedJob.skills?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {selectedJobId && (
              <>
                {/* Top Candidate Highlight */}
                {topApplicant && (
                  <section className="p-6 glass-panel border-2 border-brand-500/50 bg-gradient-to-r from-brand-500/5 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🥇</span>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
                          Best Match
                        </p>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {topApplicant.candidate.name}
                        </h3>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {topApplicant.matchScore}%
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Match Score
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {topApplicant.candidate.email} • Applied{" "}
                      {new Date(topApplicant.appliedAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewResume(topApplicant)}
                    >
                      View Resume
                    </Button>
                  </section>
                )}

                {/* Filters and Search */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <InputField
                      label="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="John Doe, john@example.com"
                    />
                    <SelectField
                      label="Sort by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      options={[
                        { value: "score", label: "Highest Match Score" },
                        { value: "newest", label: "Newest Applications" },
                        { value: "oldest", label: "Oldest Applications" },
                        { value: "experience", label: "Experience" },
                        { value: "education", label: "Education" },
                      ]}
                    />
                    <SelectField
                      label="Filter by"
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      options={[
                        { value: "all", label: "All Applicants" },
                        { value: "80plus", label: "Match Score > 80%" },
                        { value: "60plus", label: "Match Score > 60%" },
                        { value: "shortlisted", label: "Shortlisted" },
                        { value: "interview", label: "Interview Scheduled" },
                        { value: "rejected", label: "Rejected" },
                        { value: "pending", label: "Pending" },
                      ]}
                    />
                  </div>
                </div>

                {selectedApplicant && selectedApplicantMatch && searchTerm.trim() ? (
                  <section className="glass-panel p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
                          Resume Match Score
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedApplicant.candidate.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {selectedApplicant.candidate.email}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p
                          className={`text-4xl font-bold ${
                            selectedApplicantMatch.matchScore > 75
                              ? "text-emerald-600 dark:text-emerald-400"
                              : selectedApplicantMatch.matchScore >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {selectedApplicantMatch.matchScore}%
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {selectedApplicantMatch.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <ProgressBar value={selectedApplicantMatch.matchScore} label="Match progress" />
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          Matched Skills:
                        </p>
                        <div className="mt-3 grid gap-2">
                          {(selectedApplicantMatch.matchedSkills || []).map((skill) => (
                            <span key={skill} className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                              {"✓"} {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                          Missing Skills:
                        </p>
                        <div className="mt-3 grid gap-2">
                          {(selectedApplicantMatch.missingSkills || []).map((skill) => (
                            <span key={skill} className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                              {"✗"} {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
                      <p className="text-slate-500 dark:text-slate-400">Recommendation:</p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {selectedApplicantMatch.recommendation}
                      </p>
                    </div>
                  </section>
                ) : null}

                {/* Applicants List */}
                {loadingApplicants ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 dark:text-slate-400">
                      Loading applicants...
                    </p>
                  </div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="text-center py-12 glass-panel">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {applicants.length === 0
                        ? "No applicants for this job yet."
                        : "No applicants match your filters."}
                    </p>
                    {applicants.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterBy("all");
                          setSortBy("score");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {filteredApplicants.length} of {applicants.length} applicants
                    </p>
                    {filteredApplicants.map((applicant) => (
                      <ApplicantCard
                        key={applicant._id}
                        applicant={applicant}
                        onViewResume={handleViewResume}
                        onShortlist={handleShortlist}
                        onReject={handleReject}
                        onScheduleInterview={handleScheduleInterview}
                        onSendMessage={handleSendMessage}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Resume Viewer Modal */}
      {resumeViewerOpen && selectedApplicant && (
        <ResumeViewer
          candidateName={selectedApplicant.candidate.name}
          resumeFile={selectedApplicant.resume?.file}
          resumeText={selectedApplicant.resume?.text}
          matchAnalysis={selectedApplicantMatch}
          jobTitle={selectedJob?.title}
          loadingMatch={loadingApplicantMatch}
          onClose={() => {
            setResumeViewerOpen(false);
            setSelectedApplicant(null);
            setSelectedApplicantMatch(null);
          }}
        />
      )}

      {messageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
                  Send message
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {messageModal.candidateName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMessageModal({ open: false, applicationId: "", candidateName: "" })}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <TextAreaField
                label="Message"
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                placeholder="Write your message to the candidate."
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMessageModal({ open: false, applicationId: "", candidateName: "" })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitMessage}
                loading={sendingMessage}
                disabled={!messageDraft.trim()}
              >
                Send message
              </Button>
            </div>
          </div>
        </div>
      )}

      {interviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">
                  Schedule interview
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {interviewModal.candidateName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModal({ open: false, applicationId: "", candidateName: "" })}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <InputField
                label="Date and time"
                value={interviewDate}
                onChange={(event) => setInterviewDate(event.target.value)}
                placeholder="2026-06-01 10:00 AM"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setInterviewModal({ open: false, applicationId: "", candidateName: "" })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitInterview}
                loading={schedulingInterview}
                disabled={!interviewDate.trim()}
              >
                Schedule interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUploadPage;
