import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import TextAreaField from "../components/ui/TextAreaField";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, updateProfile } from "../services/api";

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    location: "",
    education: "",
    experience: "",
    skills: "",
    resumeText: "",
    resumeFile: "",
    companyName: "",
    companyDescription: "",
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      headline: user.headline || "",
      location: user.location || "",
      education: user.education || "",
      experience: user.experience || "",
      skills: user.skills?.join(", ") || "",
      resumeText: user.resumeText || "",
      resumeFile: user.resumeFile || "",
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await updateProfile({
        ...formData,
        skills: formData.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      setUser(response.user);
      toast.success(response.message || "Profile updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update profile."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <Sidebar />
        <section className="glass-panel p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Profile</p>
          <h1 className="mt-4 font-display text-4xl font-bold">Manage your public professional story</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Keep your profile sharp so recruiters or candidates immediately understand your value.
          </p>

          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <InputField label="Full name" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} required />
            <InputField label="Email" value={user?.email || ""} disabled />
            <InputField label="Headline" value={formData.headline} onChange={(event) => setFormData((current) => ({ ...current, headline: event.target.value }))} className="md:col-span-2" />
            <InputField label="Location" value={formData.location} onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))} />
            <InputField label="Education" value={formData.education} onChange={(event) => setFormData((current) => ({ ...current, education: event.target.value }))} />
            <TextAreaField label="Experience" value={formData.experience} onChange={(event) => setFormData((current) => ({ ...current, experience: event.target.value }))} className="md:col-span-2" />

            {user?.role === "employer" ? (
              <>
                <InputField label="Company name" value={formData.companyName} onChange={(event) => setFormData((current) => ({ ...current, companyName: event.target.value }))} className="md:col-span-2" />
                <TextAreaField label="Company description" value={formData.companyDescription} onChange={(event) => setFormData((current) => ({ ...current, companyDescription: event.target.value }))} className="md:col-span-2" />
              </>
            ) : (
              <>
                <InputField
                  label="Skills"
                  value={formData.skills}
                  onChange={(event) => setFormData((current) => ({ ...current, skills: event.target.value }))}
                  helperText="Separate skills with commas."
                  className="md:col-span-2"
                />
                <InputField label="Resume file reference" value={formData.resumeFile} onChange={(event) => setFormData((current) => ({ ...current, resumeFile: event.target.value }))} className="md:col-span-2" />
                <TextAreaField label="Resume text" value={formData.resumeText} onChange={(event) => setFormData((current) => ({ ...current, resumeText: event.target.value }))} className="md:col-span-2" />
              </>
            )}
            <div className="md:col-span-2">
              <Button type="submit" loading={loading}>Save profile</Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
