import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DEMO_MODE } from "../lib/api.js";
import { heroArt } from "../lib/art.js";
import { useStore } from "../lib/store.jsx";

export default function Auth({ mode }) {
  const isSignup = mode === "signup";
  const { signIn, signUp } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) await signUp(form);
      else await signIn({ email: form.email, password: form.password });
      navigate(location.state?.from || (isSignup ? "/account" : "/"), { replace: true });
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__form">
        <div className="w-full max-w-[420px]">
          <Link className="brand" to="/">
            <span className="brand__mark">L</span>
            <span>luma<span className="brand__dot">.</span></span>
          </Link>
          <h1 className="mt-10 text-3xl font-bold sm:text-4xl">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSignup
              ? "Join us for a smoother checkout, saved favourites and order tracking."
              : "Sign in to continue to your saved items and orders."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            {isSignup && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <div className="relative">
                  <UserRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="name" required className="pl-10" placeholder="Alex Morgan" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </div>
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="email" type="email" required className="pl-10" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="password" type={showPassword ? "text" : "password"} required minLength={6} className="pl-10 pr-11" placeholder="At least 6 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="field-error">{error}</p>}
            <button className="btn btn--primary w-full" disabled={busy} type="submit">
              {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>

          {DEMO_MODE && (
            <div className="mt-6 rounded-2xl bg-brand-50 p-4 text-xs leading-6 text-brand-800">
              <strong className="flex items-center gap-2"><CheckCircle2 size={15} /> Demo mode is on</strong>
              Use any email and a password of 6+ characters. No real account is created.
            </div>
          )}

          <p className="mt-7 text-sm text-slate-500">
            {isSignup ? "Already have an account?" : "New to Luma?"}{" "}
            <Link className="font-bold text-brand-700 hover:underline" to={isSignup ? "/signin" : "/signup"}>
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-page__art">
        <div className="auth-page__art-inner">
          <img src={heroArt} alt="Luma store essentials" />
          <div className="mt-8 max-w-sm">
            <blockquote className="text-2xl font-semibold leading-snug text-white">
              “Good design should feel effortless — online and at your door.”
            </blockquote>
            <p className="mt-3 text-sm text-brand-100">The Luma promise · Curated essentials, honest prices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
