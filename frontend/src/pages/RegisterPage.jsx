import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthHero from "../components/AuthHero";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import TextAreaField from "../components/ui/TextAreaField";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
    headline: "",
    location: "",
    skills: "",
    companyName: "",
    companyDescription: "",
  });

  const onChange = (event) =>
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register({
        ...formData,
        skills: formData.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <AuthHero
          title="Create your profile in minutes."
          subtitle="Choose your role, set up your identity, and unlock a role-aware dashboard built for hiring."
          stats={[
            { label: "Students onboarded", value: "12k+" },
            { label: "Recruiter teams", value: "450+" },
            { label: "Fit score clarity", value: "Real-time" },
          ]}
        />
        <div className="glass-panel p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold">Create account</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Pick the experience you want CareerConnect to optimize for.
          </p>
          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <InputField label="Full name" name="name" value={formData.name} onChange={onChange} required />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={onChange} required />
            <InputField label="Password" name="password" type="password" value={formData.password} onChange={onChange} required />
            <SelectField
              label="Role"
              name="role"
              value={formData.role}
              onChange={onChange}
              options={[
                { value: "jobseeker", label: "Job Seeker" },
                { value: "employer", label: "Recruiter" },
              ]}
            />
            <InputField
              label="Headline"
              name="headline"
              value={formData.headline}
              onChange={onChange}
              placeholder="Frontend engineer seeking product-focused teams"
              className="md:col-span-2"
            />
            <InputField
              label="Location"
              name="location"
              value={formData.location}
              onChange={onChange}
              placeholder="Bengaluru, India"
              className="md:col-span-2"
            />

            {formData.role === "jobseeker" ? (
              <InputField
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={onChange}
                placeholder="React, Figma, Communication, Node.js"
                helperText="Separate skills with commas."
                className="md:col-span-2"
              />
            ) : (
              <>
                <InputField label="Company name" name="companyName" value={formData.companyName} onChange={onChange} className="md:col-span-2" />
                <TextAreaField
                  label="Company description"
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={onChange}
                  className="md:col-span-2"
                  placeholder="Describe your hiring brand, mission, and open opportunities."
                />
              </>
            )}

            <div className="md:col-span-2">
              <Button type="submit" loading={loading} className="w-full">Create account</Button>
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-300">Log in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
