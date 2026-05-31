const { calculateMatchScore, generateFallbackScore } = require("../utils/resumeMatcher");

exports.getMatchScore = async (req, res, next) => {
  try {
    const { resumeText = "", jobSkills = [], jobDescription = "" } = req.body;

    console.log("Received Job ID:", req.body.jobId || "(not provided)");
    console.log("Received Candidate payload:", {
      resumeText: resumeText ? resumeText.slice(0, 120) : "(empty)",
      jobSkills,
      jobDescription: jobDescription ? jobDescription.slice(0, 120) : "(empty)",
    });

    const result = calculateMatchScore(resumeText, jobSkills, jobDescription);

    console.log("Generated Match Score:", result.matchScore);
    console.log("Extracted Skills:", result.matchedSkills);
    console.log("Missing Skills:", result.missingSkills);

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error generating match score:", error);
    const fallback = generateFallbackScore(req.body);
    return res.json({ success: true, ...fallback });
  }
};
