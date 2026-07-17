"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Star,
  Mail,
  Eye,
  Building2,
  Briefcase,
  CalendarDays,
  Quote,
  RefreshCw,
  Inbox,
} from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string | null;
  email: string;
  rating: number;
  quote: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  approved:
    "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  rejected: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
};

const STATUS_OPTIONS = ["pending", "approved", "rejected"] as const;

const EMPTY_FORM = {
  name: "",
  title: "",
  company: "",
  email: "",
  rating: 5,
  quote: "",
};

function authHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function formatDate(value?: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
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

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // View dialog (read-only details + status-only update)
  const [viewTarget, setViewTarget] = useState<Testimonial | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState<Testimonial["status"]>(
    "pending",
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Create / Edit dialog (details only — status is never edited here)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchTestimonials() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
      });

      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (ratingFilter) params.append("rating", ratingFilter);

      const res = await fetch(`/api/admin/testimonials?${params}`, {
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
          : "Could not load testimonials. Please try again.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, ratingFilter, retryCount]);

  const hasActiveFilters = Boolean(search || status || ratingFilter);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setRatingFilter("");
    setPage(1);
  }

  const pageNumbers = useMemo(
    () => getPageNumbers(page, lastPage),
    [page, lastPage],
  );

  // ---- View / status-only update ----

  function openView(t: Testimonial) {
    setViewTarget(t);
    setStatusDraft(t.status);
    setStatusError(null);
    setViewOpen(true);
  }

  function closeView() {
    setViewOpen(false);
    setViewTarget(null);
    setStatusError(null);
  }

  async function saveStatus() {
    if (!viewTarget) return;
    if (statusDraft === viewTarget.status) {
      closeView();
      return;
    }

    setStatusSaving(true);
    setStatusError(null);

    try {
      const res = await fetch(`/api/admin/testimonials/${viewTarget.id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        // Only the status field is sent — nothing else about the
        // testimonial can change through this flow.
        body: JSON.stringify({ status: statusDraft }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const saved: Testimonial = await res.json();

      setItems((prev) =>
        prev.map((t) => (t.id === saved.id ? { ...t, ...saved } : t)),
      );
      setViewTarget((prev) => (prev ? { ...prev, ...saved } : prev));
      closeView();
    } catch {
      setStatusError("Couldn't update the status. Please try again.");
    } finally {
      setStatusSaving(false);
    }
  }

  // ---- Create / edit (details only) ----

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({
      name: t.name,
      title: t.title,
      company: t.company ?? "",
      email: t.email,
      rating: t.rating,
      quote: t.quote,
    });
    setFormErrors({});
    setFormOpen(true);
  }

  async function submitForm() {
    setSaving(true);
    setFormErrors({});

    const isEdit = Boolean(editing);
    const url = isEdit
      ? `/api/admin/testimonials/${editing!.id}`
      : `/api/admin/testimonials`;

    // Status is preserved as-is on edit, and defaults to "pending" on
    // create — it is never set from this form.
    const body = {
      ...form,
      status: isEdit ? editing!.status : "pending",
    };

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(true),
        body: JSON.stringify(body),
      });

      if (res.status === 422) {
        const data = await res.json();
        setFormErrors(
          Object.fromEntries(
            Object.entries(data.errors ?? {}).map(([k, v]) => [
              k,
              Array.isArray(v) ? (v[0] as string) : String(v),
            ]),
          ),
        );
        return;
      }

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const saved: Testimonial = await res.json();

      setItems((prev) =>
        isEdit
          ? prev.map((t) => (t.id === saved.id ? saved : t))
          : [saved, ...prev],
      );

      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);

      if (!isEdit) fetchTestimonials();
    } catch {
      setFormErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  function openDeleteDialog(t: Testimonial) {
    setDeleteTarget(t);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      // keep dialog open so the admin can retry
    } finally {
      setDeleting(false);
    }
  }

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
        {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Testimonial
          </button>
        </div> */}

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row mb-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search name, company, quote..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-44"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-44"
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Rating</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">
                          Loading testimonialss...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          {error}
                        </p>
                        <button
                          onClick={() => setRetryCount((c) => c + 1)}
                          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Try again
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                          <Inbox className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          No testimonials found
                        </p>
                        <p className="text-xs text-slate-400">
                          {hasActiveFilters
                            ? "Try a different search term or clear your filters."
                            : "New testimonials will show up here."}
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

                {!loading && !error && items.map((t) => (
                    <tr key={t.id} className="hover:bg-blue-50/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{t.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-500">
                          {t.title}
                          {t.company ? ` · ${t.company}` : ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < t.rating
                                ? "fill-[#1B3A8C] text-[#1B3A8C]"
                                : "fill-slate-100 text-slate-200"
                                }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[t.status] ??
                            "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                            }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {t.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openView(t)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openEdit(t)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openDeleteDialog(t)}
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
          <div className="mt-5 flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-sm text-slate-500">
              {total > 0 ? `${total} total testimonials` : null}
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
      </main>

      {/* View Dialog — read-only details, status is the only editable field */}
      {viewOpen && viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Testimonial details
              </h2>
              <button
                onClick={closeView}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              {/* Rating + quote */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < viewTarget.rating
                          ? "fill-[#1B3A8C] text-[#1B3A8C]"
                          : "fill-slate-200 text-slate-200"
                          }`}
                      />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-slate-200" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  &ldquo;{viewTarget.quote}&rdquo;
                </p>
              </div>

              {/* Contact details */}
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-400">Name</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-900">
                    {viewTarget.name}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Mail className="h-3 w-3" /> Email
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-700">
                    {viewTarget.email}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Briefcase className="h-3 w-3" /> Job title
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-700">
                    {viewTarget.title || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Building2 className="h-3 w-3" /> Company
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-700">
                    {viewTarget.company || "—"}
                  </dd>
                </div>
                {viewTarget.created_at && (
                  <div>
                    <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <CalendarDays className="h-3 w-3" /> Submitted
                    </dt>
                    <dd className="mt-0.5 text-sm text-slate-700">
                      {formatDate(viewTarget.created_at)}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Status — the only editable field in this dialog */}
              <div className="border-t border-slate-100 pt-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Status
                </label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStatusDraft(opt)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${statusDraft === opt
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Only the status can be changed here. To edit other details,
                  use the edit action instead.
                </p>
                {statusError && (
                  <p className="mt-1.5 text-xs text-red-600">{statusError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={closeView}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveStatus}
                disabled={statusSaving || statusDraft === viewTarget.status}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog — testimonial details only, status is untouched */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit Testimonial" : "New Testimonial"}
              </h2>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              {formErrors.general && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formErrors.general}
                </p>
              )}

              {editing && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Status stays as{" "}
                  <span className="font-medium capitalize text-slate-700">
                    {editing.status}
                  </span>{" "}
                  here — change it from the view dialog instead.
                </p>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => updateField("rating", s)}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${s <= (hoveredStar || form.rating)
                          ? "fill-[#1B3A8C] text-[#1B3A8C]"
                          : "fill-slate-100 text-slate-200"
                          }`}
                      />
                    </button>
                  ))}
                </div>
                {formErrors.rating && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.rating}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Full name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Job title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. CEO"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Company
                  </label>
                  <input
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="e.g. Bayanihan Digital"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {formErrors.company && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.company}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Testimonial
                </label>
                <textarea
                  value={form.quote}
                  onChange={(e) => updateField("quote", e.target.value)}
                  rows={4}
                  placeholder="What did they say about their experience?"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {formErrors.quote && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.quote}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Create Testimonial"}
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Delete this testimonial?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
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