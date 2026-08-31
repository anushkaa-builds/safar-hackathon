export const destinationsData = [
  {
    id: "kashmir",
    name: "Kashmir",
    state: "Jammu & Kashmir",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80",
    tagline: "Paradise on Earth • Dal Lake & Gulmarg",
    category: "Mountains",
    altitude: 1600,
    altitudeUnit: "1,600m - 2,700m (Gulmarg/Sonamarg)",
    safetyRisk: {
      level: "Moderate",
      riskType: "High Altitude & Winter Snow Blockages",
      amsRisk: "Low in Srinagar, Moderate at Gulmarg Phase 2",
      advisory: "Carry thermals. Acclimatize before Gondola Phase 2. Verify road clearance during heavy snow.",
      helpline: "+91-194-2452693 (J&K Tourism), 112 (Emergency), 1363 (Tourist Police)"
    },
    transport: {
      nearestAirport: "Sheikh ul-Alam Int'l Airport (SXR), Srinagar",
      nearestRailway: "Jammu Tawi (JAT) / Udhampur (USBRL connection)",
      busConnectivity: "J&K RTC Volvo & Deluxe buses from Jammu/Delhi",
      localTransit: "Shikara, Shared Sumo/Innova cabs, Pre-paid tourist taxis (₹2,200 - ₹3,500/day)"
    },
    stays: [
      { type: "Budget / Homestay", name: "Dal Lake Heritage Homestay", price: "₹1,200 - ₹2,000/night", rating: 4.6 },
      { type: "Mid-Range Boutique", name: "Pine & Peak Hotel Pahalgam", price: "₹3,800 - ₹6,500/night", rating: 4.8 },
      { type: "Luxury / Heritage", name: "The Lalit Grand Palace Srinagar", price: "₹12,000+/night", rating: 4.9 }
    ],
    attractions: [
      {
        id: "dal-lake",
        name: "Dal Lake & Shikara Ride",
        timeSlot: "Morning (07:00 AM - 10:00 AM)",
        duration: "2-3 hours",
        cost: "₹700 - ₹1,000 per Shikara",
        crowdLevel: "High",
        crowdScore: 88,
        tags: ["Lakes", "Culture", "Photography"],
        description: "Glide through floating vegetable markets and historic wooden houseboats with Himalayan reflections.",
        offbeatAlternative: {
          name: "Nigeen Lake & Doodhpathri",
          tagline: "Pristine, peaceful waters & lush alpine meadows with 75% fewer crowds",
          benefit: "Zero motor noise, untouched cedar forests, authentic Gujjar tea stalls.",
          distance: "22 km from city center",
          crowdScore: 22
        }
      },
      {
        id: "gulmarg-gondola",
        name: "Gulmarg Gondola & Snow Meadows",
        timeSlot: "Afternoon (11:00 AM - 03:30 PM)",
        duration: "4-5 hours",
        cost: "₹1,050 (Phase 1) / ₹2,000 (Phase 2)",
        crowdLevel: "Severe",
        crowdScore: 94,
        tags: ["Snow", "Adventure", "High Altitude"],
        description: "World's highest cable car taking you to Mount Aphrawat (3,980m) for skiing and panoramic peaks.",
        offbeatAlternative: {
          name: "Doodhpathri (Valley of Milk)",
          tagline: "Breathtaking rolling green meadows with gushing Shaliganga river",
          benefit: "Fresh mountain stream, pony treks with regulated local pricing, serene landscapes.",
          distance: "42 km from Srinagar",
          crowdScore: 30
        }
      },
      {
        id: "mughal-gardens",
        name: "Nishat & Shalimar Mughal Gardens",
        timeSlot: "Evening (04:30 PM - 06:30 PM)",
        duration: "2 hours",
        cost: "₹50 per adult",
        crowdLevel: "Moderate",
        crowdScore: 65,
        tags: ["Heritage", "Botanical", "History"],
        description: "Terraced Persian-style gardens built by Emperor Jahangir with cascading water fountains.",
        offbeatAlternative: {
          name: "Pari Mahal & Botanical Garden Walk",
          tagline: "Seven-terraced fairy palace overlooking Dal Lake at sunset",
          benefit: "Spectacular panoramic sunset views with quiet architectural ruins.",
          distance: "4 km from Nishat",
          crowdScore: 35
        }
      }
    ]
  },
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    tagline: "Snow-capped peaks & Solang Valley",
    category: "Mountains",
    altitude: 2050,
    altitudeUnit: "2,050m (Town) - 3,978m (Rohtang Pass)",
    safetyRisk: {
      level: "Moderate",
      riskType: "Landslide in Monsoons / Heavy Snow Roadblocks",
      amsRisk: "Moderate at Rohtang Pass / Atal Tunnel north portal",
      advisory: "Check Atal Tunnel clearance status. Pre-book Rohtang Pass NGT permits. Carry motion sickness medicine for ghats.",
      helpline: "+91-1902-252175 (Manali Police), 112 (State Emergency), 1077 (Disaster Helpline)"
    },
    transport: {
      nearestAirport: "Kullu-Manali Airport, Bhuntar (50 km)",
      nearestRailway: "Chandigarh Junction (310 km) / Amb Andaura (Vande Bharat)",
      busConnectivity: "HRTC Himsuta Volvo from Delhi ISBT Kashmere Gate & Chandigarh",
      localTransit: "Local Alto/Innova taxis (Union fixed tariff), Royal Enfield bike rentals (₹1,000 - ₹1,800/day)"
    },
    stays: [
      { type: "Budget / Hostel", name: "Zostel Manali / Old Manali Homestay", price: "₹800 - ₹1,800/night", rating: 4.7 },
      { type: "Mid-Range Boutique", name: "Apple Country Resort & Spa", price: "₹3,500 - ₹5,800/night", rating: 4.6 },
      { type: "Luxury / Heritage", name: "The Himalayan Castle Resort", price: "₹9,500+/night", rating: 4.9 }
    ],
    attractions: [
      {
        id: "solang-valley",
        name: "Solang Valley Adventure Arena",
        timeSlot: "Morning (09:00 AM - 01:00 PM)",
        duration: "3-4 hours",
        cost: "₹1,500 - ₹3,000 (Paragliding/Zorbing)",
        crowdLevel: "Severe",
        crowdScore: 92,
        tags: ["Adventure", "Snow", "Paragliding"],
        description: "High-adrenaline valley famous for paragliding, ATV rides, zorbing, and ropeway.",
        offbeatAlternative: {
          name: "Sethan Valley (Hampta Foothills / Igloo Village)",
          tagline: "Quiet Buddhist village with boulder climbing, deep snow & igloos",
          benefit: "Zero commercial clutter, incredible view of Dhauladhar ranges, untouched snow.",
          distance: "14 km off Manali (4x4 required)",
          crowdScore: 25
        }
      },
      {
        id: "mall-road-hidimba",
        name: "Hadimba Temple & Old Manali Trail",
        timeSlot: "Afternoon (02:00 PM - 05:30 PM)",
        duration: "3 hours",
        cost: "Free (Temple) / ₹400 for Cafe snacks",
        crowdLevel: "High",
        crowdScore: 82,
        tags: ["Culture", "Food", "Heritage"],
        description: "16th-century wooden pagoda temple amidst towering cedar forests followed by bohemian cafes.",
        offbeatAlternative: {
          name: "Naggar Castle & Roerich Art Gallery",
          tagline: "Medieval wooden heritage castle overlooking Beas river with Russian art museum",
          benefit: "Peaceful Himalayan architecture, rooftop apple cider, ancient wood carvings.",
          distance: "21 km from Manali",
          crowdScore: 32
        }
      },
      {
        id: "jogini-waterfall",
        name: "Jogini Waterfall Trek",
        timeSlot: "Morning (07:30 AM - 10:30 AM)",
        duration: "2-3 hours",
        cost: "Free",
        crowdLevel: "Moderate",
        crowdScore: 60,
        tags: ["Trekking", "Nature", "Waterfalls"],
        description: "Scenic pine trail from Vashisht village leading to a multi-tiered cascading waterfall.",
        offbeatAlternative: {
          name: "Sajla Waterfall & Local Apple Orchards",
          tagline: "Secluded forest fall with wooden suspension bridge and Vishnu temple",
          benefit: "Clean natural rock pool, local Pahadi chai & pakora stalls with no tourist rush.",
          distance: "10 km towards Naggar",
          crowdScore: 20
        }
      }
    ]
  },
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    tagline: "Beaches & vibrant nightlife",
    category: "Beach",
    altitude: 10,
    altitudeUnit: "Sea Level (0m - 50m)",
    safetyRisk: {
      level: "Low",
      riskType: "Monsoon Rip Currents & Water Sports Closures",
      amsRisk: "None",
      advisory: "Swim only in designated lifeguard zones (Drishti Marine flags). Avoid two-wheelers during heavy rain.",
      helpline: "+91-832-2419033 (Goa Tourism), 112 (Police), 108 (Ambulance), 0832-2223800 (Drishti Lifesavers)"
    },
    transport: {
      nearestAirport: "Manohar Int'l Airport Mopa (GOX) / Dabolim (GOI)",
      nearestRailway: "Madgaon Junction (MAO) / Thivim (THVM) - Vande Bharat available",
      busConnectivity: "KSRTC / Kadamba luxury sleeper buses from Mumbai/Pune/Bangalore",
      localTransit: "Self-drive scooters (₹400 - ₹700/day) or self-drive Thar/cars (₹1,500 - ₹3,500/day), GoaMiles app cabs"
    },
    stays: [
      { type: "Budget / Hostel", name: "The Lost Hostel / Anjuna Backpackers", price: "₹600 - ₹1,400/night", rating: 4.7 },
      { type: "Mid-Range Boutique", name: "Fontainhas Heritage Inn, Panaji", price: "₹3,200 - ₹5,500/night", rating: 4.8 },
      { type: "Luxury / Beachfront", name: "Taj Exotica Resort & Spa Benaulim", price: "₹14,000+/night", rating: 4.9 }
    ],
    attractions: [
      {
        id: "baga-calangute",
        name: "Baga Beach Watersports & Shacks",
        timeSlot: "Morning (09:30 AM - 01:30 PM)",
        duration: "4 hours",
        cost: "₹1,200 - ₹2,500 (Jet Ski/Parasailing combo)",
        crowdLevel: "Severe",
        crowdScore: 96,
        tags: ["Beach", "Watersports", "Parties"],
        description: "Bustling North Goa coastline packed with music shacks, jet skis, banana rides, and parasailing.",
        offbeatAlternative: {
          name: "Butterfly Beach & Galgibaga (Turtle Beach)",
          tagline: "Semi-circular secluded cove accessible by short trek or boat with wild dolphins",
          benefit: "Crystal turquoise water, zero commercial loud speakers, Olive Ridley turtle nesting zone.",
          distance: "South Goa (Palolem side)",
          crowdScore: 24
        }
      },
      {
        id: "aguada-fort",
        name: "Fort Aguada & Light House",
        timeSlot: "Afternoon (03:30 PM - 05:30 PM)",
        duration: "2 hours",
        cost: "₹25 entry fee",
        crowdLevel: "High",
        crowdScore: 84,
        tags: ["Heritage", "Portuguese", "Ocean View"],
        description: "17th-century Portuguese fortress overlooking the Mandovi River and Arabian Sea.",
        offbeatAlternative: {
          name: "Cabo de Rama Fort & Cliff Viewpoint",
          tagline: "Dramatic ancient sea fort cliff with wild panoramic ocean vista",
          benefit: "Spectacular ocean sunset cliff with historical chapel ruins and minimal footfall.",
          distance: "South Goa (28 km from Margao)",
          crowdScore: 30
        }
      },
      {
        id: "fontainhas-walk",
        name: "Fontainhas Latin Quarter Walking Tour",
        timeSlot: "Evening (05:30 PM - 08:00 PM)",
        duration: "2.5 hours",
        cost: "Free (Guided tours ₹400)",
        crowdLevel: "Moderate",
        crowdScore: 68,
        tags: ["Architecture", "Heritage", "Photography"],
        description: "Vibrant colonial streets painted in pastel yellows and blues with authentic Portuguese bakeries.",
        offbeatAlternative: {
          name: "Divar Island & Chorao Mangrove Boat Cruise",
          tagline: "Idyllic river island with vintage Portuguese villas & Salim Ali Bird Sanctuary",
          benefit: "Ferry ride across Mandovi river, tranquil winding village roads, rare kingfishers & otters.",
          distance: "Short ferry from Ribandar",
          crowdScore: 18
        }
      }
    ]
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    tagline: "Amber Fort & Pink City heritage",
    category: "Heritage",
    altitude: 431,
    altitudeUnit: "431m (Plains/Aravalli Foothills)",
    safetyRisk: {
      level: "Low",
      riskType: "Summer Heatwaves (May-June >44°C)",
      amsRisk: "None",
      advisory: "Drink electrolyte water during daytime sightseeing. Wear breathable cottons and sun protection.",
      helpline: "+91-141-2822822 (Rajasthan Tourism), 112 (Police), 108 (Ambulance), 0141-2601720 (Tourist Assistance)"
    },
    transport: {
      nearestAirport: "Jaipur International Airport (JAI), Sanganer",
      nearestRailway: "Jaipur Junction (JP) - multiple Vande Bharat & Shatabdi trains from Delhi",
      busConnectivity: "RSRTC Goldline / Scania Super Express every 30 mins from Delhi Bikaner House",
      localTransit: "Jaipur Metro, Uber/Ola, Pre-paid E-rickshaws (₹30 - ₹100), Full-day AC tourist cab (₹1,800 - ₹2,500)"
    },
    stays: [
      { type: "Budget / Heritage Haveli", name: "Khatu Haveli / Gypsy Backpackers", price: "₹900 - ₹1,800/night", rating: 4.7 },
      { type: "Mid-Range Boutique", name: "Shahpura House / Alsisar Haveli", price: "₹3,800 - ₹6,500/night", rating: 4.8 },
      { type: "Luxury / Royal Palace", name: "Rambagh Palace / Jai Mahal Palace", price: "₹18,000+/night", rating: 4.95 }
    ],
    attractions: [
      {
        id: "amber-fort",
        name: "Amber Fort & Sheesh Mahal",
        timeSlot: "Morning (08:30 AM - 12:30 PM)",
        duration: "3-4 hours",
        cost: "₹100 (Indians) / ₹500 (Foreigners)",
        crowdLevel: "Severe",
        crowdScore: 95,
        tags: ["Heritage", "Architecture", "Palace"],
        description: "Opulent hilltop fort with intricate mirror mosaic work (Sheesh Mahal) and Maota Lake views.",
        offbeatAlternative: {
          name: "Nahargarh Stepwell (Baori) & Jaigarh Cannon Foundry",
          tagline: "Magnificent symmetrical architectural stepwell featured in Rang De Basanti",
          benefit: "Peaceful cliffside breezy views of the entire Pink City basin with massive underground water channels.",
          distance: "6 km from Amber",
          crowdScore: 35
        }
      },
      {
        id: "hawa-mahal-city-palace",
        name: "Hawa Mahal & City Palace Museum",
        timeSlot: "Afternoon (02:00 PM - 05:00 PM)",
        duration: "3 hours",
        cost: "₹50 (Hawa Mahal) + ₹300 (City Palace)",
        crowdLevel: "High",
        crowdScore: 89,
        tags: ["Royalty", "History", "Photography"],
        description: "953-window honeycomb pink sandstone facade designed for royal ladies to view city processions.",
        offbeatAlternative: {
          name: "Gatore Ki Chhatriyan & Royal Cenotaphs",
          tagline: "Serene white marble and sandstone cenotaphs nestled in a quiet valley",
          benefit: "Mesmerizing carved marble domes, peaceful peacocks, and zero tour-bus congestion.",
          distance: "4 km from Hawa Mahal",
          crowdScore: 20
        }
      },
      {
        id: "chokhi-dhani",
        name: "Chokhi Dhani Ethnic Cultural Village",
        timeSlot: "Evening (06:30 PM - 10:30 PM)",
        duration: "4 hours",
        cost: "₹900 - ₹1,400 (Includes Royal Thali buffet)",
        crowdLevel: "High",
        crowdScore: 85,
        tags: ["Culture", "Rajasthani Thali", "Folk Dance"],
        description: "Immersive Rajasthani village fair with Kalbeliya dancers, acrobatics, camel rides, and traditional dining.",
        offbeatAlternative: {
          name: "Bagru Block Printing Artisan Village & Rooftop Sitar Dinner",
          tagline: "Hands-on natural dye block printing with 300-year-old Chippa community families",
          benefit: "Direct artisan workshop experience, authentic home-cooked Bajra roti and Gatte ki sabzi.",
          distance: "28 km on Ajmer Road",
          crowdScore: 15
        }
      }
    ]
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    image: "https://images.unsplash.com/photo-1591019479261-4d1e5e3f8c40?auto=format&fit=crop&w=1200&q=80",
    tagline: "Ganga Aarti & river rafting",
    category: "Adventure & Spiritual",
    altitude: 372,
    altitudeUnit: "372m - 1,000m (Foothills)",
    safetyRisk: {
      level: "Moderate",
      riskType: "Monsoon Flash Flood in Ganga & River Currents",
      amsRisk: "None",
      advisory: "River rafting is closed July 1 to Sep 15 (Monsoon). Always wear ISO-certified life jackets. Strictly avoid swimming in unauthorized ghat currents.",
      helpline: "+91-135-2430209 (Rishikesh Police), 112 (Emergency), 1070 (State Disaster Response)"
    },
    transport: {
      nearestAirport: "Jolly Grant Airport, Dehradun (DED - 21 km)",
      nearestRailway: "Yog Nagari Rishikesh (YNRK) / Haridwar Junction (25 km)",
      busConnectivity: "UTC Volvo & AC sleeper buses from ISBT Delhi (5-6 hours)",
      localTransit: "Vikram shared autos, rented Scooty (₹400 - ₹600/day), local cabs"
    },
    stays: [
      { type: "Budget / Ashram / Hostel", name: "Zostel Rishikesh / Parmarth Niketan Ashram", price: "₹600 - ₹1,500/night", rating: 4.8 },
      { type: "Mid-Range Boutique", name: "Aloha On The Ganges / Ganga Kinare", price: "₹4,200 - ₹7,500/night", rating: 4.7 },
      { type: "Luxury / Wellness", name: "Ananda in the Himalayas / Taj Rishikesh", price: "₹22,000+/night", rating: 4.95 }
    ],
    attractions: [
      {
        id: "ganga-rafting",
        name: "Shivpuri to Rishikesh White Water Rafting",
        timeSlot: "Morning (08:30 AM - 12:30 PM)",
        duration: "3-4 hours",
        cost: "₹800 - ₹1,500 (16 km / 24 km stretch)",
        crowdLevel: "Severe",
        crowdScore: 91,
        tags: ["Rafting", "Adventure", "River"],
        description: "Thrilling Grade III+ rapids including Roller Coaster, Golf Course, and Club House on emerald Ganga waters.",
        offbeatAlternative: {
          name: "Vashistha Cave (Gufa) Meditation & River Bank",
          tagline: "Ancient Himalayan meditation cave inside a quiet banyan forest on the Ganga",
          benefit: "Deep meditative silence, serene white sand beach with gentle, clear river flow.",
          distance: "22 km upstream from Laxman Jhula",
          crowdScore: 20
        }
      },
      {
        id: "triveni-aarti",
        name: "Triveni Ghat Evening Maha Aarti",
        timeSlot: "Evening (05:45 PM - 07:30 PM)",
        duration: "2 hours",
        cost: "Free (Diyas ₹20 - ₹50)",
        crowdLevel: "High",
        crowdScore: 87,
        tags: ["Spiritual", "Culture", "Chanting"],
        description: "Enchanting twilight ritual of brass lamps, conch shells, Vedic mantras, and floating leaf lamps.",
        offbeatAlternative: {
          name: "Shatrughna Ghat & Ram Jhula Sunset Ghats",
          tagline: "Soulful, intimate Ganga Aarti with saintly acoustic bhajans",
          benefit: "Sit peacefully by the river steps without tourist pushing or loudspeaker distortion.",
          distance: "Near Ram Jhula",
          crowdScore: 35
        }
      },
      {
        id: "beatles-ashram",
        name: "The Beatles Ashram (Chaurasi Kutia)",
        timeSlot: "Afternoon (02:30 PM - 05:00 PM)",
        duration: "2.5 hours",
        cost: "₹150 (Indians) / ₹600 (Foreigners)",
        crowdLevel: "Moderate",
        crowdScore: 62,
        tags: ["Art", "Music History", "Graffiti"],
        description: "Famous ashram where The Beatles stayed in 1968, adorned with psychedelic murals and meditation stone domes.",
        offbeatAlternative: {
          name: "Kunjapuri Temple Sunrise / Sunset Trek",
          tagline: "360-degree panoramic view of snow-clad Himalayan peaks & Doon valley",
          benefit: "Unmatched sunrise over Swargarohini & Gangotri peaks with fresh mountain breeze.",
          distance: "26 km uphill",
          crowdScore: 28
        }
      }
    ]
  },
  {
    id: "kerala",
    name: "Kerala",
    state: "Kerala",
    image: "https://images.unsplash.com/photo-1602301413753-99e8b3d3d0f1?auto=format&fit=crop&w=1200&q=80",
    tagline: "Houseboats & lush greenery",
    category: "Nature & Eco-Tourism",
    altitude: 10,
    altitudeUnit: "0m (Alleppey) - 1,600m (Munnar)",
    safetyRisk: {
      level: "Moderate",
      riskType: "Monsoon Hill Landslides (Idukki) & River Spate",
      amsRisk: "None",
      advisory: "Monitor Kerala State Disaster Management Authority (KSDMA) color codes during monsoons (June-Aug).",
      helpline: "+91-471-2321132 (Kerala Tourism), 112 (Emergency), 1077 (District Disaster Control)"
    },
    transport: {
      nearestAirport: "Cochin International Airport (COK)",
      nearestRailway: "Alappuzha (ALLP) / Ernakulam Junction (ERS) - Vande Bharat available",
      busConnectivity: "KSRTC Swift Superfast & Scania buses linking Cochin, Alleppey, and Munnar",
      localTransit: "SWTD Government Water Taxis (₹15 - ₹40), Pre-paid auto-rickshaws, Tourist AC cabs"
    },
    stays: [
      { type: "Budget / Homestay", name: "Marari Village Beach Homestay", price: "₹1,100 - ₹2,200/night", rating: 4.8 },
      { type: "Mid-Range Boutique", name: "Premium Kettuvallam Houseboat (Alleppey)", price: "₹6,500 - ₹11,000/night (All meals)", rating: 4.7 },
      { type: "Luxury / Heritage", name: "Kumarakom Lake Resort / Spice Tree Munnar", price: "₹16,000+/night", rating: 4.9 }
    ],
    attractions: [
      {
        id: "alleppey-houseboat",
        name: "Alleppey Backwaters Cruise",
        timeSlot: "Morning to Afternoon (11:30 AM - 04:30 PM)",
        duration: "5 hours",
        cost: "₹5,000 - ₹9,000 per private boat",
        crowdLevel: "Severe",
        crowdScore: 93,
        tags: ["Backwaters", "Cuisine", "Cruises"],
        description: "Traditional thatched Kettuvallam cruise through coconut palm canals, paddy fields, and Karimeen fry lunch.",
        offbeatAlternative: {
          name: "Kumarakom Bird Sanctuary & Canoe in Narrow Canals",
          tagline: "Eco-friendly silent wooden canoe tour deep into narrow mangrove canals",
          benefit: "Access to tiny canals where big houseboats cannot enter, spotting Siberian cranes & kingfishers.",
          distance: "32 km from Alleppey",
          crowdScore: 25
        }
      },
      {
        id: "munnar-tea-estates",
        name: "Munnar Tea Museum & Kolukkumalai Sunrise",
        timeSlot: "Morning (06:00 AM - 11:00 AM)",
        duration: "4 hours",
        cost: "₹150 (Museum) + ₹2,000 (4x4 Jeep Safari)",
        crowdLevel: "High",
        crowdScore: 81,
        tags: ["Tea", "Mountains", "Sunrise", "Trek"],
        description: "Lush green emerald hills, factory tea-leaf processing demonstration, and high-altitude mist.",
        offbeatAlternative: {
          name: "Marayoor Sandalwood Forest & Chinnar Wildlife Sanctuary",
          tagline: "Natural sandalwood forest with ancient Stone Age dolmens & star tortoises",
          benefit: "Rain shadow valley with zero commercial mist traffic and authentic sugarcane jaggery farms.",
          distance: "40 km from Munnar",
          crowdScore: 22
        }
      }
    ]
  },
  {
    id: "ladakh",
    name: "Ladakh",
    state: "UT of Ladakh",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    tagline: "High Mountain Passes & Pangong Tso",
    category: "High Altitude & Adventure",
    altitude: 3500,
    altitudeUnit: "3,500m (Leh) - 5,359m (Khardung La)",
    safetyRisk: {
      level: "High",
      riskType: "Acute Mountain Sickness (AMS) & Extreme Cold",
      amsRisk: "HIGH - Mandatory 48-hour resting acclimatization required upon landing in Leh",
      advisory: "Do not plan Khardung La or Pangong on Day 1 or Day 2. Drink 4-5L water daily. Carry portable O2 can.",
      helpline: "+91-1982-252018 (Leh Police), +91-1982-252012 (SNM District Hospital Leh), 112 (Disaster Helpline)"
    },
    transport: {
      nearestAirport: "Kushok Bakula Rimpochee Airport (IXL), Leh",
      nearestRailway: "Jammu Tawi / Chandigarh (via Manali Highway)",
      busConnectivity: "HPTDC luxury semi-deluxe coach (2-day transit via Keylong)",
      localTransit: "Leh Taxi Union 4x4 Bolero/Innova cabs, Himalayan 450 bike rentals (₹1,500 - ₹2,500/day)"
    },
    stays: [
      { type: "Budget / Homestay", name: "Leh Old Town Heritage Homestay", price: "₹900 - ₹1,800/night", rating: 4.8 },
      { type: "Mid-Range Boutique", name: "Nubra Valley Eco Luxury Camp", price: "₹3,500 - ₹6,000/night", rating: 4.7 },
      { type: "Luxury / Stargazing", name: "The Grand Dragon Ladakh", price: "₹15,000+/night", rating: 4.9 }
    ],
    attractions: [
      {
        id: "pangong-tso",
        name: "Pangong Tso Blue Lake",
        timeSlot: "Full Day (07:00 AM - 05:00 PM)",
        duration: "8-10 hours trip",
        cost: "₹600 (Inner Line Permit fee)",
        crowdLevel: "Severe",
        crowdScore: 90,
        tags: ["Lakes", "High Altitude", "Photography"],
        description: "134 km long world-famous endorheic lake changing shades from turquoise to deep indigo.",
        offbeatAlternative: {
          name: "Hanle Dark Sky Reserve & Tso Moriri Lake",
          tagline: "India's 1st International Dark Sky Reserve with astronomical stargazing",
          benefit: "Breathtaking views of the Milky Way, remote Changpa nomadic lifestyle, raw Himalayan beauty.",
          distance: "South-East Ladakh",
          crowdScore: 20
        }
      }
    ]
  },
  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    tagline: "Ancient Ghats, Ganga Aarti & Spiritual Legacy",
    category: "Spiritual & Cultural",
    altitude: 80,
    altitudeUnit: "80m (Plains)",
    safetyRisk: {
      level: "Low",
      riskType: "Extreme Crowd Surge on Narrow Ghat Gullies",
      amsRisk: "None",
      advisory: "Be mindful of belongings in crowded narrow alleys. Use pre-fixed rate government boat fares.",
      helpline: "+91-542-2508833 (Varanasi Tourist Assistance), 112 (Police), 108 (Ambulance)"
    },
    transport: {
      nearestAirport: "Lal Bahadur Shastri International Airport (VNS), Babatpur",
      nearestRailway: "Varanasi Junction (BSB) / Banaras (BSBS) - Multiple Vande Bharat trains",
      busConnectivity: "UPSRTC Volvo & AC Janrath buses connecting Lucknow, Allahabad, and Patna",
      localTransit: "E-rickshaws (₹20 - ₹50), Manual row boats (₹300 - ₹500/hour)"
    },
    stays: [
      { type: "Budget / Ghat Hostel", name: "Moustache Varanasi / Stops Hostel", price: "₹600 - ₹1,400/night", rating: 4.7 },
      { type: "Mid-Range Boutique", name: "Ganges View Heritage / BrijRama Palace (Standard)", price: "₹3,500 - ₹6,800/night", rating: 4.8 },
      { type: "Luxury / Heritage", name: "BrijRama Palace Heritage on Darbhanga Ghat", price: "₹24,000+/night", rating: 4.95 }
    ],
    attractions: [
      {
        id: "dashashwamedh-aarti",
        name: "Dashashwamedh Ghat Evening Ganga Aarti",
        timeSlot: "Evening (06:30 PM - 08:00 PM)",
        duration: "1.5 hours",
        cost: "Free (Boat seat ₹150 - ₹300)",
        crowdLevel: "Severe",
        crowdScore: 97,
        tags: ["Spiritual", "Ghats", "Aarti", "Heritage"],
        description: "Grand synchronized Vedic prayer with giant incense burners, conches, and thousands of floating oil lamps.",
        offbeatAlternative: {
          name: "Assi Ghat Subah-e-Banaras Morning Raga & Yogasana",
          tagline: "Soul-stirring dawn classical music, shehnai, and sunrise Surya Namaskar on the ghat",
          benefit: "Fresh morning river breeze, soothing live sitar performance, zero evening stampede.",
          distance: "Assi Ghat (South end)",
          crowdScore: 38
        }
      }
    ]
  }
];

export default destinationsData;