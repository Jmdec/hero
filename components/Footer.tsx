'use client';

import Link from 'next/link';
import Image from 'next/image'
import { Globe, Camera, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

const socialLinks = [
  { href: 'https://facebook.com/herophilippines', icon: Globe, label: 'Facebook' },
  { href: 'https://instagram.com/herophilippines', icon: Camera, label: 'Instagram' },
  { href: 'https://tiktok.com/@herophilippines', icon: MessageCircle, label: 'TikTok' },
];

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { href: '/about', label: t('footer.quickLinks') as string },
    { href: '/services', label: t('footer.ourServices') as string },
    { href: '/virtual-tour', label: t('navigation.virtualTour') as string },
    { href: '/reservation', label: t('reservation.hero.title') as string },
    { href: '/contact', label: t('navigation.contact') as string },
  ];

  const services = [
    t('home.services.servicedOffices') as string,
    t('home.services.virtualOffices') as string,
    t('home.services.conferenceRooms') as string,
    t('reservation.form.virtualOffice') as string,
    t('reservation.form.meetingRoom') as string,
  ];
  return (
    <footer className="bg-[#1A1A2E] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A8C] to-[#3B5EA6] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">HERO</span>
                <span className="text-sm text-gray-400 block -mt-1">Serviced Office</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.tagline') as string}
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1B3A8C] transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks') as string}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#5C7ABF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.ourServices') as string}</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href="/services"
                    className="text-sm hover:text-[#5C7ABF] transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contactUs') as string}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#5C7ABF] flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  {Array.isArray(t('contact.info.addressDetails')) 
                    ? (t('contact.info.addressDetails') as unknown as string[]).join(', ')
                    : t('contact.info.addressDetails') as string}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#5C7ABF]" />
                <a
                  href="tel:+63288013417"
                  className="text-sm hover:text-[#5C7ABF] transition-colors"
                >
                  {Array.isArray(t('contact.info.phoneNumbers'))
                    ? (t('contact.info.phoneNumbers') as unknown as string[])[0]
                    : t('contact.info.phoneNumbers') as string}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#5C7ABF]" />
                <a
                  href="mailto:sales@heroph.net"
                  className="text-sm hover:text-[#5C7ABF] transition-colors"
                >
                  {Array.isArray(t('contact.info.emailAddresses'))
                    ? (t('contact.info.emailAddresses') as unknown as string[])[0]
                    : t('contact.info.emailAddresses') as string}
                </a>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">
                {t('footer.businessHours') as string}:<br />
                <span className="text-white">{t('footer.hours') as string}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {t('footer.copyright') as string}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-[#5C7ABF] transition-colors">
                {t('footer.privacyPolicy') as string}
              </Link>
              <Link href="/terms" className="hover:text-[#5C7ABF] transition-colors">
                {t('footer.termsOfService') as string}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
