import { Mail, MapPin, Eye, MessageSquare, Check, X, Calendar } from "lucide-react";
import { useState } from "react";
import Button from "./ui/Button";
import ScoreBreakdown from "./ScoreBreakdown";

export default function ApplicantCard({
  applicant,
  onViewResume,
  onShortlist,
  onReject,
  onScheduleInterview,
  onSendMessage,
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [actionsLoading, setActionsLoading] = useState({});

  const handleAction = async (action, callback) => {
    setActionsLoading((prev) => ({ ...prev, [action]: true }));
    try {
      await callback();
    } finally {
      setActionsLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const matchColor = (score) => {
    if (score >= 80) return "emerald";
    if (score >= 60) return "amber";
    return "rose";
  };

  const getScoreColorClass = (colorName) => {
    const colorMap = {
      emerald: "text-emerald-600 dark:text-emerald-400",
      amber: "text-amber-600 dark:text-amber-400",
      rose: "text-rose-600 dark:text-rose-400",
    };
    return colorMap[colorName] || colorMap.rose;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      applied: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      shortlisted:
        "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
      rejected: "bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200",
      interview_scheduled:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      offer_sent: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
      hired: "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200",
    };
    return colors[status] || colors.applied;
  };

  const color = matchColor(applicant.matchScore);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {applicant.candidate.name}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Mail size={16} />
                <a
                  href={`mailto:${applicant.candidate.email}`}
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  {applicant.candidate.email}
                </a>
              </div>
              {applicant.candidate.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {applicant.candidate.location}
                </div>
              )}
            </div>
          </div>

          {/* Match Score */}
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColorClass(color)}`}>
              {applicant.matchScore}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Match Score
            </div>
          </div>
        </div>

        {/* Status Badge and Application Date */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
              applicant.status
            )}`}
          >
            {applicant.status.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Headline */}
        {applicant.candidate.headline && (
          <p className="text-sm text-slate-600 dark:text-slate-400 italic">
            {applicant.candidate.headline}
          </p>
        )}

        {/* Experience and Education */}
        {(applicant.candidate.experience || applicant.candidate.education) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {applicant.candidate.experience && (
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Experience
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {applicant.candidate.experience}
                </div>
              </div>
            )}
            {applicant.candidate.education && (
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Education
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {applicant.candidate.education}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills Match */}
        <div className="space-y-2">
          {applicant.matchedSkills && applicant.matchedSkills.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                {"\u2713"} Matching Skills ({applicant.matchedSkills.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {applicant.matchedSkills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {applicant.matchedSkills.length > 4 && (
                  <span className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
                    +{applicant.matchedSkills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {applicant.missingSkills && applicant.missingSkills.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-2">
                {"\u2717"} Missing Skills ({applicant.missingSkills.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {applicant.missingSkills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {applicant.missingSkills.length > 4 && (
                  <span className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
                    +{applicant.missingSkills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        {applicant.scoreBreakdown && applicant.scoreBreakdown.length > 0 && (
          <div>
            <ScoreBreakdown
              breakdown={applicant.scoreBreakdown}
              isExpanded={showBreakdown}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewResume(applicant)}
          icon={<Eye size={16} />}
          loading={actionsLoading.view}
        >
          View Resume
        </Button>

        {applicant.status !== "shortlisted" && applicant.status !== "rejected" && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                handleAction("shortlist", () => onShortlist(applicant._id))
              }
              icon={<Check size={16} />}
              loading={actionsLoading.shortlist}
            >
              Shortlist
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                handleAction("reject", () => onReject(applicant._id))
              }
              icon={<X size={16} />}
              loading={actionsLoading.reject}
            >
              Reject
            </Button>
          </>
        )}

        {applicant.status === "shortlisted" && (
          <Button
            variant="info"
            size="sm"
            onClick={() =>
              handleAction("schedule", () =>
                onScheduleInterview(applicant._id)
              )
            }
            icon={<Calendar size={16} />}
            loading={actionsLoading.schedule}
          >
            Schedule Interview
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            handleAction("message", () => onSendMessage(applicant._id))
          }
          icon={<MessageSquare size={16} />}
          loading={actionsLoading.message}
        >
          Message
        </Button>
      </div>
    </div>
  );
}

