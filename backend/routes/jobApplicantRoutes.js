const express = require("express");
const {
  getApplicantsForJob,
} = require("../controllers/jobApplicantController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Recruiter/employer: get all applicants for a job posting they own (or for their company)
router.get("/:jobId/applicants", protect, getApplicantsForJob);

module.exports = router;

