import React, { useState } from "react";
import { 
  X, Check, ShieldCheck, CreditCard, Lock, Download, 
  Printer, ArrowRight, User, Mail, Phone, Calendar, 
  Sparkles, CheckCircle2, QrCode, AlertCircle, Building, Plane
} from "lucide-react";
import { saveBooking, generatePNR } from "../services/bookingService";

export default function BookingModal({ isOpen, onClose, item, type = "hotel", destination = "Kashmir", onBookingComplete }) {
  if (!isOpen || !item) return null;

  const [step, setStep] = useState(1); // 1: Traveler Details, 2: Stripe Payment, 3: Voucher / PNR
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Traveler form state
  const [guestName, setGuestName] = useState(localStorage.getItem("safar_guest_name") || "Yatri Traveler");
  const [guestEmail, setGuestEmail] = useState(localStorage.getItem("safar_guest_email") || "traveler@yatrisathi.com");
  const [guestPhone, setGuestPhone] = useState("+91 98765 43210");
  const [guestAge, setGuestAge] = useState("24");
  const [idType, setIdType] = useState("Aadhaar / National ID");
  const [idNumber, setIdNumber] = useState("XXXX-XXXX-4819");
  const [specialRequests, setSpecialRequests] = useState("High floor room with scenic view / Window seat");

  // Stripe card state
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [cardName, setCardName] = useState("Yatri Traveler");
  const [cardZip, setCardZip] = useState("110001");

  // Price calculations
  const rawPrice = item.priceNum || (typeof item.price === "string" ? parseInt(item.price.replace(/[^0-9]/g, "")) : 4500) || 4500;
  const basePrice = rawPrice;
  const taxesAndGST = Math.round(basePrice * 0.12);
  const greenLevy = 99;
  const totalPayable = basePrice + taxesAndGST + greenLevy;

  function fillTestCard() {
    setCardNumber("4242 4242 4242 4242");
    setCardExpiry("12/28");
    setCardCvc("424");
    setCardName(guestName || "Test Traveler");
    setCardZip("110001");
  }

  async function handleProceedToPayment(e) {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) return;
    localStorage.setItem("safar_guest_name", guestName);
    localStorage.setItem("safar_guest_email", guestEmail);
    setStep(2);
  }

  async function handleStripePay(e) {
    e.preventDefault();
    setLoading(true);

    const generatedPnr = generatePNR(type);
    const paymentId = `ch_test_${Date.now()}_${Math.random().toString(36).substring(5)}`;

    const bookingRecord = {
      pnr: generatedPnr,
      type: type,
      itemName: item.name || item.provider || item.mode || "Travel Service",
      itemDetails: item,
      destination: destination || item.destination || "India",
      travelerName: guestName,
      travelerEmail: guestEmail,
      travelerPhone: guestPhone,
      travelerAge: guestAge,
      idProof: `${idType}: ${idNumber}`,
      specialRequests,
      basePrice,
      taxes: taxesAndGST,
      greenLevy,
      totalAmount: totalPayable,
      paymentId,
      cardLast4: cardNumber.replace(/\s/g, "").slice(-4) || "4242",
      bookingDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      checkInTime: item.timing || item.departureTime || "02:00 PM",
      status: "CONFIRMED"
    };

    // Simulate 1s real Stripe API processing
    setTimeout(async () => {
      const saved = await saveBooking(bookingRecord);
      setConfirmedBooking(saved);
      setLoading(false);
      setStep(3);
      if (onBookingComplete) {
        onBookingComplete(saved);
      }
    }, 1200);
  }

  function handlePrintVoucher() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#172536] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-xl text-[#E99A25]">
              {type === "flight" ? <Plane className="w-5 h-5 text-[#E99A25]" /> : <Building className="w-5 h-5 text-[#E99A25]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E99A25] text-[#172536]">
                  {step === 3 ? "Booking Confirmed" : "Direct Reservation"}
                </span>
                <span className="text-[10px] text-white/70 font-sans font-medium">Stripe Live Checkout</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white mt-0.5 leading-tight">
                {step === 3 ? "Official Booking Voucher" : `Reserve ${item.name || item.provider || "Travel"}`}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xl font-bold transition">
            ✕
          </button>
        </div>

        {/* Progress Tracker Bar */}
        {step < 3 && (
          <div className="px-6 py-2.5 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-center justify-between text-xs font-sans font-medium">
            <span className={step === 1 ? "text-[#172536] font-semibold flex items-center gap-1.5" : "text-slate-500 flex items-center gap-1.5"}>
              <span className="w-5 h-5 rounded-full bg-[#172536] text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Traveler Details
            </span>
            <span className="text-slate-300">➔</span>
            <span className={step === 2 ? "text-[#172536] font-semibold flex items-center gap-1.5" : "text-slate-400 flex items-center gap-1.5"}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? "bg-[#172536] text-white" : "bg-slate-200 text-slate-700"}`}>2</span>
              Payment Confirmation
            </span>
            <span className="text-slate-300">➔</span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">3</span>
              PNR Voucher
            </span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-5">
          {/* STEP 1: TRAVELER & GUEST DETAILS */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Selected Item Summary Card */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase text-[#B47012] bg-[#E99A25]/15 px-2 py-0.5 rounded">
                    {item.type || type}
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#172536] mt-1">{item.name || item.provider || item.mode}</h4>
                  <p className="text-xs text-slate-500 font-sans">{item.address || item.route || `Destination: ${destination}`}</p>
                  <p className="text-[11px] text-[#2D5A46] font-sans font-medium mt-1">
                    ✓ {item.cancellation || "Instant Confirmation with PNR & Supabase Sync"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-serif font-bold text-[#172536] block">
                    {item.price || `₹${totalPayable.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block">+ ₹{taxesAndGST} taxes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-800">Lead Passenger / Guest Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      placeholder="e.g. Anushka Yadav"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold pl-9 outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-800">Email Address (For Voucher)</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      placeholder="traveler@example.com"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold pl-9 outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-800">Mobile Phone (WhatsApp Updates)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold pl-9 outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-800">Age & Identity Verification</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={guestAge}
                      onChange={(e) => setGuestAge(e.target.value)}
                      placeholder="Age"
                      className="w-20 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-center outline-none"
                    />
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Govt ID / Aadhaar / Passport"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800">Special Preferences / Requests (Optional)</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Non-smoking room, Quiet floor, Vegetarian breakfast, Extra pillows"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">Total Amount Payable:</span>
                  <span className="text-lg font-black text-slate-900">₹{totalPayable.toLocaleString()}</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <span>Proceed to Stripe Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: STRIPE TEST PAYMENT FORM */}
          {step === 2 && (
            <form onSubmit={handleStripePay} className="space-y-4">
              {/* Stripe Test Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs text-blue-900 font-bold">
                    Stripe Sandbox Active • Zero real money charged
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] shrink-0 transition"
                >
                  ⚡ Auto-Fill 4242 Test Card
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-700">
                  <span>Base Rate / Fare ({item.name || item.provider})</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Taxes & GST (12%)</span>
                  <span>₹{taxesAndGST.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Eco Tourism Community Contribution</span>
                  <span>₹{greenLevy}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-black text-sm">
                  <span>Total Due Now</span>
                  <span className="text-emerald-800">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Card Form */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Card Payment (Stripe Secure)</span>
                  <div className="flex gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-black">VISA</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-black">MASTERCARD</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-black">RUPAY</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      required
                      className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs font-mono tracking-wider text-white outline-none pl-9"
                    />
                    <CreditCard className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                      className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs font-mono text-center text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      required
                      className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs font-mono text-center text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-300">ZIP / PIN</label>
                    <input
                      type="text"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      placeholder="110001"
                      required
                      className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs font-mono text-center text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full Name as on Card"
                    required
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-[#172536] hover:bg-[#22354d] text-[#F7F5F0] font-sans font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing with Stripe & Syncing Supabase...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#E99A25]" />
                      <span>Confirm & Authorize ₹{totalPayable.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OFFICIAL PNR CONFIRMATION VOUCHER */}
          {step === 3 && confirmedBooking && (
            <div className="space-y-5">
              {/* Green Success Badge */}
              <div className="p-4 rounded-2xl bg-[#2D5A46]/10 border border-[#2D5A46]/30 text-[#2D5A46] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#172536]">Payment Confirmed & Verified</h4>
                    <p className="text-xs text-slate-600 font-sans">
                      Your booking has been registered with official PNR.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-sans font-bold uppercase text-[#2D5A46] bg-white border border-[#2D5A46]/30 px-2.5 py-1 rounded-md">
                  PAID
                </span>
              </div>

              {/* Printable Official Voucher Box */}
              <div id="booking-voucher" className="p-6 rounded-3xl bg-white border border-[#E5E0D8] shadow-sm space-y-5 text-slate-900">
                {/* Voucher Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#E5E0D8] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#172536] text-[#F7F5F0] flex items-center justify-center font-serif font-bold text-lg">
                      S
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#172536]">SAFAR Official Travel Voucher</h3>
                      <p className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">Verified Booking & Tourism Guarantee</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded block">
                      Confirmed PNR
                    </span>
                    <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                      {confirmedBooking.pnr}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">Reserved Service</span>
                    <h4 className="font-black text-sm text-slate-900">{confirmedBooking.itemName}</h4>
                    <p className="text-slate-600 font-semibold">{item.address || item.route || destination}</p>
                    <p className="text-[11px] text-emerald-800 font-bold mt-1">Schedule/Timing: {confirmedBooking.checkInTime}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">Primary Guest / Passenger</span>
                    <h4 className="font-black text-sm text-slate-900">{confirmedBooking.travelerName}</h4>
                    <p className="text-slate-600 font-semibold">{confirmedBooking.travelerEmail} • {confirmedBooking.travelerPhone}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Verified ID: {confirmedBooking.idProof}</p>
                  </div>
                </div>

                {/* Billing & Verification Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Stripe Transaction Reference:</span>
                    <span className="font-mono text-emerald-300 font-bold text-xs">{confirmedBooking.paymentId}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Total Paid (All Inclusive):</span>
                    <span className="text-base font-black text-white">₹{confirmedBooking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                  <p className="font-bold text-slate-800">📋 Check-In & Boarding Instructions:</p>
                  <p>• Present this digital voucher or PNR (<strong>{confirmedBooking.pnr}</strong>) along with any government photo ID upon arrival.</p>
                  <p>• 24x7 Tourist Helpline: Dial <strong>1363</strong> or <strong>112</strong> in case of emergency.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-md transition"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Download / Print Voucher</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md"
                >
                  Done & Back to Itinerary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
