import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function savePreferences(userId, data) {
  try {
    localStorage.setItem("safar_preferences_" + userId, JSON.stringify(data));
    localStorage.setItem("safar_latest_preferences", JSON.stringify(data));
  } catch (e) {
    console.warn("LocalStorage save warning:", e);
  }

  try {
    await setDoc(doc(db, "users", userId), {
      name: data.name,
      age: data.age,
      gender: data.gender,
      city: data.city,
      destination: data.destination,
      interests: data.interests || [],
      holidays: data.holidays || 3,
      budget: data.budget || 500,
      departDate: data.departDate || "",
      departTime: data.departTime || "08:00 AM",
      medicalIssues: data.medicalIssues || [],
      customMedicalInfo: data.customMedicalInfo || "",
      travelType: data.travelType || "solo",
      groupSize: data.groupSize || 1,
      selectedTravel: data.selectedTravel || null,
      selectedStay: data.selectedStay || null,
      updatedAt: new Date().toISOString()
    });
    console.log("Preferences successfully saved to Cloud Firestore!");
    return true;
  } catch (error) {
    console.warn("Firestore save fallback to local:", error);
    return true;
  }
}

export async function saveItinerary(userId, itinerary) {
  try {
    localStorage.setItem("safar_itinerary_" + userId, JSON.stringify(itinerary));
    localStorage.setItem("safar_latest_itinerary", JSON.stringify(itinerary));
  } catch (e) {
    console.warn("LocalStorage saveItinerary error:", e);
  }

  try {
    const docRef = doc(db, "itineraries", userId);
    await setDoc(docRef, {
      ...itinerary,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore saveItinerary fallback to local:", error);
    return true;
  }
}

export async function getSavedItinerary(userId) {
  try {
    const docRef = doc(db, "itineraries", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Firestore getSavedItinerary error, checking local backup:", error);
  }

  try {
    const local = localStorage.getItem("safar_itinerary_" + userId) || localStorage.getItem("safar_latest_itinerary");
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error("Local fallback parse error for itinerary:", e);
  }
  return null;
}

export async function getPreferences(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Firestore read error, checking local backup:", error);
  }

  try {
    const local = localStorage.getItem("safar_preferences_" + userId) || localStorage.getItem("safar_latest_preferences");
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error("Local fallback parse error:", e);
  }
  return null;
}

export async function clearSavedItinerary(userId) {
  try {
    localStorage.removeItem("safar_itinerary_" + userId);
    localStorage.removeItem("safar_latest_itinerary");
  } catch (e) {
    console.warn("LocalStorage clear error:", e);
  }
}