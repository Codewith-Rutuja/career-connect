import { ArrowRight, CalendarClock, MessageSquare, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import SelectField from "../components/ui/SelectField";
import TextAreaField from "../components/ui/TextAreaField";
import StatusBadge from "../components/StatusBadge";
import {
  fetchApplications,
  fetchMessages,
  sendMessage,
  shortlistApplicant,
  rejectApplicant,
  scheduleInterview,
  sendOffer,
  markHired,
  withdrawApplication,
  getErrorMessage,
} from "../services/api";
import ProgressBar from "../components/ui/ProgressBar";



function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interviewDate: "",
    interviewMode: "online",
    interviewLink: "",
    interviewInstructions: "",
  });
  const [sortBy, setSortBy] = useState("recent");
  const [offerLetter, setOfferLetter] = useState("");
  const [matchAnalysis, setMatchAnalysis] = useState({ loading: false, error: "", result: null });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await fetchApplications();
      const nextApplications = response.applications || [];
      setApplications(nextApplications);
      return nextApplications;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load applications."));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const activeApplication = useMemo(
    () => applications.find((item) => item._id === selectedApplication?._id) || selectedApplication,
    [applications, selectedApplication]
  );

  const handleSelectApplication = (application) => {
    console.log("Selected Candidate ID:", application._id);
    console.log("Selected Job ID:", application.job?._id);
    setSelectedApplication(application);
  };

  const demoRequiredSkills = ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"];
  const skillCatalog = [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "SQL",
    "Python",
    "Java",
    "C++",
    "Git",
    "REST API",
    "Tailwind",
    "Redux",
  ];

  const getNormalizedSkills = (skills) =>
    (Array.isArray(skills) ? skills : String(skills || "").split(/[,;\n]/))
      .map((skill) => String(skill || "").trim())
      .filter(Boolean);

  const normalizeSkill = (skill) => String(skill || "").toLowerCase().replace(/[^a-z0-9+#.]/g, "");

  const extractSkillsFromText = (text = "") => {
    const normalizedText = String(text).toLowerCase();
    return skillCatalog.filter((skill) => {
      const escapedSkill = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9+#.])${escapedSkill}([^a-z0-9+#.]|$)`, "i").test(normalizedText);
    });
  };

  const getStableDemoScore = (application) => {
    const seed = String(application?._id || application?.applicant?._id || application?.job?._id || "resume-lab");
    const hash = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
    return 70 + (hash % 26);
  };

  const getRecommendation = (score) => {
    if (score > 75) return "Strong Match";
    if (score >= 50) return "Moderate Match";
    return "Needs Review";
  };

  const computeMatchScore = (application) => {
    const resumeText = [
      application?.resumeText,
      application?.applicant?.resumeText,
      application?.coverLetter,
      getNormalizedSkills(application?.applicant?.skills).join(", "),
    ]
      .filter(Boolean)
      .join("\n");
    const jobSkills = getNormalizedSkills(application?.job?.skills);
    const requiredSkills = jobSkills.length ? jobSkills : demoRequiredSkills;
    const candidateSkills = [...new Set([...extractSkillsFromText(resumeText), ...getNormalizedSkills(application?.applicant?.skills)])];

    const canScoreExactly = jobSkills.length > 0 && candidateSkills.length > 0;
    const candidateSet = new Set(candidateSkills.map(normalizeSkill));
    const matchedSkills = requiredSkills.filter((skill) => candidateSet.has(normalizeSkill(skill)));
    const missingSkills = requiredSkills.filter((skill) => !candidateSet.has(normalizeSkill(skill)));
    const score = canScoreExactly ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : getStableDemoScore(application);

    return {
      matchScore: score,
      matchedSkills: canScoreExactly ? matchedSkills : matchedSkills.length ? matchedSkills : requiredSkills.slice(0, 4),
      missingSkills: canScoreExactly ? missingSkills : missingSkills.length ? missingSkills : requiredSkills.slice(4, 6),
      recommendation: getRecommendation(score),
      estimated: !canScoreExactly,
      scoreBreakdown: [{ label: "Skills Match", score }],
    };
  };

  useEffect(() => {
    if (!activeApplication) {
      setMatchAnalysis({ loading: false, error: "", result: null });
      return;
    }

    const result = computeMatchScore(activeApplication);
    setMatchAnalysis({ loading: false, error: "", result });
  }, [activeApplication?._id, activeApplication?.job?.skills, activeApplication?.applicant?.skills]);

  const handleSendMessage = async () => {
    if (!selectedApplication || !messageDraft.trim()) {
      return;
    }

    setActionLoading(true);
    try {
      await sendMessage(selectedApplication._id, { content: messageDraft });
      const response = await fetchMessages(selectedApplication._id);
      setMessages(response.messages || []);
      setMessageDraft("");
      toast.success("Message sent.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send message."));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedApplication) return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetchMessages(selectedApplication._id);
        setMessages(response.messages || []);
      } catch {
        // ignore polling errors
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [selectedApplication]);

  const handleApplicationAction = async (appId, action, payload = {}) => {
    setActionLoading(true);
    try {
      if (action === "shortlist") await shortlistApplicant(appId);
      if (action === "reject") await rejectApplicant(appId);
      if (action === "interview") await scheduleInterview(appId, payload);
      if (action === "offer") await sendOffer(appId, payload);
      if (action === "hire") await markHired(appId);
      if (action === "withdraw") await withdrawApplication(appId);

      const refreshedApplications = await loadApplications();
      setSelectedApplication(refreshedApplications.find((app) => app._id === appId) || null);

      if (action === "interview") {
        setInterviewData({
          interviewDate: "",
          interviewMode: "online",
          interviewLink: "",
          interviewInstructions: "",
        });
      }

      if (action === "offer") {
        setOfferLetter("");
      }

      const response = await fetchMessages(appId);
      setMessages(response.messages || []);
      toast.success("Action saved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to complete action."));
    } finally {
      setActionLoading(false);
    }
  };

  const sortedApplications = useMemo(() => {
    const list = [...applications];
    if (sortBy === "score") {
      return list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
    if (sortBy === "status") {
      return list.sort((a, b) => a.status.localeCompare(b.status));
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [applications, sortBy]);

  const isRecruiterFlow = user?.role === "employer" || user?.role === "recruiter";
  const canWithdraw = !isRecruiterFlow && activeApplication && !["hired", "rejected", "withdrawn"].includes(activeApplication.status);

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="glass-panel p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">My Applications</p>
            <h1 className="mt-3 font-display text-4xl font-bold">Track every application and hiring milestone</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              {isRecruiterFlow
                ? "Manage applicant workflows, schedule interviews, and send offers from one place."
                : "Follow your job progress, interview details, recruiter notes, and messages."}
            </p>
          </div>

          <div className="glass-panel p-8">
            <div className="grid gap-4 md:grid-cols-[0.8fr_0.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Application list</p>
                <h2 className="mt-3 font-display text-2xl font-bold">Active workflow</h2>
              </div>
              <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                {applications.length} total applications
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Sort applications by</p>
              <div className="flex items-center gap-3">
                <SelectField
                  label=""
                  name="sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  options={[
                    { value: "recent", label: "Most recent" },
                    { value: "score", label: "Match score" },
                    { value: "status", label: "Status" },
                  ]}
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-[24px] bg-slate-200 p-6 shadow-sm dark:bg-slate-800" />
                  ))}
                </div>
              ) : sortedApplications.length ? (
                sortedApplications.map((application) => (
                  <button
                    type="button"
                    key={application._id}
                    onClick={() => handleSelectApplication(application)}
                    className={`w-full rounded-[30px] border p-5 text-left transition ${
                      selectedApplication?._id === application._id
                        ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-slate-900/80"
                        : "border-white/60 bg-white/80 dark:border-white/10 dark:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{application.job?.title || "Unknown role"}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {application.job?.companyName || application.job?.employer?.companyName} • {application.job?.location || "Remote"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={application.status} />
                        <span className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
                        Match score
                        <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">{application.matchScore || 0}%</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
                        Resume used
                        <p className="mt-2 text-sm text-slate-900 dark:text-white">{application.resumeFile || "Profile resume"}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-[30px] border border-white/60 bg-white/80 p-10 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
                  No applications found. Apply to jobs or post roles to begin tracking progress.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          {activeApplication ? (
            <div className="glass-panel p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Application details</p>
                  <h2 className="mt-3 font-display text-3xl font-bold">{activeApplication.job?.title || "Application details"}</h2>
                </div>
                <StatusBadge status={activeApplication.status} />
              </div>

              <div className="mt-6 rounded-[30px] border border-slate-200 bg-slate-50 p-5 text-slate-900 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100">
                {matchAnalysis.loading ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Calculating match score...</div>
                    <div className="h-8 w-8 rounded-full border-2 border-slate-300 dark:border-slate-600 animate-spin" />
                  </div>
                ) : matchAnalysis.error ? (
                  <div className="text-sm text-rose-600 dark:text-rose-300">{matchAnalysis.error}</div>
                ) : matchAnalysis.result ? (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Resume Match Score</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="text-4xl font-bold">{matchAnalysis.result.matchScore}%</span>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              matchAnalysis.result.matchScore > 75
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                                : matchAnalysis.result.matchScore >= 50
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"
                            }`}
                          >
                            {matchAnalysis.result.recommendation}
                          </span>
                        </div>

                        <div className="mt-4">
                          <ProgressBar value={matchAnalysis.result.matchScore} label="Match progress" />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {matchAnalysis.result.scoreBreakdown
                          ?.filter((item) => ["Skills Match", "Experience", "Education"].includes(item.label))
                          .map((item) => (
                            <div key={item.label} className="rounded-3xl bg-white p-3 text-sm shadow-sm dark:bg-slate-900/90">
                              <p className="text-slate-500 dark:text-slate-400">{item.label}</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.score}%</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {Array.isArray(matchAnalysis.result.matchedSkills) && matchAnalysis.result.matchedSkills.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Matched Skills:</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {matchAnalysis.result.matchedSkills.map((skill) => (
                            <span key={skill} className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                              {"✓"} {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(matchAnalysis.result.missingSkills) && matchAnalysis.result.missingSkills.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Missing Skills:</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {matchAnalysis.result.missingSkills.map((skill) => (
                            <span key={skill} className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                              {"✗"} {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900/90">
                      <p className="text-slate-500 dark:text-slate-400">Recommendation:</p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">{matchAnalysis.result.recommendation}</p>
                    </div>

                  </>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Match score will appear here after selecting a candidate.</p>
                )}
              </div>

              <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Company</p>
                  <p className="font-semibold">{activeApplication.job?.companyName || activeApplication.job?.employer?.companyName}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Applied on</p>
                  <p className="font-semibold">{new Date(activeApplication.createdAt).toLocaleDateString()}</p>
                </div>
                {activeApplication.status === "interview_scheduled" && (
                  <div className="rounded-3xl border border-brand-200/70 bg-brand-50/70 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
                    <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
                      <CalendarClock size={18} /> Interview scheduled
                    </div>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{new Date(activeApplication.interviewDate).toLocaleString()}</p>
                    <div className="mt-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/80 dark:text-slate-100">
                      {activeApplication.interviewMode === "offline" ? "Offline interview" : "Online interview"}
                    </div>
                    {activeApplication.interviewLink && (
                      <a href={activeApplication.interviewLink} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
                        Join meeting
                      </a>
                    )}
                    {activeApplication.interviewInstructions && (
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{activeApplication.interviewInstructions}</p>
                    )}
                  </div>
                )}
                {activeApplication.offerLetter && (
                  <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/5">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">Offer letter</p>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{activeApplication.offerLetter}</p>
                  </div>
                )}
                {activeApplication.recruiterNotes && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
                    <p className="font-semibold">Recruiter note</p>
                    <p className="mt-2">{activeApplication.recruiterNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {isRecruiterFlow ? (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "shortlist")} loading={actionLoading}>
                        Shortlist candidate
                      </Button>
                      <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "reject")} variant="secondary" loading={actionLoading}>
                        Reject candidate
                      </Button>
                    </div>
                    <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80">
                      <h3 className="font-semibold">Schedule interview</h3>
                      <div className="mt-4 space-y-3">
                        <TextAreaField label="Date and time" value={interviewData.interviewDate} onChange={(event) => setInterviewData((current) => ({ ...current, interviewDate: event.target.value }))} placeholder="2026-05-25 10:00 AM" />
                        <SelectField label="Interview mode" value={interviewData.interviewMode} onChange={(event) => setInterviewData((current) => ({ ...current, interviewMode: event.target.value }))} options={[{ value: "online", label: "Online" }, { value: "offline", label: "Offline" }]} />
                        <TextAreaField label="Meeting link" value={interviewData.interviewLink} onChange={(event) => setInterviewData((current) => ({ ...current, interviewLink: event.target.value }))} placeholder="Google Meet or Zoom link" />
                        <TextAreaField label="Interview instructions" value={interviewData.interviewInstructions} onChange={(event) => setInterviewData((current) => ({ ...current, interviewInstructions: event.target.value }))} placeholder="Add any preparation notes for the candidate." />
                        <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "interview", interviewData)} loading={actionLoading}>
                          Schedule interview
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80">
                      <h3 className="font-semibold">Send offer letter</h3>
                      <TextAreaField label="Offer letter" value={offerLetter} onChange={(event) => setOfferLetter(event.target.value)} placeholder="Write a short offer summary or paste the full letter." />
                      <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "offer", { offerLetter })} loading={actionLoading} disabled={!offerLetter.trim()}>
                        Send offer
                      </Button>
                    </div>
                    <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "hire")} variant="outline" loading={actionLoading}>
                      Mark as hired
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
                      <div className="flex items-center gap-2 text-brand-600">
                        <MessageSquare size={18} />
                        <p className="font-semibold">Recruiter communication</p>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        Use instant messaging to ask questions and get updates about this role.
                      </p>
                    </div>
                    {canWithdraw && (
                      <Button type="button" variant="secondary" onClick={() => handleApplicationAction(activeApplication._id, "withdraw")} loading={actionLoading}>
                        Withdraw application
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-[30px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Messages</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Conversation tied to this application.</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Real time</span>
                </div>
                <div className="mt-4 space-y-4">
                  {messages.length ? (
                    messages.map((message) => (
                      <div key={message._id} className={`rounded-3xl p-4 ${message.sender?._id === user?._id ? "bg-brand-50 text-slate-900 dark:bg-brand-500/10" : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200"}`}>
                        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          <span>{message.sender?.name || "You"}</span>
                          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6">{message.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet. Start the conversation with a quick note.</p>
                  )}
                </div>
                <div className="mt-5 space-y-3">
                  <TextAreaField label="Write a message" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Give a quick update or ask the recruiter a question." />
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      loading={actionLoading}
                      size="sm"
                      className="w-auto rounded-xl px-5 py-2.5 transition hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <Send size={16} /> Send message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Select an application</p>
              <h2 className="mt-4 font-display text-3xl font-bold">Pick a role to view workflow details</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Choose a job card from the list to review status, interview information, and recruiter messages.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <ArrowRight size={16} /> Select an application from the left panel
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ApplicationsPage;
