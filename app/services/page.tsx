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
import { useLanguage } from "../../components/LanguageProvider";

export default function ServicesPage() {
  const { t } = useLanguage();

  const moveInSteps = [
    { step: 1, title: t("services.moveInFlow.step1") as string, description: t("services.moveInFlow.step1Desc") as string },
    { step: 2, title: t("services.moveInFlow.step2") as string, description: t("services.moveInFlow.step2Desc") as string },
    { step: 3, title: t("services.moveInFlow.step3") as string, description: t("services.moveInFlow.step3Desc") as string },
    { step: 4, title: t("services.moveInFlow.step4") as string, description: t("services.moveInFlow.step4Desc") as string },
    { step: 5, title: t("services.moveInFlow.step5") as string, description: t("services.moveInFlow.step5Desc") as string },
    { step: 6, title: t("services.moveInFlow.step6") as string, description: t("services.moveInFlow.step6Desc") as string },
  ];
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5C7ABF]/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("services.hero.title") as string}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Our Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("services.locations.title") as string}
            </h2>
            <p className="text-lg text-gray-600">
              {t("services.locations.subtitle") as string}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tower 6789 Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#1B3A8C] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("services.locations.tower6789") as string}</h3>
                    <p className="text-sm text-[#1B3A8C] font-medium">{t("services.locations.tower6789Location") as string}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{t("services.locations.tower6789Address") as string}</p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.tower6789Feature1") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.tower6789Feature2") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.tower6789Feature3") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.tower6789Feature4") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.tower6789Feature5") as string}</span>
                  </li>
                </ul>
                <Link
                  href="/services/tower-6789"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#1B3A8C] text-white rounded-xl font-semibold hover:bg-[#3B5EA6] transition-colors"
                >
                  {t("services.locations.tower6789Cta") as string}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Insular Life Building Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#1B3A8C] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("services.locations.insularLife") as string}</h3>
                    <p className="text-sm text-[#3B5EA6] font-medium">{t("services.locations.insularLifeLocation") as string}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{t("services.locations.insularLifeAddress") as string}</p>
              </div>
              
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.insularLifeFeature1") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.insularLifeFeature2") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.insularLifeFeature4") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.insularLifeFeature5") as string}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t("services.locations.insularLifeFeature6") as string}</span>
                  </li>
                </ul>
                <Link
                  href="/services/insular-life"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#1B3A8C] text-white rounded-xl font-semibold hover:bg-[#3B5EA6] transition-colors"
                >
                  {t("services.locations.insularLifeCta") as string}
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("services.moveInFlow.title") as string}
            </h2>
            <p className="text-lg text-gray-600">
              {t("services.moveInFlow.subtitle") as string}
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
