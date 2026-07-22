"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  MapPin,
  Building2,
  Users,
  Headset,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  Quote,
  AlertCircle,
  Inbox,
} from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  rating: number;
  quote: string;
  status: "pending" | "approved" | "rejected";
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const FEATURED_COUNT = 3;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [servicesLoading, setServicesLoading] = useState(true);

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

  const features = [
    {
      icon: MapPin,
      title: "Excellent Location",
      description:
        "Conveniently located along Ayala Avenue, the central business district of Makati City.",
    },
    {
      icon: Users,
      title: "Full Support System",
      description:
        "We provide comprehensive support to ensure your business runs smoothly.",
    },
    {
      icon: Building2,
      title: "Comfortable Office Space",
      description:
        "Spacious and well-equipped office spaces designed to enhance your productivity.",
    },
    {
      icon: Headset,
      title: "Professional Support",
      description:
        "Professional assistance available to support your business needs.",
    },
  ];

  const services = [
    {
      title: "Private Offices",
      description:
        "Private offices designed for individual professionals and small teams.",
      image: "private-space.jpg",
    },
    {
      title: "Virtual Offices",
      description:
        "Remote office solutions for businesses that need flexibility and scalability.",
      image: "virtual-office.jpg",
    },
    {
      title: "Co-working Spaces",
      description:
        "Flexible workspaces designed for freelancers and entrepreneurs.",
      image: "co-working.jpg",
    },
    {
      title: "Meeting Rooms",
      description:
        "Professional meeting spaces equipped with the latest technology.",
      image: "meeting-space.jpg",
    },
    {
      title: "Event Space",
      description:
        "Versatile event spaces ideal for seminars, workshops, networking events, and corporate gatherings.",
      image: "event-space.jpg",
    },
  ];

  const benefits = [
    "High-speed internet and WiFi connectivity",
    "24/7 security and access control",
    "Professional reception and mail handling",
    "Meeting rooms with video conferencing",
    "Cafe and lounge areas",
    "Japanese-speaking support staff",
    "Printing and copying facilities",
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadTestimonials() {
      setLoading(true);
      setLoadError(null);

      try {
        const res = await fetch("/api/testimonials", { cache: "no-store" });

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data ?? []);

        if (!cancelled) {
          const approved = list.filter(
            (t: Testimonial) => t.status === "approved",
          );
          setTestimonials(approved);
        }
      } catch (err) {
        console.error("Testimonials fetch failed:", err);
        if (!cancelled) {
          setLoadError(
            "We couldn't load testimonials right now. Check your connection and try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []); // fixed: was missing the dependency array, causing a fetch loop on every render

  const featuredTestimonials = testimonials.slice(0, FEATURED_COUNT);

  // Services are static content, but the section still shows a brief skeleton
  // state so the page doesn't pop in abruptly and stays consistent with the
  // loading UX used elsewhere on the page.
  useEffect(() => {
    const timer = setTimeout(() => setServicesLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden ">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <Image
              key={index}
              src={slide.image}
              alt={slide.location}
              fill
              className={`absolute inset-0 object-cover transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
              priority={index === 0}
            />
          ))}
          <div className="absolute inset-0 bg-linear-to-l from-black/80 via-black/60 to-black/80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl pb-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Gateway to Business Success in the <br />
              <span className="text-[#8FA8D6]">Philippines</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Premium serviced offices in the heart of Makati City. <br />
              Perfect for Japanese companies expanding into the Philippines
              market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/virtual-tour"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5" />
                Virtual Tour
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFC107] text-[#1B3A8C] rounded-full font-bold hover:bg-[#FFC107]/80 transition-colors"
              >
                Contact Us
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 pt-10 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm text-gray-400">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-gray-400">Companies Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-gray-400">Satisfaction Rate</div>
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
              className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? "bg-white w-6" : "bg-white/50"
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
                className="group p-6 bg-[#F5F5F3] rounded-2xl"
              >
                <div className="w-14 h-14 bg-[#1B3A8C] rounded-xl flex items-center justify-center mb-4">
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
      {servicesLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              {/* Image Skeleton */}
              <div className="aspect-video bg-gray-200 animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-6 space-y-4">
                <div className="h-6 w-2/3 rounded bg-gray-200 animate-pulse" />

                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                </div>

                <div className="pt-2">
                  <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="py-14 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Services
                </h2>
                <p className="text-lg text-gray-600">
                  We offer a range of flexible office solutions to meet the unique
                  needs of your business.
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 mt-4 md:mt-0 text-[#1B3A8C] font-semibold hover:text-[#FFC107]"
              >
                View All Services
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {servicesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: services.length }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="relative aspect-video bg-gray-100" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 w-2/3 rounded bg-gray-100" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                      <div className="h-3 w-4/5 rounded bg-gray-100" />
                      <div className="h-3 w-1/3 rounded bg-gray-100 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 bg-opacity-50 group-hover:opacity-100"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gray-400/20" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <Link
                          href="/quotation"
                          className="text-md font-bold text-[#1B3A8C] hover:text-[#FFC107] hover:underline transition-colors"
                        >
                          Get Quotation →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our offices come fully equipped with modern facilities and
                amenities to ensure your business operates smoothly from day
                one.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1B3A8C] shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <Link
                  href="/about"
                  className="rounded-full bg-[#FFC107] px-5 py-4 font-bold text-[#1B3A8C] transition hover:bg-transparent hover:text-[#1B3A8C] hover:border-[#FFC107] hover:border"
                >
                  Learn More
                </Link>

                <Link
                  href="/services"
                  className="rounded-full border border-[#FFC107] px-5 py-4 font-bold text-[#1B3A8C] transition hover:bg-[#FFC107] hover:text-[#1B3A8C]"
                >
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/_ARM8120.jpg"
                  alt="Office interior"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gray-400/20" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#1B3A8C]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Ready to Use
                    </div>
                    <div className="text-sm text-gray-600">
                      Move in immediately with all amenities provided.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Clients Say
              </h2>
              <p className="text-lg text-gray-600">
                Trusted by growing companies in Makati
              </p>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: FEATURED_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className="h-5 w-5 rounded-full bg-gray-100"
                        />
                      ))}
                    </div>
                    <div className="h-8 w-8 rounded bg-gray-100" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 rounded bg-gray-100 w-full" />
                    <div className="h-3 rounded bg-gray-100 w-full" />
                    <div className="h-3 rounded bg-gray-100 w-2/3" />
                  </div>
                  <div className="border-t border-gray-100 pt-5 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gray-100 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                      <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && loadError && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">{loadError}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !loadError && featuredTestimonials.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                <Inbox className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                No testimonials yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Be the first to share your experience at Hero Serviced Office.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !loadError && featuredTestimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTestimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-5 w-5 fill-[#1B3A8C] text-[#1B3A8C]"
                        />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-gray-100 fill-gray-100" />
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-[#1B3A8C] flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-white">
                          {getInitials(t.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t.title}
                          {t.company ? ` · ${t.company}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="py-12 flex items-center justify-center">
            <Link
              href="/testimonial"
              className="inline-flex items-center gap-2 mt-4 md:mt-0 bg-[#FFC107] text-[#1B3A8C] rounded-lg px-6 py-3 font-bold hover:bg-[#FFC107]/80"
            >
              View All Testimonials
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-[#0D47A1] to-[#00ACC1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Business in the Philippines?
          </h2>
          <p className="text-md text-white/90 mb-8">
            Contact us today for a personalized tour and discover the perfect
            office solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quotation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Get a Quote →
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}