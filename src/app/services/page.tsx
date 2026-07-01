"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Building,
  Landmark,
  ShoppingBag,
  Trees,
  Train,
  Hotel,
  Lock,
  Globe,
  Users,
  MonitorPlay,
  CalendarDays,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2
} from "lucide-react";

type SpaceType = {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  pricingLabel: string;
  overview: {
    description: string;
    pricing: string;
    inclusions: string[];
    terms: string[];
  };
  faqs: { q: string; a: string }[];
};

/* Data */
const spaceTypes: SpaceType[] = [
  {
    id: "private",
    icon: Lock,
    title: "Private Office",
    tagline: "Fully furnished. Move-in ready.",
    pricingLabel: "From ₱11,000 / seat / mo",
    overview: {
      description:
        "A private office fully furnished is a ready-to-use workspace designed for individuals or teams, equipped with modern office furniture, high-speed internet, and essential facilities. It provides a professional and secure environment where businesses can operate immediately without the need for setup or additional investment.",
      pricing:
        "Starts at PHP 11,000.00 per seat / month (Corridor Side) – PHP 12,000 per seat / month (Window Side)",
      inclusions: [
        "Fully furnished private office workstation",
        "Prestigious business address",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Mail and parcel handling",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned office environment",
        "Regular housekeeping services",
        "Meeting room usage credits",
        "Pantry access with complimentary use of common areas",
        "Printing and scanning",
        "24/7 secure access to the facility",
        "Company signage display (subject to availability)",
        "Access cards for secure entry",
        "Phone booth access for private calls",
        "Conference room access (based on entitlement or booking)",
        "Lounge and common area access",
      ],
      terms: ["3 Months", "6 Months", "9 Months", "12 Months"],
    },
    faqs: [
      { q: "What is included in a private office rental?", a: "A private office includes fully furnished workspace, high-speed internet, utilities, reception services, and access to shared facilities such as meeting rooms and pantry areas." },
      { q: "Can I move in immediately?", a: "Move-in is typically available within 3 to 4 weeks after completing the required documents and payment. This allows time for preparation, onboarding, and ensuring your private office is fully ready for operations." },
      { q: "What is the minimum contract term?", a: "We offer flexible contract terms starting from 3 months, with options for 6, 9, and 12 months depending on your business needs." },
      { q: "Is the office space exclusive to my company?", a: "Yes, each private office is fully enclosed and dedicated solely to your company to ensure privacy and security." },
      { q: "Are utilities included in the monthly rate?", a: "Yes, electricity, water, air-conditioning, and general maintenance are included in the monthly rental fee." },
      { q: "Do I have 24/7 access to the office?", a: "24/7 access is available depending on your selected branch or add-on, allowing flexibility for different work schedules." },
      { q: "Can I upgrade or expand my office space later?", a: "Yes, office expansion is possible depending on availability, allowing you to add more seats or move to a larger unit as your team grows." },
      { q: "Are meeting rooms included in the package?", a: "Yes, meeting room credits are included in most rates, with additional usage available through add-on booking rates." },
      { q: "Is there a security deposit required?", a: "Yes, a refundable security deposit equivalent to 1–2 months' rent is required, subject to contract terms and account clearance." },
      { q: "Can I use the business address for company registration?", a: "Yes, the private office address can be used as your official business address for registration and corporate documentation." },
      { q: "Can I customize the office layout or branding inside my unit?", a: "Yes, minor layout adjustments and internal branding are allowed depending on management approval and space conditions." },
      { q: "What internet speed and setup do you provide?", a: "We provide high-speed shared business internet, with options to upgrade to a dedicated line for companies requiring higher stability or secure connections." },
      { q: "How is privacy maintained inside the office?", a: "Each private office is fully enclosed with controlled access, ensuring confidentiality and minimal external disruption." },
      { q: "Are there limits on the number of people inside my office?", a: "Yes, occupancy depends on the size of the office unit and is defined in your agreement to ensure safety and comfort." },
      { q: "Can I bring my own equipment or furniture?", a: "Yes, clients may bring additional equipment or replace select furniture items, subject to space and safety guidelines." },
      { q: "What happens if I need to increase or reduce my team size?", a: "You may upgrade or downgrade to a different office size depending on availability and contract terms." },
      { q: "Is there a dedicated support person for office concerns?", a: "Yes, an on-site team is available to assist with operational concerns such as maintenance, internet issues, and facility support." },
      { q: "Can I receive clients or guests in my office?", a: "Yes, clients and guests are welcome, with access managed through reception for security and proper coordination." },
      { q: "Are there restrictions on working hours for tenants?", a: "Most offices allow flexible, with extended or 24/7 access available as an upgrade." },
      { q: "What makes your private office different from traditional leasing?", a: "Our private offices are fully serviced and ready-to-use, eliminating the need for long-term build-out, utility setup, and operational staffing." },
    ],
  },
  {
    id: "virtual",
    icon: Globe,
    title: "Virtual Office",
    tagline: "Professional address. Zero overhead.",
    pricingLabel: "From ₱2,000 / month",
    overview: {
      description:
        "A Virtual Office provides businesses with a prestigious professional address, complete business support services, and access to essential office facilities without the need for a physical workspace. It is ideal for companies that want to establish a credible presence, manage mail and communications efficiently, and access meeting spaces whenever needed.",
      pricing:
        "Basic – PHP 2,000/mo | Standard – PHP 3,000/mo | Premium – PHP 5,000/mo",
      inclusions: [
        "Business address",
        "Business registration documents assistance",
        "Mail handling",
        "Basic call handling",
        "Co-working space access (per plan)",
        "Conference room access (per plan)",
      ],
      terms: ["6 Months", "12 Months"],
    },
    faqs: [
      { q: "What is a Virtual Office?", a: "A Virtual Office provides a professional business address and essential support services without requiring a physical office space." },
      { q: "What is included in a Virtual Office package?", a: "It includes a business address, mail handling, reception support, and access to meeting rooms based on credits or booking." },
      { q: "Can I use the address for company registration?", a: "Yes, the Virtual Office address can be used for business registration, subject to applicable requirements and documentation." },
      { q: "How is mail handled under the Virtual Office service?", a: "Mail and parcels are received, recorded, and either stored for pickup or coordinated for forwarding upon request." },
      { q: "Can mail be forwarded to another location?", a: "Yes, mail forwarding is available as an add-on service, subject to courier fees and handling charges." },
      { q: "Do I get access to physical office facilities?", a: "Yes, clients can access meeting rooms, lounges, and common areas based on their package inclusions or bookings." },
      { q: "Is there a limit on meeting room usage?", a: "Yes, meeting room usage is typically allocated through credits or hourly booking depending on your plan." },
      { q: "Can I upgrade to a physical office later?", a: "Yes, you may upgrade to a private office or coworking space anytime, subject to availability." },
      { q: "Do I get a dedicated phone line?", a: "A dedicated business phone line or VoIP setup is available as an add-on service." },
      { q: "Is receptionist support included?", a: "Yes, professional reception services are included for handling calls, guests, and mail coordination." },
      { q: "Can I receive walk-in clients at the address?", a: "Yes, you may receive clients and guests in designated meeting or reception areas." },
      { q: "Is there 24/7 access to the facility?", a: "Access depends on your selected plan, with 24/7 access available for eligible packages or upgrades." },
      { q: "What industries commonly use Virtual Offices?", a: "Startups, freelancers, remote teams, international companies, and SMEs commonly use Virtual Offices." },
      { q: "What documents are required to sign up?", a: "Basic company and identification documents are required, depending on registration and compliance needs." },
      { q: "What makes a Virtual Office better than a home address?", a: "It provides a professional business identity, privacy protection, and access to corporate facilities that a home address cannot offer." },
    ],
  },
  {
    id: "coworking",
    icon: Users,
    title: "Co-working Space",
    tagline: "Flexible desks. Collaborative energy.",
    pricingLabel: "From ₱550 / day",
    overview: {
      description:
        "A co-working space is a flexible and fully serviced shared workspace designed for individuals, freelancers, startups, and teams who need a productive and professional working environment without the commitment of a private office.",
      pricing: "PHP 550 (Daily) / PHP 2,000 (Weekly) / PHP 5,500 (Monthly)",
      inclusions: [
        "Flexible co-working workstation",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned workspace environment",
        "Meeting room usage credits",
        "Pantry access with shared common areas",
        "24/7 secure access to the facility",
        "Access cards for secure entry",
        "Phone booth access for private calls",
        "Conference room access (based on entitlement or booking)",
        "Lounge and collaboration area access",
        "Unlimited Coffee, Tea and Water",
      ],
      terms: ["Daily", "Weekly", "Monthly", "Yearly"],
    },
    faqs: [
      { q: "What is included in a co-working space membership?", a: "It includes a dedicated workstation in a shared environment, high-speed internet, access to common areas, reception services, and basic office amenities." },
      { q: "Do I need to bring my own equipment?", a: "You may bring your own laptop and personal devices. Basic office essentials such as desks, chairs, and internet access are already provided." },
      { q: "Is there a fixed seat assigned to me?", a: "Depending on your plan, you may either have a dedicated seat or a flexible seating arrangement within the co-working area." },
      { q: "Can I use the space for meetings or client presentations?", a: "Yes, meeting rooms and conference rooms are available, subject to booking and entitlement under your plan or add-ons." },
      { q: "Is co-working suitable for teams or only individuals?", a: "It is suitable for both individuals and small teams who prefer a flexible and cost-efficient workspace solution." },
      { q: "Are there privacy options available?", a: "Yes, private phone booths are available for confidential calls and discussions." },
      { q: "What are the operating hours of the co-working space?", a: "Operating hours depend on your package, with 24/7 access available for selected branches or upgrades." },
      { q: "Can I upgrade to a private office later?", a: "Yes, you may upgrade to a private office depending on availability and your business requirements." },
      { q: "Is the co-working space noisy or crowded?", a: "The environment is designed to be professional and well-managed to maintain productivity and minimize disruption." },
      { q: "Can I register my business using the co-working address?", a: "Yes, the business address can be used for registration depending on your selected plan and compliance requirements." },
    ],
  },
  {
    id: "conference",
    icon: MonitorPlay,
    title: "Conference Room",
    tagline: "Impress clients. Lead every meeting.",
    pricingLabel: "From ₱1,500 / hour",
    overview: {
      description:
        "A fully furnished conference room designed for professional meetings, presentations, training sessions, and business discussions with complete AV equipment and support.",
      pricing: "PHP 1,500 (Hourly) / PHP 9,000 (Daily)",
      inclusions: [
        "Fully-furnished Conference Room",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned workspace environment",
        "Projector and Screen",
        "Pantry access with shared common areas",
        "24/7 secure access to the facility",
        "Access cards for secure entry",
        "Phone booth access for private calls",
        "Unlimited Coffee, Tea and Water",
      ],
      terms: ["Hourly", "Daily"],
    },
    faqs: [
      { q: "What is included when I book the conference room?", a: "The booking includes a fully equipped meeting space, high-speed internet, seating arrangement, and access to basic office amenities." },
      { q: "How many people can the conference room accommodate?", a: "Capacity depends on the room size, typically suitable for small to medium-sized groups for meetings, presentations, or training sessions." },
      { q: "Do I need to book in advance?", a: "Yes, advance booking is recommended to ensure availability, especially during peak business hours." },
      { q: "Can I extend my booking if the room is still available?", a: "Yes, extensions are possible depending on schedule availability and prior reservations." },
      { q: "Is food and beverage allowed inside the conference room?", a: "Light refreshments are allowed, and catering can be arranged upon request depending on the package." },
      { q: "Is technical equipment provided for presentations?", a: "Basic display and presentation equipment may be available, with additional upgrades offered as add-ons." },
      { q: "Can I use the conference room for client meetings?", a: "Yes, the space is designed specifically for professional meetings, client presentations, and business discussions." },
      { q: "Is there privacy in the conference room?", a: "Yes, the room is fully enclosed to ensure privacy and confidentiality during meetings." },
      { q: "Can I access other facilities during my booking?", a: "Yes, guests may access shared areas such as lounges and pantry facilities depending on the booking terms." },
      { q: "What happens if I exceed my booked time?", a: "Additional charges may apply if you exceed your reserved time, subject to availability and management approval." },
    ],
  },
  {
    id: "event",
    icon: CalendarDays,
    title: "Event / Activity Area",
    tagline: "Workshops. Launches. Networking.",
    pricingLabel: "From ₱5,000 / event",
    overview: {
      description:
        "An event or activity area is a flexible, fully serviced space designed for corporate events, workshops, training, networking sessions, product launches, and group activities.",
      pricing: "Starts at PHP 5,000.00 (depending on setup and number of participants)",
      inclusions: [
        "Flexible event space setup (café area, office space, workshop, or networking style)",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned event environment",
        "Basic furniture setup (tables and chairs)",
        "Access to common lounge and collaboration areas",
        "Pantry access with shared facilities",
        "Unlimited coffee, tea, and drinking water",
        "24/7 secure access to the facility (subject to booking schedule)",
        "Access cards for entry",
        "Phone booth access for private calls",
        "Conference room access (if included in package or booking agreement)",
      ],
      terms: ["Daily rental", "Monthly arrangements", "Yearly partnership agreements"],
    },
    faqs: [
      { q: "What types of events can be held in space?", a: "The space can accommodate corporate events, training, workshops, seminars, networking sessions, and small business gatherings." },
      { q: "How many guests can the event space accommodate?", a: "Capacity depends on the setup and layout, ranging from small group sessions to medium-sized corporate events." },
      { q: "Can the layout of the space be customized?", a: "Yes, the setup can be arranged in theater, classroom, workshop, or networking formats depending on your requirements." },
      { q: "Do you provide event equipment?", a: "Basic setup is included, while additional equipment such as microphones, projectors, and sound systems are available as add-ons." },
      { q: "Is catering allowed inside the event area?", a: "Yes, catering is allowed and can be arranged upon request or coordinated with your preferred provider." },
      { q: "Can I book the space regularly for training sessions?", a: "Yes, recurring bookings are available for companies or organizations conducting regular programs or workshops." },
      { q: "Is there support staff during events?", a: "Yes, on-site staff is available to assist with setup, technical support, and basic coordination during the event." },
      { q: "Can I use the space for private or exclusive events?", a: "Yes, the event area can be fully reserved for exclusive use to ensure privacy and focus during your activity." },
    ],
  },
];

