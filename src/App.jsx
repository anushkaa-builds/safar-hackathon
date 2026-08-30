import { useState } from "react";
import { savePreferences, getPreferences } from "./services/preferences";

function App() {
  const [status, setStatus] = useState("");

  async function handleTestSave() {
    setStatus("Saving...");

    const testData = {
      name: "Billu",
      age: 20,
      gender: "female",
      city: "Delhi",
      interests: ["mountains", "food"],
      holidays: 5,
      budget: 20000,
      departDate: "2026-10-15",
      travelType: "solo",
      groupSize: 1
    };

    const success = await savePreferences("testUser1", testData);

    if (success) {
      setStatus("Saved! Fetching it back...");
      const fetched = await getPreferences("testUser1");
      console.log("Fetched data:", fetched);
      setStatus("Done! Check the browser console (F12) for fetched data.");
    } else {
      setStatus("Save failed. Check console for error.");
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Firebase Test</h1>
      <button onClick={handleTestSave} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Save Test Data to Firestore
      </button>
      <p>{status}</p>
    </div>
  );
}

export default App;
