import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// Random delay between 1s – 2s so responses feel human, not instant
const humanDelay = () =>
    new Promise(res => setTimeout(res, 1000 + Math.random() * 1000));

// ── Server-side validation ────────────────────────────────────────────────────
function sanitize(input: unknown): string {
    if (typeof input !== "string") return "";
    return input
        .trim()
        .slice(0, 1000)                     // hard cap — no prompt-stuffing
        .replace(/<[^>]*>/g, "")            // strip HTML tags
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""); // strip control chars
}

function validateMessage(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
    const value = sanitize(raw);
    if (!value) return { ok: false, error: "Message is required." };
    if (value.length < 1) return { ok: false, error: "Message cannot be empty." };
    if (value.length > 1000) return { ok: false, error: "Message is too long (max 1000 characters)." };
    return { ok: true, value };
}

export async function POST(req: Request) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const raw = (body as Record<string, unknown>)?.message;
        const validation = validateMessage(raw);

        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { value: message } = validation;

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY is not set.");
            return NextResponse.json(
                { error: "Assistant is temporarily unavailable." },
                { status: 503 }
            );
        }

        const [completion] = await Promise.all([
            client.chat.completions.create({
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: `
You are the official AI assistant of HERO Serviced Office.

Company Information:
- Company Name: HERO Serviced Office
- Business Type: Serviced Offices & Flexible Workspaces
- Experience: 2+ years
- Projects Completed: 20+
- Locations:
  • 23F Tower6789, 6789 Ayala Avenue, Makati City 1209, Metro Manila, Philippines
  • 11F Insular Life Building, 6781 Ayala Avenue, Corner Paseo de Roxas, Makati City, Metro Manila, Philippines
- Services:
  • Flexible Office Spaces
  • Meeting & Conference Rooms
  • Virtual Offices
  • Coworking Spaces
  • Business Support Services
- Email: info@heroph.net

Behavior Rules:
- Always represent HERO Serviced Office. You are HERO's assistant, not a generic AI.
- If asked "Who are you?", say you are the official assistant of HERO Serviced Office.
- Never mention OpenAI, Groq, LLaMA, Meta, or that you are a generic language model.
- Answer questions about services, pricing inquiries, or company info using the details above.
- Keep responses concise, professional, and friendly — 2–4 short paragraphs or bullet points maximum.
- Encourage users to email info@heroph.net for detailed quotations or site visits.
- If a question is outside the company scope, answer helpfully while staying in the HERO identity.
- Use bullet points when listing multiple items.
- Never fabricate pricing, floor plans, or information not provided above.

Tone: Professional, warm, clear, and confident.
                        `,
                    },
                    {
                        role: "user",
                        content: message, // already sanitized above
                    },
                ],
                temperature: 0.7,
                max_tokens: 512,
            }),
            humanDelay(),
        ]);

        return NextResponse.json({
            reply:
                completion.choices?.[0]?.message?.content ||
                "No response received.",
        });
    } catch (error) {
        console.error("Groq API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch AI response" },
            { status: 500 }
        );
    }
}