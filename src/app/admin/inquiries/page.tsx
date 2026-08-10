"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import {
  Search,
  Eye,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Mail,
  Pencil,
  ChevronDown,
  Inbox,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  ChevronRight as ChevronRightIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface Contact {
  id: number
  name: string
  email: string
  phone: string
  company?: string | null
  inquiry_type: string
  message: string
  details?: Record<string, string> | null
  status: string
  created_at: string
  updated_at?: string
}

interface ContactStats {
  total: number
  new: number
  contacted: number
  completed: number
}

type StatKey = "total" | "new" | "contacted" | "completed"

const STAT_TONE_STYLES: Record<"neutral" | "blue" | "amber" | "green", { bg: string; text: string }> = {
  neutral: { bg: "bg-slate-100", text: "text-slate-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700" },
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
  contacted: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
  completed: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
}

function mapDisplayStatus(status: string | null | undefined) {
  switch (status) {
    case "replied":
    case "in_progress":
      return "contacted"
    case "closed":
      return "completed"
    default:
      return status || "new"
  }
}

function mapApiStatus(status: string | null | undefined) {
  switch (status) {
    case "contacted":
      return "replied"
    case "completed":
      return "closed"
    default:
      return status || "new"
  }
}

const INQUIRY_LABELS: Record<string, string> = {
  "private-office": "Private Office",
  "virtual-office": "Virtual Office",
  "co-working-space": "Co-Working Space",
  "meeting-room": "Meeting Room",
  "event-space": "Event Space",
  "ocular-visit": "Ocular Visit",
  partnership: "Partnership",
  others: "Others",
}

function greeting(c: Contact) {
  const firstName = c.name?.split(" ")[0] || c.name
  return `Good Day Mr/Ms ${firstName},`
}

const QUOTATION_BASE_URL = "/quotation"

const BRANCH_LABELS: Record<string, string> = {
  "tower-6789": "Tower 6789",
  "insular-life": "Insular Life Building",
  both: "Both Branches",
}

function quotationLink(c: Contact, inquiryType: string) {
  const serviceValue = inquiryType === "co-working-space" ? "coworking" : inquiryType

  const params = new URLSearchParams({
    service: serviceValue,
    ref: String(c.id),
    type: inquiryType,
  })

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}${QUOTATION_BASE_URL}?${params.toString()}`
}

type TemplateBuilder = (c: Contact) => { subject: string; body: string }

function getDetailValue(c: Contact, ...keys: string[]) {
  for (const key of keys) {
    const value = c.details?.[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function getBranchValue(c: Contact) {
  const rawBranch = getDetailValue(c, "branchInterest", "interestedBranch")
  return BRANCH_LABELS[rawBranch] ?? rawBranch ?? "Not specified"
}

function getServiceInterestValue(c: Contact) {
  const rawService = getDetailValue(c, "serviceOfInterest")
  if (!rawService) return "Not specified"
  return INQUIRY_LABELS[rawService] ?? formatLabel(rawService)
}

function getPreferredVisitSchedule(c: Contact) {
  const date = getDetailValue(c, "visitDate")
  const time = getDetailValue(c, "visitTime", "preferredTime", "time")
  const parts = [date ? formatDate(date) : "", time].filter(Boolean)
  return parts.join(" at ") || "Not specified"
}

const EMAIL_TEMPLATES: Record<string, TemplateBuilder> = {
  "private-office": (c) => ({
    subject: `Your Private Office Inquiry at HERO Serviced Office`,
    body: `${greeting(c)}

We’d love to help you find the right fully furnished workspace for your team — with Flexibility That Fits Your Needs. 

Here's a quick overview: 
- Pricing: starts at PHP 11,000/seat/month  to  PHP 12,000/seat/month 
- Office sizes: available from 1 to 35 persons
- Contract terms: 3, 6, 9, and  12 months 
- Inclusions: fully furnished workstation, prestigious business address, high-speed internet (up to 600 Mbps), professional reception services, mail and parcel handling, utilities, housekeeping, pantry and common area access, telephone booth access, access to multifunctional printer, 24/7 secure access.
- Add-ons available: parking slots, dedicated internet line, dedicated IP, telephone lines, conference room access and lockers.

Interested in our service? Request your quotation here: ${quotationLink(c, "private-office")}

