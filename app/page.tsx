import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Footer from "@/components/Footer";
import Search from "@/components/Search";
import { settingsData } from "@/settings";

import type { Metadata } from "next";
import SearchBarBig from "@/components/SearchBarBig";
import RequestButton from "@/components/RequestButton";
import Image from "next/image";

const title = "Cars,Vans,Suvs for Rent & Wedding Hire | Renting Services";
const description =
  "Find and rent cars, vans, SUVs and more across all 25 districts in Sri Lanka. With or without driver.";
const image = settingsData.FrontPageMainImage;

export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: [
    "Rent a car Sri Lanka",
    "Vehicle rental Sri Lanka",
    "Car hire Sri Lanka",
    "Budget car rental Sri Lanka",
    "Cheap car hire Sri Lanka",
    "Self drive car rental Sri Lanka",
    "Rent a car with driver Sri Lanka",
    "Monthly car rental Sri Lanka",
    "Weekly car rental Sri Lanka",
    "Long term car rental Sri Lanka",
    "Car rental near me",
    "Affordable vehicle hire",
    "Best car rental Sri Lanka",
    "Airport car rental Sri Lanka",
    "Rent a car Colombo",
    "Rent a car Gampaha",
    "Rent a car Kandy",
    "Rent a car Galle",
    "Rent a car Jaffna",
    "Wedding car hire Sri Lanka",
    "Luxury car rental Sri Lanka",
    "Van rental Sri Lanka",
    "Rent a bike Sri Lanka",
    "Scooter rental Sri Lanka",
    "Tuk tuk rental Sri Lanka",
    "24/7 car rental service",
    "Emergency car rental",
    "Online car booking Sri Lanka",
    "Rent a car price Sri Lanka",
    "Car rental deals Sri Lanka",
    "Discount car rental",
    "Rent a car without deposit",
    "Rent a car Katunayake",
    "Bandaranaike Airport car hire",
    "Pick and drop car rental",
    "Intercity car rental",
    "Outstation car hire",
    "Premium car rental",
    "Economy car rental",
    "Family car rental",
    "SUV rental Sri Lanka",
    "4x4 rental Sri Lanka",
    "Electric car rental Sri Lanka",
    "Hybrid car rental Sri Lanka",
    "Petrol car rental",
    "Diesel car rental",
    "Rent a car Negombo",
    "Rent a car Kalutara",
    "Rent a car Kurunegala",
    "Rent a car Matara",
    "Toyota Premio for rent",
    "Toyota Axio for rent",
    "Toyota Allion for rent",
    "Suzuki Alto for rent",
    "Suzuki Wagon R for rent",
    "Suzuki Spacia for rent",
    "Toyota Vitz for rent",
    "Honda Fit for rent",
    "Honda Vezel for rent",
    "Honda Grace for rent",
    "Toyota Aqua for rent",
    "Toyota Prius for rent",
    "Nissan Leaf for rent",
    "Nissan Dayz for rent",
    "Perodua Bezza for rent",
    "Perodua Viva Elite for rent",
    "Toyota KDH for rent",
    "KDH Super GL for rent",
    "Commuter van for rent",
    "Toyota Hiace for rent",
    "Micro Panda for rent",
    "Tata Nano for rent",
    "Mahindra KUV100 for rent",
    "MG ZS for rent",
    "Mitsubishi Montero for rent",
    "Toyota Land Cruiser for rent",
    "Toyota Hilux for rent",
    "Double cab for rent Sri Lanka",
    "Bajaj Pulsar for rent",
    "Honda Dio for rent",
    "Yamaha FZ for rent",
    "TVS Apache for rent",
    "Hero Dash for rent",
    "Scooty for rent Sri Lanka",
    "Trail bike for rent Sri Lanka",
    "Mountain bike for rent",
    "Off road vehicle rental",
    "7 seater car for rent",
    "9 seater van for rent",
    "14 seater KDH for rent",
    "Luxury wedding car Sri Lanka",
    "Mercedes Benz for rent SL",
    "BMW for rent Sri Lanka",
    "Audi for rent Sri Lanka",
    "Vintage car for rent wedding",
    "Classic car hire Sri Lanka",
    "Limousine rental Sri Lanka",
    "Automatic car for rent",
    "Manual car for rent",
    "Small car for rent",
    "Big car for rent",
    "Hatchback for rent",
    "Sedan for rent",
    "Crossover for rent",
    "Luxury SUV hire",
    "Vellfire for rent Sri Lanka",
    "Alphard for rent Sri Lanka",
    "Caravan for rent Sri Lanka",
    "Motorhome rental Sri Lanka",
    "Truck rental Sri Lanka",
    "Lorry for rent Sri Lanka",
    "Dimo Batta for rent",
    "Buddy van for rent",
    "Flatbed truck hire",
    "Cooling van for rent",
    "Delivery van rental",
    "Work van hire",
    "Passenger van rental",
    "Tourist van Sri Lanka",
    "Private chauffeur service",
    "Rent a car Western Province",
    "Rent a car Central Province",
    "Rent a car Southern Province",
    "Rent a car North",
    "Rent a car Nugegoda",
    "Rent a car Maharagama",
    "Rent a car Dehiwala",
    "Rent a car Mount Lavinia",
    "Rent a car Ratmalana",
    "Rent a car Moratuwa",
    "Rent a car Panadura",
    "Rent a car Horana",
    "Rent a car Wattala",
    "Rent a car Ja-Ela",
    "Rent a car Kadawatha",
    "Rent a car Kiribathgoda",
    "Rent a car Malabe",
    "Rent a car Battaramulla",
    "Rent a car Thalawathugoda",
    "Rent a car Kottawa",
    "Rent a car Homagama",
    "Rent a car Piliyandala",
    "Rent a car Kesbewa",
    "Rent a car Avissawella",
    "Rent a car Hanwella",
    "Rent a car Minuwangoda",
    "Rent a car Mirigama",
    "Rent a car Veyangoda",
    "Rent a car Beruwala",
    "Rent a car Bentota",
    "Rent a car Hikkaduwa",
    "Rent a car Unawatuna",
    "Rent a car Weligama",
    "Rent a car Tangalle",
    "Rent a car Hambantota",
    "Rent a car Peradeniya",
    "Rent a car Katugastota",
    "Rent a car Nuwara Eliya",
    "Rent a car Ella",
    "Rent a car Badulla",
    "Rent a car Bandarawela",
    "Rent a car Ratnapura",
    "Rent a car Kegalle",
    "Rent a car Chilaw",
    "Rent a car Wennappuwa",
    "Rent a car Marawila",
    "Rent a car Puttalam",
    "Rent a car Anuradhapura",
    "Rent a car Polonnaruwa",
    "Rent a car Dambulla",
    "Rent a car Sigiriya",
    "Rent a car Trincomalee",
    "Rent a car Batticaloa",
    "Rent a car Ampara",
    "Rent a car Vavuniya",
    "Rent a car Mannar",
    "Rent a car Kilinochchi",
    "Rent a car Mullaithivu",
    "Rent a car Point Pedro",
    "Rent a car Chavakachcheri",
    "Car rental with GPS",
    "Car rental with child seat",
    "Unlimited mileage car rental",
    "Limited mileage car hire",
    "Fuel efficient rental cars",
    "Car rental insurance Sri Lanka",
    "No hidden cost car rental",
    "Secure online payment car rental",
    "Car rental customer reviews",
    "Verified car owners Sri Lanka",
    "Rent a car mobile app",
    "Real time car availability",
    "Instant booking car rental",
    "Rent a car cancellation policy",
    "Emergency roadside assistance",
    "Car rental terms and conditions",
    "Driver contact details",
    "Car rental for foreigners",
    "International driving permit Sri Lanka",
    "Tourist car rental Sri Lanka",
    "Expat car rental Sri Lanka",
    "Diplomat car rental",
    "Corporate car hire Sri Lanka",
    "Staff transport service",
    "Airport transfer service SL",
    "Hotel drop off car rental",
    "Train station pick up car rental",
    "One way car rental Sri Lanka",
    "Return car at different location",
    "Clean rental cars",
    "Sanitized car rental",
    "Non smoking rental cars",
    "Pet friendly car rental",
    "New model cars for rent",
    "2024 car models for rent",
    "2025 car models for rent",
    "Best rated car rental agency",
    "Reliable car hire service",
    "Trustworthy car rental Sri Lanka",
    "Fast car rental booking",
    "How to rent a car in Sri Lanka",
    "Cost of renting a car in Sri Lanka",
    "Self drive vs with driver Sri Lanka",
    "Driving rules in Sri Lanka for foreigners",
    "Best places to visit in Sri Lanka by car",
    "Road trip guide Sri Lanka",
    "Top 10 rental cars in Sri Lanka",
    "Is it safe to drive in Sri Lanka",
    "Document needed for car rental SL",
    "Sri Lanka car rental FAQ",
    "Tips for renting a car in SL",
    "Avoid scams in car rental Sri Lanka",
    "Best fuel for rental cars",
    "How to extend car rental period",
    "Returning a rental car checklist",
    "Parking rules in Colombo",
    "Highway tolls in Sri Lanka",
    "Expressway entry points Sri Lanka",
    "Southern Expressway guide",
    "Katunayake Expressway guide",
    "Central Expressway updates",
    "Best time to book a rental car",
    "Last minute car rental deals",
    "Rent a car for long trips",
    "Off roading in Sri Lanka tips",
    "Finding cheap bike rentals SL",
    "Maintaining a rental vehicle",
    "Reporting car rental accidents",
    "Inspecting a rental car before hire",
    "why rent from us",
    "Crew cab for rent",
    "Refrigerated truck rental Sri Lanka",
    "Freezer van for rent",
    "Moving truck rental",
    "Furniture transport Sri Lanka",
    "Tipper truck for rent",
    "Crane truck rental",
    "Flatbed trailer hire",
    "Recovery truck service",
    "Car carrier trailer for rent",
    "Water tanker rental Sri Lanka",
    "Fuel tanker hire",
    "Waste management vehicle rental",
    "Office staff transport service",
    "Factory worker transport",
    "School van service Sri Lanka",
    "Luxury bus for rent",
    "29 seater bus rental",
    "40 seater bus Sri Lanka",
    "54 seater AC bus",
    "Mini bus for rent",
    "Crew transport van",
    "Event logistics vehicle",
    "Exhibition material transport",
    "Heavy equipment transport",
    "Low bed trailer for rent",
    "Forklift rental Sri Lanka",
    "Backhoe for rent",
    "JCB for rent Sri Lanka",
    "Boom truck hire",
    "Mobile workshop van",
    "Ambulance for rent Sri Lanka",
    "Funeral hearse rental",
    "Promotional vehicle hire",
    "Mobile billboard truck",
    "Branding vehicle rental",
    "Campaign vehicle Sri Lanka",
    "Election vehicle rental",
    "Field visit vehicle",
    "Site inspection car",
    "Project vehicle rental",
    "NGO vehicle hire",
    "Government project car rental",
    "UN vehicle rental SL",
    "Mining vehicle hire",
    "Plantation vehicle rental",
    "Estate cab for rent",
    "Tea estate transport",
    "Off-road 4x4 for hire",
    "Snorkel equipped 4x4",
    "Winch equipped SUV",
    "Camping gear vehicle",
    "Roof top tent car rental",
    "Overlanding vehicle Sri Lanka",
    "Safari jeep for rent",
    "Yala safari jeep hire",
    "Wilpattu safari jeep",
    "Udawalawe safari rental",
    "Minneriya safari jeep",
    "Bird watching tour vehicle",
    "VIP backup vehicle hire",
    "Presidential security convoy rental",
    "Bulletproof car rental Sri Lanka",
    "Armored vehicle hire",
    "Bodyguard with vehicle service",
    "Executive protection transport",
    "Airport VIP lounge transfer",
    "Red carpet event car",
    "Award ceremony vehicle",
    "Celebrity transport Sri Lanka",
    "Music band van rental",
    "Film production vehicle",
    "Camera crew van",
    "Equipment transport for shoots",
    "Wedding car decoration service",
    "Flower car for wedding",
    "Bridal car Sri Lanka",
    "Groom car rental",
    "Bridesmaids transport",
    "Homecoming car rental",
    "Anniversary car hire",
    "Birthday party limo",
    "Graduation ceremony car",
    "Prom night car rental",
    "Bachelor party van",
    "Bachelorette party bus",
    "Night club drop off service",
    "Late night transport Sri Lanka",
    "Weekend getaway car",
    "Holiday rental vehicle",
    "Christmas vacation car",
    "New Year trip vehicle",
    "Avurudu holiday car rental",
    "Vesak tour bus",
    "Poson pilgrimage transport",
    "Kandy Perahera transport",
    "Nallur festival travel",
    "Kataragama pilgrimage van",
    "Church feast transport",
    "Family reunion van",
    "Sports team transport",
    "Cricket team bus",
    "Football team van",
    "Athlete transport service",
    "Cycling support vehicle",
    "Marathon lead car",
    "Golf club transport",
    "Surfboard carrier car",
    "Diving gear transport van",
    "Island wide car rental",
    "Round trip Sri Lanka car",
    "Multi day tour vehicle",
    "Chauffeur guide Sri Lanka",
    "English speaking driver rental",
    "Chinese speaking guide SL",
    "German speaking driver",
    "French speaking guide rental",
    "Tamil speaking driver Colombo",
    "Sinhala speaking driver",
    "Cultural triangle tour car",
    "Hill country tour van",
    "Down south road trip car",
    "East coast travel vehicle",
    "Jaffna road trip van",
    "Ancient cities tour",
    "Wildlife photography tour vehicle",
    "Adventure travel car rental",
    "Budget traveler car SL",
    "Backpacker bike rental",
    "Luxury tourist transport",
    "Boutique hotel transfer",
    "Villa pick up service",
    "Airbnb car rental service",
    "Shore excursion for cruises",
    "Passenger port pick up",
    "Colombo Port transfer",
    "Hambantota Port car hire",
    "Domestic airport transfer",
    "Cinnamon Air transfer car",
    "Helitours pick up service",
    "Whale watching transport",
    "Turtle hatchery tour car",
    "Tea factory visit van",
    "Gem mine tour vehicle",
    "Hiking trailhead transport",
    "Adam’s Peak transport",
    "Horton Plains van hire",
    "Knuckles range 4x4",
    "Ella to Kandy car service",
    "Scenic route travel car",
    "Expressway rapid transport",
    "Highway intercity car",
    "Overnight stay car rental",
    "Multi city car hire",
    "Cross province vehicle rental",
    "Wayamba province car hire",
    "Sabaragamuwa car rental",
    "Uva province van hire",
    "North Central car rental",
    "Eastern province bike hire",
    "Northern province car rental",
    "Deep south travel van",
    "Coastal road trip car",
    "Cheapest car rental in Sri Lanka",
    "Most reliable car rental SL",
    "Top rated vehicle hire",
    "Car rental price comparison",
    "Best value for money rental",
    "No credit card car rental",
    "Cash payment car rental",
    "Debit card car rental SL",
    "Pay on arrival car hire",
    "Last minute rental deals",
    "Early bird car booking",
    "Seasonal car rental offers",
    "Festive season car deals",
    "Low season car rental",
    "Peak season vehicle hire",
    "Budget friendly van hire",
    "Premium car rental experience",
    "First class vehicle hire",
    "5 star car rental service",
    "Professional driver hire SL",
    "Experienced chauffeur rental",
    "Safe driving car rental",
    "Insured rental vehicles",
    "Modern fleet car rental",
    "Well maintained vehicles",
    "Cleanest rental cars SL",
    "Smoke free car rental",
    "Female driver for rent SL",
    "Elderly friendly car rental",
    "Wheelchair accessible vehicle",
    "Baby seat included car rental",
    "Roof rack car for rent",
    "Large boot space car",
    "High ground clearance car",
    "Fuel efficient car hire",
    "Small engine car for rent",
    "Powerful SUV for rent",
    "Automatic transmission rental",
    "Manual gear car for rent",
    "Tiptronic car for rent",
    "Daily staff transport",
    "Monthly corporate car",
    "Yearly vehicle lease",
    "Corporate fleet management",
    "Outsourced transport service",
    "Bank staff transport",
    "IT company transport",
    "BPO staff van",
    "Night shift transport",
    "Employee pick and drop",
    "Executive car lease",
    "Operational lease Sri Lanka",
    "Long term van lease",
    "Short term vehicle rental",
    "Flexible car rental plan",
    "No contract car hire",
    "Easy cancellation rental",
    "Replacement vehicle service",
    "Breakdown replacement car",
    "Monthly bike lease",
    "Weekly bike rental SL",
    "Daily scooter hire",
    "Student transport service",
    "University shuttle van",
    "Hospital shuttle service",
    "Shopping mall shuttle",
    "Supermarket delivery vehicle",
    "E-commerce delivery van",
    "Courier service vehicle",
    "Pharmacy delivery bike",
    "Food delivery scooter hire",
    "Last mile delivery vehicle",
    "Logistics partner Sri Lanka",
    "Transport contractor SL",
    "Authorized car rental agency",
    "Registered vehicle hire company",
    "SLTDA registered transport",
    "Licensed tourist transport",
    "Professional rent a car SL",
    "Best vehicle rental platform",
    "Top car hire service Sri Lanka",
    "Car for Rent | Wedding Car Hire | Van for Rent | Renting Services"
  ],

  // ─── Open Graph (WhatsApp, Facebook previews) ───
  openGraph: {
    title,
    description,
    images: [{ url: image, width: 1200, height: 630 }],
    type: "website",
  },

  // ─── Twitter card ───
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default async function Home() {
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  const supabase = await createClient();

  const { data: vehicles, count } = await supabase
    .from("uploaded_rent_vehicles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="page">
      {/* <Header /> */}

      {/* ─── HERO ─── */}
      <section className="hero">
        <div>
          <Link
            href="/get-started"
            className="btn btn-primary btn-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              position: "absolute",
              top: "var(--space-4)", // Spacing from top
              right: "var(--space-4)", // Spacing from right
              zIndex: 10,
              //end right
            }}
          >
            Post Free
          </Link>
        </div>
        <div
          className="container"
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <div className="hero-eyebrow">
            🇱🇰 Sri Lanka's Vehicle Rental Platform
          </div>

          <h1 className="hero-title">
            Find Your Perfect
            <br />
            <span className="accent">Rental Vehicle</span>
          </h1>

          {/* <p
            className="hero-sub"
            style={{
              margin: "0 auto",
              textAlign: "center",
              marginBottom: "var(--space-10)",
            }}
          >
            {settingsData.FrontPageMainSmallText}
          </p> */}
          <RequestButton />

          <div>
            <p
              style={{
                color: "white",
                maxWidth: 480,
                lineHeight: 1.6,
                marginBottom: "var(--space-3)",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <b>Or</b>
            </p>
          </div>

          {/* Search */}
          <SearchBarBig />
          <div style={{ maxWidth: "720px", margin: "0 auto var(--space-12)" }}>
            <Search />
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "var(--space-8)",
              flexWrap: "wrap",
            }}
          >
            <div className="stat-pill">
              <div className="stat-pill-value">{count?.toLocaleString()}+</div>
              <div className="stat-pill-label">Vehicles Listed</div>
            </div>

            {/* <div style={{ width: '1px', height: '36px', backgroundColor: 'rgb(255 255 255 / 0.1)' }} /> 
            <div className="stat-pill">
              <div className="stat-pill-value">25</div>
              <div className="stat-pill-label">Districts</div>
            </div> */}
            {/* <div style={{ width: '1px', height: '36px', backgroundColor: 'rgb(255 255 255 / 0.1)' }} /> */}
            {/* <div className="stat-pill">
              <div className="stat-pill-value">7</div>
              <div className="stat-pill-label">Vehicle Types</div>
            </div> */}
          </div>
        </div>
      </section>

      {/* ─── FEATURED VEHICLES ─── */}
      <section style={{ padding: "var(--space-16) 0" }}>
        <div className="container">
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "var(--space-8)",
            }}
          >
            <div>
              <p className="label">Recently Added</p>
              <h2 style={{ marginTop: "var(--space-1)" }}>Latest Listings</h2>
            </div>
            <Link href="/explore" className="btn btn-ghost btn-sm">
              View All {"→"}
            </Link>
          </div>

          {/* Vehicle Grid */}
          <div
            className="stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {vehicles?.map((car) => (
              <Link
                key={car.id}
                href={`/explore/${car.id}`}
                className="vehicle-card animate-fade-in"
              >
                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    height: "100px",
                    overflow: "hidden",
                    backgroundColor: "var(--bg-subtle)",
                  }}
                >
                  {car.image_urls?.[0] ? (
                    <Image
                      src={car.image_urls[0]}
                      alt={`${car.make} ${car.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 260px"
                      className="vehicle-card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        color: "var(--neutral-300)",
                      }}
                    >
                      🚗
                    </div>
                  )}

                  {/* Type badge */}
                  <span
                    className="badge badge-dark"
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {car.type}
                  </span>

                  {/* Driver badge */}
                  {car.with_driver && (
                    <span
                      className="badge badge-red"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      👨‍✈️ With Driver
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="vehicle-card-body">
                  <div className="vehicle-card-title">
                    {car.make} {car.model}{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--text-tertiary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      ({car.year})
                    </span>
                  </div>
                  <div className="vehicle-card-sub">📍 {car.district}</div>

                  <div
                    style={{
                      marginTop: "var(--space-3)",
                      paddingTop: "var(--space-3)",
                      borderTop: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="vehicle-card-price">
                      Rs. {car.daily_rate?.toLocaleString()}
                      <span>/day</span>
                    </div>
                    <span className="badge badge-gray">{car.fuel_type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: "var(--space-12)" }}>
            <Link href="/get-started" className="btn btn-primary btn-lg">
              🚗 Post Your Vehicle Free
            </Link>
            <br />
            <br />
            <RequestButton />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
