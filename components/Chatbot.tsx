"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Message {
    type: 'bot' | 'user';
    text: string;
    time: string;
}

// ── Validation helpers ────────────────────────────────────────────────────────
const validators = {
    name: (v: string) => {
        if (!v.trim()) return "Full name is required.";
        if (v.trim().length < 2) return "Name must be at least 2 characters.";
        if (!/^[a-zA-Z\s'\-\.]+$/.test(v.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes.";
        return "";
    },
    email: (v: string) => {
        if (!v.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Please enter a valid email address.";
        return "";
    },
    phone: (v: string) => {
        const digits = v.replace(/\D/g, "");
        if (!v.trim()) return "Phone number is required.";
        if (digits.length < 7 || digits.length > 15) return "Please enter a valid phone number.";
        if (!/^[\d\s\+\-\(\)]+$/.test(v.trim())) return "Phone number contains invalid characters.";
        return "";
    },
    company: (_: string) => "", // optional
};

type LeadField = keyof typeof validators;

const Chatbot = () => {
    const [isStarted, setIsStarted] = useState(false);
    const [leadSubmitted, setLeadSubmitted] = useState(false);
    const [leadInfo, setLeadInfo] = useState({ name: "", email: "", phone: "", company: "" });
    const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", phone: "", company: "" });
    const [touched, setTouched] = useState({ name: false, email: false, phone: false, company: false });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            type: 'bot',
            text: "Hi there! 👋 I'm your HERO assistant. We deliver premium serviced offices and flexible workspace solutions in the Philippines. How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickReplies = [
        'Our Services',
        'About Us',
        'Contact Info',
        'Office Spaces',
        'Meeting Rooms',
        'Get a Quote'
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Random delay between 1.2s – 2.5s to feel more human
    const humanDelay = () =>
        new Promise(res => setTimeout(res, 1200 + Math.random() * 1300));

    const handleQuickReply = async (reply: string) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [...prev, { type: 'user', text: reply, time }]);
        setIsTyping(true);

        const predefinedReplies: Record<string, string> = {
            'Our Services':
                "We offer a range of workspace solutions:\n\n• Flexible Office Spaces\n• Meeting & Conference Rooms\n• Virtual Offices\n• Coworking Spaces\n• Business Support Services\n\nAll designed to help your business operate professionally and efficiently!",
            'About Us':
                "HERO Serviced Office provides premium, fully-equipped workspaces for businesses of all sizes in the Philippines. With 2+ years of experience and 20+ completed projects, we help companies scale without the overhead of a traditional office.",
            'Contact Info':
                "📍 Tower 6789\n23F Tower6789, 6789 Ayala Avenue, Makati City 1209, Metro Manila, Philippines\n\n📍 Insular Life Building\n11F Insular Life Building, 6781 Ayala Avenue, Corner Paseo de Roxas, Makati City, Metro Manila, Philippines\n\n📧 Email: info@heroph.net\n\nFeel free to reach out — we'd love to hear from you!",
            'Office Spaces':
                "Our private office spaces are fully furnished and ready to move in. Whether you need a space for 1 person or a whole team, we have flexible options to fit your needs and budget.",
            'Meeting Rooms':
                "Our meeting rooms are equipped with high-speed Wi-Fi, presentation displays, and video conferencing tools — perfect for client meetings, interviews, and team sessions. Available by the hour or day.",
            'Get a Quote':
                "We'd love to put together a quote for you! Please email us at info@heroph.net with your requirements (team size, duration, space type), and our team will get back to you promptly."
        };

        await humanDelay();
        setIsTyping(false);

        if (predefinedReplies[reply]) {
            setMessages(prev => [...prev, { type: 'bot', text: predefinedReplies[reply], time }]);
            return;
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { type: 'bot', text: data.reply || 'No response from assistant.', time }]);
        } catch {
            setMessages(prev => [...prev, { type: 'bot', text: '⚠️ Sorry, something went wrong. Please try again.', time }]);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMessage: Message = { type: "user", text: message, time };

        setMessages(prev => [...prev, userMessage]);
        setMessage("");
        setIsTyping(true);

        await humanDelay();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text })
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                type: "bot",
                text: data.reply || "No response received.",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }]);
        } catch {
            setMessages(prev => [...prev, {
                type: "bot",
                text: "⚠️ Something went wrong. Please try again.",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFieldChange = (key: LeadField, value: string) => {
        setLeadInfo(prev => ({ ...prev, [key]: value }));
        if (touched[key]) {
            setFieldErrors(prev => ({ ...prev, [key]: validators[key](value) }));
        }
    };

    const handleFieldBlur = (key: LeadField) => {
        setTouched(prev => ({ ...prev, [key]: true }));
        setFieldErrors(prev => ({ ...prev, [key]: validators[key](leadInfo[key]) }));
    };

    const validateAll = () => {
        const errors = {
            name: validators.name(leadInfo.name),
            email: validators.email(leadInfo.email),
            phone: validators.phone(leadInfo.phone),
            company: validators.company(leadInfo.company),
        };
        setFieldErrors(errors);
        setTouched({ name: true, email: true, phone: true, company: true });
        return !errors.name && !errors.email && !errors.phone;
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Toggle button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-[#1B3A8C] hover:bg-[#16318a] flex items-center justify-center shadow-xl transition-all hover:scale-105 group"
                    aria-label="Open chat"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </button>
            )}

            {/* Chat window */}
            {isChatOpen && (
                <div className="fixed bottom-6 right-5 z-50 w-[calc(100vw-40px)] md:w-[380px] h-[580px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">

                    {/* Header */}
                    <div className="bg-[#1B3A8C] px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-[#1B3A8C] text-base font-bold leading-none">H</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm leading-tight">HERO Serviced Office</p>
                                <p className="text-blue-200 text-xs flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    Online now
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="text-white/70 hover:text-white hover:bg-white/15 rounded-full p-1.5 transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-gray-50">

                        {/* Welcome screen */}
                        {!isStarted && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-[#1B3A8C] flex items-center justify-center shadow-lg">
                                    <span className="text-white text-2xl font-bold">H</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Welcome to HERO</h2>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                        I'm your HERO Assistant. Before we begin, we'll collect a few details so we can better serve you.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsStarted(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] transition-colors shadow-sm"
                                >
                                    Get started <ChevronRight className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-gray-400">Powered by HERO Serviced Office</p>
                            </div>
                        )}

                        {/* Lead form */}
                        {isStarted && !leadSubmitted && (
                            <div className="p-5 space-y-3">
                                <div className="text-center mb-4">
                                    <h2 className="text-base font-bold text-gray-900">Your contact details</h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Please fill in your details before continuing.
                                    </p>
                                </div>

                                {([
                                    { key: 'name', placeholder: 'Full name', type: 'text' },
                                    { key: 'email', placeholder: 'Email address', type: 'email' },
                                    { key: 'phone', placeholder: 'Phone number', type: 'tel' },
                                    { key: 'company', placeholder: 'Company name (optional)', type: 'text' },
                                ] as { key: LeadField; placeholder: string; type: string }[]).map(field => {
                                    const hasError = touched[field.key] && fieldErrors[field.key];
                                    return (
                                        <div key={field.key} className="space-y-1">
                                            <input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={leadInfo[field.key]}
                                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                onBlur={() => handleFieldBlur(field.key)}
                                                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white transition-colors ${hasError
                                                        ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                                                        : touched[field.key] && !fieldErrors[field.key] && leadInfo[field.key]
                                                            ? "border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                                                            : "border-gray-200 focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20"
                                                    }`}
                                            />
                                            {hasError && (
                                                <p className="text-[11px] text-red-500 pl-1 flex items-center gap-1">
                                                    <span>⚠</span> {fieldErrors[field.key]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                                <p className="text-[11px] text-gray-400 text-center pt-1">
                                    Your information is used solely to assist with your inquiries.
                                </p>

                                <button
                                    className="w-full py-2.5 rounded-xl bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        if (validateAll()) {
                                            setLeadSubmitted(true);
                                            setMessages([{
                                                type: "bot",
                                                text: `Thanks, ${leadInfo.name.trim()}! Your details have been received. How can I help you today?`,
                                                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                            }]);
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                                <p className="text-[11px] text-gray-400 text-center">Powered by HERO Serviced Office</p>
                            </div>
                        )}

                        {/* Messages */}
                        {leadSubmitted && (
                            <div className="p-4 space-y-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                        {msg.type === "bot" && (
                                            <div className="w-7 h-7 rounded-full bg-[#1B3A8C] flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                                                <span className="text-white text-xs font-bold">H</span>
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${msg.type === "user"
                                                ? "bg-[#1B3A8C] text-white rounded-br-sm"
                                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                                            }`}>
                                            <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                                            <p className={`text-[10px] mt-1 ${msg.type === "user" ? "text-blue-200 text-right" : "text-gray-400"}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div className="flex justify-start items-end gap-2">
                                        <div className="w-7 h-7 rounded-full bg-[#1B3A8C] flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xs font-bold">H</span>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                            <div className="flex gap-1 items-center">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quick replies */}
                                {!isTyping && messages[messages.length - 1]?.type === "bot" && (
                                    <div className="pt-1">
                                        <p className="text-[11px] text-gray-400 mb-2 pl-9">Quick replies</p>
                                        <div className="flex flex-wrap gap-1.5 pl-9">
                                            {quickReplies.map((reply, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleQuickReply(reply)}
                                                    className="px-3 py-1.5 text-xs border border-[#1B3A8C] text-[#1B3A8C] rounded-full hover:bg-[#1B3A8C] hover:text-white transition-colors font-medium"
                                                >
                                                    {reply}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input area */}
                    {leadSubmitted && (
                        <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a message…"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20 bg-gray-50 transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="w-9 h-9 rounded-full bg-[#1B3A8C] hover:bg-[#16318a] flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-300 text-center mt-2">Powered by HERO Serviced Office</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default Chatbot;