Best regards,

HERO Serviced Office`,
  }),

  "virtual-office": (c) => ({
    subject: `Your Virtual Office Inquiry at HERO Serviced Office`,
    body: `${greeting(c)}

Thank you for reaching out about our Virtual Office solutions. Here are our current packages:

- Basic - PHP 2,000/month: business address, registration document assistance, mail handling, 1 day co-working access, 1 hour conference room access
- Standard - PHP 3,000/month: business address, registration document assistance, mail handling, 2 days co-working access, 2 hours conference room access
- Premium - PHP 5,000/month: business address, registration document assistance, mail handling, 5 days co-working access, 3 hours conference room access

Contract terms are available for 6 or 12 months, and the address can be used for official business registration.

Interested in our service? Request your quotation here: ${quotationLink(c, "virtual-office")}

Best regards,

HERO Serviced Office`,
  }),

  "co-working-space": (c) => ({
    subject: `Your Co-Working Space Inquiry at HERO Serviced Office`,
    body: `${greeting(c)}

Thanks for your interest in our Co-Working Space. It's a great fit if you'd like a flexible, professional workspace without a long-term commitment. 

- Pricing: PHP 550/day, PHP 2,000/week, or PHP 6,000/month 
- Inclusions: flexible workstation, high-speed internet (up to 600 Mbps), air-conditioned environment, pantry and lounge access, 24/7 secure access, phone booth access, and free- flowing coffee, tea, and water 
- Add-ons: printing and scanning services, access cards, meeting room access

Interested in our service? Request your quotation here: ${quotationLink(c, "co-working-space")}

Best regards,

HERO Serviced Office`,
  }),

  "meeting-room": (c) => ({
    subject: `Your Conference Room Booking Inquiry at HERO Serviced Office`,
    body: `${greeting(c)}

Thank you for your interest in booking our Meeting Room. Here are the details:

- Pricing: PHP 1,500/hour or PHP 9,000/day (8-10 seater) and PHP 3,000/hour or PHP 18,000/day (18-20 seater)
- Inclusions: fully furnished conference room, Wi-fi connection  (up to 600 Mbps), reception services, and free-flowing coffee, tea, and water
- Add-ons: printing and scanning services, projector and screen

Interested in our service? Request your quotation here: ${quotationLink(c, "meeting-room")}

Best regards,

HERO Serviced Office`,
  }),

  "event-space": (c) => ({
    subject: `Your Event & Activity Space Inquiry at HERO Serviced Office`,
    body: `${greeting(c)}

Thank you for considering HERO Serviced Office for your upcoming event. Our Event/Activity Area is a flexible, fully serviced space designed for workshops, training, networking sessions, and product launches.

- Pricing: starts at PHP 7,000 depending on setup and number of participants and duration of the event
- Inclusions: flexible event space setup, Wifi- connection (up to 600 Mbps), reception services, utilities, basic furniture setup, lounge access, pantry access, free-flowing coffee  and 24/7 secure access (subject to booking schedule)
- Add-ons: audio-visual equipment, sound system rental, event styling, catering coordination, conference room and extra seating

Interested in our service? Request your quotation here: ${quotationLink(c, "event-space")}

Best regards,

HERO Serviced Office`,
  }),

  "ocular-visit": (c) => ({
    subject: `Scheduling Your Ocular Visit at HERO Serviced Office`,
    body: `${greeting(c)}

Thank you for your interest in visiting HERO Serviced Office. We'd be happy to give you a tour of our workspaces at Tower 6789 or the Insular Life Building along Ayala Avenue, Makati.

Here’s your scheduled ocular visit details:
- Preferred branch: ${getBranchValue(c)}
- Preferred date and time: ${getPreferredVisitSchedule(c)}
- Service of Interest: ${getServiceInterestValue(c)}

We look forward to showing you around and discussing the best fit for your business.

Best regards,

HERO Serviced Office`,
  }),

  partnership: (c) => ({
    subject: `Thank You for Your Partnership Inquiry - HERO Serviced Office`,
    body: `${greeting(c)}

Thank you for reaching out about a potential partnership with HERO Serviced Office. We're always glad to explore opportunities that create value for both sides.

