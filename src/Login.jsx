import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Lock, Mail, ArrowRight, UserCheck, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

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
          setMessage("Account created successfully! Logging you in...");
          setTimeout(() => onLoginSuccess(data.user), 800);
        } else {
          setMessage("Please check your email to confirm your signup, or use 1-Click Guest Login!");
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
      email: "guest.yatri@safar.in",
      user_metadata: { name: "Guest Yatri" }
    };
    localStorage.setItem("safar_user_id", demoUser.id);
    localStorage.setItem("safar_guest_user", JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Immersive background photograph of Indian Himalayas */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2000&q=85"
          alt="Himalayan Valley at Twilight"
          className="w-full h-full object-cover filter brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172536] via-[#172536]/50 to-[#172536]/70" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#E5E0D8] relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#172536] text-[#F7F5F0] flex items-center justify-center font-serif text-xl font-bold mx-auto">
            S
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#172536]">SAFAR</h1>
            <p className="text-[11px] uppercase font-bold tracking-wider text-[#E99A25] mt-0.5">
              Discover India, Beyond the Ordinary
            </p>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed pt-1">
            {isSignUp
              ? "Create an account to save custom itineraries, view real bookings, and access your 24x7 AI Copilot."
              : "Sign in to access your planned routes, confirmed bookings, and personalized crowd alerts."}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172536] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold pl-10 transition outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172536] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold pl-10 transition outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E99A25] hover:bg-[#D4881A] text-[#172536] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isSignUp ? "Create Yatri Account" : "Sign In to Safar"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E0D8]" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Or quick access
          </span>
        </div>

        {/* Guest Demo Login */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-3 bg-[#FAF8F5] hover:bg-[#E5E0D8]/40 text-[#172536] font-bold text-xs rounded-xl border border-[#E5E0D8] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-[#2D5A46]" />
          <span>Continue as Guest / Demo Yatri (1-Click)</span>
        </button>

        {/* Switch mode */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-xs font-semibold text-[#2D5A46] hover:text-[#172536] hover:underline cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Security badge */}
        <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-center gap-1.5 text-[10px] text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A46]" />
          <span>Secured by Supabase Auth & Cloud Data Store</span>
        </div>
      </div>
    </div>
  );
}
