import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-700"><Compass size={30} /></span>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-bold">This page took a detour</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">The page you're looking for isn't here. Let's get you back to the good stuff.</p>
      <Link className="btn btn--primary mt-7" to="/"><ArrowLeft size={17} /> Back to home</Link>
    </div>
  );
}