/* FAQ Accordion */
function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-[#EEF2FB] transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-md font-semibold text-gray-800">{faq.q}</span>
            {open === i ? (
              <ChevronUp className="w-4 h-4 text-[#0D47A1] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            )}
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-4 py-3 text-sm text-gray-700 bg-white">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* Map Embed with loading state */
function MapEmbed({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gray-100 animate-pulse">
          <Loader2 className="w-5 h-5 text-[#0D47A1] animate-spin" />
          <span className="text-xs font-medium text-gray-400">Loading map…</span>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

/*  Modal  */
function SpaceModal({
  space,
  onClose,
}: {
  space: SpaceType;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "faq">("overview");
  const Icon = space.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-[#0D47A1]">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight">{space.title}</h3>
              <p className="text-sm text-blue-200">{space.pricingLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["overview", "faq"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t
                  ? "text-[#0D47A1] border-b-2 border-[#0D47A1] bg-[#EEF2FB]"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t === "overview" ? "Overview" : "FAQ"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {tab === "overview" ? (
              <div className="space-y-5">
                <p className="text-md text-gray-600 leading-relaxed">{space.overview.description}</p>

                <div>
                  <p className="text-lg font-bold uppercase tracking-wider text-[#0D47A1] mb-1">Pricing</p>
                  <p className="text-md text-gray-600 font-medium">{space.overview.pricing}</p>
                </div>

                <div>
                  <p className="text-lg font-bold uppercase tracking-wider text-[#0D47A1] mb-2">What's Included</p>
                  <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {space.overview.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-md text-gray-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0D47A1] shrink-0" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-lg font-bold uppercase tracking-wider text-[#0D47A1] mb-2">Contract Terms</p>
                  <div className="flex flex-wrap gap-2">
                    {space.overview.terms.map((term) => (
                      <span
                        key={term}
                        className="px-3 py-1 text-sm font-semibold rounded-full bg-[#EEF2FB] text-[#0A1E3F]"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <FaqAccordion faqs={space.faqs} />
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <a
              href="/quotation"
              className="flex-1 text-center px-4 py-2.5 bg-[#efb916] hover:bg-[#FFC107] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Get a Quote Now
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ServicesPage() {
  const [activeSpace, setActiveSpace] = useState<SpaceType | null>(null);

  const moveInSteps = [
    { step: 1, title: "Inquiry", description: "Contact us to learn more about our office spaces and availability." },
    { step: 2, title: "Introduction", description: "We will provide you with detailed information about our office spaces." },
    { step: 3, title: "Application", description: "Submit your application and provide the necessary documentation." },
    { step: 4, title: "Examination", description: "We will review your application and conduct a site visit." },
    { step: 5, title: "Contract", description: "Sign the lease agreement and finalize the move-in process." },
    { step: 6, title: "Start Using", description: "Begin using your new office space and receive ongoing support." },
  ];

  const tower6789Features = [
    "49 private rooms (up to 17 people)",
    "PEZA certified building",
    "24-hour air conditioning",
    "Meeting rooms up to 10 people",
    "Use of multifunction copier, printer and scanner.",
  ];

  const insularLifeFeatures = [
    "49 private rooms (up to 35 people)",
    "PEZA certified building",
    "24-hour air conditioning",
    "Meeting rooms up to 20 people",
    "Mailbox & locker room included",
  ];

  const landmarkCategories = [
    {
      icon: Building,
      label: "Major Corporate & Office Buildings",
      walk: "0–5 mins walk",
      items: [
        { name: "PBCom Tower", time: "2–3 mins", desc: "One of the tallest towers in the Philippines and a key financial hub landmark along Ayala Avenue." },
        { name: "Rufino Pacific Tower", time: "2–4 mins", desc: "Grade A office building housing multinational companies and BPO firms." },
        { name: "Bank of the Philippine Islands (BPI) Head Office", time: "1–3 mins", desc: "Major banking headquarters, directly within the Ayala Avenue business corridor." },
        { name: "GT Tower International", time: "4–6 mins", desc: "Prestigious office tower with banking and corporate tenants." },
        { name: "Ayala Tower One & Exchange Plaza", time: "5–7 mins", desc: "Premium corporate address and one of the most recognized office complexes in Makati CBD." },
      ],
    },
    {
      icon: Landmark,
      label: "Financial & Government Institutions",
      walk: "2–8 mins walk",
      items: [
        { name: "RCBC Plaza", time: "6–8 mins", desc: "Major financial complex hosting multinational corporations and embassies." },
        { name: "Makati Central Post Office", time: "5–7 mins", desc: "Key postal and government service hub." },
        { name: "Philippine Stock Exchange Center (PSE Tower)", time: "6–8 mins", desc: "Main stock trading center of the Philippines." },
      ],
    },
    {
      icon: ShoppingBag,
      label: "Shopping Malls & Lifestyle Hubs",
      walk: "5–12 mins walk",
      items: [
        { name: "Greenbelt Mall (Ayala Center)", time: "8–12 mins", desc: "Premium shopping, dining, and lifestyle destination." },
        { name: "Glorietta Mall", time: "8–12 mins", desc: "Major retail and entertainment complex." },
        { name: "SM Makati", time: "8–10 mins", desc: "Convenient shopping mall connected to Ayala MRT area." },
        { name: "The Landmark Makati", time: "7–10 mins", desc: "Department store and supermarket hub." },
      ],
    },
    {
      icon: Trees,
      label: "Parks & Open Spaces",
      walk: "5–10 mins walk",
      items: [
        { name: "Ayala Triangle Gardens", time: "5–8 mins", desc: "Central green space surrounded by major corporate towers." },
        { name: "Legazpi Active Park", time: "10–12 mins", desc: "Popular for jogging, weekend markets, and outdoor meetings." },
        { name: "Washington SyCip Park", time: "10–12 mins", desc: "Quiet garden park ideal for breaks and informal meetings." },
      ],
    },
    {
      icon: Train,
      label: "Transport Hubs",
      walk: "5–12 mins walk",
      items: [
        { name: "MRT Ayala Station", time: "10–20 mins", desc: "Main rail connection linking Makati to EDSA corridor." },
        { name: "One Ayala Transport Terminal", time: "10–20 mins", desc: "Major bus, jeep, and UV Express hub for Metro Manila routes." },
      ],
    },
    {
      icon: Hotel,
      label: "Hotels & Business Accommodation",
      walk: "5–10 mins walk",
      items: [
        { name: "The Peninsula Manila", time: "6–9 mins", desc: "Luxury 5-star hotel frequently used for business meetings." },
        { name: "Makati Shangri-La Hotel", time: "7–10 mins", desc: "Premium international hotel for corporate guests." },
        { name: "New World Makati Hotel", time: "6–9 mins", desc: "Business-friendly hotel near Greenbelt area." },
      ],
    },
  ];

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="HERO Serviced Office services"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#1B3A8C]/90 to-[#1B3A8C]/60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Office Guidance & Services
            </h1>
            <p className="text-xl text-gray-300">
              Comprehensive office solutions for your business needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Locations</h2>
            <p className="text-lg text-gray-600">
              Choose the HERO PH location that best suits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tower 6789 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden group">
                <MapEmbed
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7277203334647!2d121.01805607468263!3d14.557556885923752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f316aaaab%3A0xf80063632113a229!2sHERO%20PH!5e0!3m2!1sen!2sph!4v1782451174323!5m2!1sen!2sph"
                  title="Tower 6789 map"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">View on Google Maps</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0D47A1] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Tower 6789</h3>
                    <p className="text-sm text-[#0A1E3F] font-medium">23rd Floor, 6789 Ayala Avenue, Makati City</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tower6789Features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/tower-6789"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#0D47A1] hover:bg-[#0A1E3F] text-white rounded-xl font-semibold transition-colors"
                >
                  View Tower 6789 Makati
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Insular Life Building */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden group">
                <MapEmbed
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7349367396077!2d121.01852111072995!3d14.55714458586539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f31651de5%3A0xf2d7d4161752e079!2sHero%20Serviced%20Office!5e0!3m2!1sen!2sph!4v1781155861898!5m2!1sen!2sph"
                  title="Insular Life Building map"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">View on Google Maps</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0D47A1] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Insular Life Building</h3>
                    <p className="text-sm text-[#0A1E3F] font-medium">11th Floor, 6781 Ayala Avenue corner Paseo de Roxas, Makati</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {insularLifeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/insular-life"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#0D47A1] hover:bg-[#0A1E3F] text-white rounded-xl font-semibold transition-colors"
                >
                  View Insular Life Building
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Space Type */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Space Types</h2>
            <p className="text-lg text-gray-600">
              Flexible workspace solutions designed for every stage of business growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {spaceTypes.map((space, i) => {
              const Icon = space.icon;
              return (
                <motion.button
                  key={space.id}
                  onClick={() => setActiveSpace(space)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0D47A1]/30 hover:shadow-xl"
                >
                  <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-[#0D47A1] transition-transform duration-300 group-hover:scale-x-100" />

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0D47A1] transition-all duration-300 group-hover:bg-[#0D47A1] group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-bold text-[#0A1E3F] transition-colors group-hover:text-[#0D47A1]">
                      {space.title}
                    </h3>

                    <span className="inline-flex rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#0D47A1]">
                      {space.pricingLabel}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-8 font-semibold text-[#0D47A1] transition-all group-hover:gap-3">
                    <span>Explore Space</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeSpace && (
        <SpaceModal space={activeSpace} onClose={() => setActiveSpace(null)} />
      )}

      {/* ── Move-In Flow ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Flow Until Moving In
            </h2>
            <p className="text-lg text-gray-600">Simple 6-step process to start using our office</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#C5D2EC] hidden lg:block" />
            <div className="space-y-8">
              {moveInSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  <div className="flex-1">
                    <div className={`bg-gray-50 rounded-2xl text-center p-6 ${index % 2 === 0 ? "lg:mr-8" : "lg:ml-8"}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Step {item.step}: {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-[#0D47A1] rounded-full flex items-center justify-center text-white text-2xl font-bold z-10 shadow-lg shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Landmarks */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nearby Landmarks</h2>
            <p className="text-lg text-gray-600">
              Everything you need is within walking distance from both HERO locations on Ayala Avenue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landmarkCategories.map((cat, catIdx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#0D47A1]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-md font-bold text-gray-900 leading-tight">{cat.label}</p>
                      <p className="text-sm text-[#1565C0] font-semibold mt-0.5">{cat.walk}</p>
                    </div>
                  </div>

                  {/* Landmark rows */}
                  <ul className="divide-y divide-gray-50">
                    {cat.items.map((item) => (
                      <li key={item.name} className="px-5 py-3.5">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="text-md font-semibold text-gray-900 leading-snug">{item.name}</span>
                          <span
                            className="text-xs font-bold whitespace-nowrap shrink-0 mt-0.5 px-2 py-0.5 rounded-full bg-[#FFC107]/40 text-gray-600"
                          >
                            ~{item.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}