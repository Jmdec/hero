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
  BadgeCheck,
  DoorOpen,
  Globe,
  Calendar,
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
      <section className="relative bg-gradient-to-br from-[#1B3A8C] via-[#3B5EA6] to-[#1A1A2E] text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5C7ABF]/20 via-transparent to-transparent" />
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
            <Image src="/peza.png" alt="PEZA Logo" width={100} height={100} />z
            <div className="flex flex-col gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                The building where the service office is located (TOWER6789) is a PEZA certified building.
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
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#8FA8D6]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#3B5EA6]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">11th Floor, Insular Life Building</p>
                    <p className="text-gray-600">6781 Ayala Avenue corner Paseo de Roxas Avenue</p>
                    <p className="text-gray-600">Makati City, Metro Manila, Philippines</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#8FA8D6]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[#3B5EA6]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Total Rooms</p>
                    <p className="text-gray-600">49 private rooms in total</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#8FA8D6]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#3B5EA6]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Capacity</p>
                    <p className="text-gray-600">Up to 35 people in private rooms</p>
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
              <div className="aspect-[4/3] bg-gradient-to-br from-[#8FA8D6]/30 to-[#C5D2EC]/30 rounded-2xl flex items-center justify-center">
                <Building2 className="w-32 h-32 text-[#3B5EA6]/20" />
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

      {/* Office Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Floor Layout & Office Types
            </h2>
            <p className="text-lg text-gray-600">
              Choose the perfect workspace solution for your business needs
            </p>

            <div className="p-4 my-4 bg-yellow-50 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Note: </strong>
                Initial costs include contract fee, security deposit, first month usage fee, common service fee, security card fee, and tax.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {officeTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow relative"
              >
                <div className="absolute top-6 right-6">
                  <div className="relative group">
                    <InfoIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Please contact us for details.
                      <div className="absolute top-full right-0 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#8FA8D6]/30 rounded-xl flex items-center justify-center">
                    <type.icon className="w-7 h-7 text-[#3B5EA6]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {type.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities & Services */}
      <section className="pb-20 bg-gray-50">
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
      <section className="pb-20 bg-gray-50">
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
      <section className="py-20 bg-gradient-to-r from-[#1B3A8C] to-[#3B5EA6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Service Office Inquiry
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Contact us to learn more about our office spaces at Tower 6789
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <a
              href="tel:+63288013417"
              className="flex items-center justify-center gap-3 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#1B3A8C]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Call Us</p>
                <p className="text-2xl font-bold text-[#1B3A8C]">+63 2 8801-3417</p>
                <p className="text-sm text-gray-500">Mon-Fri 9:00-18:00 (PH Time)</p>
              </div>
            </a>

            <a
              href="mailto:sales@heroph.net"
              className="flex items-center justify-center gap-3 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#1B3A8C]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Email Us</p>
                <p className="text-xl font-bold text-[#1B3A8C]">sales@heroph.net</p>
                <p className="text-sm text-gray-500">We reply within 24 hours</p>
              </div>
            </a>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-[#3B5EA6] transition-colors"
          >
            Send Inquiry
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}