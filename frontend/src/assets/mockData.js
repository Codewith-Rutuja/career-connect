export const mockJobs = [
  {
    _id: "job-1",
    title: "AI Product Designer",
    companyName: "Northstar Labs",
    location: "Bengaluru, India",
    jobType: "Full-time",
    salary: "22-30 LPA",
    description:
      "Design intelligent candidate experiences, recruiter workflows, and recommendation surfaces for a fast-growing hiring platform.",
    skills: ["Figma", "Design Systems", "User Research", "AI UX", "Prototyping"],
    employer: {
      name: "Ananya Rao",
      companyName: "Northstar Labs",
      email: "talent@northstarlabs.ai",
      companyDescription:
        "Northstar Labs builds AI-native products for the future of work with a strong focus on polished product thinking.",
    },
    applicantCount: 34,
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    _id: "job-2",
    title: "Frontend Engineer",
    companyName: "PulseHire",
    location: "Remote",
    jobType: "Remote",
    salary: "18-24 LPA",
    description:
      "Ship delightful product surfaces in React, collaborate with design, and push motion-rich interfaces into production.",
    skills: ["React", "Tailwind CSS", "Framer Motion", "TypeScript", "REST APIs"],
    employer: {
      name: "Rahul Nair",
      companyName: "PulseHire",
      email: "jobs@pulsehire.com",
      companyDescription:
        "PulseHire is modernizing recruiting workflows for high-growth startups across Asia and Europe.",
    },
    applicantCount: 57,
    createdAt: "2026-03-30T10:00:00.000Z",
  },
  {
    _id: "job-3",
    title: "Campus Recruitment Manager",
    companyName: "VectorEdge",
    location: "Hyderabad, India",
    jobType: "Full-time",
    salary: "14-18 LPA",
    description:
      "Lead university hiring programs, manage employer brand events, and convert top student talent into successful hires.",
    skills: ["Campus Hiring", "Stakeholder Management", "Communication", "Analytics"],
    employer: {
      name: "Maya Thomas",
      companyName: "VectorEdge",
      email: "careers@vectoredge.io",
      companyDescription:
        "VectorEdge partners with universities and enterprises to build stronger early-career talent pipelines.",
    },
    applicantCount: 12,
    createdAt: "2026-03-28T10:00:00.000Z",
  },
];

export const recruiterHighlights = [
  { label: "Screening time reduced", value: "67%" },
  { label: "Higher quality applicants", value: "2.4x" },
  { label: "Universities onboarded", value: "120+" },
];

export const candidateHighlights = [
  { label: "Curated roles", value: "5k+" },
  { label: "Average response speed", value: "36 hrs" },
  { label: "Hiring partners", value: "450+" },
];
