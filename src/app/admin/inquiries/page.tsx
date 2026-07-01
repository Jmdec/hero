"use client"

import { useEffect, useState } from "react"
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
  Phone,
  Building2,
  Calendar,
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

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
  contacted: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
  completed: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
}

const INQUIRY_LABELS: Record<string, string> = {
  "private-office": "Private Office",
  "virtual-office": "Virtual Office",
  "meeting-room": "Meeting Room",
  "event-space": "Event Space",
}

function formatDate(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  async function fetchContacts() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
      })

      if (search) params.append("search", search)
      if (status) params.append("status", status)
      if (type) params.append("inquiry_type", type)

      const token = localStorage.getItem("token")

      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`Request failed (${res.status})`)

      const data = await res.json()

      setContacts(data.data ?? [])
      setLastPage(data.last_page ?? 1)
      setTotal(data.total ?? (data.data ?? []).length)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load inquiries. Please try again."
      )
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, type])

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

      await fetch(`/api/admin/contacts/${statusTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusValue }),
      })

      setContacts((prev) =>
        prev.map((c) =>
          c.id === statusTarget.id ? { ...c, status: statusValue } : c
        )
      )
      setStatusOpen(false)
      setStatusTarget(null)
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
    } catch {
      // keep dialog open so the admin can retry
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <main className="mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Inquiries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage website inquiries
          </p>
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
              <option value="meeting-room">Meeting Room</option>
              <option value="event-space">Event Space</option>
            </select>
          </div>
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
                          onClick={fetchContacts}
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
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm text-slate-500">
                        No inquiries match your filters.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/40">
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
                          onClick={() => openStatusDialog(c)}
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize transition hover:opacity-80 ${
                            STATUS_STYLES[c.status] ??
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
                            onClick={() => {
                              setSelected(c)
                              setViewOpen(true)
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openDeleteDialog(c)}
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

      {/* View Details Dialog */}
      {viewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Inquiry Details
              </h2>
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {selected.name}
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[selected.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {INQUIRY_LABELS[selected.inquiry_type] ??
                    selected.inquiry_type}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{selected.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>{selected.company || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{formatDate(selected.created_at)}</span>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Message
                </p>
                <p className="rounded-lg border border-slate-100 bg-white p-3 text-sm leading-relaxed text-slate-700">
                  {selected.message || "—"}
                </p>
              </div>

              {selected.details &&
                Object.keys(selected.details).length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Additional Details
                    </p>
                    <div className="space-y-1.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-sm">
                      {Object.entries(selected.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            {formatLabel(k)}
                          </span>
                          <span className="font-medium text-slate-800">
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewOpen(false)
                  openStatusDialog(selected)
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      {statusOpen && statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Update Status
              </h2>
              <button
                onClick={() => setStatusOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-slate-500">
                Change the status for{" "}
                <span className="font-medium text-slate-800">
                  {statusTarget.name}
                </span>
                .
              </p>

              <div className="space-y-2">
                {["new", "contacted", "completed"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition ${
                      statusValue === opt
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="capitalize text-slate-700">{opt}</span>
                    <input
                      type="radio"
                      name="status"
                      value={opt}
                      checked={statusValue === opt}
                      onChange={() => setStatusValue(opt)}
                      className="h-4 w-4 accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setStatusOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={statusSaving || statusValue === statusTarget.status}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Delete this inquiry?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    This will permanently remove the inquiry from{" "}
                    <span className="font-medium text-slate-700">
                      {deleteTarget.name}
                    </span>
                    . This action cannot be undone.
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
  )
}