Could you share a bit more detail about the partnership you have in mind (e.g., referral, corporate agreement, event collaboration) along with your company background? This will help us route your inquiry to the right team and respond with the most relevant information.

Best regards,

HERO Serviced Office`,
  }),

  others: (c) => ({
    subject: `Following Up on Your Inquiry - HERO Serviced Office`,
    body: `${greeting(c)}

Thank you for reaching out to HERO Serviced Office. We received your message:

"${c.message || "—"}"

We'd love to learn more about what you're looking for so we can point you to the right workspace solution - Private Office, Virtual Office, Co-Working Space, Conference Room, or Event Space. Could you share a few more details, or let us know a good time for a quick call?

Best regards,

HERO Serviced Office`,
  }),
}

function buildTemplateFor(c: Contact) {
  const builder = EMAIL_TEMPLATES[c.inquiry_type] ?? EMAIL_TEMPLATES.others
  return builder(c)
}

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

// Builds a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 12
function getPageNumbers(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push("…");
    result.push(p);
  });
  return result;
}

function buildDrillDownData(stats: ContactStats, contacts: Contact[]) {
  const byType = contacts.reduce<Record<string, number>>((acc, contact) => {
    const label = INQUIRY_LABELS[contact.inquiry_type] ?? contact.inquiry_type
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})

  const topTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, value: String(count) }))

  const percentageText = (n: number) => (stats.total > 0 ? `${Math.round((n / stats.total) * 100)}% of total` : "—")

  return {
    total: {
      title: "All Inquiries",
      items: [
        { label: "New", value: String(stats.new), sub: percentageText(stats.new) },
        { label: "Contacted", value: String(stats.contacted), sub: percentageText(stats.contacted) },
        { label: "Completed", value: String(stats.completed), sub: percentageText(stats.completed) },
        ...topTypes,
      ],
    },
    new: {
      title: "New Inquiries",
      items: [
        { label: "Count", value: String(stats.new), sub: percentageText(stats.new) },
        { label: "Awaiting first reply", value: String(stats.new) },
        ...topTypes,
      ],
    },
    contacted: {
      title: "Contacted Inquiries",
      items: [
        { label: "Count", value: String(stats.contacted), sub: percentageText(stats.contacted) },
        { label: "Replied via email", value: String(stats.contacted) },
        ...topTypes,
      ],
    },
    completed: {
      title: "Completed Inquiries",
      items: [
        { label: "Count", value: String(stats.completed), sub: percentageText(stats.completed) },
        { label: "Closed out", value: String(stats.completed) },
        ...topTypes,
      ],
    },
  } as Record<StatKey, { title: string; items: { label: string; value: string; sub?: string }[] }>
}

function StatCard({
  id,
  label,
  value,
  icon: Icon,
  tone,
  onClick,
}: {
  id: StatKey
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tone: "neutral" | "blue" | "amber" | "green"
  onClick: (id: StatKey) => void
}) {
  const toneStyles = STAT_TONE_STYLES[tone]

  return (
    <button
      onClick={() => onClick(id)}
      className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-200 text-left w-full border border-transparent hover:border-[#C5D2EC]"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${tone === "amber" ? "bg-amber-500" : tone === "green" ? "bg-green-500" : "bg-[#0D47A1]"}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneStyles.bg}`}>
          <Icon className={`w-5 h-5 ${toneStyles.text}`} />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D47A1] transition-colors" />
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
    </button>
  )
}

