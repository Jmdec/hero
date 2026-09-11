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
function PrivacyPolicyContent({ isJapanese }: { isJapanese: boolean }) {
  if (isJapanese) {
    return (
      <>
        <p>
          いつもHero Serviced Office, Inc.(以下「当社」)のサービスをご利用いただき、誠にありがとうございます。
        </p>
        <p>
          本プライバシーポリシー(以下「本ポリシー」)は、当社の個人情報の取り扱いに関する基本方針を定めるものです。ユーザーは、当社サービスをご利用いただくことで、本ポリシーに同意したものとみなされます。
        </p>

        <Section title="01 — プライバシー情報とは">
          プライバシー情報には、個人情報および履歴情報・特性情報の両方が含まれます。個人情報とは、個人情報の保護に関する法律に定める個人情報、または生存する個人に関する情報であり、具体的には氏名、生年月日、住所、電話番号その他の連絡先情報、その他個人を識別できる記載情報を指します。個人情報以外の情報は履歴情報・特性情報に該当し、利用したサービス、購入した商品、閲覧したページ・広告の履歴、ユーザーが使用した検索キーワード、利用日時、利用方法、利用環境、郵便番号、性別、職業、年齢、ユーザーのIPアドレス、クッキー情報、位置情報、端末識別情報などが含まれます。
        </Section>

        <Section title="02 — プライバシー情報の収集方法">
          当社は、ユーザーがユーザー登録を行う際、または当社のいずれかのサービスを利用する際に個人情報を、あるいは当社のサービスを利用する際や当社ウェブサイトの各ページを閲覧する際に履歴情報・特性情報を収集することがあります。ユーザーがサービスの利用を外部サービスと連携させる設定を行った場合、当社は当該外部サービスでユーザーが使用するIDや、外部サービスのプライバシー設定のもとでユーザーが連携先サービスへの開示に同意した情報を収集します。
        </Section>

        <Section title="03 — プライバシー情報の利用目的">
          <ul className="list-[upper-alpha] list-inside space-y-2 mt-1">
            <li>ユーザーが登録情報を閲覧・修正し、利用状況を確認できるよう登録情報を表示するため</li>
            <li>ユーザーへの通知・連絡、または商品の発送のためにメールアドレスを利用するため</li>
            <li>氏名、生年月日、住所などの情報をユーザー本人確認のために利用するため</li>
            <li>決済関連情報を、ユーザーへの請求のために利用するため</li>
            <li>ユーザーが入力しやすいよう、入力画面に登録情報を表示するため</li>
            <li>利用規約に違反したユーザーによるサービス利用を拒否するため</li>
            <li>ユーザーからのお問い合わせに回答するため</li>
            <li>個人を特定できない形式で処理した統計データを作成するため</li>
            <li>当社または第三者の広告を配信・表示するため</li>
            <li>プライバシー情報をマーケティングに利用するため</li>
            <li>上記利用目的に付随する目的のため</li>
          </ul>
        </Section>

        <Section title="04 — プライバシー情報を第三者に提供することはありますか">
          当社は、法令に基づき必要とされる場合、人の生命・身体・財産の保護に必要な場合、または国の機関が法令の定める事務を遂行することに協力する必要がある場合を除き、ユーザーの事前の承諾なく、プライバシー情報を第三者に提供することはありません。
        </Section>

        <Section title="05 — 自己のプライバシー情報の確認や訂正を求めることはできますか">
          ユーザーが自己のプライバシー情報の開示を請求した場合、当該開示がユーザーまたは第三者の利益を害するおそれがある場合、当社の業務の遂行に著しい支障を及ぼすおそれがある場合、または法令に違反することとなる場合を除き、当社は遅滞なく開示します。開示のご請求には1回につき1,000円の手数料がかかります。個人情報に誤りがある場合は、ご請求に応じて訂正または削除いたします。
        </Section>

        <Section title="06 — 利用停止を請求することはできますか">
          ユーザーは、自己のプライバシー情報の利用停止を請求することができます。当社は必要な調査を行い、適切な措置を講じたうえで、遅滞なくユーザーにご連絡いたします。
        </Section>

        <Section title="07 — プライバシーポリシーの変更">
          本プライバシーポリシーは、予告なく変更されることがあります。変更内容は、当ウェブサイトに掲載された時点で効力を生じます。
        </Section>

        <Section title="08 — お問い合わせ窓口">
          <p>担当者: Minoru Kobayashi</p>
          <p>会社名: Hero Serviced Office, Inc.</p>
          <p>住所: 23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
          <p>
            Eメール:{' '}
            <a href="mailto:salesofficer@heroph.net" className="text-[#1565C0] underline underline-offset-2">
              salesofficer@heroph.net
            </a>
          </p>
        </Section>
      </>
    );
  }

  return (
    <>
      <p>
        Thank you very much for using the services provided by Hero Serviced Office, Inc. (hereinafter,
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
        <p>Company name: Hero Serviced Office, Inc.</p>
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
function TermsOfServiceContent({ isJapanese }: { isJapanese: boolean }) {
  if (isJapanese) {
    return (
      <>
        <p>
          Hero Serviced Office, Inc.が提供するサービスにアクセスまたは利用することにより、お客様は本利用規約に拘束されることに同意したものとします。サービスをご利用になる前に、本規約を注意深くお読みください。
        </p>

        <Section title="01 — サービスの利用">
          お客様は、適用法令に従い、合法的な目的のみで当社サービスをご利用いただくことに同意するものとします。適用法令に違反する方法、または有害、詐欺的、もしくは欺瞞的な方法で当社サービスを利用してはなりません。
        </Section>

        <Section title="02 — ユーザーアカウント">
          お客様は、ご自身のアカウント認証情報の機密保持、および当該アカウントの下で行われるすべての活動について責任を負うものとします。アカウントの不正利用に気づいた場合は、直ちに当社までご連絡ください。
        </Section>

        <Section title="03 — お支払いおよび料金">
          サービスに対するすべての料金は、サービス契約に定めるとおりお支払いいただく必要があります。料金のお支払いがない場合、サービスの停止または終了となることがあります。別段の定めがない限り、すべての料金は返金されません。
        </Section>

        <Section title="04 — 責任の制限">
          Hero Serviced Office, Inc.は、お客様による当社サービスの利用から生じる間接損害、付随的損害、結果的損害について責任を負いません。当社の責任総額は、直前月にお客様が当該サービスに対してお支払いいただいた金額を超えないものとします。
        </Section>

        <Section title="05 — 契約の解除">
          お客様が本利用規約に違反した場合、または当社が他のユーザーもしくは当社にとって有害であると判断する行為を行った場合、当社は事前の通知なく、直ちに当社サービスへのアクセスを終了または停止する権利を留保します。
        </Section>

        <Section title="06 — 規約の変更">
          当社は、いつでも本規約を変更する権利を留保します。変更内容は、当ウェブサイトに掲載された時点で効力を生じます。変更後も当社サービスの利用を継続された場合、新しい規約に同意したものとみなされます。
        </Section>

        <Section title="07 — 準拠法">
          本規約は、フィリピン共和国の法律に準拠し、これに従って解釈されるものとします。本規約に関するいかなる紛争も、マカティ市の裁判所の専属管轄に服するものとします。
        </Section>

        <Section title="08 — お問い合わせ">
          <p>本規約に関するご質問は、以下までご連絡ください:</p>
          <p>Hero Serviced Office, Inc.</p>
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

  return (
    <>
      <p>
        By accessing or using the services provided by Hero Serviced Office, Inc., you agree to be
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
        Hero Serviced Office, Inc. Inc. shall not be liable for any indirect, incidental, or consequential
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
        <p>Hero Serviced Office, Inc.</p>
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
    <h3 className="relative font-bold inline-block text-[15px] tracking-wide uppercase text-white/90 mb-5 pb-3">
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
      <span className="shrink-0 text-xl leading-none text-[#FFC107] tabular-nums pt-0.5 font-bold">
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
  const [locale, setLocale] = useState<'en' | 'ja'>('en');
  const isJapanese = locale === 'ja';

  useEffect(() => {
    const getStoredLocale = () => {
      const match = document.cookie.match(/(?:^|;\s*)hero_lang=([^;]+)/);
      return match?.[1] === 'ja' ? 'ja' : 'en';
    };

    const updateLocale = (event?: Event) => {
      const detail = (event as CustomEvent<string> | undefined)?.detail;
      const nextLocale = detail === 'ja' || detail === 'en' ? detail : getStoredLocale();
      setLocale(nextLocale);
    };

    updateLocale();
    window.addEventListener('localeChanged', updateLocale);

    return () => window.removeEventListener('localeChanged', updateLocale);
  }, []);

  const quickLinks = [
    { href: '/about', label: isJapanese ? '会社概要' : 'About Us' },
    { href: '/services', label: isJapanese ? 'サービス' : 'Our Services' },
    { href: '/virtual-tour', label: isJapanese ? 'バーチャルツアー' : 'Virtual Tour' },
    { href: '/quotation', label: isJapanese ? 'お見積り依頼' : 'Get a Quote' },
    { href: '/contact', label: isJapanese ? 'お問い合わせ' : 'Contact Us' },
    { href: '/login', label: isJapanese ? 'ログイン' : 'Log In' },
  ];

  const services = [
    { href: '/services?modal=private', label: isJapanese ? '個室オフィス' : 'Private Offices' },
    { href: '/services?modal=virtual', label: isJapanese ? 'バーチャルオフィス' : 'Virtual Offices' },
    { href: '/services?modal=coworking', label: isJapanese ? 'コワーキングスペース' : 'Co-working Space' },
    { href: '/services?modal=conference', label: isJapanese ? '会議室' : 'Meeting Rooms' },
    { href: '/services?modal=event', label: isJapanese ? 'イベントスペース' : 'Event Space' },
  ];

  return (
    <>
      <footer className="bg-[#070084] text-gray-300 border-t-2 border-[#FFC107]">
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
                {isJapanese ? '成功のためのワークスペース。' : 'Your Workspace for Success.'}
              </p>
              <p className="text-sm text-gray-400 max-w-xs text-justify">
                {isJapanese
                  ? 'マカティにある2つの拠点で、個室オフィス・会議室・イベントスペースをすぐにご利用いただけます。'
                  : 'Private offices, meeting rooms, and event space across two Makati addresses — ready when you are.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 lg:gap-10">
              {/* Quick Links */}
              <div>
                <ColumnHeading>{isJapanese ? 'クイックリンク' : 'Quick Links'}</ColumnHeading>
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
                <ColumnHeading>{isJapanese ? '当社のサービス' : 'Our Services'}</ColumnHeading>
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
              <ColumnHeading>{isJapanese ? 'ぜひお越しください' : 'Visit Us'}</ColumnHeading>

              <div className="flex flex-col md:flex-row lg:flex-col gap-3">
                <DirectoryEntry
                  floor="23F"
                  lines={[
                    'TOWER6789', 
                    '6789 Ayala Avenue', 
                    'Makati City 1209, Metro Manila'
                  ]}
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
                  href="tel:+639173224211"
                  className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FFC107] shrink-0" />
                  +63 917 322 4211
                </a>
                <a
                  href="mailto:salesofficer@heroph.net"
                  className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#FFC107] shrink-0" />
                  salesofficer@heroph.net
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center md:items-start gap-1">
                <p className="text-xs tracking-wide text-gray-400">
                  {isJapanese
                    ? `© ${new Date().getFullYear()} Hero Serviced Office, Inc. 全著作権所有。`
                    : `© ${new Date().getFullYear()} Hero Serviced Office, Inc.. All rights reserved.`}
                </p>
                <span className="text-xs tracking-wide text-gray-400">
                  {isJapanese ? '提供：' : 'Powered by'}{' '}
                  <a
                    href="https://www.infinitechphil.com/"
                    className="hover:text-[#FFC107] transition-colors underline underline-offset-2"
                  >
                    Infinitech Advertising Corporation
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs tracking-wide text-gray-400">
                <button
                  onClick={() => setModal('privacy')}
                  className="hover:text-[#FFC107] transition-colors cursor-pointer uppercase"
                >
                  {isJapanese ? 'プライバシーポリシー' : 'Privacy Policy'}
                </button>
                <button
                  onClick={() => setModal('terms')}
                  className="hover:text-[#FFC107] transition-colors cursor-pointer uppercase"
                >
                  {isJapanese ? '利用規約' : 'Terms of Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal open={modal === 'privacy'} onClose={() => setModal(null)} title={isJapanese ? 'プライバシーポリシー' : 'Privacy Policy'}>
        <PrivacyPolicyContent isJapanese={isJapanese} />
      </Modal>

      <Modal open={modal === 'terms'} onClose={() => setModal(null)} title={isJapanese ? '利用規約' : 'Terms of Service'}>
        <TermsOfServiceContent isJapanese={isJapanese} />
      </Modal>
    </>
  );
}