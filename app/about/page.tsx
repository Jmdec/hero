"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Building2,
  Target,
  Eye,
  Award,
  Users,
  Globe,
  Clock,
  Shield,
  MapPin,
  Navigation,
  Plane,
  Landmark,
  Store,
  Trees,
  Utensils,
  Train,
  ExternalLink,
  Link,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description:
        "We deliver exceptional quality in every aspect of our service.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We build trust through transparency and ethical practices.",
    },
    {
      icon: Users,
      title: "Customer First",
      description:
        "Your success is our priority, and we're dedicated to exceeding expectations.",
    },
    {
      icon: Globe,
      title: "Global Standards",
      description:
        "We maintain international quality benchmarks in all our facilities.",
    },
  ];

  const stats = [
    { number: "15+", label: "Years of Experience" },
    { number: "500+", label: "Companies Served" },
    { number: "2", label: "Prime Locations" },
    { number: "50+", label: "Team Members" },
  ];

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

  const nearbyLandmarks = [
    {
      icon: Plane,
      name: "Ninoy Aquino International Airport",
      description: "Main international gateway for flights worldwide",
      distance: "10 km",
    },
    {
      icon: Landmark,
      name: "Ayala Museum",
      description:
        "Premier cultural institution showcasing Filipino art and history",
      distance: "0.5 km",
    },
    {
      icon: Building2,
      name: "Ayala Triangle Gardens",
      description:
        "Scenic urban park perfect for walking breaks and outdoor events",
      distance: "0.3 km",
    },
    {
      icon: Building2,
      name: "PSE Center",
      description:
        "Home of the Philippine Stock Exchange, the country's financial hub",
      distance: "0.4 km",
    },
    {
      icon: Store,
      name: "Greenbelt Mall",
      description:
        "World-class shopping complex with luxury brands and fine dining",
      distance: "0.6 km",
    },
    {
      icon: Trees,
      name: "Legazpi Active Park",
      description:
        "Vibrant community park with weekend market and fitness activities",
      distance: "0.8 km",
    },
    {
      icon: Utensils,
      name: "Paseo Center",
      description:
        "Convenient food court offering diverse cuisine and retail options",
      distance: "0.7 km",
    },
    {
      icon: Train,
      name: "MRT Ayala Station",
      description:
        "Major transit hub connecting to key destinations across Metro Manila",
      distance: "0.9 km",
    },
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
              Your trusted partner for premium office solutions in the heart of
              Makati's business district.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="space-y-4 text-gray-600">
                <p>
                  HERO Serviced Office has been a leading provider of premium
                  office solutions in the Philippines for over 15 years. We
                  specialize in serviced offices, meeting rooms, and virtual
                  office services designed to meet the diverse needs of modern
                  businesses.
                </p>
                <p>
                  Our strategically located facilities in Makati's premier
                  business district offer unparalleled convenience,
                  accessibility, and professional environments that empower your
                  business to thrive.
                </p>
                <p>
                  With a commitment to excellence and customer satisfaction,
                  we've helped over 500 companies establish their presence in
                  the Philippines, from startups to multinational corporations.
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

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm"
              >
                <div className="text-4xl md:text-5xl font-bold text-[#1B3A8C] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 bg-[#C5D2EC]/30 rounded-2xl"
            >
              <div className="w-14 h-14 bg-[#1B3A8C] rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading provider of innovative and sustainable office
                solutions in the Philippines, setting the standard for
                excellence in workspace management and customer service.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-[#8FA8D6]/20 rounded-2xl"
            >
              <div className="w-14 h-14 bg-[#3B5EA6] rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To provide flexible, high-quality office solutions that empower
                businesses to succeed by combining world-class facilities with
                exceptional service and support.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C5D2EC] rounded-full text-sm text-[#1B3A8C] mb-6">
              <MapPin className="w-4 h-4" />
              Prime Business Locations
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Locations
            </h2>
            <p className="text-lg text-gray-600">
              Strategically positioned in the heart of Metro Manila's business
              district
            </p>
          </div>

          {/* Location Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {locations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <iframe
                    src={location.mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#1B3A8C] rounded-xl flex items-center justify-center">
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {location.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">{location.address}</p>
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#1B3A8C] text-[#1B3A8C] rounded-xl font-semibold hover:bg-[#C5D2EC]/30 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on Google Maps
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Nearby Landmarks */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Nearby Landmarks
            </h3>
            <p className="text-gray-600">
              Everything you need within walking distance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyLandmarks.map((landmark, index) => (
              <motion.div
                key={landmark.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-2xl hover:bg-[#C5D2EC]/30 transition-colors"
              >
                <landmark.icon className="w-8 h-8 text-[#1B3A8C] mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {landmark.name}
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  {landmark.description}
                </p>
                <div className="flex items-center gap-1 text-[#1B3A8C] text-sm font-medium">
                  <Navigation className="w-4 h-4" />
                  {landmark.distance}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-linear-to-r from-[#1B3A8C] to-[#3B5EA6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Why Choose Us
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Experience the difference with HERO Serviced Office
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
              <span className="flex gap-4 justify-center items-center mb-4">
                <Clock className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
              </span>
              <p className="text-gray-200">
                Access your workspace anytime, day or night, with secure entry
                systems.
              </p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
              <span className="flex gap-4 justify-center items-center mb-4">
                <Users className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bilingual Support</h3>
              </span>
              <p className="text-gray-200">
                Our team speaks both English and Japanese to serve your needs
                effectively.
              </p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
              <span className="flex gap-4 justify-center items-center mb-4">
                <Shield className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-2">Privacy & Security</h3>
              </span>
              <p className="text-gray-200">
                Your data and privacy are protected with our comprehensive
                security measures.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
