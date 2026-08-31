import React from "react";
import { ShieldAlert, PhoneCall, HeartPulse, Compass, MapPin } from "lucide-react";

export default function EmergencyModal({ isOpen, onClose, destinationName = "Kashmir" }) {
  if (!isOpen) return null;

  const contacts = [
    { title: "Tourist Police National Helpline", number: "1363", badge: "24x7 Multi-lingual", icon: Compass, color: "from-blue-600 to-indigo-600" },
    { title: "National Emergency Response (All in One)", number: "112", badge: "Instant SOS", icon: ShieldAlert, color: "from-rose-600 to-red-700" },
    { title: "National Ambulance & Medical Rescue", number: "108", badge: "Paramedic Unit", icon: HeartPulse, color: "from-emerald-600 to-teal-700" },
    { title: "State Disaster Management (SDRF)", number: "1070", badge: "Natural Calamity / Rescue", icon: MapPin, color: "from-amber-600 to-orange-700" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white border-2 border-rose-300 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl leading-tight">Emergency SOS & Safety Hub</h3>
              <p className="text-xs text-rose-100 font-semibold">Location: {destinationName} • Real-Time Assistance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <p className="text-xs text-rose-900 font-bold leading-relaxed">
              ⚠️ In case of medical emergencies, road blockages, natural calamities, or safety concerns, tap the numbers below for immediate direct connection.
            </p>
          </div>

          <div className="space-y-3">
            {contacts.map((c, i) => {
              const IconComponent = c.icon;
              return (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 flex items-center justify-between gap-3 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {c.badge}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-1">{c.title}</h4>
                      <p className="text-xs text-slate-500 font-bold">Dial: <span className="text-slate-900 font-black">{c.number}</span></p>
                    </div>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md shrink-0 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Call {c.number}
                  </a>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs space-y-2">
            <p className="font-bold text-slate-900">🛡️ Important High-Altitude Safety Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>High Altitude Sickness (AMS): If experiencing dizziness or headache above 2,500m, descend immediately and seek oxygen support.</li>
              <li>Always inform your homestay/hotel manager before embarking on unguided backcountry trails.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-black text-xs hover:bg-slate-300 transition"
          >
            Close SOS Hub
          </button>
        </div>
      </div>
    </div>
  );
}