import React, { useState, useEffect } from "react";
import { X, Calendar, Download, Printer, ShieldCheck, QrCode, Building, Plane, ArrowRight } from "lucide-react";
import { getUserBookings } from "../services/bookingService";

export default function MyBookingsModal({ isOpen, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getUserBookings().then((res) => {
        setBookings(res);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl font-black">
              🎟️
            </div>
            <div>
              <h3 className="font-black text-xl leading-tight">My Confirmed Bookings & Vouchers</h3>
              <p className="text-xs text-teal-200 font-semibold">Synced with Supabase Cloud Database</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-bold text-sm">
              Loading your bookings from Supabase...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center text-2xl">
                🧳
              </div>
              <h4 className="font-black text-slate-800 text-lg">No Confirmed Bookings Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                When you book a hotel or flight using our real booking platform, your official PNR vouchers will appear right here!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {bookings.map((b, idx) => (
                <div 
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 bg-slate-50/70 transition space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                        {b.type === "flight" ? <Plane className="w-5 h-5 text-emerald-400" /> : <Building className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {b.status || "CONFIRMED"}
                        </span>
                        <h4 className="font-black text-base text-slate-900 mt-0.5">{b.itemName || b.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{b.destination} • {b.bookingDate || "Recent Booking"}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block">PNR Reference:</span>
                      <span className="font-mono text-sm font-black text-slate-900 bg-white border border-slate-300 px-2.5 py-0.5 rounded-lg">
                        {b.pnr}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-medium">
                      Guest: <strong className="text-slate-900">{b.travelerName || "Yatri"}</strong> • Paid: <strong className="text-emerald-800">₹{b.totalAmount ? b.totalAmount.toLocaleString() : "4,500"}</strong>
                    </span>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" /> Print Voucher
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
