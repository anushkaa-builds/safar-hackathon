import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Compass, ShieldCheck, Sparkles, Lock, Mail, ArrowRight, UserCheck, AlertCircle, CheckCircle } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setMessage("🎉 Account created successfully! Logging you in...");
          setTimeout(() => onLoginSuccess(data.user), 800);
        } else {
          setMessage("Please check your email to confirm your signup, or use Guest Login!");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleGuestLogin() {
    const demoUser = {
      id: "guest_" + Math.random().toString(36).substring(2, 9),
      email: "guest.yatri@yatrisathi.com",
      user_metadata: { name: "Guest Yatri" }
    };
    localStorage.setItem("safar_user_id", demoUser.id);
    localStorage.setItem("safar_guest_user", JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-emerald-600/30">
            🧭
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">YatriSathi</h1>
            <p className="text-xs font-bold text-emerald-700 tracking-wide mt-0.5">
              AI Tourism & Real Booking Platform
            </p>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {isSignUp ? "Create an account to manage bookings, sync itineraries, and access live rates" : "Sign in to access your itinerary, real hotel/flight bookings, and AI Copilot"}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold pl-10 transition outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold pl-10 transition outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span>Connecting to Supabase...</span>
            ) : (
              <>
                <span>{isSignUp ? "Create Yatri Account" : "Sign In to Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or quick access
          </span>
        </div>

        {/* Demo / Guest Login */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition shadow-xs"
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Continue as Guest / Demo Yatri (1-Click)</span>
        </button>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured by Supabase Auth & Cloud Data Store</span>
        </div>
      </div>
    </div>
  );
}
