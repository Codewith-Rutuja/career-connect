import { X, Download } from "lucide-react";
import Button from "./ui/Button";
import ScoreBreakdown from "./ScoreBreakdown";
import ProgressBar from "./ui/ProgressBar";

export default function ResumeViewer({
  candidateName,
  resumeFile,
  resumeText,
  matchAnalysis,
  jobTitle,
  loadingMatch,
  onClose,
}) {
  const isPreviewableResumeFile =
    typeof resumeFile === "string" &&
    (/^https?:\/\//i.test(resumeFile) || resumeFile.startsWith("/") || resumeFile.startsWith("data:application/pdf")) &&
    (/\.pdf($|\?)/i.test(resumeFile) || resumeFile.startsWith("data:application/pdf"));

  const handleDownload = () => {
    if (isPreviewableResumeFile) {
      const link = document.createElement("a");
      link.href = resumeFile;
      link.download = `${candidateName}_resume.pdf`;
      link.click();
    }
  };

  const getFitLabel = (score) => {
    if (score > 75) return "Strong Match";
    if (score >= 50) return "Moderate Match";
    return "Needs Review";
  };

  const getScoreBadgeClass = (score) => {
    if (score > 75) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200";
    if (score >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";
    return "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Resume: {candidateName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {(matchAnalysis || jobTitle) && (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Selected job
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {jobTitle || "Selected job"}
                </h3>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Resume Match Score
                    </p>
                    <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                      {loadingMatch ? "..." : `${matchAnalysis?.matchScore ?? 0}%`}
                    </p>
                  </div>
                  <div className={`rounded-3xl px-3 py-2 text-sm font-semibold ${getScoreBadgeClass(matchAnalysis?.matchScore ?? 0)}`}>
                    {loadingMatch
                      ? "Computing"
                      : matchAnalysis
                      ? matchAnalysis.recommendation || getFitLabel(matchAnalysis.matchScore)
                      : "No match yet"}
                  </div>
                </div>

                {matchAnalysis && !loadingMatch && (
                  <div className="mt-5 space-y-4">
                    <ProgressBar value={matchAnalysis.matchScore} label="Match progress" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      {matchAnalysis.breakdown?.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900"
                        >
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                            {item.score}%
                          </p>
                        </div>
                      ))}
                    </div>
                    <ScoreBreakdown breakdown={matchAnalysis.breakdown} isExpanded={true} />

                    <div className="grid gap-4 md:grid-cols-2">
                      {matchAnalysis.matchedSkills?.length ? (
                        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Matched Skills:
                          </h4>
                          <div className="mt-3 grid gap-2">
                            {matchAnalysis.matchedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
                              >
                                {"\u2713"} {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {matchAnalysis.missingSkills?.length ? (
                        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Missing Skills:
                          </h4>
                          <div className="mt-3 grid gap-2">
                            {matchAnalysis.missingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="text-sm font-semibold text-rose-700 dark:text-rose-300"
                              >
                                {"\u2717"} {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Recommendation:</p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {matchAnalysis.recommendation || getFitLabel(matchAnalysis.matchScore)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isPreviewableResumeFile ? (
            <div className="mb-4">
              <iframe
                src={resumeFile}
                type="application/pdf"
                className="w-full h-[600px] rounded-lg border border-slate-200 dark:border-slate-700"
                title="Resume PDF"
              />
            </div>
          ) : resumeText ? (
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              {resumeText}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Resume preview is not available for this file reference.
              {resumeFile ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Saved reference: {resumeFile}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex justify-end gap-3">
          {isPreviewableResumeFile && (
            <Button
              variant="primary"
              onClick={handleDownload}
              icon={<Download size={18} />}
            >
              Download Resume
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}



