const Application = require("../models/Application");
const Job = require("../models/Job");
const { calculateMatchScore } = require("../utils/resumeMatcher");
const { sendNotification } = require("../utils/notificationService");

const allowedStatuses = [
  "applied",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "offer_sent",
  "selected",
  "rejected",
  "withdrawn",
  "hired",
];

exports.applyForJob = async (req, res, next) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can apply." });
    }

    const { jobId, coverLetter = "", resumeText = "", resumeFile = "" } = req.body;

    const job = await Job.findById(jobId).populate("employer");
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied." });
    }

    const resumeSource = resumeText || req.user.resumeText || req.user.skills.join(", ");
    const resumeFileSource = resumeFile || req.user.resumeFile || "";

    const matchDetails = calculateMatchScore(
      resumeSource,
      job.skills,
      job.description
    );

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter,
      resumeText: resumeSource,
      resumeFile: resumeFileSource,
      matchScore: matchDetails.matchScore,
      matchedSkills: matchDetails.matchedSkills,
      missingSkills: matchDetails.missingSkills,
      scoreBreakdown: matchDetails.breakdown || [],
      status: "applied",
    });

    await sendNotification({
      userId: job.employer._id,
      applicationId: application._id,
      type: "general",
      title: "New application received",
      message: `${req.user.name} has applied for ${job.title}.`,
      data: { jobId: job._id, applicationId: application._id },
      email: job.employer.email,
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    let applications = [];

    if (req.user.role === "employer" || req.user.role === "recruiter") {
      let jobFilter = {};
      if (req.user.role === "employer") {
        const jobs = await Job.find({ employer: req.user._id }).select("_id");
        const jobIds = jobs.map((job) => job._id);
        jobFilter = { job: { $in: jobIds } };
      } else {
        // recruiter: show jobs for same companyName
        const jobs = await Job.find({ companyName: req.user.companyName }).select("_id");
        const jobIds = jobs.map((job) => job._id);
        jobFilter = { job: { $in: jobIds } };
      }

      applications = await Application.find(jobFilter)
        .populate({
          path: "job",
          select: "title companyName description skills location",
          populate: { path: "employer", select: "name companyName email" },
        })
        .populate("applicant", "name email skills resumeText resumeFile headline location education experience")
        .sort({ createdAt: -1 });
    } else {
      applications = await Application.find({ applicant: req.user._id })
        .populate({
          path: "job",
          populate: { path: "employer", select: "name companyName email" },
        })
        .sort({ createdAt: -1 });
    }

    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterNotes } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status." });
    }
    const application = await Application.findById(req.params.id).populate({
      path: "job",
      select: "title employer companyName",
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Only allow employers (owner) or recruiters from same company
    if (req.user.role === "employer") {
      if (application.job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can update only applicants for your own jobs." });
      }
    } else if (req.user.role === "recruiter") {
      if (!req.user.companyName || application.job.companyName !== req.user.companyName) {
        return res.status(403).json({ message: "You can update only applicants for your company's jobs." });
      }
    } else {
      return res.status(403).json({ message: "Only employers or recruiters can update application status." });
    }

    application.status = status;
    if (typeof recruiterNotes === "string") {
      application.recruiterNotes = recruiterNotes;
    }
    await application.save();

    await sendNotification({
      userId: application.applicant,
      applicationId: application._id,
      type: status === "shortlisted" ? "shortlisted" : status === "rejected" ? "rejected" : status === "general",
      title: `Application status updated: ${status.replace(/_/g, " ")}`,
      message: recruiterNotes || `Your application for ${application.job.title} is now ${status.replace(/_/g, " ")}.`,
      data: { status, applicationId: application._id },
      email: null,
    });

    res.json({ message: "Application status updated successfully.", application });
  } catch (error) {
    next(error);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate({
      path: "job",
      select: "title employer companyName",
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only withdraw your own application." });
    }

    if (application.status === "withdrawn") {
      return res.status(400).json({ message: "This application has already been withdrawn." });
    }

    application.status = "withdrawn";
    await application.save();

    await sendNotification({
      userId: application.job.employer,
      applicationId: application._id,
      type: "general",
      title: "Application withdrawn",
      message: `${req.user.name} has withdrawn their application for ${application.job.title}.`,
      data: { applicationId: application._id },
      email: null,
    });

    res.json({ message: "Your application has been withdrawn.", application });
  } catch (error) {
    next(error);
  }
};

exports.shortlistApplicant = async (req, res, next) => {
  try {
    await exports._performApplicationAction(req, res, next, {
      status: "shortlisted",
      title: "Candidate shortlisted",
      message: "Your application has been shortlisted.",
      notificationType: "shortlisted",
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectApplicant = async (req, res, next) => {
  try {
    await exports._performApplicationAction(req, res, next, {
      status: "rejected",
      title: "Application update",
      message: "This candidate has been moved to rejected status.",
      notificationType: "rejected",
    });
  } catch (error) {
    next(error);
  }
};

exports.scheduleInterview = async (req, res, next) => {
  try {
    const {
      interviewDate,
      interviewLink = "",
      interviewInstructions = "",
      interviewMode = "online",
    } = req.body;

    if (!interviewDate) {
      return res.status(400).json({ message: "Interview date is required." });
    }

    if (!["online", "offline"].includes(interviewMode)) {
      return res.status(400).json({ message: "Interview mode must be online or offline." });
    }

    await exports._performApplicationAction(req, res, next, {
      status: "interview_scheduled",
      title: "Interview scheduled",
      message: "An interview has been scheduled for your application.",
      notificationType: "interview_scheduled",
      updateFields: {
        interviewDate,
        interviewMode,
        interviewLink,
        interviewInstructions,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.sendOffer = async (req, res, next) => {
  try {
    const { offerLetter = "" } = req.body;
    if (!offerLetter) {
      return res.status(400).json({ message: "Offer letter content is required." });
    }

    await exports._performApplicationAction(req, res, next, {
      status: "offer_sent",
      title: "Offer letter sent",
      message: "An offer letter has been sent for your application.",
      notificationType: "offer_sent",
      updateFields: { offerLetter },
    });
  } catch (error) {
    next(error);
  }
};

exports.markHired = async (req, res, next) => {
  try {
    await exports._performApplicationAction(req, res, next, {
      status: "hired",
      title: "Candidate hired",
      message: "This candidate has been marked as hired.",
      notificationType: "general",
    });
  } catch (error) {
    next(error);
  }
};

exports._performApplicationAction = async (req, res, next, { status, title, message, notificationType, updateFields = {} }) => {
  const application = await Application.findById(req.params.id).populate({
    path: "job",
    select: "title employer companyName",
  });

  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }

  // Only allow employers (owner) or recruiters from same company
  if (req.user.role === "employer") {
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can change only applicants for your own jobs." });
    }
  } else if (req.user.role === "recruiter") {
    if (!req.user.companyName || application.job.companyName !== req.user.companyName) {
      return res.status(403).json({ message: "You can change only applicants for your company's jobs." });
    }
  } else {
    return res.status(403).json({ message: "Only employers or recruiters can perform this action." });
  }

  application.status = status;
  Object.assign(application, updateFields);
  await application.save();

  await sendNotification({
    userId: application.applicant,
    applicationId: application._id,
    type: notificationType,
    title,
    message,
    data: { status, applicationId: application._id },
    email: null,
  });

  res.json({ message: `${status.replace(/_/g, " ")} action completed.`, application });
};

exports.getApplicantsForJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId || req.params.id;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check authorization - only employer or recruiter from same company
    if (req.user.role === "employer") {
      if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only view applicants for your own jobs." });
      }
    } else if (req.user.role === "recruiter") {
      if (!req.user.companyName || job.companyName !== req.user.companyName) {
        return res.status(403).json({ message: "You can only view applicants for your company's jobs." });
      }
    } else {
      return res.status(403).json({ message: "Only employers or recruiters can view applicants." });
    }

    // Fetch all applications for this job with populated data
    const applications = await Application.find({ job: jobId })
      .populate({
        path: "applicant",
        select: "name email skills resumeText resumeFile headline location education experience",
      })
      .populate({
        path: "job",
        select: "title description skills companyName",
      })
      .sort({ matchScore: -1, createdAt: -1 });

    // Format response with applicant info
    const applicants = applications.map((app) => ({
      _id: app._id,
      candidate: {
        _id: app.applicant._id,
        name: app.applicant.name,
        email: app.applicant.email,
        headline: app.applicant.headline,
        location: app.applicant.location,
        education: app.applicant.education,
        experience: app.applicant.experience,
        skills: app.applicant.skills,
      },
      resume: {
        text: app.resumeText,
        file: app.resumeFile,
      },
      matchScore: app.matchScore,
      matchedSkills: app.matchedSkills,
      missingSkills: app.missingSkills,
      scoreBreakdown: app.scoreBreakdown,
      status: app.status,
      appliedAt: app.createdAt,
      interviewDate: app.interviewDate,
      interviewMode: app.interviewMode,
      interviewLink: app.interviewLink,
      recruiterNotes: app.recruiterNotes,
    }));

    res.json({
      job: {
        _id: job._id,
        title: job.title,
        description: job.description,
        skills: job.skills,
      },
      applicants,
      totalApplicants: applicants.length,
    });
  } catch (error) {
    next(error);
  }
};
