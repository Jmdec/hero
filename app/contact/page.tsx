"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Globe,
  Camera,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export default function ContactPage() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: Phone,
      title: t("contact.info.phone") as string,
      details: Array.isArray(t("contact.info.phoneNumbers")) ? t("contact.info.phoneNumbers") as unknown as string[] : [t("contact.info.phoneNumbers") as string],
      action: { label: t("contact.info.callNow") as string, href: "tel:+63288013417" },
    },
    {
      icon: Mail,
      title: t("contact.info.email") as string,
      details: Array.isArray(t("contact.info.emailAddresses")) ? t("contact.info.emailAddresses") as unknown as string[] : [t("contact.info.emailAddresses") as string],
      action: { label: t("contact.info.sendEmail") as string, href: "mailto:sales@heroph.net" },
    },
    {
      icon: MapPin,
      title: t("contact.info.address") as string,
      details: Array.isArray(t("contact.info.addressDetails")) ? t("contact.info.addressDetails") as unknown as string[] : [t("contact.info.addressDetails") as string],
      action: { label: t("contact.info.getDirections") as string, href: "https://goo.gl/maps/location" },
    },
    {
      icon: Clock,
      title: t("contact.info.businessHours") as string,
      details: Array.isArray(t("contact.info.hoursDetails")) ? t("contact.info.hoursDetails") as unknown as string[] : [t("contact.info.hoursDetails") as string],
    },
  ];

  const socialLinks = [
    { icon: Globe, label: "Facebook", href: "https://facebook.com/herophilippines", color: "bg-blue-600" },
    { icon: Camera, label: "Instagram", href: "https://instagram.com/herophilippines", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { icon: MessageCircle, label: "TikTok", href: "https://tiktok.com/@herophilippines", color: "bg-black" },
  ];

  const inquiryTypes = [
    { value: "", label: t("contact.form.selectInquiry") as string },
    { value: "general", label: t("contact.form.general") as string },
    { value: "office-rental", label: t("contact.form.officeRental") as string },
    { value: "meeting-room", label: t("contact.form.meetingRoom") as string },
    { value: "virtual-office", label: t("contact.form.virtualOffice") as string },
    { value: "tour", label: t("contact.form.tour") as string },
    { value: "support", label: t("contact.form.support") as string },
    { value: "partnership", label: t("contact.form.partnership") as string },
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

  const faqData = Array.isArray(t("contact.faq.questions"))
    ? (t("contact.faq.questions") as unknown as Array<{
        q: string;
        a: string;
      }>)
    : [
        {
          q: "How quickly can I move in?",
          a: "You can move in immediately after completing the reservation and payment process, usually within 24 hours.",
        },
        {
          q: "Do you offer short-term leases?",
          a: "Yes, we offer flexible lease terms starting from 1 month for serviced offices.",
        },
        {
          q: "Is there parking available?",
          a: "Yes, we have dedicated parking spaces for tenants and visitors at Tower 6789.",
        },
        {
          q: "Do you provide Japanese-speaking staff?",
          a: "Yes, we have bilingual staff fluent in Japanese and English to assist you.",
        },
      ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("contact.hero.title") as string}
            </h1>
            <p className="text-xl text-gray-300">
              {t("contact.hero.subtitle") as string}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-2xl hover:bg-[#C5D2EC]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-[#1B3A8C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {info.title}
                </h3>
                <div className="space-y-1 text-gray-600 text-sm">
                  {info.details.map((detail, i) => (
                    <p key={i}>{detail}</p>
                  ))}
                </div>
                {info.action && (
                  <a
                    href={info.action.href}
                    className="inline-block mt-4 text-[#1B3A8C] font-medium text-sm hover:text-[#3B5EA6]"
                  >
                    {info.action.label} →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
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
                {t("contact.form.title") as string}
              </h2>
              <p className="text-gray-600 mb-8">
                {t("contact.form.subtitle") as string}
              </p>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{t("contact.form.success") as string}</p>
                    <p className="text-sm text-green-700">
                      {t("contact.form.successDesc") as string}
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
                    <p className="font-medium text-red-900">{t("contact.form.error") as string}</p>
                    <p className="text-sm text-red-700">
                      {t("contact.form.errorDesc") as string}
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
                      {t("contact.form.name") as string} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("contact.form.email") as string} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
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
                      {t("contact.form.phone") as string}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("contact.form.company") as string}
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiryType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.form.inquiryType") as string} *
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent"
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
                    {t("contact.form.message") as string} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                    {t("contact.form.newsletter") as string}
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
                      {t("contact.form.sending") as string}
                    </>
                  ) : (
                    <>
                      {t("contact.form.sendMessage") as string}
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-2xl overflow-hidden aspect-video">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C5D2EC]/50 to-[#8FA8D6]/30">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-[#1B3A8C]/30 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Tower 6789, Ayala Avenue</p>
                    <p className="text-gray-500 text-sm">Makati City, Philippines</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="p-6 bg-white rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("contact.social.title") as string}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("contact.social.subtitle") as string}
                </p>
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 ${social.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-6 bg-[#C5D2EC]/30 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("contact.quickActions.title") as string}
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/reservation"
                    className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 bg-[#C5D2EC]/50 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#1B3A8C]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t("contact.quickActions.reservation") as string}</p>
                      <p className="text-sm text-gray-600">{t("contact.quickActions.reservationDesc") as string}</p>
                    </div>
                  </Link>
                  <Link
                    href="/virtual-tour"
                    className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 bg-[#8FA8D6]/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#3B5EA6]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t("contact.quickActions.virtualTour") as string}</p>
                      <p className="text-sm text-gray-600">{t("contact.quickActions.virtualTourDesc") as string}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("contact.faq.title") as string}
            </h2>
            <p className="text-gray-600">
              {t("contact.faq.subtitle") as string}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-2xl"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
