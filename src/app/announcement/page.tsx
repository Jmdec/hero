"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, X } from "lucide-react";

interface Announcement {
    id: number;
    tag: string;
    date: string;
    title: string;
    excerpt: string;
    content: string;
}

const announcements: Announcement[] = [
    {
        id: 1,
        tag: "New Location",
        date: "June 15, 2026",
        title: "Insular Life Tower private offices now open",
        excerpt:
            "Our newest floor at Insular Life Tower is officially live, with premium private offices overlooking Ayala Avenue.",
        content:
            "We're thrilled to announce that our newest floor at Insular Life Tower is officially open for occupancy. Featuring premium private offices with floor-to-ceiling windows overlooking Ayala Avenue, this location sets a new standard for professional workspaces in the heart of Makati's central business district.\n\nThe new floor includes 24 fully furnished private offices ranging from single-desk to 10-person suites, two dedicated meeting rooms with video conferencing equipment, a pantry stocked with complimentary coffee and refreshments, and high-speed 1 Gbps fiber internet.\n\nExisting members may transfer or expand to the new floor at no additional setup fee. Interested in a tour? Book a visit through the member portal or contact our concierge team.",
    },
    {
        id: 2,
        tag: "Promo",
        date: "May 28, 2026",
        title: "Lock in 3 months free on annual virtual office plans",
        excerpt:
            "Sign up for any 12-month virtual office package and get three months on us — limited slots until end of July.",
        content:
            "For a limited time, new members who sign up for any 12-month virtual office plan will receive three months completely free — that's a 25% savings on your first year.\n\nOur virtual office plans include a prestigious Makati CBD business address, mail handling and forwarding, access to our network of meeting rooms at member rates, and a dedicated local phone number with live answering during business hours.\n\nThis promotion is available for new sign-ups only and runs until July 31, 2026. Slots are limited, so we encourage you to secure your plan early. Contact our sales team or sign up directly through the website to take advantage of this offer.",
    },
    {
        id: 3,
        tag: "Event",
        date: "May 02, 2026",
        title: "Member networking night at Tower 6789",
        excerpt:
            "Coworking members joined us for an evening of drinks, demos, and introductions with Makati's startup community.",
        content:
            "Last week we hosted our monthly member networking night at Tower 6789, and it was one of our best yet. Over 80 members and guests gathered for an evening of casual introductions, live product demos, and great conversation — all fueled by cocktails and a rotating selection of local street food.\n\nHighlights from the night included demo pitches from three member startups, an impromptu panel on remote hiring across Southeast Asia, and a raffle that sent two lucky members home with complimentary month upgrades.\n\nThank you to everyone who came out and made the evening a success. Our next networking night is scheduled for June — keep an eye on your inbox for the invitation.",
    },
    {
        id: 4,
        tag: "Feature",
        date: "April 10, 2026",
        title: "360° virtual tour now available online",
        excerpt:
            "Explore every workspace, meeting room, and lounge from the comfort of your browser before you visit.",
        content:
            "We've launched a fully interactive 360° virtual tour of all Hero Serviced Office locations, now accessible directly from our website — no app download required.\n\nThe tour lets you walk through every private office configuration, inspect meeting rooms and their AV setups, explore common areas and lounges, and get a feel for natural light and layout at each floor. High-resolution photography combined with spatial audio gives you one of the most immersive pre-visit experiences available.\n\nWhether you're evaluating us for the first time or helping a remote colleague understand the space, the virtual tour is available 24/7 at heroservicedoffice.com/tour.",
    },
    {
        id: 5,
        tag: "Partnership",
        date: "March 18, 2026",
        title: "Bilingual concierge support expanded",
        excerpt:
            "We've grown our Japanese-English support team to better serve international companies setting up in Manila.",
        content:
            "Hero Serviced Office is proud to announce the expansion of our bilingual concierge support service. Our Japanese-English support team has doubled in size and is now available during extended hours to assist international members with everything from business registration guidance to local vendor recommendations.\n\nThis expansion is part of our continued commitment to making Manila an accessible base for Japanese companies expanding into Southeast Asia. Our bilingual team can assist with document translation referrals, coordination with government agencies, introductions to our network of local legal and accounting partners, and cultural orientation sessions for relocating executives.\n\nFor inquiries, reach out to our concierge desk and request the international support team.",
    },
    {
        id: 6,
        tag: "Upgrade",
        date: "February 05, 2026",
        title: "Faster fiber internet across all floors",
        excerpt:
            "All Hero Serviced Office locations now run on dedicated 1 Gbps redundant fiber lines.",
        content:
            "We've completed a full infrastructure upgrade across all Hero Serviced Office locations. Every floor now runs on dedicated 1 Gbps redundant fiber lines — meaning your connection is never shared with neighboring buildings and a backup line automatically takes over in the rare event of an outage.\n\nIn addition to the speed upgrade, we've deployed enterprise-grade Wi-Fi 6E access points throughout all common areas and meeting rooms, delivering faster speeds and better performance in high-density environments.\n\nWe know reliable internet is non-negotiable for our members. This upgrade is part of our ongoing investment in the infrastructure that keeps your business running smoothly.",
    },
];

