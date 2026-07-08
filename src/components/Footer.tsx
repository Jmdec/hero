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
      className="fixed inset-0 z-1000 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-[#060F20]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-sm bg-[#F5F1E8] shadow-2xl border-t-2 border-[#FFC107]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#0A1B33]/10">
          <h2
            id="modal-title"
            className="text-xl tracking-wide text-[#0A1B33] font-semibold"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-[#0A1B33]/50 hover:text-[#0A1B33] hover:bg-[#0A1B33]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 text-sm text-[#0A1B33]/70 leading-relaxed space-y-5">
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

      <Section title="01 — What is privacy information?">
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

      <Section title="02 — How do you collect privacy information?">
        We may collect personal information when a user makes a user registration or use any of our
        services and/or history and characteristic information of a user when a user uses any of our
        services or views any of the pages of our website. If a user performs settings in such a way
        that the use of the services is linked with any external service, we will collect the ID to
        be used by the user in the external service and/or the information that the user agrees to
        disclose to the linked service under the external service's privacy settings.
      </Section>

      <Section title="03 — For what purpose do you use privacy information?">
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

      <Section title="04 — Do you provide privacy information for a third party?">
        We will not provide privacy information for a third party without prior approval of users
        except where required under laws and regulations, where required for protecting human life or
        property, or where necessary to help a national organization perform clerical work prescribed
        by law.
      </Section>

      <Section title="05 — Can I check my privacy information or request correction?">
        If a user requests disclosure of their own privacy information, we will disclose it without
        delay unless doing so would harm the interests of the user or third party, significantly
        hinder our operations, or violate laws and regulations. A fee of 1,000 yen applies per
        disclosure instance. Incorrect personal information can be corrected or deleted upon request.
      </Section>

      <Section title="06 — Can I request discontinuation of use?">
        Users may request discontinuation of use of their privacy information. We will conduct a
        necessary investigation and take appropriate measures, informing the user without delay.
      </Section>

      <Section title="07 — Change of Privacy Policy">
        This Privacy Policy is subject to changes without notice. Changes take effect when posted to
        this website.
      </Section>

      <Section title="08 — Inquiry Contact">
        <p>Contact person: Minoru Kobayashi</p>
        <p>Company name: Hero Serviced Office Inc.</p>
        <p>Address: 23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
        <p>
          E-mail:{' '}
          <a href="mailto:salesofficer@heroph.net" className="text-[#1565C0] underline underline-offset-2">
            salesofficer@heroph.net
          </a>
        </p>
      </Section>
    </>
  );
}

//  Terms of Service Content 

function TermsOfServiceContent() {
  return (
    <>
      <p>
        By accessing or using the services provided by Hero Serviced Office Inc., you agree to be
        bound by these Terms of Service. Please read them carefully before using our services.
      </p>

      <Section title="01 — Use of Services">
        You agree to use our services only for lawful purposes and in accordance with these Terms.
        You must not use our services in any way that violates applicable laws or regulations, or in
        a manner that is harmful, fraudulent, or deceptive.
      </Section>

      <Section title="02 — User Accounts">
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activities that occur under your account. Please notify us immediately of any
        unauthorized use of your account.
      </Section>

      <Section title="03 — Payment and Charges">
        All charges for services are due as specified in your service agreement. Failure to pay
        charges may result in suspension or termination of services. All fees are non-refundable
        unless otherwise stated.
      </Section>

      <Section title="04 — Limitation of Liability">
        Hero Serviced Office Inc. shall not be liable for any indirect, incidental, or consequential
        damages arising from your use of our services. Our total liability shall not exceed the
        amount paid by you for the services in the preceding month.
      </Section>

      <Section title="05 — Termination">
        We reserve the right to terminate or suspend access to our services immediately, without
        prior notice, if you breach these Terms of Service or engage in conduct that we determine to
        be harmful to other users or to us.
      </Section>

      <Section title="06 — Changes to Terms">
        We reserve the right to modify these Terms at any time. Changes will be effective upon
        posting to our website. Continued use of our services after any such changes constitutes
        your acceptance of the new Terms.
      </Section>

      <Section title="07 — Governing Law">
        These Terms shall be governed by and construed in accordance with the laws of the Republic
        of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts
        of Makati City.
      </Section>

      <Section title="08 — Contact">
        <p>For questions about these Terms, please contact us:</p>
        <p>Hero Serviced Office Inc.</p>
        <p>23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
        <p>
          <a href="mailto:sales@heroph.net" className="text-[#1565C0] underline underline-offset-2">
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
      <h3 className="text-[15px] tracking-wide text-[#0A1B33] mb-1.5">
        {title}
      </h3>
      <div className="text-[#0A1B33]/70">{children}</div>
    </div>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="relative inline-block text-[15px] tracking-wide uppercase text-white/90 mb-5 pb-3">
      {children}
      <span className="absolute left-0 bottom-0 h-0.5 w-8 bg-[#FFC107]" />
    </h3>
  );
}

