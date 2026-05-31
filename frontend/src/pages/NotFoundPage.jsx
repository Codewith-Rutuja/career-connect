import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

function NotFoundPage() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="glass-panel max-w-xl p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold">This page drifted off-course.</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          The route you requested does not exist, but the rest of CareerConnect is ready.
        </p>
        <div className="mt-8">
          <Button as={Link} to="/">Return home</Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