const tagColors: Record<string, string> = {
    "New Location": "bg-blue-50 text-blue-600",
    Promo: "bg-blue-50 text-blue-600",
    Event: "bg-blue-50 text-blue-600",
    Feature: "bg-blue-50 text-blue-600",
    Partnership: "bg-blue-50 text-blue-600",
    Upgrade: "bg-blue-50 text-blue-600",
};

export default function AnnouncementPage() {
    const [selected, setSelected] = useState<Announcement | null>(null);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative text-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
                        alt="Newsletter"
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
                        className="w-full text-center mx-auto"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            News, Updates & Exclusive Offers
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Get the latest from Hero Serviced Office — new locations, events,
                            member benefits, and special promotions delivered straight to your
                            inbox.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Announcements Grid */}
            <section className="py-20 bg-[#F5F5F3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                onClick={() => setSelected(item)}
                                className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {/* Tag + Date */}
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`text-xs font-medium px-3 py-1 rounded-full ${tagColors[item.tag] ?? "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {item.tag}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {item.date}
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-[17px] font-bold text-gray-900 leading-snug mb-3">
                                    {item.title}
                                </h2>

                                {/* Excerpt */}
                                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                                    {item.excerpt}
                                </p>

                                {/* Read more */}
                                <div className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-[#1B3A8C] transition-colors">
                                    Read more
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal */}
            <AnimatePresence>
                {selected && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelected(null)}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, y: 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.97 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none"
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl pointer-events-auto flex flex-col max-h-[85vh]"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-4 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${tagColors[selected.tag] ?? "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {selected.tag}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {selected.date}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Scrollable body */}
                                <div className="overflow-y-auto px-7 pb-8">
                                    <h2 className="text-xl font-bold text-gray-900 leading-snug mb-4">
                                        {selected.title}
                                    </h2>
                                    <div className="space-y-4">
                                        {selected.content.split("\n\n").map((para, i) => (
                                            <p key={i} className="text-sm text-gray-600 leading-relaxed">
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* CTA */}
            <section className="py-20 bg-linear-to-r from-[#0D47A1] to-[#00ACC1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        <div>
                            <span className="inline-flex items-center gap-2 text-blue-200 uppercase tracking-wider text-sm font-semibold">
                                ✉ Newsletter
                            </span>

                            <h2 className="mt-4 text-2xl lg:text-5xl font-bold text-white leading-tight">
                                Subscribe to the Hero monthly
                            </h2>

                            <p className="mt-5 text-md text-blue-100 leading-relaxed max-w-xl">
                                One curated email per month with new spaces, member perks,
                                exclusive promos, and Makati business insights.
                                No spam — unsubscribe anytime.
                            </p>

                            <div className="mt-5 space-y-2">

                                {[
                                    "Early access to promotional rates",
                                    "Invitations to member-only events",
                                    "Tips for setting up your business in the Philippines",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 text-blue-100"
                                    >
                                        <div className="w-6 h-6 rounded-full border border-blue-300 flex items-center justify-center">
                                            ✓
                                        </div>

                                        <span>{item}</span>
                                    </div>
                                ))}

                            </div>

                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl">
                            <form className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Email address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        className="w-full rounded-xl bg-white px-5 py-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-white/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-white py-4 font-semibold text-[#0D47A1] hover:bg-gray-100 transition flex items-center justify-center gap-2"
                                >
                                    Subscribe
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <p className="text-md text-blue-100 leading-relaxed">
                                    By subscribing you agree to receive marketing emails from
                                    Hero Serviced Office.
                                </p>

                            </form>

                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}