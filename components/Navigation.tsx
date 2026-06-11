'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import LanguageSwitcher from './LanguageSwitcher';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { href: '/', label: t('navigation.home') as string },
    { href: '/about', label: t('navigation.about') as string },
    { href: '/services', label: t('navigation.services') as string },
    { href: '/virtual-tour', label: t('navigation.virtualTour') as string },
    { href: '/contact', label: t('navigation.contact') as string },
  ];


  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/header_logo_manila.png" alt="HERO Serviced Office" width={150} height={50} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            {/* {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <Link href="/login"
                className="px-5 py-2.5 bg-transparent hover:bg-[#C5D2EC]/30 text-[#1B3A8C] border border-[#1B3A8C] font-medium text-sm rounded-full">
                {t('navigation.login') as string}
              </Link>
            )} */}
            <Link
              href="/reservation"
              className="px-5 py-2.5 bg-[#1B3A8C] text-white font-medium text-sm rounded-full hover:bg-[#3B5EA6] transition-colors"
            >
              {t('navigation.reservation') as string}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="px-4 py-3">
                    <UserProfileDropdown />
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 rounded-lg transition-colors">
                    {t('navigation.login') as string}
                  </Link>
                )}
                <Link
                  href="/reservation"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center mt-2 px-5 py-3 bg-[#1B3A8C] text-white font-medium rounded-full hover:bg-[#3B5EA6] transition-colors"
                >
                  {t('navigation.reservation') as string}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
