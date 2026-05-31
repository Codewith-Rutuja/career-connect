const normalize = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+\s.#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) => new Set(normalize(value).split(" ").filter(Boolean));

const containsAny = (text, keywords) => {
  const normalizedText = normalize(text);
  return keywords.some((keyword) => normalizedText.includes(keyword));
};

const parseYears = (text) => {
  const normalized = normalize(text);
  const match = normalized.match(/(\d+)(?:\+)?\s*(?:years|yrs|year)/);
  return match ? Number(match[1]) : 0;
};

function calculateMatchScore(resumeText = "", jobSkills = [], jobDescription = "") {
  const normalizedResume = normalize(resumeText);
  const resumeTokens = tokenize(resumeText);

  const skillRequirements = (Array.isArray(jobSkills) ? jobSkills : [])
    .map((skill) => ({
      original: skill,
      normalized: normalize(skill),
      parts: normalize(skill).split(" ").filter(Boolean),
    }))
    .filter((item) => item.normalized.length > 0);

  const matchedSkills = [];
  const missingSkills = [];

  skillRequirements.forEach(({ original, normalized, parts }) => {
    const matchesWholeSkill = normalizedResume.includes(normalized);
    const matchesParts = parts.length > 0 && parts.every((part) => resumeTokens.has(part));

    if (matchesWholeSkill || matchesParts) {
      matchedSkills.push(original);
    } else {
      missingSkills.push(original);
    }
  });

  const skillScore = skillRequirements.length
    ? Math.round((matchedSkills.length / skillRequirements.length) * 100)
    : 100;

  const experienceKeywords = [
    "experience",
    "experienced",
    "years",
    "yrs",
    "year",
    "senior",
    "lead",
    "manager",
    "principal",
    "director",
    "mid",
    "junior",
    "entry",
  ];

  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "degree",
    "mba",
    "bs",
    "ba",
    "ms",
    "diploma",
    "certificate",
    "certifications",
  ];

  const resumeYears = parseYears(resumeText);
  const jobYears = parseYears(jobDescription);
  const resumeHasExperience = containsAny(resumeText, experienceKeywords) || resumeYears > 0;
  const jobHasExperience = containsAny(jobDescription, experienceKeywords) || jobYears > 0;

  let experienceScore = 60;
  if (jobYears > 0) {
    if (resumeYears >= jobYears) {
      experienceScore = 100;
    } else if (resumeYears > 0) {
      experienceScore = 70;
    } else {
      experienceScore = 50;
    }
  } else if (jobHasExperience) {
    experienceScore = resumeHasExperience ? 85 : 55;
  } else {
    experienceScore = resumeHasExperience ? 80 : 65;
  }

  const resumeHasEducation = containsAny(resumeText, educationKeywords);
  const jobHasEducation = containsAny(jobDescription, educationKeywords);

  let educationScore = 70;
  if (jobHasEducation) {
    educationScore = resumeHasEducation ? 100 : 50;
  } else {
    educationScore = resumeHasEducation ? 90 : 70;
  }

  const totalScore = Math.round(
    skillScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2
  );

  const fitLabel = totalScore >= 90
    ? "Excellent Match"
    : totalScore >= 70
    ? "Good Match"
    : totalScore >= 50
    ? "Moderate Match"
    : "Low Match";

  const suggestions = [];
  if (missingSkills.length) {
    suggestions.push(`Add or emphasize these required skills: ${missingSkills.join(", ")}.`);
  }
  if (experienceScore < 70) {
    suggestions.push("Highlight relevant years of experience or leadership in your resume.");
  }
  if (educationScore < 70 && jobHasEducation) {
    suggestions.push("Include your relevant education or degree to improve this match.");
  }
  if (!suggestions.length) {
    suggestions.push("Your resume aligns well with this role. Keep refining keywords and achievements.");
  }

  const scoreBreakdown = [
    { label: "Skills Match", score: skillScore },
    { label: "Experience", score: experienceScore },
    { label: "Education", score: educationScore },
  ];

  return {
    matchScore: Math.max(0, Math.min(100, totalScore)),
    skillsMatch: skillScore,
    experienceMatch: experienceScore,
    educationMatch: educationScore,
    matchedSkills,
    missingSkills,
    breakdown: scoreBreakdown,
    scoreBreakdown,
    fitLabel,
    suggestions,
  };
}

function generateFallbackScore({ resumeText = "", jobSkills = [], jobDescription = "" } = {}) {
  const normalizedResume = normalize(resumeText);
  const resumeTokens = tokenize(resumeText);

  const skillRequirements = (Array.isArray(jobSkills) ? jobSkills : [])
    .map((skill) => ({
      original: skill,
      normalized: normalize(skill),
      parts: normalize(skill).split(" ").filter(Boolean),
    }))
    .filter((item) => item.normalized.length > 0);

  const matchedSkills = [];
  const missingSkills = [];

  skillRequirements.forEach(({ original, normalized, parts }) => {
    const matchesWholeSkill = normalizedResume.includes(normalized);
    const matchesParts = parts.length > 0 && parts.every((part) => resumeTokens.has(part));

    if (matchesWholeSkill || matchesParts) {
      matchedSkills.push(original);
    } else {
      missingSkills.push(original);
    }
  });

  const skillScore = skillRequirements.length
    ? Math.round((matchedSkills.length / skillRequirements.length) * 100)
    : 65;

  const experienceKeywords = [
    "experience",
    "experienced",
    "years",
    "yrs",
    "year",
    "senior",
    "lead",
    "manager",
    "principal",
    "director",
    "mid",
    "junior",
    "entry",
  ];
  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "degree",
    "mba",
    "bs",
    "ba",
    "ms",
    "diploma",
    "certificate",
    "certifications",
  ];

  const resumeHasExperience = containsAny(resumeText, experienceKeywords);
  const resumeHasEducation = containsAny(resumeText, educationKeywords);

  const experienceScore = resumeHasExperience ? 75 : 55;
  const educationScore = resumeHasEducation ? 75 : 55;
  const totalScore = Math.round(skillScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2);

  const fitLabel = totalScore >= 90
    ? "Excellent Match"
    : totalScore >= 70
    ? "Good Match"
    : totalScore >= 50
    ? "Moderate Match"
    : "Low Match";

  const suggestions = [];
  if (matchedSkills.length === 0 && missingSkills.length > 0) {
    suggestions.push(`Review the role's required skills and emphasize relevant experience or certifications.`);
  }
  if (!resumeHasExperience) {
    suggestions.push("Include more details about your experience duration and project contributions.");
  }
  if (!resumeHasEducation) {
    suggestions.push("Add education, certifications, or training where relevant.");
  }
  if (!suggestions.length) {
    suggestions.push("Provide additional resume context to improve the match score.");
  }

  return {
    matchScore: Math.max(0, Math.min(100, totalScore)),
    skillsMatch: skillScore,
    experienceMatch: experienceScore,
    educationMatch: educationScore,
    matchedSkills,
    missingSkills,
    breakdown: [
      { label: "Skills Match", score: skillScore },
      { label: "Experience", score: experienceScore },
      { label: "Education", score: educationScore },
    ],
    fitLabel,
    suggestions,
  };
}

module.exports = {
  calculateMatchScore,
  generateFallbackScore,
};