type ToastTone = "success" | "error"

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${t.tone === "success"
            ? "bg-white border-green-200"
            : "bg-white border-red-200"
            }`}
        >
          {t.tone === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-slate-800 flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 transition shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<ContactStats>({ total: 0, new: 0, contacted: 0, completed: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [activeStat, setActiveStat] = useState<StatKey | null>(null)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")

  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [selected, setSelected] = useState<Contact | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const [statusTarget, setStatusTarget] = useState<Contact | null>(null)
  const [statusValue, setStatusValue] = useState("")
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Reply-by-email dialog state
  const [replyTarget, setReplyTarget] = useState<Contact | null>(null)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replySubject, setReplySubject] = useState("")
  const [replyBody, setReplyBody] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(0)

  const pushToast = useCallback((message: string, tone: ToastTone) => {
    const id = ++toastIdRef.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const dismissToast = (id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }

  async function fetchContacts(background = false) {
    if (background) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
      })

      if (search) params.append("search", search)
      if (status) params.append("status", mapApiStatus(status))
      if (type) params.append("inquiry_type", type)

      const token = localStorage.getItem("token")

      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`Request failed (${res.status})`)

      const data = await res.json()
      const list = Array.isArray(data.data) ? data.data : []
      const mappedContacts = list.map((contact: Contact) => ({
        ...contact,
        status: mapDisplayStatus(contact.status),
      }))

      setContacts(mappedContacts)
      setLastPage(data.last_page ?? 1)
      setTotal(data.total ?? mappedContacts.length)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load inquiries. Please try again."
      )
      setContacts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function fetchStats() {
    setStatsLoading(true)
    setStatsError(null)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/admin/contacts?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`Request failed (${res.status})`)

      const data = await res.json()
      const list = Array.isArray(data.data) ? data.data : []
      const statsData = list.reduce(
        (acc: ContactStats, inquiry: Contact) => {
          const displayStatus = mapDisplayStatus(inquiry.status)
          if (displayStatus === "new") {
            acc.new += 1
          } else if (displayStatus === "contacted") {
            acc.contacted += 1
          } else if (displayStatus === "completed") {
            acc.completed += 1
          }
          acc.total += 1
          return acc
        },
        { total: 0, new: 0, contacted: 0, completed: 0 },
      )

      setStats(statsData)
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : "Could not load stats."
      )
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, type])

  useEffect(() => {
    fetchStats()
  }, [])

  function handleRefresh() {
    fetchContacts(true)
    fetchStats()
  }

  function openStatusDialog(c: Contact) {
    setStatusTarget(c)
    setStatusValue(c.status)
    setStatusOpen(true)
  }

  async function confirmStatusUpdate() {
    if (!statusTarget) return
    setStatusSaving(true)

    try {
      const token = localStorage.getItem("token")
      const apiStatus = mapApiStatus(statusValue)

      await fetch(`/api/admin/contacts/${statusTarget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: apiStatus }),
      })

      setContacts((prev) =>
        prev.map((c) =>
          c.id === statusTarget.id ? { ...c, status: mapDisplayStatus(apiStatus) } : c
        )
      )
      setStatusOpen(false)
      setStatusTarget(null)
      fetchStats()
    } catch {
      // keep dialog open so the admin can retry
    } finally {
      setStatusSaving(false)
    }
  }

  function openDeleteDialog(c: Contact) {
    setDeleteTarget(c)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      const token = localStorage.getItem("token")

      await fetch(`/api/admin/contacts/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchStats()
    } catch {
      // keep dialog open so the admin can retry
    } finally {
      setDeleting(false)
    }
  }

  // ---- Reply-by-email handlers ----

  function openReplyDialog(c: Contact) {
    const { subject, body } = buildTemplateFor(c)
    setReplyTarget(c)
    setReplySubject(subject)
    setReplyBody(body)
    setSendError(null)
    setSendSuccess(false)
    setReplyOpen(true)
  }

  // Regenerate the draft from the template, discarding manual edits.
  function resetReplyTemplate() {
    if (!replyTarget) return
    const { subject, body } = buildTemplateFor(replyTarget)
    setReplySubject(subject)
    setReplyBody(body)
  }

  async function confirmSendReply() {
    if (!replyTarget) return
    setSending(true)
    setSendError(null)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`/api/admin/contacts/${replyTarget.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: replyTarget.email,
          subject: replySubject,
          message: replyBody,
        }),
      })

      if (!res.ok) throw new Error(`Request failed (${res.status})`)

      // Move the inquiry to "contacted" once a reply has gone out.
      setContacts((prev) =>
        prev.map((c) =>
          c.id === replyTarget.id ? { ...c, status: "contacted" } : c
        )
      )
      setSendSuccess(true)
      fetchStats()
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "Could not send the email. Please try again."
      )
    } finally {
      setSending(false)
    }
  }

  const hasActiveFilters = Boolean(search || status || type);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setType("");
    setPage(1);
  }

  const pageNumbers = useMemo(
    () => getPageNumbers(page, lastPage),
    [page, lastPage],
  );

  const drillDownData = useMemo(
    () => buildDrillDownData(stats, contacts),
    [stats, contacts],
  );

  const activeDrillDown = activeStat ? drillDownData[activeStat] : null;

  return (
    <main className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 space-y-6">

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard id="total" label="Total Inquiries" value={stats.total} icon={Inbox} tone="neutral" onClick={setActiveStat} />
          <StatCard id="new" label="New" value={stats.new} icon={Mail} tone="blue" onClick={setActiveStat} />
          <StatCard id="contacted" label="Contacted" value={stats.contacted} icon={Send} tone="amber" onClick={setActiveStat} />
          <StatCard id="completed" label="Completed" value={stats.completed} icon={CheckCircle2} tone="green" onClick={setActiveStat} />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search name, email, message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-44"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-48"
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All Inquiry</option>
            <option value="private-office">Private Office</option>
            <option value="virtual-office">Virtual Office</option>
            <option value="co-working-space">Co-Working Space</option>
            <option value="meeting-room">Meeting Room</option>
            <option value="event-space">Event Space</option>
            <option value="ocular-visit">Ocular Visit</option>
            <option value="partnership">Partnership</option>
            <option value="others">Others</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm font-semibold text-[#0B1F4A] hover:border-[#1B3A8C] hover:text-[#1B3A8C] transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Inquiry</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#0D47A1] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-[#64748B]">Loading inquiries...</span>
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
                          onClick={() => fetchContacts()}
                          className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Try again
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && contacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                          <Inbox className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          No Inquiries found
                        </p>
                        <p className="text-xs text-slate-400">
                          {hasActiveFilters
                            ? "Try a different search term or clear your filters."
                            : "New inquiries will show up here."}
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  contacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelected(c)
                        setViewOpen(true)
                      }}
                      className="cursor-pointer hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {INQUIRY_LABELS[c.inquiry_type] ?? c.inquiry_type}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openStatusDialog(c)
                          }}
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize transition hover:opacity-80 ${STATUS_STYLES[c.status] ??
                            "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                            }`}
                        >
                          {c.status}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(c.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openReplyDialog(c)
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Reply by email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelected(c)
                              setViewOpen(true)
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeleteDialog(c)
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
        {!loading && !error && contacts.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 md:flex-row">
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

              <div className="hidden items-center gap-1 sm:flex">
                {pageNumbers.map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-sm text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${page === p
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 sm:hidden">
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
      </section>

      {activeDrillDown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveStat(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">{activeDrillDown.title}</h2>
              <button
                onClick={() => setActiveStat(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-2">
              {activeDrillDown.items.map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
                  {item.sub && <p className="mt-0.5 text-xs text-slate-400">{item.sub}</p>}
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setActiveStat(null)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      {viewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F4A]/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5EAF2] px-6 py-5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-11 h-11 rounded-full bg-[#1B3A8C] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  {selected.name
                    ?.trim()
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-[#0B1F4A] truncate">
                    {selected.name}
                  </h2>
                  <p className="text-xs text-[#64748B] truncate">
                    {INQUIRY_LABELS[selected.inquiry_type] ?? selected.inquiry_type} · {formatDate(selected.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-full p-1.5 text-[#64748B] hover:bg-[#F0F4FB] transition shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[selected.status] ??
                    "bg-slate-100 text-slate-600"
                    }`}
                >
                  {selected.status}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB] mb-3">
                  Contact
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-4 py-1">
                    <span className="text-sm text-[#64748B]">Email</span>
                    <a href={`mailto:${selected.email}`} className="text-sm font-semibold text-[#0B1F4A] hover:underline text-right truncate max-w-[65%]">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-1">
                    <span className="text-sm text-[#64748B]">Phone</span>
                    <a href={`tel:${selected.phone}`} className="text-sm font-semibold text-[#0B1F4A] hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-1">
                    <span className="text-sm text-[#64748B]">Company</span>
                    <span className="text-sm font-semibold text-[#0B1F4A]">{selected.company || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-[#D9E2F0] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB] mb-3">
                  Message
                </p>
                <p className="rounded-xl bg-[#F8FAFD] border border-[#E5EAF2] p-3 text-sm leading-relaxed text-[#0B1F4A]">
                  {selected.message || "—"}
                </p>
              </div>

              {selected.details && Object.keys(selected.details).length > 0 && (
                <div className="border-t border-dashed border-[#D9E2F0] pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB] mb-3">
                    Additional details
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(selected.details).map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-4 py-1">
                        <span className="text-sm text-[#64748B]">{formatLabel(k)}</span>
                        <span className="text-sm font-semibold text-[#0B1F4A] text-right">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#E5EAF2] px-6 py-4">
              <button
                onClick={() => {
                  setViewOpen(false)
                  openReplyDialog(selected)
                }}
                className="flex items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#132a5e] transition"
              >
                <Mail className="h-4 w-4" />
                Reply by email
              </button>
              <button
                onClick={() => {
                  setViewOpen(false)
                  openStatusDialog(selected)
                }}
                className="rounded-xl bg-[#1B3A8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16316F] transition"
              >
                Update status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply by Email Dialog */}
      {replyOpen && replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F4A]/50 p-4">
          <div className="flex w-full max-w-xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-[#0B1F4A]">
                  Reply to {replyTarget.name}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Draft generated from the{" "}
                  <span className="font-medium text-[#0B1F4A]">
                    {INQUIRY_LABELS[replyTarget.inquiry_type] ?? replyTarget.inquiry_type}
                  </span>{" "}
                  inquiry template
                </p>
              </div>
              <button
                onClick={() => setReplyOpen(false)}
                className="rounded-full p-1.5 text-[#64748B] hover:bg-[#F0F4FB] transition shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-5">
              {sendSuccess ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </span>
                  <p className="text-sm font-medium text-[#0B1F4A]">
                    Email sent to {replyTarget.email}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    This inquiry has been marked as contacted.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFD] border border-[#E5EAF2] px-3 py-2.5 text-sm text-[#64748B]">
                    <Mail className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <span>
                      To: <span className="font-semibold text-[#0B1F4A]">{replyTarget.email}</span>
                    </span>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB]">
                      Subject
                    </label>
                    <input
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full rounded-xl border border-[#D9E2F0] px-3 py-2.5 text-sm text-[#0B1F4A] focus:border-[#1B3A8C] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB]">
                        Message
                      </label>
                      <button
                        onClick={resetReplyTemplate}
                        className="text-xs font-semibold text-[#1B3A8C] hover:text-[#16316F]"
                      >
                        Reset to template
                      </button>
                    </div>
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={14}
                      className="w-full resize-y rounded-xl border border-[#D9E2F0] px-3 py-2.5 text-sm leading-relaxed text-[#0B1F4A] focus:border-[#1B3A8C] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10"
                    />
                  </div>

                  {sendError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {sendError}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E5EAF2] px-6 py-4">
              {!sendSuccess && (
                <button
                  onClick={confirmSendReply}
                  disabled={sending || !replySubject.trim() || !replyBody.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#1B3A8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16316F] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send email
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      {statusOpen && statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F4A]/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FB]">
                  <Pencil className="w-6 h-6 text-[#1B3A8C]" />
                </div>
                <button
                  onClick={() => setStatusOpen(false)}
                  className="rounded-full p-1.5 text-[#64748B] hover:bg-[#F0F4FB] transition shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#0B1F4A]">
                Update status
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                {statusTarget.name}
              </p>

              <label className="block mt-5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B] mb-1.5">
                New status
              </label>
              <div className="relative">
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-sm font-medium text-[#0B1F4A] capitalize focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] cursor-pointer"
                >
                  {["new", "contacted", "completed"].map((opt) => (
                    <option key={opt} value={opt} className="capitalize">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStatusOpen(false)}
                  className="flex-1 rounded-xl border border-[#D9E2F0] py-3 text-sm font-medium text-[#0B1F4A] hover:bg-[#F8FAFD] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  disabled={statusSaving || statusValue === statusTarget.status}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1B3A8C] py-3 text-sm font-semibold text-white hover:bg-[#16316F] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal - shared by table row and detail modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-center text-[#0B1F4A]">
                Delete Inquiry?
              </h2>

              <p className="mt-3 text-center text-sm text-[#64748B] leading-6">
                Are you sure you want to delete this request
                {deleteTarget.name ? ` for ${deleteTarget.name}` : ""}?
                This action cannot be undone.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-[#D9E2F0] py-3 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

    </main>
  )
}