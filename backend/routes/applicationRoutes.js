const express = require("express");
const {
  applyForJob,
  getApplications,
  updateApplicationStatus,
  withdrawApplication,
  shortlistApplicant,
  rejectApplicant,
  scheduleInterview,
  sendOffer,
  markHired,
  getApplicantsForJob,
} = require("../controllers/applicationController");
const { getMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getApplications).post(protect, applyForJob);
router.route("/:id").patch(protect, updateApplicationStatus).delete(protect, withdrawApplication);
router.post("/:id/shortlist", protect, shortlistApplicant);
router.post("/:id/reject", protect, rejectApplicant);
router.post("/:id/interview", protect, scheduleInterview);
router.post("/:id/offer", protect, sendOffer);
router.post("/:id/hire", protect, markHired);
router.route("/:id/messages").get(protect, getMessages).post(protect, sendMessage);

module.exports = router;
