import { supabase } from "../supabaseClient";

/**
 * Generates a unique, professional PNR / Booking Reference code.
 */
export function generatePNR(type = "hotel") {
  const prefix = type === "flight" ? "YS-FLT" : type === "train" ? "YS-RAIL" : "YS-HTL";
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomChars}${timestamp}`;
}

/**
 * Saves a completed booking to Supabase and localStorage.
 */
export async function saveBooking(bookingPayload) {
  const pnr = bookingPayload.pnr || generatePNR(bookingPayload.type);
  const enrichedBooking = {
    ...bookingPayload,
    pnr,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: new Date().toISOString(),
  };

  // 1. Always save to localStorage for offline access and fallback
  try {
    const existing = JSON.parse(localStorage.getItem("safar_user_bookings") || "[]");
    const updated = [enrichedBooking, ...existing];
    localStorage.setItem("safar_user_bookings", JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  // 2. Attempt to save in Supabase database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || localStorage.getItem("safar_user_id") || "guest_user";

    const supabaseRecord = {
      user_id: userId,
      pnr: enrichedBooking.pnr,
      booking_type: enrichedBooking.type || "hotel",
      item_name: enrichedBooking.itemName || enrichedBooking.hotelName || enrichedBooking.flightName || "Travel Booking",
      destination: enrichedBooking.destination || "India",
      traveler_name: enrichedBooking.travelerName || enrichedBooking.guestName || "Guest Yatri",
      traveler_email: enrichedBooking.travelerEmail || user?.email || "",
      traveler_phone: enrichedBooking.travelerPhone || "",
      amount: Number(enrichedBooking.totalAmount || enrichedBooking.amount) || 0,
      currency: "INR",
      payment_id: enrichedBooking.paymentId || `ch_test_${Date.now()}`,
      status: "CONFIRMED",
      booking_details: enrichedBooking,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert([supabaseRecord])
      .select();

    if (error) {
      console.warn("Supabase database insert note (stored locally):", error.message);
    } else {
      console.log("✅ Booking successfully saved to Supabase:", data);
    }
  } catch (err) {
    console.warn("Supabase booking persistence note:", err.message);
  }

  return enrichedBooking;
}

/**
 * Retrieves all bookings for the current user from Supabase and localStorage.
 */
export async function getUserBookings() {
  const localBookings = JSON.parse(localStorage.getItem("safar_user_bookings") || "[]");

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const combined = [...data.map(d => d.booking_details || d), ...localBookings];
        const unique = Array.from(new Map(combined.map(b => [b.pnr, b])).values());
        return unique;
      }
    }
  } catch (e) {
    console.warn("Could not fetch from Supabase:", e.message);
  }

  return localBookings;
}
