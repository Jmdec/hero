"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  InfoIcon,
  Building2,
  Users,
  Briefcase,
  MapPin,
  Phone,
  Wifi,
  Coffee,
  Printer,
  Mail,
  Package,
  Armchair,
  Clock,
  CheckCircle2,
  ArrowRight,
  Snowflake,
  Car,
  FileText,
  ShieldCheck,
  DoorOpen,
  Globe,
  LandPlot,
} from "lucide-react";

const officeTypes = [
  {
    id: "shared-office",
    name: "Shared Office",
    icon: Users,
    description: "Flexible booth-type desks for individuals",
    details: [
      "Booth-type desks available",
      "Single person workstations",
      "Desks, chairs, and Wi-Fi included",
      "Perfect for freelancers and remote workers",
    ],
    note: "Please contact us for pricing details.",
  },
  {
    id: "coworking",
    name: "Co-Working Space",
    icon: Coffee,
    description: "Collaborative space in cafe and lounge areas",
    details: [
      "Work in cafe area and lounge",
      "Enhanced coworking environment",
      "Share space with other tenants",
      "Desks, chairs, and Wi-Fi provided",
    ],
    note: "Enhanced coworking space opened April 2019. Please contact us for pricing details.",
  },
  {
    id: "virtual-office",
    name: "Virtual Office",
    icon: Briefcase,
    description: "Prime Makati address for corporate registration",
    details: [
      "Makati City address for registration",
      "Prime location in business district",
      "Mail forwarding service included",
      "Professional business address",
    ],
    note: "Initial costs include contract fee, security deposit, first month usage fee, common service fee, security card fee, and tax.",
  },
];

const facilities = [
  {
    icon: DoorOpen,
    title: "Reception",
    description: "Japanese-speaking staff available weekdays 9:00-18:00",
  },
  {
    icon: Users,
    title: "Meeting Space",
    description: "2 shared meeting rooms. Combined capacity up to 20 people (paid, weekdays 9:00-18:00)",
  },
  {
    icon: Coffee,
    title: "Cafe Area",
    description: "Spacious area for casual meetings and networking",
  },
  {
    icon: Armchair,
    title: "Lounge",
    description: "Visitor waiting area and tenant break space. Available 24/7",
  },
  {
    icon: Mail,
    title: "Mailbox",
    description: "Individual mailboxes for residents. Available 24/7, 365 days",
  },
  {
    icon: Package,
    title: "Locker Room",
    description: "Rental lockers for large luggage. Available 24/7, 365 days",
  },
];

const amenities = [
  { icon: Clock, title: "24/7 Access", description: "Use office anytime, perfect security" },
  { icon: Wifi, title: "Wired LAN", description: "Japan-equivalent line speeds" },
  { icon: Snowflake, title: "24H Air Conditioning", description: "No limits, available 24 hours daily" },
  { icon: Phone, title: "Telephone Line", description: "Fixed monthly payment" },
  { icon: FileText, title: "Mail Forwarding", description: "For virtual office customers" },
  { icon: Car, title: "Parking", description: "Available at Insular Life Building" },
  { icon: Coffee, title: "Unlimited Coffee", description: "Free coffee and mineral water" },
  { icon: Printer, title: "Multifunction Machine", description: "Copy, print, and scan functions" },
  { icon: FileText, title: "Fixtures Included", description: "Desks, chairs, cabinets provided" },
  { icon: Globe, title: "Global IP Address", description: "Global IP addresses available for rent" },
];

