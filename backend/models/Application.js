const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    resumeText: {
      type: String,
      default: "",
    },
    resumeFile: {
      type: String,
      default: "",
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    scoreBreakdown: {
      type: [
        {
          label: String,
          score: Number,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "applied",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "offer_sent",
        "selected",
        "rejected",
        "withdrawn",
        "hired",
      ],
      default: "applied",
    },
    interviewDate: {
      type: Date,
    },
    interviewMode: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    interviewLink: {
      type: String,
      default: "",
    },
    interviewInstructions: {
      type: String,
      default: "",
    },
    offerLetter: {
      type: String,
      default: "",
    },
    recruiterNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// One user should only be able to apply once for a job.
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
