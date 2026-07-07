// 📁 PUT THIS FILE AT: app/admin/contact/page.tsx
// (this is the ADMIN PAGE itself — different from the app/api/admin/contact/
// route files from before, which are the backend proxy routes this page calls)

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Calendar,
  Tag,
  Mail,
  Reply,
  Sparkles,
  Send,
  Building2,
  Phone,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ThreadEntry {
  type: "inbound" | "outbound";
  from: string;
  subject: string;
  body: string;
  created_at: string;
}

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  inquiry_type: string;
  message: string;
  dynamic_data: Record<string, string> | null;
  status: "new" | "in_progress" | "replied" | "closed";
  thread: ThreadEntry[];
  last_replied_at: string | null;
  created_at: string;
}

// ─── Static config ─────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
  in_progress: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
  replied: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  replied: "Replied",
  closed: "Closed",
};

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  "private-office": "Private Office",
  "virtual-office": "Virtual Office",
  "co-working-space": "Co-Working Space",
  "meeting-room": "Meeting Room",
  "event-space": "Event Space",
  "ocular-visit": "Ocular Visit",
  partnership: "Partnership",
  others: "Others",
};

// "nakaabang" canned replies — pre-written but every field stays editable
// before sending. {{name}} gets swapped for the inquiry's actual name.
interface ReplyTemplate {
  id: string;
  label: string;
  appliesTo?: string[]; // inquiry_type values this template is most relevant for
  subject: string;
  body: string;
}

const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "acknowledge",
    label: "Acknowledge & follow up",
    subject: "We received your inquiry",
    body: `Hi {{name}},

Thank you for reaching out to HERO Serviced Office. We've received your inquiry and our team is reviewing the details now.

We'll follow up shortly with the information you need. In the meantime, feel free to reply here if you have any additional questions.

Best regards,
HERO Serviced Office Team`,
  },
  {
    id: "private-office",
    label: "Private Office — next steps",
    appliesTo: ["private-office"],
    subject: "Your Private Office inquiry",
    body: `Hi {{name}},

Thanks for your interest in a private office with us. To move forward, could you confirm the following:

- Preferred move-in date
- Number of seats needed
- Preferred lease term

Once we have these, we'll send over available units and pricing tailored to your needs.

Best regards,
HERO Serviced Office Team`,
  },
  {
    id: "virtual-office",
    label: "Virtual Office — plan details",
    appliesTo: ["virtual-office"],
    subject: "Your Virtual Office inquiry",
    body: `Hi {{name}},

Thanks for your interest in our Virtual Office plans. Here's a quick overview of what's included at each tier:

- Address Only — business address for registration/mail
- Address + Reception — adds mail handling and front-desk support
- Address + Reception + Phone Answering — full package with call handling

Let us know which plan fits best and we'll get your setup started.

Best regards,
HERO Serviced Office Team`,
  },
  {
    id: "meeting-room",
    label: "Meeting Room — availability",
    appliesTo: ["meeting-room", "event-space"],
    subject: "Your booking inquiry",
    body: `Hi {{name}},

Thanks for reaching out. Could you confirm your preferred date and time so we can check availability for you?

Once confirmed, we'll send over the booking details and rate for your session.

Best regards,
HERO Serviced Office Team`,
  },
  {
    id: "ocular-visit",
    label: "Ocular Visit — schedule",
    appliesTo: ["ocular-visit"],
    subject: "Scheduling your site visit",
    body: `Hi {{name}},

We'd be happy to have you visit our office. Could you confirm your preferred date and time?

Our team will prepare a short walkthrough of the space and answer any questions you have on-site.

Best regards,
HERO Serviced Office Team`,
  },
  {
    id: "closing",
    label: "Closing the loop",
    subject: "Following up on your inquiry",
    body: `Hi {{name}},

Just checking in — let us know if you still need any information from us, or if you'd like to proceed.

We're happy to help whenever you're ready.

Best regards,
HERO Serviced Office Team`,
  },
];

const STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function authHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function fillTemplate(text: string, name: string) {
  return text.replace(/\{\{name\}\}/g, name || "there");
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ContactAdmin() {
  const [items, setItems] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Reply / detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<ContactInquiry | null>(null);

  const [templateId, setTemplateId] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ContactInquiry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  async function fetchInquiries() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
      });

      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json();

      setItems(data.data ?? []);
      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? (data.data ?? []).length);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load inquiries. Please try again.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);

  // Relevant templates float to the top for this inquiry's type, but every
  // template stays selectable — nothing is hidden.
  const orderedTemplates = useMemo(() => {
    if (!selected) return REPLY_TEMPLATES;
    return [...REPLY_TEMPLATES].sort((a, b) => {
      const aMatch = a.appliesTo?.includes(selected.inquiry_type) ? 0 : 1;
      const bMatch = b.appliesTo?.includes(selected.inquiry_type) ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [selected]);

  async function openDetail(row: ContactInquiry) {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelected(row);
    setTemplateId("");
    setReplySubject(
      `Re: Your ${INQUIRY_TYPE_LABELS[row.inquiry_type] ?? row.inquiry_type} inquiry`,
    );
    setReplyBody("");
    setSendError(null);
    setSendSuccess(false);

    try {
      // fetch full record so we have the complete thread, not just the list row
      const res = await fetch(`/api/admin/contacts/${row.id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setSelected(data.data ?? row);
    } catch {
      // keep the row data we already had if the detail fetch fails
    } finally {
      setDetailLoading(false);
      setTimeout(
        () => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  }

  function applyTemplate(id: string) {
    setTemplateId(id);
    if (!id) return;
    const tpl = REPLY_TEMPLATES.find((t) => t.id === id);
    if (!tpl || !selected) return;
    setReplySubject(fillTemplate(tpl.subject, selected.name));
    setReplyBody(fillTemplate(tpl.body, selected.name));
  }

  async function sendReply() {
    if (!selected || !replyBody.trim()) {
      setSendError("Write a message before sending.");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch(`/api/admin/contacts/${selected.id}/reply`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          subject: replySubject,
          message: replyBody,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const updated: ContactInquiry = data.data ?? {
        ...selected,
        status: "replied",
        thread: [
          ...(selected.thread ?? []),
          {
            type: "outbound",
            from: "admin",
            subject: replySubject,
            body: replyBody,
            created_at: new Date().toISOString(),
          },
        ],
      };

      setSelected(updated);
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it)),
      );
      setReplyBody("");
      setTemplateId("");
      setSendSuccess(true);
      setTimeout(
        () => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Failed to send reply.",
      );
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(newStatus: ContactInquiry["status"]) {
    if (!selected) return;
    const prevStatus = selected.status;
    setSelected({ ...selected, status: newStatus });

    try {
      const res = await fetch(`/api/admin/contacts/${selected.id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();

      setItems((prev) =>
        prev.map((it) =>
          it.id === selected.id ? { ...it, status: newStatus } : it,
        ),
      );
    } catch {
      setSelected((s) => (s ? { ...s, status: prevStatus } : s));
    }
  }

  function openDeleteDialog(row: ContactInquiry) {
    setDeleteTarget(row);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/contacts/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      // keep dialog open so the admin can retry
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <main className="mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Contact Inquiries
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Reply to inquiries submitted through the contact form
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Search name, email, message..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-48"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <tr>
                  <th className="px-5 py-3 text-left">From</th>
                  <th className="px-5 py-3 text-left">Inquiry Type</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Received</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading inquiries...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <p className="text-sm font-medium text-slate-700">
                          {error}
                        </p>
                        <button
                          onClick={fetchInquiries}
                          className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Try again
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm text-slate-500">
                        No inquiries match your filters.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  items.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-blue-50/40"
                      onClick={() => openDetail(row)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {row.name}
                        </p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          <Tag className="h-3 w-3" />
                          {INQUIRY_TYPE_LABELS[row.inquiry_type] ??
                            row.inquiry_type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            STATUS_STYLES[row.status] ??
                            "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                          }`}
                        >
                          {STATUS_LABELS[row.status] ?? row.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(row.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(row);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="View & Reply"
                          >
                            <Reply className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(row);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-sm text-slate-500">
              {total > 0 ? `${total} total inquiries` : null}
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Page {page} of {lastPage}
              </span>

              <button
                disabled={page === lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Gmail-style Detail / Reply Dialog ── */}
      {detailOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {INQUIRY_TYPE_LABELS[selected.inquiry_type] ??
                    selected.inquiry_type}{" "}
                  inquiry
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {selected.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {selected.phone}
                  </span>
                  {selected.company && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {selected.company}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{" "}
                    {formatDate(selected.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selected.status}
                  onChange={(e) =>
                    updateStatus(e.target.value as ContactInquiry["status"])
                  }
                  className={`rounded-full border-none px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    STATUS_STYLES[selected.status]
                  }`}
                >
                  {STATUS_FILTERS.filter((f) => f.value).map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Thread — Gmail style, oldest on top */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-6 py-5">
              {detailLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                (selected.thread ?? []).map((entry, i) => {
                  const isInbound = entry.type === "inbound";
                  return (
                    <div
                      key={i}
                      className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                          isInbound
                            ? "bg-white text-slate-700 ring-1 ring-inset ring-slate-200"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        <div
                          className={`mb-1 flex items-center justify-between gap-3 text-xs ${
                            isInbound ? "text-slate-400" : "text-blue-100"
                          }`}
                        >
                          <span className="font-medium">
                            {isInbound ? selected.name : "You (Admin)"}
                          </span>
                          <span>{formatDateTime(entry.created_at)}</span>
                        </div>
                        <p
                          className={`whitespace-pre-wrap text-sm ${
                            isInbound ? "text-slate-700" : "text-white"
                          }`}
                        >
                          {entry.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Reply composer */}
            <div className="border-t border-slate-100 bg-white px-6 py-4">
              {sendError && (
                <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {sendError}
                </p>
              )}
              {sendSuccess && !sendError && (
                <p className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
                  Reply sent.
                </p>
              )}

              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-400" />
                <select
                  value={templateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Use a canned reply... (editable after)
                  </option>
                  {orderedTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                      {t.appliesTo?.includes(selected.inquiry_type) ? " ★" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <input
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Subject"
                className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={4}
                placeholder="Write your reply... (selecting a canned reply above fills this in, but you can edit anything before sending)"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Sent to {selected.email} — quoted history included
                  automatically.
                </p>
                <button
                  onClick={sendReply}
                  disabled={sending || !replyBody.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Delete this inquiry?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    The inquiry from{" "}
                    <span className="font-medium text-slate-700">
                      {deleteTarget.name}
                    </span>{" "}
                    will be permanently removed. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
