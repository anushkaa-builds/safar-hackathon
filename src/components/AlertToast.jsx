import React from "react";
import { AlertTriangle, CloudRain, Users, X, ArrowRight, ShieldCheck } from "lucide-react";

export default function AlertToast({ alert, onDismiss, onViewAssistant, onSwapRoute }) {
  if (!alert) return null;

  const isSevere = alert.severity === "high" || alert.severity === "severe";

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-full animate-bounce-short">
      <div className={`p-4 sm:p-5 rounded-3xl shadow-2xl backdrop-blur-xl border-2 transition-all ${
        isSevere
          ? "bg-rose-950/90 text-white border-rose-500/60 shadow-rose-900/40"
          : "bg-slate-900/90 text-white border-teal-500/50 shadow-teal-950/40"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black shrink-0 ${
              isSevere ? "bg-rose-600 text-white animate-pulse" : "bg-teal-500 text-slate-950"
            }`}>
              {alert.type === "crowd" ? <Users className="w-5 h-5" /> : alert.type === "weather" ? <CloudRain className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  Proactive AI Guardian
                </span>
                <span className="text-[10px] text-white/70">{alert.timestamp}</span>
              </div>
              <h4 className="font-black text-sm text-white mt-0.5 leading-snug">{alert.title}</h4>
            </div>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-white/90 font-medium mt-2.5 leading-relaxed">
          {alert.message}
        </p>

        {alert.alternative && (
          <div className="mt-3 p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-teal-300 font-bold block">Recommended Serene Alternative:</span>
              <span className="text-xs font-black text-white">{alert.alternative}</span>
            </div>
            {onSwapRoute && (
              <button
                onClick={() => {
                  onSwapRoute();
                  onDismiss(alert.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md transition shrink-0"
              >
                Swap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> GIS Safety Verified
          </div>
          <button
            onClick={() => {
              if (onViewAssistant) onViewAssistant();
              onDismiss(alert.id);
            }}
            className="text-xs font-bold text-teal-300 hover:text-teal-200 underline flex items-center gap-1"
          >
            Open Live AI Guardian →
          </button>
        </div>
      </div>
    </div>
  );
}