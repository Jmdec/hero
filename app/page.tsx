"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
  MapPin,
  Building2,
  Users,
  Headset,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
} from "lucide-react";
import { useLanguage } from "../components/LanguageProvider";

export default function Home() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "/tower6789.jpg",
      location: "Tower 6789, Ayala Avenue, Makati City",
    },
    {
      image: "/insular_life.jpg",
      location: "Insular Life Building, Ayala Avenue, Makati City",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const features = [
    {
      icon: MapPin,
      title: t("home.features.excellentLocation") as string,
      description: t("home.features.excellentLocationDesc") as string,
    },
    {
      icon: Users,
      title: t("home.features.fullSupport") as string,
      description: t("home.features.fullSupportDesc") as string,
    },
    {
      icon: Building2,
      title: t("home.features.comfortableSpace") as string,
      description: t("home.features.comfortableSpaceDesc") as string,
    },
    {
      icon: Headset,
      title: t("home.features.professionalSupport") as string,
      description: t("home.features.professionalSupportDesc") as string,
    },
  ];

  const services = [
    {
      title: t("home.services.privateOffices") as string,
      description: t("home.services.privateOfficesDesc") as string,
      image: "/office-1.jpg",
    },
    {
      title: t("home.services.sharedOffices") as string,
      description: t("home.services.sharedOfficesDesc") as string,
      image: "/shared-office.jpg",
    },
    {
      title: t("home.services.coworking") as string,
      description: t("home.services.coworkingDesc") as string,
      image: "/coworking.jpg",
    },
    {
      title: t("home.services.virtualOffices") as string,
      description: t("home.services.virtualOfficesDesc") as string,
      image: "/virtual-office.jpg",
    },
    {
      title: t("home.services.conferenceRooms") as string,
      description: t("home.services.conferenceRoomsDesc") as string,
      image: "/conference.jpg",
    },
  ];
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[700px]">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <Image
              key={index}
              src={slide.image}
              alt={slide.location}
              fill
              className={`absolute inset-0 object-cover transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
              priority={index === 0}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t("home.hero.title") as string}{" "}
              <span className="text-[#8FA8D6]">{t("home.hero.highlight") as string}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
              {t("home.hero.description") as string}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/virtual-tour"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                <Play className="w-5 h-5" />
                {t("home.hero.virtualTour") as string}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3B5EA6] text-white rounded-full font-semibold hover:bg-[#5C7ABF] transition-colors"
              >
                {t("home.hero.getQuote") as string}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 pt-10 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm text-gray-400">{t("home.hero.yearsExperience") as string}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-gray-400">{t("home.hero.companiesServed") as string}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-gray-400">{t("home.hero.satisfactionRate") as string}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-8 left-8 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{heroSlides[currentSlide].location}</span>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 right-8 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-4 bg-[#F5F5F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 bg-[#F5F5F3] rounded-2xl hover:bg-[#C5D2EC]/30 transition-colors"
              >
                <div className="w-14 h-14 bg-[#1B3A8C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("home.services.title") as string}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                {t("home.services.subtitle") as string}
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 mt-4 md:mt-0 text-[#1B3A8C] font-semibold hover:text-[#3B5EA6]"
            >
              {t("home.services.viewAll") as string}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-[#C5D2EC]/50 to-[#8FA8D6]/30 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-[#1B3A8C]/30" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <Link
                      href="/reservation"
                      className="text-sm font-medium text-gray-900 hover:text-[#1B3A8C] transition-colors"
                    >
                      Reserve Now →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t("home.benefits.title") as string}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t("home.benefits.subtitle") as string}
              </p>
              <ul className="space-y-4">
                {(t("home.benefits.benefitsList") as unknown as string[]).map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1B3A8C] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#C5D2EC]/30 to-[#8FA8D6]/20 rounded-2xl flex items-center justify-center">
                <Building2 className="w-48 h-48 text-[#1B3A8C]/10" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#1B3A8C]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t("home.benefits.readyToUse") as string}</div>
                    <div className="text-sm text-gray-600">{t("home.benefits.moveInImmediately") as string}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1B3A8C] to-[#3B5EA6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("home.cta.title") as string}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t("home.cta.subtitle") as string}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              {t("home.cta.makeReservation") as string}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              {t("home.cta.contactUs") as string}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
