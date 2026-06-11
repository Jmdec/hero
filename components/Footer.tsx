'use client';

import Link from 'next/link';
import Image from 'next/image'
import { Globe, Camera, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';

const socialLinks = [
  { href: 'https://facebook.com/herophilippines', icon: Globe, label: 'Facebook' },
  { href: 'https://instagram.com/herophilippines', icon: Camera, label: 'Instagram' },
  { href: 'https://tiktok.com/@herophilippines', icon: MessageCircle, label: 'TikTok' },
];

export default function Footer() {
  const quickLinks = [
    { href: '/about', label: "About Us" },
    { href: '/services', label: "Our Services" },
    { href: '/virtual-tour', label: "Virtual Tour" },
    { href: '/reservation', label: "Reservation" },
    { href: '/contact', label: "Contact Us" },
  ];

  const services = [
    { href: '/services', label: "Private Offices" },
    { href: '/services', label: "Conference Rooms" },
    { href: '/reservation', label: "Virtual Offices" },
    { href: '/reservation', label: "Meeting Rooms" },
  ];
  return (
    <footer className="bg-[#1A1A2E] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-[#1B3A8C] to-[#3B5EA6] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">HERO</span>
                <span className="text-sm text-gray-400 block -mt-1">Serviced Office</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your gateway to professional workspace solutions in Makati.
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
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
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
            <h3 className="text-white font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href={service.href}
                    className="text-sm hover:text-[#5C7ABF] transition-colors"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#5C7ABF] shrink-0 mt-0.5" />
                <span className="text-sm">
                  23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#5C7ABF] shrink-0 mt-0.5" />
                <span className="text-sm">
                  11F Insular Life Building, 6781 Ayala Avenue Corner Paseo de Roxas Ave., Makati City, Metro Manila, Philippines.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#5C7ABF]" />
                <a
                  href="tel:+63-(0)2-8801-3417"
                  className="text-sm hover:text-[#5C7ABF] transition-colors"
                >
                  +63-(0)2-8801-3417
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#5C7ABF]" />
                <a
                  href="mailto:sales@heroph.net"
                  className="text-sm hover:text-[#5C7ABF] transition-colors"
                >
                  sales@heroph.net
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-col items-center gap-2">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} HERO Serviced Office. All rights reserved.
              </p>
              <span className="text-sm text-gray-500">Powered by&nbsp; 
                <a href="https://www.infinitechphil.com/" className="hover:text-[#5C7ABF] transition-colors underline">Infinitech Advertising Corporation</a>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-[#5C7ABF] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#5C7ABF] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
