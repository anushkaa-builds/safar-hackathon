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