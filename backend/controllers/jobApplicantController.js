const Application = require("../models/Application");
const Job = require("../models/Job");

// Checks whether current user can view applicants for the job
async function canAccessJob(reqUser, job) {
  if (!job) return false;

  if (reqUser.role === "employer") {
    return job.employer && job.employer.toString() === reqUser._id.toString();
  }

  if (reqUser.role === "recruiter") {
    // recruiter: same companyName
    return !!reqUser.companyName && job.companyName === reqUser.companyName;
  }

  return false;
}

exports.getApplicantsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate("employer", "_id");
    if (!job) return res.status(404).json({ message: "Job not found." });

    const canAccess = await canAccessJob(req.user, job);
    if (!canAccess) return res.status(403).json({ message: "You can access only applicants for your jobs." });

    const applications = await Application.find({ job: jobId })
      .populate({
        path: "applicant",
        select: "name email skills resumeText resumeFile headline location education experience",
      })
      .populate({
        path: "job",
        select: "title companyName employer",
      })
      .sort({ createdAt: -1 });

    const applicants = applications.map((app) => ({
      _id: app._id,
      status: app.status,
      createdAt: app.createdAt,
      applicant: app.applicant,
      job: app.job,
      resumeFile: app.resumeFile,
      resumeText: app.resumeText,
      matchScore: app.matchScore,
      matchedSkills: app.matchedSkills,
      missingSkills: app.missingSkills,
      // scoreboard breakdown is not stored in DB currently; keep placeholder for UI compatibility
      // scoreBreakdown is not stored in the current Application schema; return null for now
      scoreBreakdown: null,
      recruiterNotes: app.recruiterNotes,
      offerLetter: app.offerLetter,
      interviewDate: app.interviewDate,
      interviewMode: app.interviewMode,
      interviewLink: app.interviewLink,
    }));

    res.json({ job: { _id: job._id, title: job.title }, applicants });
  } catch (error) {
    next(error);
  }
};

