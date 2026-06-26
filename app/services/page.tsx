"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Phone,
  CheckCircle2,
  ArrowRight,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function ServicesPage() {

  const locations = [
    {
      name: "Tower 6789",
      address: "23F Tower 6789 Ayala Avenue, Makati City, Metro Manila",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7200608897456!2d121.01756961072985!3d14.557994485864604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f304c137d%3A0x580219e924b84918!2sTower%206789!5e0!3m2!1sen!2sph!4v1781155754072!5m2!1sen!2sph",
      mapUrl:
        "https://maps.app.goo.gl/jAR9csHtx3PUmMFi6",
    },
    {
      name: "Insular Life Building",
      address: "11F Insular Life Building, Ayala Avenue, Makati, Metro Manila",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7349367396077!2d121.01852111072995!3d14.55714458586539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f31651de5%3A0xf2d7d4161752e079!2sHero%20Serviced%20Office!5e0!3m2!1sen!2sph!4v1781155861898!5m2!1sen!2sph",
      mapUrl:
        "https://maps.app.goo.gl/YJssvia5wSw1RMrx8",
    },
  ];

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
    "Opened April 2019",
    "24-hour air conditioning",
    "Meeting rooms up to 20 people",
    "Mailbox & locker room included",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="About HERO Serviced Office"
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
            className="w-full text-center mx-auto text-shadow-4xl"
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Locations
            </h2>
            <p className="text-lg text-gray-600">
              Choose the HERO PH location that best suits your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">

            {/* Tower 6789 Card */}
            <motion.div
              key="Tower 67889"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7200608897456!2d121.01756961072985!3d14.557994485864604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f304c137d%3A0x580219e924b84918!2sTower%206789!5e0!3m2!1sen!2sph!4v1781155754072!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View on Google Maps
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1B3A8C] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Tower 6789</h3>
                    <p className="text-sm text-[#1B3A8C] font-medium">23rd Floor, 6789 Ayala Avenue, Makati City</p>
                  </div>
                </div>
              </div>

              <div className="px-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{tower6789Features[0]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{tower6789Features[1]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{tower6789Features[2]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{tower6789Features[3]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{tower6789Features[4]}</span>
                  </li>
                </ul>
                <Link
                  href="/services/tower-6789"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 mb-5 bg-[#1B3A8C] text-white rounded-xl font-semibold hover:bg-[#3B5EA6] transition-colors"
                >
                  View Tower 6789 Makati
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Insular Life Building Card */}
            <motion.div
              key="Insular Life"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7349367396077!2d121.01852111072995!3d14.55714458586539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f31651de5%3A0xf2d7d4161752e079!2sHero%20Serviced%20Office!5e0!3m2!1sen!2sph!4v1781155861898!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View on Google Maps
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1B3A8C] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Insular Life Building</h3>
                    <p className="text-sm text-[#1B3A8C] font-medium">11th Floor, 6781 Ayala Avenue corner Paseo de Roxas, Makati</p>
                  </div>
                </div>
              </div>

              <div className="px-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{insularLifeFeatures[0]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{insularLifeFeatures[1]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{insularLifeFeatures[2]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{insularLifeFeatures[3]}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{insularLifeFeatures[4]}</span>
                  </li>
                </ul>
                <Link
                  href="/services/insular-life"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 mb-5 bg-[#1B3A8C] text-white rounded-xl font-semibold hover:bg-[#3B5EA6] transition-colors"
                >
                  View Insular Life Building
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Move-in Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Flow Until Moving In
            </h2>
            <p className="text-lg text-gray-600">
              Simple 6-step process to start using our office
            </p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#C5D2EC] hidden lg:block" />
            <div className="space-y-8">
              {moveInSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                >
                  <div className="flex-1 lg:text-right">
                    <div className={`bg-gray-50 rounded-2xl p-6 ${index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Step {item.step}: {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  {/* Step Number Circle */}
                  <div className="w-16 h-16 bg-[#1B3A8C] rounded-full flex items-center justify-center text-white text-2xl font-bold z-10 shadow-lg">
                    {item.step}
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-[#1B3A8C] to-[#3B5EA6]">
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
                <p className="text-2xl font-bold text-[#1B3A8C]">+63-(0)2-8801-3417</p>
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
                <p className="text-2xl font-bold text-[#1B3A8C]">sales@heroph.net</p>
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
