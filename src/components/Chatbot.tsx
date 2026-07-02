"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronRight, AlertCircle, Loader2, UserRound } from 'lucide-react';
import { chatApi } from '../lib/chatApi';

interface Message {
    type: 'bot' | 'user';
    text: string;
    time: string;
}

const SESSION_STORAGE_KEY = 'hero_chat_session_id';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-xs">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <h2 id="modal-title" className="text-base font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-y-auto px-5 py-4 text-sm text-gray-600 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-4 last:mb-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-1">{children}</div>
        </div>
    );
}

function PrivacyPolicyContent() {
    return (
        <>
            <p className="mb-4">
                Thank you very much for using the services provided by Hero PH INC. (hereinafter,
                &quot;we/our/us&quot;).
            </p>
            <p className="mb-4">
                The Privacy Policy (hereinafter, &quot;the Policy&quot;) sets forth our privacy information handling
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
                code, gender, occupation, age, user&apos;s IP address, cookie information, location information,
                and terminal identification information.
            </Section>

            <Section title="(2) How do you collect privacy information?">
                We may collect personal information when a user makes a user registration or use any of our
                services and/or history and characteristic information of a user when a user uses any of our
                services or views any of the pages of our website. If a user performs settings in such a way
                that the use of the services is linked with any external service, we will collect the ID to
                be used by the user in the external service and/or the information that the user agrees to
                disclose to the linked service under the external service&apos;s privacy settings.
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

function TermsOfServiceContent() {
    return (
        <>
            <p className="mb-4">
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
    company: (_: string) => "",
};

type LeadField = keyof typeof validators;

type ConversationState = {
    id: number;
    session_id: string;
    remoteConversationId?: number;
};

const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME_MESSAGE: Message = {
    type: 'bot',
    text: "Hi there! 👋 I'm your HERO assistant. We deliver premium serviced offices and flexible workspace solutions in the Philippines. How can I help you today?",
    time: formatTime(),
};

// Text shown when a live agent ends the conversation and control returns to the AI assistant.
const AGENT_ENDED_MESSAGE =
    "🔴 The live agent ended the chat. You're back with our AI assistant — feel free to keep chatting or pick a quick reply below.";

const Chatbot = () => {
    const [isStarted, setIsStarted] = useState(false);
    const [leadSubmitted, setLeadSubmitted] = useState(false);
    const [leadInfo, setLeadInfo] = useState({ name: "", email: "", phone: "", company: "" });
    const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", phone: "", company: "" });
    const [touched, setTouched] = useState({ name: false, email: false, phone: false, company: false });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [leadError, setLeadError] = useState('');
    const [isResumingSession, setIsResumingSession] = useState(true);
    const [conversation, setConversation] = useState<ConversationState | null>(null);
    const [sendError, setSendError] = useState('');
    const [modal, setModal] = useState<'privacy' | 'terms' | null>(null);
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [agreementTouched, setAgreementTouched] = useState(false);
    const [agentRequested, setAgentRequested] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Tracks the conversation's last known status between polls, so we can
    // detect the transition "agent was handling this chat" -> "agent ended it".
    // ADJUST THE FIELD NAME / VALUES below to match your actual chatApi contract
    // (e.g. `status`, `agent_status`, a boolean `agent_active`, etc.)
    const previousStatusRef = useRef<string | null>(null);

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

    useEffect(() => {
        if (isChatOpen && leadSubmitted) {
            inputRef.current?.focus();
        }
    }, [isChatOpen, leadSubmitted]);

    useEffect(() => {
        if (!leadSubmitted || !conversation?.id) return;

        const interval = window.setInterval(async () => {
            try {
                const latestConversation = await chatApi.getConversation(conversation.id);

                const mappedMessages: Message[] = (latestConversation.messages ?? []).map((message) => ({
                    type: message.sender === 'user' ? 'user' : 'bot',
                    text: message.message,
                    time: new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }));

                // NOTE: this reads `status` (falling back to `agent_status`) off the
                // conversation payload. Expected values: 'agent_requested' | 'agent_active'
                // while a live agent owns the chat, and 'agent_closed' (or 'ai' / 'closed')
                // once the admin ends it and control returns to the AI assistant.
                // Update these strings to match whatever your backend actually sends.
                const rawStatus: string | null =
                    (latestConversation as any).status ??
                    (latestConversation as any).agent_status ??
                    null;

                const previousStatus = previousStatusRef.current;
                const agentJustEnded =
                    (previousStatus === 'agent_active' || previousStatus === 'agent_requested') &&
                    (rawStatus === 'agent_closed' || rawStatus === 'ai' || rawStatus === 'closed');

                previousStatusRef.current = rawStatus;

                setMessages((prev) => {
                    const current = prev[0]?.type === 'bot' && prev[0]?.text === WELCOME_MESSAGE.text ? [] : prev;
                    const previousText = current.map((m) => `${m.type}:${m.text}`).join('|');
                    const nextText = mappedMessages.map((m) => `${m.type}:${m.text}`).join('|');

                    const finalMessages = agentJustEnded
                        ? [
                            ...mappedMessages,
                            {
                                type: 'bot' as const,
                                text: AGENT_ENDED_MESSAGE,
                                time: formatTime(),
                            },
                        ]
                        : mappedMessages;

                    if (!agentJustEnded && previousText === nextText) {
                        return prev;
                    }

                    return finalMessages;
                });

                if (agentJustEnded) {
                    // Loop back to AI mode: re-enable the "Talk to an agent" button
                    // and clear any stale error state so the assistant flow resumes cleanly.
                    setAgentRequested(false);
                    setSendError('');
                }
            } catch {
                // Ignore transient polling errors so the chat stays responsive.
            }
        }, 3000);

        return () => window.clearInterval(interval);
    }, [conversation?.id, leadSubmitted]);

    useEffect(() => {
        setIsResumingSession(false);
    }, []);

    const humanDelay = () =>
        new Promise(res => setTimeout(res, 1200 + Math.random() * 1300));

    const ensureConversation = useCallback(async (): Promise<{ id: number; session_id: string } | null> => {
        if (conversation) return conversation;

        const newConversation = {
            id: Date.now(),
            session_id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `local-${Date.now()}`,
        };

        setConversation(newConversation);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(SESSION_STORAGE_KEY, newConversation.session_id);
        }

        return newConversation;
    }, [conversation]);

    const persistMessage = useCallback(async (
        activeConversation: { id: number; session_id: string } | null,
        sender: 'user' | 'assistant',
        text: string
    ) => {
        if (!activeConversation?.id) return;

        try {
            await chatApi.sendMessage(activeConversation.id, sender, text);
        } catch {
            // Swallow persistence errors so the chat remains usable even if the backend is temporarily unavailable.
        }
    }, []);

    const handleQuickReply = async (reply: string) => {
        const time = formatTime();

        setMessages(prev => [...prev, { type: 'user', text: reply, time }]);
        setIsTyping(true);
        setSendError('');

        const activeConversation = await ensureConversation();
        await persistMessage(activeConversation, 'user', reply);

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
            const replyText = predefinedReplies[reply];
            setMessages(prev => [...prev, { type: 'bot', text: replyText, time }]);
            void persistMessage(activeConversation, 'assistant', replyText);
            return;
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply })
            });
            const data = await res.json();
            const replyText = data.reply || 'No response from assistant.';
            setMessages(prev => [...prev, { type: 'bot', text: replyText, time }]);
            await persistMessage(activeConversation, 'assistant', replyText);
        } catch {
            setMessages(prev => [...prev, { type: 'bot', text: '⚠️ Sorry, something went wrong. Please try again.', time }]);
        }
    };

    const handleTalkToAgent = async () => {
        const time = formatTime();
        const userText = "I'd like to talk to a live agent.";

        setMessages(prev => [...prev, { type: 'user', text: userText, time }]);
        setIsTyping(true);
        setSendError('');
        setAgentRequested(true);

        try {
            const activeConversation = await ensureConversation();
            const targetId = conversation?.id ?? activeConversation?.id;

            if (targetId) {
                await chatApi.requestAgent(targetId, userText);
                // Seed the status ref so the next poll can correctly detect
                // the eventual "agent ended the chat" transition.
                previousStatusRef.current = 'agent_requested';
            }

            void persistMessage(activeConversation, 'user', userText);

            const agentReply =
                "Sure thing! 🙋 One of our team members will be with you shortly.\n\nIn the meantime, you can also reach us directly:\n\n📧 info@heroph.net\n📞 Mon–Fri, 9AM–6PM (PHT)\n\nWe'll keep this chat open so an agent can pick up right where we left off.";

            setMessages(prev => [...prev, { type: 'bot', text: agentReply, time: formatTime() }]);
            void persistMessage(activeConversation, 'assistant', agentReply);
        } catch {
            setSendError('We could not connect you to an agent right now. Please try again.');
            setMessages(prev => [...prev, { type: 'bot', text: '⚠️ We could not connect you to an agent right now. Please try again.', time: formatTime() }]);
            setAgentRequested(false);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const time = formatTime();
        const userMessage: Message = { type: "user", text: message, time };

        setMessages(prev => [...prev, userMessage]);
        setMessage("");
        setIsTyping(true);
        setSendError('');

        const activeConversation = await ensureConversation();
        await persistMessage(activeConversation, 'user', userMessage.text);

        await humanDelay();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text })
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                throw new Error(errBody?.error || 'Assistant request failed.');
            }

            const data = await res.json();
            const replyText = data.reply || "No response received.";
            setMessages(prev => [...prev, { type: "bot", text: replyText, time: formatTime() }]);
            await persistMessage(activeConversation, 'assistant', replyText);
        } catch {
            setSendError("Your message couldn't be sent. Please try again.");
            setMessages(prev => [...prev, {
                type: "bot",
                text: "⚠️ Something went wrong. Please try again.",
                time: formatTime()
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

    const handleContinue = async () => {
        const fieldsValid = validateAll();
        setAgreementTouched(true);

        if (!fieldsValid || !agreedToPolicy || isSubmittingLead) return;

        setIsSubmittingLead(true);
        setLeadError('');

        try {
            const payload = {
                full_name: leadInfo.name.trim(),
                email_address: leadInfo.email.trim(),
                phone_number: leadInfo.phone.trim(),
                company_name: leadInfo.company.trim() || undefined,
                privacy_policy_accepted: agreedToPolicy,
            };

            const startResponse = await chatApi.start(payload);

            const newConversation: ConversationState = {
                id: startResponse.conversation_id,
                session_id: startResponse.session_id,
                remoteConversationId: startResponse.conversation_id,
            };

            setConversation(newConversation);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(SESSION_STORAGE_KEY, newConversation.session_id);
            }

            const greeting = `Thanks, ${leadInfo.name.trim()}! Your details have been received. How can I help you today?`;
            setMessages([{ type: "bot", text: greeting, time: formatTime() }]);
            await persistMessage(newConversation, 'assistant', greeting);

            setLeadSubmitted(true);
        } catch (err) {
            const detail = err instanceof Error ? err.message : undefined;
            setLeadError(detail || "We couldn't save your details. Please try again.");
        } finally {
            setIsSubmittingLead(false);
        }
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
                    className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-[#1B3A8C] hover:bg-[#16318a] flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                    aria-label="Open chat"
                >
                    <MessageCircle className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
                </button>
            )}

            {/* Chat window */}
            {isChatOpen && (
                <div
                    role="dialog"
                    aria-label="HERO Serviced Office chat"
                    className="fixed bottom-6 right-5 z-50 w-[calc(100vw-40px)] md:w-95 h-145 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-[chatIn_0.2s_ease-out]"
                >
                    <style>{`
                        @keyframes chatIn {
                            from { opacity: 0; transform: translateY(12px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        @media (prefers-reduced-motion: reduce) {
                            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
                        }
                    `}</style>

                    {/* Header */}
                    <div className="bg-[#1B3A8C] px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Image
                                    src="/header_logo_icon.png"
                                    alt="HERO Serviced Office Logo"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain"
                                />
                            </div>

                            <div>
                                <p className="text-white font-semibold text-md leading-tight">
                                    HERO Serviced Office
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {leadSubmitted && (
                                <button
                                    onClick={handleTalkToAgent}
                                    disabled={isTyping || agentRequested}
                                    className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/15 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-white"
                                    aria-label="Talk to an agent"
                                    title="Talk to an agent"
                                >
                                    <UserRound className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                        {agentRequested ? 'Agent requested' : 'Talk to an agent'}
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="text-white/70 hover:text-white hover:bg-white/15 rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-gray-50">

                        {/* Resuming previous session */}
                        {isResumingSession && (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <p className="text-xs">Loading your conversation…</p>
                            </div>
                        )}

                        {/* Welcome screen */}
                        {!isResumingSession && !isStarted && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-[#1B3A8C] flex items-center justify-center shadow-lg">
                                    <span className="text-white text-2xl font-bold">H</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Welcome to HERO</h2>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                        I&apos;m your HERO Assistant. Before we begin, we&apos;ll collect a few details so we can better serve you.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsStarted(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] active:scale-95 transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                >
                                    Get started <ChevronRight className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-gray-400">Powered by HERO Serviced Office</p>
                            </div>
                        )}

                        {/* Lead form */}
                        {!isResumingSession && isStarted && !leadSubmitted && (
                            <div className="p-5 space-y-3">
                                <div className="text-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-900">Your contact details</h2>
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
                                                aria-invalid={Boolean(hasError)}
                                                aria-describedby={hasError ? `${field.key}-error` : undefined}
                                                disabled={isSubmittingLead}
                                                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${hasError
                                                    ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                                                    : touched[field.key] && !fieldErrors[field.key] && leadInfo[field.key]
                                                        ? "border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                                                        : "border-gray-200 focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20"
                                                    }`}
                                            />
                                            {hasError && (
                                                <p id={`${field.key}-error`} className="text-[11px] text-red-500 pl-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors[field.key]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="space-y-1.5 py-3">
                                    <label className="flex items-start gap-2 text-[11px] text-gray-500 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreedToPolicy}
                                            onChange={(e) => {
                                                setAgreedToPolicy(e.target.checked);
                                                setAgreementTouched(true);
                                            }}
                                            disabled={isSubmittingLead}
                                            aria-invalid={agreementTouched && !agreedToPolicy}
                                            className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/40 shrink-0"
                                        />
                                        <span>
                                            I agree to the{' '}
                                            <button
                                                type="button"
                                                onClick={() => setModal('privacy')}
                                                className="text-[#1565C0] underline hover:text-[#1B3A8C] transition-colors"
                                            >
                                                Privacy Policy
                                            </button>
                                            {' '}and{' '}
                                            <button
                                                type="button"
                                                onClick={() => setModal('terms')}
                                                className="text-[#1565C0] underline hover:text-[#1B3A8C] transition-colors"
                                            >
                                                Terms of Service
                                            </button>
                                            .
                                        </span>
                                    </label>
                                    {agreementTouched && !agreedToPolicy && (
                                        <p className="text-[11px] text-red-500 pl-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 shrink-0" /> Please accept the Privacy Policy and Terms of Service to continue.
                                        </p>
                                    )}
                                </div>

                                {leadError && (
                                    <p className="text-[11px] text-red-500 text-center flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3 shrink-0" /> {leadError}
                                    </p>
                                )}

                                <button
                                    className="w-full py-2.5 rounded-xl bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                    onClick={handleContinue}
                                    disabled={isSubmittingLead}
                                >
                                    {isSubmittingLead && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmittingLead ? 'Submitting…' : 'Continue'}
                                </button>
                                <p className="text-[11px] text-gray-400 text-center">Powered by HERO Serviced Office</p>
                            </div>
                        )}

                        {/* Messages */}
                        {!isResumingSession && leadSubmitted && (
                            <div className="p-4 space-y-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-[msgIn_0.2s_ease-out]`}>
                                        {msg.type === "bot" && (
                                            <div className="w-7 h-7 rounded-full bg-[#1B3A8C] flex items-center justify-center shrink-0 mr-2 mt-1">
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
                                        <div className="w-7 h-7 rounded-full bg-[#1B3A8C] flex items-center justify-center shrink-0">
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

                                {/* Send error */}
                                {sendError && !isTyping && (
                                    <p className="text-[11px] text-red-500 text-center flex items-center justify-center gap-1 pt-1">
                                        <AlertCircle className="w-3 h-3 shrink-0" /> {sendError}
                                    </p>
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
                                                    className="px-3 py-1.5 text-xs border border-[#1B3A8C] text-[#1B3A8C] rounded-full hover:bg-[#1B3A8C] hover:text-white active:scale-95 transition-all font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
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
                    {!isResumingSession && leadSubmitted && (
                        <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a message…"
                                    aria-label="Type a message"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20 bg-gray-50 transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="w-9 h-9 rounded-full bg-[#1B3A8C] hover:bg-[#16318a] active:scale-95 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 mt-2">
                                <button
                                    onClick={() => setModal('privacy')}
                                    className="hover:text-[#1565C0] transition-colors cursor-pointer"
                                >
                                    Privacy Policy
                                </button>
                                <span className="text-gray-200">·</span>
                                <button
                                    onClick={() => setModal('terms')}
                                    className="hover:text-[#1565C0] transition-colors cursor-pointer"
                                >
                                    Terms of Service
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-300 text-center mt-1">Powered by HERO Serviced Office</p>
                        </div>
                    )}
                </div>
            )}

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

            <style jsx global>{`
                @keyframes msgIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default Chatbot;