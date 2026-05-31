import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ProfilePage from "./pages/ProfilePage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-shell text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial dark:bg-hero-radial-dark" />
      <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/10" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
              <Route path="/reset-password/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <PageTransition><JobsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute>
                    <PageTransition><JobDetailsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PageTransition><DashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <PageTransition><ApplicationsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PageTransition><ProfilePage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <ProtectedRoute>
                    <PageTransition><ResumeUploadPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <ProtectedRoute>
                    <PageTransition><SavedJobsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
