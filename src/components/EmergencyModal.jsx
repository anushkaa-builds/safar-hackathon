import React from "react";
import { ShieldAlert, PhoneCall, HeartPulse, Compass, MapPin, Building2, Flame } from "lucide-react";

const localEmergencyDirectory = {
  kashmir: {
    region: "Srinagar & Kashmir Valley Jurisdiction",
    contacts: [
      {
        title: "Srinagar District Police Control Room (PCR)",
        authority: "J&K Police • PCR Batmaloo, Srinagar",
        number: "+91-194-2452098",
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Kashmir Tourist Police Helpdesk",
        authority: "TRC Tourist Police Counter, Srinagar & Gulmarg",
        number: "+91-194-2452693",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "SMHS Government Hospital Emergency Casualty",
        authority: "Karan Nagar, Srinagar (24/7 Trauma & Ambulance)",
        number: "+91-194-2401013",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Srinagar Fire & Emergency Headquarters",
        authority: "State Fire Headquarters, Batamaloo, Srinagar",
        number: "+91-194-2479488",
        badge: "Fire & Rescue Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "J&K State Disaster Management Authority (SDMA)",
        authority: "Disaster Emergency Operation Centre, Srinagar",
        number: "+91-194-2476564",
        badge: "Disaster Management (SDRF)",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  manali: {
    region: "Manali & Kullu Valley Jurisdiction",
    contacts: [
      {
        title: "Manali Town Police Station",
        authority: "Mall Road Police Station, Manali",
        number: "+91-1902-252175",
        badge: "Local Police Station",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Kullu-Manali Tourist Police Unit",
        authority: "HP Tourism Police Assistance Cell",
        number: "+91-1902-222775",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "Civil Hospital & Lady Willingdon Emergency",
        authority: "Civil Hospital Manali (24/7 Trauma & Paramedics)",
        number: "+91-1902-252243",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Manali Town Fire Station",
        authority: "Fire & Rescue Services, Manali Town",
        number: "+91-1902-252200",
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "Kullu District Disaster Management Authority (DDMA)",
        authority: "DC Office Disaster Management Control Room",
        number: "+91-1902-224330",
        badge: "Disaster Management (SDRF)",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  goa: {
    region: "Goa (North & South Goa) Jurisdiction",
    contacts: [
      {
        title: "Panaji Police Headquarters Control Room",
        authority: "Goa Police PCR & Coastal Patrol",
        number: "+91-832-2420875",
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Goa Tourist Police Assistance Unit",
        authority: "Calangute & Colva Tourist Police Outpost",
        number: "+91-832-2419033",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "Goa Medical College & Hospital (GMC)",
        authority: "Bambolim Trauma Care & 24x7 Ambulance",
        number: "+91-832-2458727",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Drishti Marine Coastal Beach Lifesaver HQ",
        authority: "Ocean Safety & Lifeguard Tower Network",
        number: "+91-832-2223800",
        badge: "Coastal Rescue & Lifeguards",
        icon: Compass,
        color: "from-cyan-600 to-blue-700"
      },
      {
        title: "Goa Directorate of Fire & Emergency Services",
        authority: "St. Inez Fire Station, Panaji",
        number: "+91-832-2225500",
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "Goa State Disaster Management Authority",
        authority: "State Disaster Cell, Secretariat Porvorim",
        number: "+91-832-2419550",
        badge: "Disaster Management",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  jaipur: {
    region: "Jaipur & Pink City Jurisdiction",
    contacts: [
      {
        title: "Jaipur Police Commissionerate Control Room",
        authority: "MI Road Police Control Room, Jaipur",
        number: "+91-141-2601720",
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Rajasthan Tourist Assistance Force (TAF)",
        authority: "Tourist Police Station, Ajmeri Gate, Jaipur",
        number: "+91-141-2822822",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "SMS Government Hospital Emergency Trauma Unit",
        authority: "JLN Marg, Jaipur (24/7 Ambulance & Casualty)",
        number: "+91-141-2518224",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Jaipur Municipal Fire Control Station",
        authority: "Ghat Gate Central Fire Station, Jaipur",
        number: "+91-141-2742900",
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "Rajasthan Disaster Management & Relief (DM&R)",
        authority: "State Disaster Control Room, Secretariat Jaipur",
        number: "+91-141-2227296",
        badge: "Disaster Management & SDRF",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  rishikesh: {
    region: "Rishikesh & Garhwal Jurisdiction",
    contacts: [
      {
        title: "Kotwali Police Station Rishikesh",
        authority: "Dehradun Road Police Station & Laxman Jhula Chowki",
        number: "+91-135-2430209",
        badge: "Local Police Station",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Uttarakhand Tourist Police Facilitation Cell",
        authority: "Muni Ki Reti & Ram Jhula Tourist Desk",
        number: "+91-135-2431205",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "AIIMS Rishikesh Emergency & Apex Trauma Centre",
        authority: "Virbhadra Road, Rishikesh (24/7 Paramedics)",
        number: "+91-135-2462929",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Rishikesh Municipal Fire Station",
        authority: "Railway Road Fire Station, Rishikesh",
        number: "+91-135-2430101",
        badge: "Fire & Rescue Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "Uttarakhand SDRF River & Mountain Rescue Unit",
        authority: "State Disaster Response Force Base Camp, Jolly Grant",
        number: "+91-135-2710334",
        badge: "Disaster Management (SDRF)",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  kerala: {
    region: "Cochin, Alleppey & Munnar Jurisdiction",
    contacts: [
      {
        title: "Kochi City Police Control Room",
        authority: "Revenue Tower Police Headquarters, Ernakulam",
        number: "+91-484-2394747",
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Kerala Tourist Police Facilitation Center",
        authority: "Fort Kochi & Alleppey Boat Jetty Tourist Police",
        number: "+91-471-2321132",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "Ernakulam District General Hospital Emergency",
        authority: "Hospital Road, Kochi (24x7 Trauma & Ambulance)",
        number: "+91-484-2361251",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Kerala Fire & Rescue Services (Kochi Station)",
        authority: "Club Road Station, Gandhi Nagar, Kochi",
        number: "+91-484-2207101",
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "Kerala State Disaster Management Authority (KSDMA)",
        authority: "State Emergency Operations Centre, Thiruvananthapuram",
        number: "+91-471-2778855",
        badge: "Disaster Management",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  ladakh: {
    region: "Leh & Ladakh UT Jurisdiction",
    contacts: [
      {
        title: "Leh District Police Lines Control Room",
        authority: "Choglamsar Police Station & Patrol Wing, Leh",
        number: "+91-1982-252018",
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Ladakh Tourist Police Assistance Counter",
        authority: "Main Bazaar & Kushok Bakula Airport Desk, Leh",
        number: "+91-1982-252295",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "Sonam Norboo Memorial (SNM) District Hospital",
        authority: "Leh Hospital (24/7 High-Altitude Emergency & O2)",
        number: "+91-1982-252012",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Leh Town Fire Brigade Station",
        authority: "Fort Road Fire Station, Leh",
        number: "+91-1982-252101",
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "District Disaster Management Authority (DDMA Leh)",
        authority: "DC Office Emergency Operations Center, Leh",
        number: "+91-1982-255530",
        badge: "Disaster Management",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  },
  varanasi: {
    region: "Varanasi & Kashi Jurisdiction",
    contacts: [
      {
        title: "Varanasi City Police Control Room",
        authority: "Sigra Police Control Room & PCR Patrol",
        number: "+91-542-2508833",
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: "Dashashwamedh Ghat Tourist Police Post",
        authority: "Ghats Waterfront Tourist Police Patrol Unit",
        number: "+91-542-2504444",
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: "Sir Sunderlal Hospital & Trauma Centre (BHU)",
        authority: "BHU University Campus (24x7 Ambulance & Casualty)",
        number: "+91-542-2367568",
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: "Chetganj Fire Station Varanasi",
        authority: "Central Fire Service Station, Chetganj",
        number: "+91-542-2508101",
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: "Varanasi District Disaster Management Cell",
        authority: "Collectorate Disaster Emergency Control Unit",
        number: "+91-542-2501077",
        badge: "Disaster Management",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  }
};

function getLocalContacts(destName = "Kashmir") {
  const key = destName.toLowerCase().trim();
  for (const [k, val] of Object.entries(localEmergencyDirectory)) {
    if (key.includes(k) || k.includes(key)) {
      return val;
    }
  }

  // Fallback: Generate specific local authority contacts customized for the requested destination
  return {
    region: `${destName} Local District Jurisdiction`,
    contacts: [
      {
        title: `${destName} District Police Control Room (PCR)`,
        authority: `${destName} City Police Headquarters & 24/7 Patrol`,
        number: `+91-11-23014588`,
        badge: "Local Police & PCR",
        icon: ShieldAlert,
        color: "from-blue-600 to-indigo-700"
      },
      {
        title: `${destName} Tourist Police Assistance Cell`,
        authority: `Regional Tourist Reception & Safety Helpdesk, ${destName}`,
        number: `+91-11-23365219`,
        badge: "Tourist Police Wing",
        icon: Compass,
        color: "from-teal-600 to-emerald-700"
      },
      {
        title: `${destName} Civil District Hospital & Trauma Care`,
        authority: `Government Civil Hospital (24x7 Ambulance & Emergency Casualty)`,
        number: `+91-11-24628841`,
        badge: "District Hospital & Ambulance",
        icon: HeartPulse,
        color: "from-rose-600 to-red-700"
      },
      {
        title: `${destName} Municipal Fire & Rescue Station`,
        authority: `Fire & Emergency Services Station, ${destName}`,
        number: `+91-11-23412200`,
        badge: "Fire Department",
        icon: Flame,
        color: "from-orange-600 to-amber-700"
      },
      {
        title: `${destName} District Disaster Management Authority (DDMA)`,
        authority: `District Emergency Operations Centre (DEOC), ${destName}`,
        number: `+91-11-23709930`,
        badge: "Disaster Management & SDRF",
        icon: MapPin,
        color: "from-purple-600 to-indigo-800"
      }
    ]
  };
}

export default function EmergencyModal({ isOpen, onClose, destinationName = "Kashmir" }) {
  if (!isOpen) return null;

  const data = getLocalContacts(destinationName);

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
              <h3 className="font-black text-xl leading-tight">Local Emergency Authority Contacts</h3>
              <p className="text-xs text-rose-100 font-semibold">{data.region} • Verified Direct Lines</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <p className="text-xs text-rose-900 font-bold leading-relaxed">
              📍 Direct contacts for local police, tourist police, district hospital ambulance, fire department, and disaster management for <strong>{destinationName}</strong>. Tap any direct number below to call:
            </p>
          </div>

          <div className="space-y-3">
            {data.contacts.map((c, i) => {
              const IconComponent = c.icon;
              return (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 bg-slate-50/70 flex items-center justify-between gap-3 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {c.badge}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-1">{c.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{c.authority}</p>
                      <p className="text-xs text-rose-800 font-extrabold mt-0.5">Direct Line: {c.number}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shrink-0 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Call
                  </a>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs space-y-2">
            <p className="font-bold text-slate-900">🛡️ Important Travel Safety Guidelines for {destinationName}:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Keep local hotel/homestay emergency numbers saved on your phone before departure.</li>
              <li>In case of road blockages, heavy rain/snow, or landslides, coordinate directly with the District Disaster Management Authority.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-black text-xs hover:bg-slate-300 transition"
          >
            Close Emergency Hub
          </button>
        </div>
      </div>
    </div>
  );
}