"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Briefcase,
  Move,
  ShieldCheck,
  Handshake,
  Scale,
  Gauge,
  Eye,
  Award,
} from "lucide-react";


export default function AboutPage() {
  const values = [
    {
      icon: Briefcase,
      title: "Professionalism",
      description:
        "We create and maintain work environments that reflect credibility, quality, and respect for business standards.",
    },
    {
      icon: Move,
      title: "Flexibility",
      description:
        "We design our services to adapt to the changing needs of modern businesses, whether they are scaling up, downsizing, or transitioning to new ways of working.",
    },
    {
      icon: ShieldCheck,
      title: "Reliability",
      description:
        "We ensure consistent service delivery and dependable workspace solutions that clients can rely on every day.",
    },
    {
      icon: Handshake,
      title: "Customer Commitment",
      description:
        "We prioritize understanding our clients’ needs and delivering solutions that support their goals and operations.",
    },
    {
      icon: Scale,
      title: "Integrity",
      description:
        "We operate with honesty, transparency, and fairness in every client relationship and business decision.",
    },
    {
      icon: Gauge,
      title: "Efficiency",
      description:
        "We simplify the way businesses work by providing complete workspace solutions that reduce operational burden and improve productivity.",
    },
  ];

  const whyHero = [
    { num: "01", title: "Prime Business Location", desc: "Located at the heart of the business district, HERO Serviced Office provides convenient access to major companies, transportation hubs, restaurants, and essential business establishments." },
    { num: "02", title: "Japanese & English Staff Support", desc: "Our professional team provides Japanese and English communication support to ensure smooth coordination and assistance for local and international clients." },
    { num: "03", title: "24/7 Office Access", desc: "Enjoy flexible working hours with round-the-clock access to your workspace whenever your business requires it." },
    { num: "04", title: "Fully Furnished, Ready to Use Offices", desc: "Move in and start working immediately with fully equipped private offices designed for productivity and convenience." },
    { num: "05", title: "Professional Corporate Environment", desc: "Create a strong business impression with a premium office setting that reflects professionalism and credibility." },
    { num: "06", title: "Flexible Office Solutions", desc: "Choose from various office options that can adapt to your company’s needs, whether for startups, growing businesses, or established companies." },
    { num: "07", title: "Dedicated Reception & Administrative Support", desc: "Receive professional front desk assistance and reliable administrative support to help manage your daily office operations." },
    { num: "08", title: "Meeting Rooms & Business Facilities", desc: "Conduct meetings and client presentations in well-equipped spaces designed for productive business discussions." },
    { num: "09", title: "Cost-Efficient Business Setup", desc: "Reduce the hassle and expenses of traditional office setup with a complete workspace solution that includes essential amenities." },
    { num: "10", title: "Reliable Internet & Office Amenities", desc: "Stay connected and productive with high-speed internet and essential office facilities prepared for your business needs." },
    { num: "11", title: "Ideal for Local & International Companies", desc: "A strategic workspace solution designed to support businesses expanding, establishing, or operating in the Philippines." },
    { num: "12", title: "Secure & Comfortable Workspace", desc: "Work with peace of mind in a safe, professional, and comfortable office environment built for business success." },
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
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto text-shadow-4xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About HERO Serviced Office
            </h1>
            <p className="text-xl text-gray-300">
              Your trusted partner for premium office solutions in the heart of Makati's business district
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-justify">
                <p>
                  HERO Serviced Office traces its roots to a Japan-based business group established with the
                  goal of developing service-oriented enterprises that support modern commercial activity. The
                  group initially operated across multiple business sectors, gradually building expertise in service
                  management, operational efficiency, and client-centered solutions.
                </p>
                <p>
                  In 2015, the serviced office division was formally established in response to the increasing
                  global demand for flexible workspace solutions. At a time when businesses were shifting toward
                  more agile and cost-efficient operating models, HERO introduced fully serviced office
                  environments that eliminated the complexity of traditional leasing structures.
                </p>
                <p>
                  Starting from its early operations in Japan, the company expanded its concept internationally,
                  refining its offerings to suit different business cultures and market environments. Over time, its
                  services evolved to include private offices, virtual office packages, coworking spaces, and
                  meeting facilities—forming a complete workspace ecosystem.
                </p>
                <p className="font-semibold">
                  Today, HERO Serviced Office continues to operate, focusing on service quality, operational
                  efficiency, and business enablement across diverse industries and markets.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
                  alt="Our office"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 bg-[#C5D2EC]/30 rounded-2xl"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#0D47A1] rounded-xl flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-justify">
                To be one of the most trusted serviced office providers in the Philippines, recognized for
                delivering reliable workspace solutions that support business growth and redefine how modern
                companies work in dynamic urban environments.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-[#8FA8D6]/20 rounded-2xl"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#0D47A1] rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-justify">
                To provide accessible, flexible, and fully serviced workspace solutions that empower
                businesses to operate efficiently, grow confidently, and establish a strong professional presence
                in the heart of Makati Citys
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-[#C5D2EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-[#1B3A8C]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}

      {/* Message from the President */}

      {/* Message from the Chairman */}

      {/* HERO Group of Companies */}

      {/* Why Choose HERO */}
      <section className="relative overflow-hidden bg-linear-to-r from-[#0A1E3F] to-[#1565C0] px-14 py-20">
        {/* Decorative Circle */}

        <div className="relative z-10">

          <h2 className="mb-12 text-center text-4xl font-extrabold leading-[1.2] tracking-[-0.01em] text-white">
            Why Choose HERO?
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {whyHero.map(({ num, title, desc }) => (
              <div
                key={num}
                className="rounded bg-white/5 border border-white/10 p-6"
              >
                <div className="flex items-center gap-5">
                  <div className="mb-2 text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#64B5F6]/35">
                    {num}
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-white">
                    {title}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-white/70">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
