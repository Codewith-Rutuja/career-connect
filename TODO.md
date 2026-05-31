# TODO - Resume Match Score (Employer Resume Lab)

## Plan
- [x] Step 1: Ensure backend applicant retrieval always returns `matchScore`, `matchedSkills`, `missingSkills` for the job.
- [ ] Step 2: Add backend endpoint to persist/generate matchScore when missing for a specific application (candidate+job).
- [x] Step 3: Update frontend employer candidate selection panel (ApplicationsPage) so it immediately shows:
  - [x] Resume Match Score (%)
  - [x] Visual progress bar
  - [x] Matched Skills
  - [x] Missing Skills

- [ ] Step 4: Update ApplicantCard visual progress bar consistency.
- [x] Step 5: Add defensive UI fallback: compute score from available application resume if backend missing.
- [x] Step 6: Run tests / lint / manual smoke test.




