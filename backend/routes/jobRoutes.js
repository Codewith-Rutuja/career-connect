const express = require("express");
const {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
} = require("../controllers/jobController");
const { getApplicantsForJob } = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getJobs).post(protect, createJob);
router.route("/:id").get(getJobById).put(protect, updateJob).delete(protect, deleteJob);
router.route("/:jobId/applicants").get(protect, getApplicantsForJob);

module.exports = router;
