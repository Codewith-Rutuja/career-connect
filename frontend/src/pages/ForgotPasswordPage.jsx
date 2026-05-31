import { useState } from "react";
import { Link } from "react-router-dom";
import AuthHero from "../components/AuthHero";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { forgotPassword, getErrorMessage } from "../services/api";
import toast from "react-hot-toast";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      setResetToken(response.resetToken || "");
      toast.success(response.message || "Password reset link created.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to request password reset."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <AuthHero
          title="Reset your password."
          subtitle="Enter your account email and we will send a reset link to restore access."
          stats={[
            { label: "Secure reset", value: "Live" },
            { label: "Token valid", value: "1 hour" },
            { label: "Support", value: "In-app" },
          ]}
        />
        <div className="glass-panel p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold">Forgot password</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            We will generate a secure reset token so you can choose a new password.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <InputField label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <Button type="submit" loading={loading} className="w-full">Request reset link</Button>
          </form>
          {resetToken && (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200">
              <p className="font-semibold">Reset token generated</p>
              <p className="mt-2 break-all">{resetToken}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Use this token on the reset password page or check the server logs for the generated link.
              </p>
              <Link to={`/reset-password/${resetToken}`} className="mt-4 inline-flex rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                Open reset page
              </Link>
            </div>
          )}
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Remembered your password? <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-300">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
