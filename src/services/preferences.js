import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function savePreferences(userId, data) {
  try {
    await setDoc(doc(db, "users", userId), {
      name: data.name,
      age: data.age,
      gender: data.gender,
      city: data.city,
      interests: data.interests,       // array, e.g. ["mountains", "food"]
      holidays: data.holidays,         // number of days
      budget: data.budget,             // number
      departDate: data.departDate,     // string, e.g. "2026-10-15"
      travelType: data.travelType,     // "solo" or "group"
      groupSize: data.groupSize        // number of people (1 if solo)
    });
    console.log("Preferences saved!");
    return true;
  } catch (error) {
    console.error("Error saving preferences:", error);
    return false;
  }
}

export async function getPreferences(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No preferences found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return null;
  }
}