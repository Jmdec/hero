'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Close on Escape key
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-[#0A1E3F]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Privacy Policy Content 

function PrivacyPolicyContent() {
  return (
    <>
      <p>
        Thank you very much for using the services provided by Hero PH INC. (hereinafter,
        "we/our/us").
      </p>
      <p>
        The Privacy Policy (hereinafter, "the Policy") sets forth our privacy information handling
        principles. You or users are deemed to have agreed with the Policy if you use our services.
      </p>

      <Section title="(1) What is privacy information?">
        Privacy information includes both personal information; and history information and
        characteristic information. Personal information refers to the personal information
        prescribed in the Act on the Protection of Personal Information or information relating to a
        living individual, specifically the name, date of birth, address, telephone number and other
        contact information, and any other described information that can identify individuals.
        Information other than personal information corresponds to history and characteristic
        information, such as services used, products purchased, history of pages/ads viewed, search
        keywords used by users, time and date of use, methods of using, using environment, postal
        code, gender, occupation, age, user's IP address, cookie information, location information,
        and terminal identification information.
      </Section>

      <Section title="(2) How do you collect privacy information?">
        We may collect personal information when a user makes a user registration or use any of our
        services and/or history and characteristic information of a user when a user uses any of our
        services or views any of the pages of our website. If a user performs settings in such a way
        that the use of the services is linked with any external service, we will collect the ID to
        be used by the user in the external service and/or the information that the user agrees to
        disclose to the linked service under the external service's privacy settings.
      </Section>

      <Section title="(3) For what purpose do you use privacy information?">
        <ul className="list-[upper-alpha] list-inside space-y-2 mt-1">
          <li>To present registered information so that users can view and/or correct their registered information and view the status of use.</li>
          <li>To use an e-mail address to notify or contact users, or to send products to users.</li>
          <li>To use information such as name, date of birth, and address for user identity verification.</li>
          <li>To use payment-related information in order to charge users.</li>
          <li>To display registered information on input screens so that users can enter data easily.</li>
          <li>To refuse the use of the Service by users who violate the Terms of Use.</li>
          <li>To answer inquiries from users.</li>
          <li>To prepare statistical data processed in a form that does not permit personal identification.</li>
          <li>To distribute or display advertisements of us or a third party.</li>
          <li>To use privacy information for marketing.</li>
          <li>Purposes incidental to the purposes of use above.</li>
        </ul>
      </Section>

      <Section title="(4) Do you provide privacy information for a third party?">
        We will not provide privacy information for a third party without prior approval of users
        except where required under laws and regulations, where required for protecting human life or
        property, or where necessary to help a national organization perform clerical work prescribed
        by law.
      </Section>

      <Section title="(5) Can I check my privacy information or request correction?">
        If a user requests disclosure of their own privacy information, we will disclose it without
        delay unless doing so would harm the interests of the user or third party, significantly
        hinder our operations, or violate laws and regulations. A fee of 1,000 yen applies per
        disclosure instance. Incorrect personal information can be corrected or deleted upon request.
      </Section>

      <Section title="(6) Can I request discontinuation of use?">
        Users may request discontinuation of use of their privacy information. We will conduct a
        necessary investigation and take appropriate measures, informing the user without delay.
      </Section>

      <Section title="(7) Change of Privacy Policy">
        This Privacy Policy is subject to changes without notice. Changes take effect when posted to
        this website.
      </Section>

      <Section title="(8) Inquiry Contact">
        <p>Contact person: Minoru Kobayashi</p>
        <p>Company name: Hero Serviced Office Inc.</p>
        <p>Address: 23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
        <p>
          E-mail:{' '}
          <a href="mailto:salesofficer@heroph.net" className="text-[#1565C0] underline">
            salesofficer@heroph.net
          </a>
        </p>
      </Section>
    </>
  );
}

// Terms of Service Content 

function TermsOfServiceContent() {
  return (
    <>
      <p>
        By accessing or using the services provided by Hero Serviced Office Inc., you agree to be
        bound by these Terms of Service. Please read them carefully before using our services.
      </p>

      <Section title="1. Use of Services">
        You agree to use our services only for lawful purposes and in accordance with these Terms.
        You must not use our services in any way that violates applicable laws or regulations, or in
        a manner that is harmful, fraudulent, or deceptive.
      </Section>

      <Section title="2. User Accounts">
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activities that occur under your account. Please notify us immediately of any
        unauthorized use of your account.
      </Section>

      <Section title="3. Payment and Charges">
        All charges for services are due as specified in your service agreement. Failure to pay
        charges may result in suspension or termination of services. All fees are non-refundable
        unless otherwise stated.
      </Section>

      <Section title="4. Limitation of Liability">
        Hero Serviced Office Inc. shall not be liable for any indirect, incidental, or consequential
        damages arising from your use of our services. Our total liability shall not exceed the
        amount paid by you for the services in the preceding month.
      </Section>

      <Section title="5. Termination">
        We reserve the right to terminate or suspend access to our services immediately, without
        prior notice, if you breach these Terms of Service or engage in conduct that we determine to
        be harmful to other users or to us.
      </Section>

      <Section title="6. Changes to Terms">
        We reserve the right to modify these Terms at any time. Changes will be effective upon
        posting to our website. Continued use of our services after any such changes constitutes
        your acceptance of the new Terms.
      </Section>

      <Section title="7. Governing Law">
        These Terms shall be governed by and construed in accordance with the laws of the Republic
        of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts
        of Makati City.
      </Section>

      <Section title="8. Contact">
        <p>For questions about these Terms, please contact us:</p>
        <p>Hero Serviced Office Inc.</p>
        <p>23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
        <p>
          <a href="mailto:sales@heroph.net" className="text-[#1565C0] underline">
            sales@heroph.net
          </a>
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-[#0A1E3F] mb-1">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  );
}

export default function Footer() {
  const [modal, setModal] = useState<'privacy' | 'terms' | null>(null);

  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Our Services' },
    { href: '/virtual-tour', label: 'Virtual Tour' },
    { href: '/reservation', label: 'Reservation' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const services = [
    { href: '/quotation', label: 'Private Offices' },
    { href: '/quotation', label: 'Virtual Offices' },
    { href: '/quotation', label: 'Co-working Space' },
    { href: '/quotation', label: 'Meeting Rooms' },
    { href: '/quotation', label: 'Event Space' },
  ];

  return (
    <>
      <footer className="bg-[#0A1E3F] text-gray-300 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-linear-to-br from-[#1B3A8C] to-[#3B5EA6] rounded-lg flex items-center justify-center">
                  <Image
                    src="/header_logo_icon.png"
                    alt="HERO Logo Icon"
                    height={120}
                    width={120}
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">HERO</span>
                  <span className="text-sm text-gray-400 block -mt-1">Serviced Office</span>
                </div>
              </div>
              <p className="text-md text-gray-400 leading-relaxed">Your Workspace for Success</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.filter(link => link.href?.trim()).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href || undefined} className="text-sm hover:text-[#1565C0] transition-colors">
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
                {services.filter(service => service.href?.trim()).map((service, index) => (
                  <li key={index}>
                    <Link href={service.href || undefined} className="text-sm hover:text-[#1565C0] transition-colors">
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
                  <MapPin className="w-5 h-5 text-[#64B5F6] shrink-0 mt-0.5" />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=23F+Tower+6789+6789+Ayala+Avenue+Makati+City"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="text-sm leading-6 hover:text-[#1565C0]">
                      <div>23F TOWER6789</div>
                      <div>6789 Ayala Avenue</div>
                      <div>Makati City 1209</div>
                      <div>Metro Manila, Philippines</div>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#64B5F6] shrink-0 mt-0.5" />
                  <a href="https://maps.app.goo.gl/UAXd38SMpp9LyU9y7" target="_blank" rel="noopener noreferrer">
                    <div className="text-sm leading-6 hover:text-[#1565C0]">
                      <div>11F Insular Life Building</div>
                      <div>6781 Ayala Avenue</div>
                      <div>Corner Paseo de Roxas</div>
                      <div>Makati City</div>
                      <div>Metro Manila, Philippines</div>
                    </div>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#64B5F6]" />
                  <a
                    href="tel:+63-(0)2-8801-3417"
                    className="text-sm hover:text-[#1565C0] transition-colors"
                  >
                    +63-(0)2-8801-3417
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#64B5F6]" />
                  <a
                    href="mailto:sales@heroph.net"
                    className="text-sm hover:text-[#1565C0] transition-colors"
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
                <span className="text-sm text-gray-500">
                  Powered by&nbsp;
                  <a
                    href="https://www.infinitechphil.com/"
                    className="hover:text-[#1565C0] transition-colors underline"
                  >
                    Infinitech Advertising Corporation
                  </a>
                </span>
              </div>

              {/* Modals */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <button
                  onClick={() => setModal('privacy')}
                  className="hover:text-[#1565C0] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setModal('terms')}
                  className="hover:text-[#1565C0] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal
        open={modal === 'privacy'}
        onClose={() => setModal(null)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </Modal>

      <Modal
        open={modal === 'terms'}
        onClose={() => setModal(null)}
        title="Terms of Service"
      >
        <TermsOfServiceContent />
      </Modal>
    </>
  );
}