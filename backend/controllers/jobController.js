const Job = require("../models/Job");
const Application = require("../models/Application");

const splitSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }

  return (skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const hiddenJobLabels = ["live role", "live roles", "offer role", "offer roles", "debug role", "debug roles"];

const isHiddenDemoJob = (job) => {
  const searchableText = [job.title, job.companyName, job.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return hiddenJobLabels.some((label) => searchableText.includes(label));
};

exports.getJobs = async (req, res, next) => {
  try {
    const { keyword = "", location = "", jobType = "" } = req.query;

    const filters = {};

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { skills: { $elemMatch: { $regex: keyword, $options: "i" } } },
        { companyName: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) {
      filters.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      filters.jobType = jobType;
    }

    const jobs = await Job.find(filters)
      .populate("employer", "name email companyName")
      .sort({ createdAt: -1 });

    res.json(jobs.filter((job) => !isHiddenDemoJob(job)));
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "name email companyName companyDescription"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const applicantCount = await Application.countDocuments({ job: job._id });

    res.json({
      ...job.toObject(),
      applicantCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    if (req.user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Only employers can create jobs." });
    }

    const { title, description, skills, location, salary, jobType } = req.body;

    const job = await Job.create({
      title,
      description,
      skills: splitSkills(skills),
      location,
      jobType: jobType || "Full-time",
      salary,
      employer: req.user._id,
      companyName: req.user.companyName || req.user.name,
    });

    res.status(201).json({
      message: "Job created successfully.",
      job,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can edit only your own jobs." });
    }

    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.skills =
      req.body.skills !== undefined ? splitSkills(req.body.skills) : job.skills;
    job.location = req.body.location || job.location;
    job.jobType = req.body.jobType || job.jobType;
    job.salary = req.body.salary || job.salary;
    job.companyName = req.user.companyName || req.user.name;

    await job.save();

    res.json({
      message: "Job updated successfully.",
      job,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can delete only your own jobs." });
    }

    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully." });
  } catch (error) {
    next(error);
  }
};
