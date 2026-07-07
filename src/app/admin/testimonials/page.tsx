"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Star,
  Mail,
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

const EMPTY_FORM = {
  name: "",
  title: "",
  company: "",
  email: "",
  rating: 5,
  quote: "",
  status: "pending" as Testimonial["status"],
};

function authHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Create / Edit dialog
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
  }, [page, search, status]);

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
      status: t.status,
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

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(true),
        body: JSON.stringify(form),
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
      <main className="mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Testimonials
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review, edit, and manage client testimonials
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Testimonial
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-48"
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
          </div>
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
                        <span className="text-sm">Loading testimonials...</span>
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
                          onClick={fetchTestimonials}
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
                        No testimonials match your filters.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  items.map((t) => (
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
                              className={`h-3.5 w-3.5 ${
                                i < t.rating
                                  ? "fill-[#1B3A8C] text-[#1B3A8C]"
                                  : "fill-slate-100 text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            STATUS_STYLES[t.status] ??
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
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
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

      {/* Create / Edit Dialog */}
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
                        className={`h-6 w-6 transition-colors ${
                          s <= (hoveredStar || form.rating)
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

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Status
                </label>
                <div className="flex gap-2">
                  {(["pending", "approved", "rejected"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("status", opt)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                        form.status === opt
                          ? "border-blue-400 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {formErrors.status && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.status}
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