export default function InsularLifePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-[#0A1E3F] to-[#1565C0] text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#5C7ABF]/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Insular Life Building Makati
            </h1>
            <p className="text-xl text-gray-300">
              11th Floor, 6781 Ayala Avenue corner Paseo de Roxas Avenue, Makati City
            </p>
          </motion.div>
        </div>
      </section>

      {/* Location Highlights */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image src="/peza.png" alt="PEZA Logo" width={100} height={100} />
            <div className="flex flex-col gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                The building (INSULAR LIFE BUILDING MAKATI) where the service office is located is a PEZA certified building.
              </h1>
              <p className="text-gray-500">
                In districts certified by the Philippine Economic Zone Authority (PEZA), as part of preferential treatment for foreign investment, depending on the type of business, you can receive preferential treatment such as exemption from corporate income tax, customs duty, and value added tax.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Base Overview */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Base Overview
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C5D2EC]/50 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1B3A8C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">
                      11th Floor, Insular Life Building
                    </p>
                    <p className="text-gray-600">
                      6781 Ayala Avenue corner Paseo de Roxas
                    </p>
                    <p className="text-gray-600">
                      Makati City, Metro Manila, Philippines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C5D2EC]/50 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[#1B3A8C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Property Classification</p>
                    <p className="text-gray-600">
                      Grade A / Premium Office Building
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C5D2EC]/50 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#1B3A8C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sustainability Certification</p>
                    <p className="text-gray-600">
                      LEED Gold Certified for energy-efficient and environmentally friendly building features
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C5D2EC]/50 rounded-lg flex items-center justify-center shrink-0">
                    <LandPlot className="w-5 h-5 text-[#1B3A8C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Typical Floor Plate</p>
                    <p className="text-gray-600">
                      Approximately 1,617–1,623 sqm
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <Image
                  src="/Insular-Life.jpg"
                  alt="Tower 6789"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#3B5EA6] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">49 Private Rooms</p>
                    <p className="text-sm text-gray-600">11th Floor, Insular Life Building</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floor Layout & Office Types */}
      <section className="py-24 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900">
              Floor Layout & Office Types
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              Discover flexible office solutions designed to accommodate businesses
              of every size.
            </p>
          </div>

          {/* Note */}
          <div className="mt-8 max-w-4xl mx-auto rounded-xl border border-yellow-300 bg-yellow-50 p-5">
            <div className="flex gap-3">
              <InfoIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-1" />

              <p className="text-sm text-yellow-800 leading-relaxed">
                <strong>Initial Costs Include:</strong> Contract fee, security
                deposit, first month's usage fee, common service fee,
                security card fee, and applicable taxes.
              </p>
            </div>
          </div>

          {/* Floor Plan & Office Cards */}
          <div className="py-6 grid grid-cols-1 gap-12 items-start">
            {/* Floor Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .6 }}
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden border">
                <div className="relative aspect-4/3">
                  <Image
                    src="/INSULAR-LIFE-FLOOR-LAYOUT.jpg"
                    alt="Floor Layout"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>

            {/* Office Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .6 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {officeTypes.map((type, index) => (
                  <motion.div key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow relative" >
                    <div className="absolute top-6 right-6">
                      <div className="relative group">
                        <InfoIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg 
                      whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Please contact us for details.
                          <div className="absolute top-full right-0 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="hidden lg:flex w-14 h-14 bg-[#8FA8D6]/30 rounded-xl items-center justify-center p-3">
                        <type.icon className="w-7 h-7 text-[#3B5EA6]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                        <p className="text-gray-600 text-sm md:text-md">{type.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {type.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Facilities & Services */}
      <section className="pb-20 bg-gray-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Facilities & Services
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for a productive work environment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-2xl hover:bg-[#C5D2EC]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-xl flex items-center justify-center mb-4">
                  <facility.icon className="w-6 h-6 text-[#1B3A8C]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{facility.title}</h3>
                <p className="text-gray-600 text-sm">{facility.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="pb-20 bg-gray-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Included Amenities
            </h2>
            <p className="text-lg text-gray-600">
              Premium features for all tenants
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {amenities.map((amenity, index) => (
              <motion.div
                key={amenity.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-2xl hover:bg-[#C5D2EC]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <amenity.icon className="w-8 h-8 text-[#1B3A8C] mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{amenity.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{amenity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#0A1E3F] via-[#0D47A1] to-[#1565C0] py-12" >
        {/* Background Decoration */}
        < div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#FFC107]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">

            <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
              Find Your Ideal Office Space
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-blue-100">
              Whether you're launching a startup or expanding your business,
              our team is ready to help you find the perfect serviced office at
              <span className="font-semibold text-white">
                {" "}Insular Life Building.
              </span>
            </p>
          </div>

          {/* Contact Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 mx-auto md:max-w-4xl">
            {/* Phone */}
            <div className="flex flex-row sm:items-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-[#FFC107]/40 hover:bg-white/10">
              <div className="flex h-10 w-10 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFC107] text-[#0A1E3F]">
                <Phone className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-200">
                    Main Contact
                  </p>
                  <p className="mt-1 wrap-break-word text-sm lg:text-base text-blue-100">
                    +63 942 639 4128
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-200">
                    Tower 6789 Contact
                  </p>
                  <p className="mt-1 wrap-break-word text-sm lg:text-base text-blue-100">
                    +63 285 283 100
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-row sm:items-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-[#FFC107]/40 hover:bg-white/10">
              <div className="flex h-10 w-10 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFC107] text-[#0A1E3F]">
                <Mail className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-200">
                    Sales Email
                  </p>
                  <p className="mt-1 wrap-break-word text-sm lg:text-base text-blue-100">
                    salesofficer@heroph.net
                  </p>
                  <p className="wrap-break-word text-sm lg:text-base text-blue-100">
                    digitalsalesmarketing@heroph.net
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-200">
                    Admin Email
                  </p>
                  <p className="mt-1 wrap-break-word text-sm lg:text-base text-blue-100">
                    admin@heroph.net
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-5">
            <Link
              href="/quotation?branch=insular-life"
              className="group inline-flex items-center gap-3 rounded-full bg-[#FFC107] px-8 py-4 font-semibold text-[#0A1E3F] transition-all duration-300 hover:scale-105 hover:bg-[#FFD54F]"
            >
              Get a Quote Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div >
  );
}