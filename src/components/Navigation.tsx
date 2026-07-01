"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
// import UserProfileDropdown from "./UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/virtual-tour", label: "Virtual Tour" },
  { href: "/announcement", label: "What's New" },
  { href: "/testimonial", label: "Client's Stories" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/header_logo_manila.png"
              alt="HERO Serviced Office"
              width={150}
              height={50}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.filter(link => link.href?.trim()).map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? "text-[#1B3A8C] bg-[#C5D2EC]/30"
                      : "text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#1B3A8C]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Language switcher + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            {/* {isAuthenticated ?
              <UserProfileDropdown /> :
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="px-7 py-2.5 text-sm font-medium text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 border border-[#3B5EA6] rounded-full transition-colors"
              >
                Login
              </Link>
            } */}
            <Link
              href="/quotation"
              className="px-5 py-2.5 bg-[#1B3A8C] text-white font-medium text-sm rounded-full hover:bg-[#3B5EA6] transition-colors"
            >
              Get a Quote
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.filter(link => link?.href?.trim()).map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      active
                        ? "text-[#1B3A8C] bg-[#C5D2EC]/30"
                        : "text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A8C] shrink-0" />
                    )}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-100">
                {/* {isAuthenticated ? (
                  <div className="px-4 py-3">
                    <UserProfileDropdown />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                )} */}
                <Link
                  href="/quotation"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center mt-2 px-5 py-3 bg-[#1B3A8C] text-white font-medium rounded-full hover:bg-[#3B5EA6] transition-colors"
                >
                  Get a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}