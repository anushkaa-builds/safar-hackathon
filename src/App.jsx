import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const guest = localStorage.getItem("safar_guest_user");
        const loggedOut = localStorage.getItem("safar_logged_out");
        if (guest) {
          try {
            setUser(JSON.parse(guest));
          } catch (e) {
            setUser(null);
          }
        } else if (!loggedOut) {
          const demoGuest = {
            id: "guest_demo",
            email: "guest.yatri@safar.in",
            user_metadata: { name: "Guest Yatri" }
          };
          localStorage.setItem("safar_guest_user", JSON.stringify(demoGuest));
          setUser(demoGuest);
        }
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.removeItem("safar_logged_out");
        setUser(session.user);
      }
    });

    return () => {
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("safar_guest_user");
    localStorage.setItem("safar_logged_out", "true");
    setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 animate-spin flex items-center justify-center font-black text-2xl">
          🧭
        </div>
        <p className="text-sm font-bold text-slate-400">Loading YatriSathi...</p>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={setUser} />
  );
}

export default App;
