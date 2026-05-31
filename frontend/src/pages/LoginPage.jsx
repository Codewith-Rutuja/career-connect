import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthHero from "../components/AuthHero";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (event) =>
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      navigate(location.state?.from || "/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <AuthHero
          title="Welcome back."
          subtitle="Sign in to continue your applications and hiring workflow."
          stats={[
            { label: "Hiring partners", value: "450+" },
            { label: "Weekly applications", value: "18k+" },
            { label: "Avg response time", value: "36 hrs" },
          ]}
        />
        <div className="glass-panel p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold">Log in</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Use your student, job seeker, or recruiter credentials.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={onChange} placeholder="you@example.com" required />
            <InputField label="Password" name="password" type="password" value={formData.password} onChange={onChange} placeholder="Enter your password" required />
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">Continue to dashboard</Button>
          </form>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            New to CareerConnect?{" "}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-300">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
