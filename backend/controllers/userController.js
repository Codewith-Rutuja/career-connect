const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const splitSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.name = req.body.name || user.name;
    user.headline = req.body.headline || "";
    user.location = req.body.location || "";
    user.education = req.body.education || "";
    user.experience = req.body.experience || "";

    if (user.role === "jobseeker") {
      user.skills = splitSkills(req.body.skills);
      user.resumeText = req.body.resumeText || "";
      user.resumeFile = req.body.resumeFile || "";
    }

    if (user.role === "employer") {
      user.companyName = req.body.companyName || user.companyName;
      user.companyDescription =
        req.body.companyDescription || user.companyDescription;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully.",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        headline: updatedUser.headline,
        location: updatedUser.location,
        resumeText: updatedUser.resumeText,
        resumeFile: updatedUser.resumeFile,
        education: updatedUser.education,
        experience: updatedUser.experience,
        companyName: updatedUser.companyName,
        companyDescription: updatedUser.companyDescription,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    if (req.user.role === "jobseeker") {
      const applications = await Application.find({ applicant: req.user._id })
        .populate({
          path: "job",
          populate: {
            path: "employer",
            select: "name companyName email",
          },
        })
        .sort({ createdAt: -1 });

      const statusCounts = applications.reduce((acc, application) => {
        acc[application.status] = (acc[application.status] || 0) + 1;
        return acc;
      }, {});

      return res.json({
        role: "jobseeker",
        applications,
        statusCounts,
      });
    }

    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    const applications = await Application.find({
      job: { $in: jobs.map((job) => job._id) },
    })
      .populate({
        path: "job",
        populate: {
          path: "employer",
          select: "name companyName email",
        },
      })
      .populate("applicant", "name email skills resumeText resumeFile headline location")
      .sort({ createdAt: -1 });

    const stats = {
      totalJobs: jobs.length,
      totalApplicants: applications.length,
      shortlisted: applications.filter((app) => app.status === "shortlisted").length,
      interviewScheduled: applications.filter((app) => app.status === "interview_scheduled").length,
      offerSent: applications.filter((app) => app.status === "offer_sent").length,
      hired: applications.filter((app) => app.status === "hired").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };

    res.json({
      role: "employer",
      jobs,
      applications,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