/** A lobby-directory style entry: a large brass floor number plus the plaque address. */
function DirectoryEntry({
  floor,
  lines,
  href,
}: {
  floor: string;
  lines: string[];
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 py-4 first:pt-0 border-b border-white/10 last:border-b-0"
    >
      <span className="shrink-0 text-xl leading-none text-[#FFC107] tabular-nums pt-0.5">
        {floor}
      </span>
      <span className="text-sm leading-6 text-gray-300 group-hover:text-white transition-colors">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </a>
  );
}

export default function Footer() {
  const [modal, setModal] = useState<'privacy' | 'terms' | null>(null);

  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Our Services' },
    { href: '/virtual-tour', label: 'Virtual Tour' },
    { href: '/quotation', label: 'Get a Quote' },
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
      <footer className="bg-[#0A1B33] text-gray-300 border-t-2 border-[#FFC107]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Company Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm ring-1 ring-[#FFC107]/40 flex items-center justify-center bg-[#0A1B33]">
                  <Image
                    src="/header_logo_icon.png"
                    alt="HERO Logo Icon"
                    height={120}
                    width={120}
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <span className="text-xl tracking-wide text-white font-bold">HERO</span>
                  <span className="text-md text-white block -mt-0.5 font-semibold">
                    Serviced Office
                  </span>
                </div>
              </div>
              <p className="text-md text-gray-400 leading-relaxed italic">
                Your Workspace for Success.
              </p>
              <p className="text-sm text-gray-500 leading-6 max-w-xs text-justify">
                Private offices, meeting rooms, and event space across two Makati
                addresses — ready when you are.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 lg:gap-10">
              {/* Quick Links */}
              <div>
                <ColumnHeading>Quick Links</ColumnHeading>
                <ul className="space-y-3">
                  {quickLinks.filter(link => link.href?.trim()).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <ColumnHeading>Our Services</ColumnHeading>
                <ul className="space-y-3">
                  {services.filter(service => service.href?.trim()).map((service, index) => (
                    <li key={index}>
                      <Link
                        href={service.href}
                        className="text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                      >
                        {service.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Directory / Contact */}
            <div>
              <ColumnHeading>Visit Us</ColumnHeading>

              <div className="flex flex-col md:flex-row lg:flex-col gap-3">
                <DirectoryEntry
                  floor="23F"
                  lines={['TOWER6789', '6789 Ayala Avenue', 'Makati City 1209, Metro Manila']}
                  href="https://www.google.com/maps/search/?api=1&query=23F+Tower+6789+6789+Ayala+Avenue+Makati+City"
                />
                <DirectoryEntry
                  floor="11F"
                  lines={[
                    'Insular Life Building',
                    '6781 Ayala Avenue cor. Paseo de Roxas',
                    'Makati City, Metro Manila',
                  ]}
                  href="https://maps.app.goo.gl/UAXd38SMpp9LyU9y7"
                />
              </div>

              <div className="flex md:flex-row lg:flex-col gap-3 mt-5 pt-5 border-t border-white/10">
                <a
                  href="tel:+63-(0)2-8801-3417"
                  className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FFC107] shrink-0" />
                  +63-(0)2-8801-3417
                </a>
                <a
                  href="mailto:sales@heroph.net"
                  className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#FFC107] shrink-0" />
                  sales@heroph.net
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center md:items-start gap-1">
                <p className="text-xs tracking-wide text-gray-500">
                  &copy; {new Date().getFullYear()} HERO Serviced Office. All rights reserved.
                </p>
                <span className="text-xs tracking-wide text-gray-600">
                  Powered by{' '}
                  <a
                    href="https://www.infinitechphil.com/"
                    className="hover:text-[#FFC107] transition-colors underline underline-offset-2"
                  >
                    Infinitech Advertising Corporation
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs tracking-wide text-gray-500">
                <button
                  onClick={() => setModal('privacy')}
                  className="hover:text-[#FFC107] transition-colors cursor-pointer uppercase"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setModal('terms')}
                  className="hover:text-[#FFC107] transition-colors cursor-pointer uppercase"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal open={modal === 'privacy'} onClose={() => setModal(null)} title="Privacy Policy">
        <PrivacyPolicyContent />
      </Modal>

      <Modal open={modal === 'terms'} onClose={() => setModal(null)} title="Terms of Service">
        <TermsOfServiceContent />
      </Modal>
    </>
  );
}