"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Globe,
  Camera,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+63288013417"],
      action: { label: "Call Now", href: "tel:+63288013417" },
    },
    {
      icon: Mail,
      title: "Email",
      details: ["sales@heroph.net"],
      action: { label: "Send Email", href: "mailto:sales@heroph.net" },
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM"],
    },
  ];

  const inquiryTypes = [
    { value: "", label: "Select Inquiry Type" },
    { value: "general", label: "General Inquiry" },
    { value: "office-rental", label: "Office Rental" },
    { value: "meeting-room", label: "Meeting Room" },
    { value: "virtual-office", label: "Virtual Office" },
    { value: "tour", label: "Tour" },
    { value: "support", label: "Support" },
    { value: "partnership", label: "Partnership" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    message: "",
    newsletter: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate API call for email notification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would send data to your backend/API
    // which would trigger email notifications to admin and confirmation to user
    setIsSubmitting(false);
    setSubmitStatus("success");

    // Reset form after successful submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      inquiryType: "",
      message: "",
      newsletter: false,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const faqTabs = [
    {
      id: "service",
      label: "About HERO Serviced Office",
      faqs: [
        {
          q: "What are the advantages of serviced offices?",
          a: "HERO Serviced Office is equipped with the facilities and services necessary to start a business, so the initial cost of opening an office can be reduced and business can be started immediately. You can also flexibly choose the size of the room and the period of use according to your purpose.",
        },
        {
          q: "Where is the office located?",
          a: "HERO Serviced Office is conveniently located near Ayala Triangle Park along Ayala Avenue, the main street in Makati City, Metro Manila, Philippines.",
        },
        {
          q: "What is the surrounding environment like?",
          a: "Our offices are located in Makati City — the economic center of the Philippines, often called the Wall Street of the Philippines. Many Japanese and foreign companies have offices nearby. Access from the airport takes about 20 minutes, and there are restaurants from various countries and large shopping malls in the area.",
        },
        {
          q: "Do you have Japanese-speaking staff?",
          a: "Yes. Japanese expatriates and staff who can speak Japanese are stationed at our offices.",
        },
        {
          q: "Can a serviced office be used as a business registration (SEC) address?",
          a: "Yes, it is possible. If you need address registration for corporate registration (SEC registration), please let us know and we will provide the necessary documents.",
        },
        {
          q: "What is the contract period?",
          a: "The contract period can start from 1 month. The contract form is a service use contract.",
        },
        {
          q: "What is the smoking policy?",
          a: "Smoking is prohibited in all office buildings.",
        },
      ],
    },
    {
      id: "payment",
      label: "Contract & Payment",
      faqs: [
        {
          q: "What documents are required for a service office contract?",
          a: "A review is required before signing. For corporate contracts: examination application form, SEC registration certificate (or Japan company registration for pre-establishment), and a copy of the representative's passport. For personal contracts: examination application form, business description, and photo ID of all users.",
        },
        {
          q: "What currency is used for payment?",
          a: "Payment is made in Philippine Pesos (PHP). You can also pay in Japanese Yen or US Dollars.",
        },
        {
          q: "How do I pay monthly?",
          a: "We send an invoice every month. You can pay by cash, check, or bank transfer — whichever is convenient for you.",
        },
        {
          q: "Will the contract fee be refunded when I move out?",
          a: "No. The contract fee includes the basic setup fee for the office and is non-refundable.",
        },
        {
          q: "Are electricity and internet usage charged separately?",
          a: "No. The monthly usage fee (rent and common service fee) includes electricity and internet usage (shared line). There are no additional charges for these.",
        },
      ],
    },
    {
      id: "rooms",
      label: "Private Rooms",
      faqs: [
        {
          q: "What types of private rooms are available?",
          a: "TOWER6789 MAKATI offers rooms for 1 to a maximum of 12 people. INSULAR LIFE BUILDING MAKATI offers rooms for 3 to a maximum of 35 people. Please see each floor layout for details.",
        },
        {
          q: "What facilities are in the private rooms?",
          a: "All private rooms are equipped with desks, cabinets, and wireless and wired internet access.",
        },
        {
          q: "Are there spaces other than private rooms?",
          a: "Yes. There is a shared office with booth-type desks for individual use. Shared spaces include a reception area, cafe area, lounge area, and meeting space.",
        },
        {
          q: "What services come with a private room contract?",
          a: "Private room tenants can use the reception service, cafe area, lounge area, and wireless/wired internet access at no extra charge. Optional services include telephone lines, telephone answering service, parking, cloud services, and multifunction device usage.",
        },
      ],
    },
    {
      id: "facilities",
      label: "Services & Facilities",
      faqs: [
        {
          q: "Can I get a dedicated phone number?",
          a: "Yes. A landline phone is available as an optional service for PHP 2,400/month (excl. VAT). Call charges are billed at actual cost.",
        },
        {
          q: "Can staff answer calls on my behalf?",
          a: "Yes. A telephone answering service is available for PHP 2,000/month (excl. VAT). The phone number acquisition fee is charged separately.",
        },
        {
          q: "Is the office available 24 hours a day?",
          a: "Yes. You can enter and leave the office anytime, 24 hours a day, 365 days a year. However, staff and receptionists are available Monday–Friday during Philippine business hours, and are closed on weekends, Philippine holidays, and year-end/New Year holidays.",
        },
        {
          q: "Can I use the meeting space?",
          a: "Yes. Meeting spaces are available in hourly increments for a fee.",
        },
        {
          q: "Is there a rest area with free drinks?",
          a: "Yes. Coffee and mineral water are available free of charge in the shared cafe and lounge areas. A paid vending machine is also available.",
        },
        {
          q: "Is parking available?",
          a: "Yes. Please contact us as there are vehicle restrictions and subject to availability.",
        },
        {
          q: "Can I use a printer or scanner?",
          a: "Yes. You can use a multifunction machine that supports copying, scanning, and printing.",
        },
        {
          q: "Can mail be forwarded for Virtual Office users?",
          a: "Yes. Mail arriving at the service office can be forwarded to a pre-designated address. A fixed monthly fee plus actual postage costs apply.",
        },
      ],
    },
  ];

  function FaqItem({ faq }: { faq: { q: string; a: string } }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
          <ChevronDown
            className={`w-5 h-5 text-[#1B3A8C] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="px-6 py-4 text-md text-gray-600 bg-gray-50 border-t border-gray-200">
                {faq.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function FaqTabs() {
    const [activeTab, setActiveTab] = useState("service");
    const active = faqTabs.find((t) => t.id === activeTab)!;

    return (
      <div>
        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {faqTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                  ? "bg-[#1B3A8C] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {active.faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

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
              Contact Us
            </h1>
            <p className="text-xl text-gray-300">
              Reach out to us for inquiries, reservations, or support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours
              </p>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Message sent successfully! We'll get back to you soon.</p>
                    <p className="text-sm text-green-700">
                      Thank you for reaching out to us. We appreciate your interest in HERO Serviced Office.
                    </p>
                  </div>
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Failed to send message. Please try again or contact us directly.</p>
                    <p className="text-sm text-red-700">
                      Thank you for your message. We apologize for any inconvenience and will respond to you as soon as possible.
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiryType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Inquiry Type *
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#1B3A8C] border-gray-300 rounded focus:ring-[#1B3A8C]"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Subscribe to our newsletter
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-4 bg-[#1B3A8C] text-white rounded-full font-semibold hover:bg-[#3B5EA6] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map & Contact Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map Card */}
              <div className="group relative overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-xl">
                <div className="absolute inset-0 bg-linear-to-tr from-[#1B3A8C]/10 via-transparent to-[#C5D2EC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src="/hero-map.png"
                    alt="Map Location"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>

                {/* Floating Location Badge */}
                <div className="absolute bottom-5 left-5 z-20 backdrop-blur-xl bg-white/90 border border-white/40 shadow-lg rounded-2xl px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1B3A8C]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#1B3A8C]" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                        Office Location
                      </p>

                      <h3 className="font-semibold text-gray-900">
                        HERO Serviced Office
                      </h3>

                      <p className="text-sm text-gray-600">
                        Makati City, Philippines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div >
      </section >

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqTabs />
        </div>
      </section>
    </div >
  );
}
