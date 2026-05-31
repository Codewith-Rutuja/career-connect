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
  getErrorMessage,
} from "../services/api";

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
  const [offerLetter, setOfferLetter] = useState("");

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

  const handleSelectApplication = async (application) => {
    setSelectedApplication(application);
    setMessages([]);
    setMessageDraft("");

    try {
      const response = await fetchMessages(application._id);
      setMessages(response.messages || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load messages."));
    }
  };

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

  const handleApplicationAction = async (appId, action, payload = {}) => {
    setActionLoading(true);
    try {
      if (action === "shortlist") await shortlistApplicant(appId);
      if (action === "reject") await rejectApplicant(appId);
      if (action === "interview") await scheduleInterview(appId, payload);
      if (action === "offer") await sendOffer(appId, payload);
      if (action === "hire") await markHired(appId);

      const refreshedApplications = await loadApplications();
      setSelectedApplication(refreshedApplications.find((app) => app._id === appId) || null);

      if (action === "offer") {
        setOfferLetter("");
      }

      if (action === "interview") {
        setInterviewData({
          interviewDate: "",
          interviewMode: "online",
          interviewLink: "",
          interviewInstructions: "",
        });
      }

      toast.success("Action saved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to complete action."));
    } finally {
      setActionLoading(false);
    }
  };

  const activeApplication = useMemo(
    () => applications.find((item) => item._id === selectedApplication?._id) || selectedApplication,
    [applications, selectedApplication]
  );

  const isRecruiterFlow = user?.role === "employer" || user?.role === "recruiter";

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
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
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Application list</p>
                <h2 className="mt-3 font-display text-2xl font-bold">Active workflow</h2>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{applications.length} total applications</div>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-[24px] bg-slate-200/80 p-6 shadow-sm dark:bg-slate-800" />
                  ))}
                </div>
              ) : applications.length ? (
                applications.map((application) => (
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
                          {application.job?.companyName || application.job?.employer?.companyName}
                          {application.job?.location ? ` • ${application.job.location}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={application.status} />
                        <span className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
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
                <div className="rounded-[30px] border border-dashed border-white/60 bg-white/70 p-10 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
                  No applications found. Apply to jobs or post roles to begin tracking progress.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          {activeApplication ? (
            <div className="glass-panel p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Application details</p>
                  <h2 className="mt-3 font-display text-3xl font-bold">{activeApplication.job?.title || "Application details"}</h2>
                </div>
                <StatusBadge status={activeApplication.status} className="w-fit" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/60 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-950/55">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Company</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{activeApplication.job?.companyName || activeApplication.job?.employer?.companyName}</p>
                </div>
                <div className="rounded-[24px] border border-white/60 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-950/55">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Applied on</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{new Date(activeApplication.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {activeApplication.status === "interview_scheduled" && (
                  <div className="rounded-[28px] border border-brand-200/70 bg-brand-50/80 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-brand-700 dark:text-brand-200">
                      <CalendarClock size={18} />
                      <span>Interview scheduled</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-100">{new Date(activeApplication.interviewDate).toLocaleString()}</p>
                    <div className="mt-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/80 dark:text-slate-100">
                      {activeApplication.interviewMode === "offline" ? "Offline interview" : "Online interview"}
                    </div>
                    {activeApplication.interviewLink && (
                      <a
                        href={activeApplication.interviewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block text-sm font-semibold text-brand-700 hover:underline dark:text-brand-200"
                      >
                        Join meeting
                      </a>
                    )}
                    {activeApplication.interviewInstructions && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{activeApplication.interviewInstructions}</p>
                    )}
                  </div>
                )}

                {activeApplication.offerLetter && (
                  <div className="rounded-[28px] border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/5">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">Offer letter</p>
                    <p className="mt-3 whitespace-pre-line text-sm text-slate-700 dark:text-slate-100">{activeApplication.offerLetter}</p>
                  </div>
                )}

                {activeApplication.recruiterNotes && (
                  <div className="rounded-[24px] border border-white/60 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-950/55">
                    <p className="font-semibold text-slate-900 dark:text-white">Recruiter note</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{activeApplication.recruiterNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {isRecruiterFlow ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "shortlist")} loading={actionLoading}>
                        Shortlist
                      </Button>
                      <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "reject")} variant="secondary" loading={actionLoading}>
                        Reject
                      </Button>
                    </div>

                    <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Schedule interview</h3>
                      <div className="mt-4 space-y-3">
                        <TextAreaField label="Date and time" value={interviewData.interviewDate} onChange={(event) => setInterviewData((current) => ({ ...current, interviewDate: event.target.value }))} placeholder="2026-05-25 10:00 AM" rows={2} />
                        <SelectField label="Interview mode" value={interviewData.interviewMode} onChange={(event) => setInterviewData((current) => ({ ...current, interviewMode: event.target.value }))} options={[{ value: "online", label: "Online" }, { value: "offline", label: "Offline" }]} />
                        <TextAreaField label="Meeting link" value={interviewData.interviewLink} onChange={(event) => setInterviewData((current) => ({ ...current, interviewLink: event.target.value }))} placeholder="Google Meet or Zoom link" rows={2} />
                        <TextAreaField label="Interview instructions" value={interviewData.interviewInstructions} onChange={(event) => setInterviewData((current) => ({ ...current, interviewInstructions: event.target.value }))} placeholder="Add any preparation notes for the candidate." rows={3} />
                        <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "interview", interviewData)} loading={actionLoading}>
                          Schedule interview
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Send offer letter</h3>
                      <TextAreaField label="Offer letter" value={offerLetter} onChange={(event) => setOfferLetter(event.target.value)} placeholder="Write a short offer summary or paste the full letter." rows={5} />
                      <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "offer", { offerLetter })} loading={actionLoading} disabled={!offerLetter.trim()} className="mt-3">
                        Send offer
                      </Button>
                    </div>

                    <Button type="button" onClick={() => handleApplicationAction(activeApplication._id, "hire")} variant="outline" loading={actionLoading}>
                      Mark as hired
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2 text-brand-600">
                      <MessageSquare size={18} />
                      <p className="font-semibold">Recruiter communication</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      Use instant messaging to ask questions and get updates about this role.
                    </p>
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

                <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                  {messages.length ? (
                    messages.map((message) => {
                      const isCurrentUser = message.sender?._id === user?._id;
                      return (
                        <div
                          key={message._id}
                          className={`max-w-[90%] rounded-[24px] px-4 py-3 ${
                            isCurrentUser
                              ? "ml-auto bg-brand-500 text-white"
                              : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] opacity-80">
                            <span>{message.sender?.name || "You"}</span>
                            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 whitespace-pre-line">{message.content}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet. Start the conversation with a quick note.</p>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <TextAreaField label="Write a message" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Give a quick update or ask the recruiter a question." rows={3} />
                  <Button type="button" onClick={handleSendMessage} loading={actionLoading} className="w-full">
                    <Send size={16} /> Send message
                  </Button>
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
