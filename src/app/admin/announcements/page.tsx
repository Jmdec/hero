"use client";

import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/components/Toast";
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
  Calendar,
  Tag,
  RefreshCw,
  Inbox,
  Eye,
  FileText,
  Clock,
  Link2,
} from "lucide-react";

interface SocialMediaEntry {
  platform: string;
  link: string;
}

interface Announcement {
  id: number;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  // Accepts the new { platform, link }[] shape, the legacy string[] /
  // comma-separated-string shape, or null. normalizeSocialMedia() handles
  // all of these when reading data back from the API.
  social_media?: SocialMediaEntry[] | string[] | string | null;
  social_platforms?: string[] | null;
  social_links?: Array<string | null> | null;
  created_at: string;
  updated_at?: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  published:
    "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  archived: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
};

const STATUS_OPTIONS = ["draft", "published", "archived"] as const;

const SOCIAL_MEDIA_OPTIONS = [
  { value: "", label: "None" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

const EMPTY_FORM = {
  tag: "",
  date: "",
  title: "",
  content: "",
  status: "draft" as Announcement["status"],
  social_media: [] as SocialMediaEntry[],
  publish_to_social: true,
};

// Normalizes whatever shape the API returns (new object array, legacy
// string array, legacy comma-separated string, or null) into a single
// { platform, link }[] shape the UI can rely on everywhere.
function normalizeSocialMedia(
  value: Announcement["social_media"],
  platforms?: string[] | null,
  links?: Array<string | null> | null,
): SocialMediaEntry[] {
  const normalizedPlatforms = Array.isArray(platforms) ? platforms : [];
  const normalizedLinks = Array.isArray(links) ? links : [];

  if (normalizedPlatforms.length > 0 || normalizedLinks.length > 0) {
    const count = Math.max(normalizedPlatforms.length, normalizedLinks.length);
    return Array.from({ length: count }, (_, index) => {
      const platform = normalizedPlatforms[index]?.trim();
      if (!platform) return null;
      return {
        platform,
        link: normalizedLinks[index]?.trim() ?? "",
      };
    }).filter((item): item is SocialMediaEntry => Boolean(item));
  }

  if (Array.isArray(value)) {
    return value
      .map((item): SocialMediaEntry | null => {
        if (item && typeof item === "object" && "platform" in item) {
          const entry = item as Partial<SocialMediaEntry>;
          return entry.platform
            ? { platform: entry.platform, link: entry.link ?? "" }
            : null;
        }
        if (typeof item === "string" && item.trim()) {
          return { platform: item.trim(), link: "" };
        }
        return null;
      })
      .filter((item): item is SocialMediaEntry => Boolean(item));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeSocialMedia(parsed);
      }
    } catch {
      // fall back to comma-separated parsing below
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((platform) => ({ platform, link: "" }));
  }

  return [];
}

function formatSocialMedia(value: Announcement["social_media"], platforms?: string[] | null, links?: Array<string | null> | null) {
  return normalizeSocialMedia(value, platforms, links).map((entry) => {
    const option = SOCIAL_MEDIA_OPTIONS.find(
      (opt) => opt.value === entry.platform,
    );
    return { label: option?.label ?? entry.platform, link: entry.link };
  });
}

// The listing excerpt is derived from the content, but the API still
// expects `excerpt` to be present in the create/update payload — it isn't
// generated server-side. Truncate on a word boundary so it doesn't cut
// off mid-word.
function generateExcerpt(content: string, maxLength = 160) {
  const clean = content.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
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

function authHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function sortAnnouncements(items: Announcement[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.date || a.created_at).getTime();
    const bTime = new Date(b.date || b.created_at).getTime();

    return Number.isNaN(bTime) || Number.isNaN(aTime) ? 0 : bTime - aTime;
  });
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

type ConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
};

// Hoisted to module scope on purpose: defining this inside the component
// body would create a brand-new component type on every render, forcing
// React to unmount/remount the whole modal (including any inputs) each
// time state changed — which is why typing felt like "one letter at a
// time" before losing focus.
function ModalBackdrop({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}

export default function AnnouncementsAdmin() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // View dialog (read-only details + status-only update)
  const [viewTarget, setViewTarget] = useState<Announcement | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState<Announcement["status"]>(
    "draft",
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Create / Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  function requestConfirmation(next: ConfirmState) {
    setConfirmState(next);
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    setConfirmState(null);
    await confirmState.onConfirm();
  }

  useEffect(() => {
    let active = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "10",
        });

        if (search) params.append("search", search);
        if (status) params.append("status", status);

        const res = await fetch(`/api/admin/announcements?${params}`, {
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        const sortedItems = sortAnnouncements(data.data ?? []);

        if (!active) return;

        setItems(sortedItems);
        setLastPage(data.last_page ?? 1);
        setTotal(data.total ?? sortedItems.length);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not load announcements. Please try again.",
        );
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAnnouncements();

    return () => {
      active = false;
    };
  }, [page, search, status, retryCount]);

  const hasActiveFilters = Boolean(search || status);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setPage(1);
  }

  const pageNumbers = useMemo(
    () => getPageNumbers(page, lastPage),
    [page, lastPage],
  );

  function openView(a: Announcement) {
    setViewTarget(a);
    setStatusDraft(a.status);
    setStatusError(null);
    setViewOpen(true);
  }

  function closeView() {
    setViewOpen(false);
    setViewTarget(null);
    setStatusError(null);
  }

  // Status-only updates use PATCH, not PUT. The API's PUT handler expects a
  // full resource replacement, so sending only `{ status }` via PUT was
  // silently wiping every other field (title, content, tag, social_media,
  // etc). PATCH is the correct verb for a partial update and leaves the
  // rest of the record untouched.
  async function saveStatus() {
    if (!viewTarget) return;

    setConfirmState(null);
    setStatusSaving(true);
    setStatusError(null);

    try {
      const res = await fetch(`/api/admin/announcements/${viewTarget.id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status: statusDraft }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const saved: Announcement = await res.json();

      setItems((prev) =>
        sortAnnouncements(prev.map((a) => (a.id === saved.id ? saved : a))),
      );
      setViewTarget(saved);
      setViewOpen(false);
      showToast("Announcement status updated.", "success");
    } catch {
      setStatusError("Could not update status. Please try again.");
      showToast("Could not update status. Please try again.", "error");
    } finally {
      setStatusSaving(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, social_media: [], publish_to_social: true });
    setFormErrors({});
    setFormOpen(true);
  }

  function openEdit(a: Announcement) {
    setEditing(a);
    setForm({
      tag: a.tag,
      date: a.date?.slice(0, 10) ?? "",
      title: a.title,
      content: a.content,
      status: a.status,
      social_media: normalizeSocialMedia(
        a.social_media,
        a.social_platforms,
        a.social_links,
      ),
      publish_to_social: true,
    });
    setFormErrors({});
    setFormOpen(true);
  }

  // Social media rows — supports posting the same announcement across
  // several platforms at once, each with its own post link. Each row picks
  // a platform that isn't already used by another row, so the same
  // platform can't be added twice.
  function addSocialMedia() {
    setForm((prev) => ({
      ...prev,
      social_media: [...prev.social_media, { platform: "", link: "" }],
    }));
  }

  function updateSocialMedia(
    index: number,
    field: keyof SocialMediaEntry,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      social_media: prev.social_media.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeSocialMedia(index: number) {
    setForm((prev) => ({
      ...prev,
      social_media: prev.social_media.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  }

  // Options available for a given row: any option not already picked by a
  // *different* row, plus whatever this row currently has selected.
  function socialMediaOptionsFor(index: number) {
    const usedElsewhere = new Set(
      form.social_media
        .filter((entry, i) => i !== index && entry.platform)
        .map((entry) => entry.platform),
    );
    return SOCIAL_MEDIA_OPTIONS.filter(
      (opt) =>
        opt.value === "" ||
        opt.value === form.social_media[index]?.platform ||
        !usedElsewhere.has(opt.value),
    );
  }

  const allSocialMediaUsed =
    form.social_media.filter((entry) => entry.platform).length >=
    SOCIAL_MEDIA_OPTIONS.length - 1;

  async function submitForm() {
    const isEdit = Boolean(editing);
    const payload = {
      ...form,
      excerpt: generateExcerpt(form.content),
      social_platforms: form.social_media
        .filter((entry) => entry.platform)
        .map((entry) => entry.platform),
      social_links: form.social_media
        .filter((entry) => entry.platform)
        .map((entry) => entry.link?.trim() || null),
    };

    setConfirmState(null);
    setSaving(true);
    setFormErrors({});
    const url = isEdit
      ? `/api/admin/announcements/${editing!.id}`
      : `/api/admin/announcements`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
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

      const saved: Announcement = await res.json();

      setItems((prev) =>
        sortAnnouncements(
          isEdit
            ? prev.map((a) => (a.id === saved.id ? saved : a))
            : [saved, ...prev],
        ),
      );

      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      showToast(
        isEdit
          ? "Announcement updated successfully."
          : "Announcement created successfully.",
        "success",
      );
    } catch {
      setFormErrors({ general: "Something went wrong. Please try again." });
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function openDeleteDialog(a: Announcement) {
    setDeleteTarget(a);
    requestConfirmation({
      title: "Delete this announcement?",
      description: `"${a.title}" will be removed permanently. This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      onConfirm: () => confirmDelete(a),
    });
  }

  async function confirmDelete(target: Announcement | null = deleteTarget) {
    if (!target) return;

    setConfirmState(null);
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/announcements/${target.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setItems((prev) => prev.filter((a) => a.id !== target.id));
      setDeleteTarget(null);
      showToast("Announcement deleted.", "success");
    } catch {
      showToast("Could not delete announcement. Please try again.", "error");
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

  function confirmSaveStatus() {
    requestConfirmation({
      title: "Update announcement status?",
      description: `Change the status of "${viewTarget?.title ?? "this announcement"}"?`,
      confirmLabel: "Save Status",
      confirmVariant: "primary",
      onConfirm: saveStatus,
    });
  }

  function confirmCreateOrEdit() {
    const isEdit = Boolean(editing);
    requestConfirmation({
      title: isEdit ? "Save announcement changes?" : "Create announcement?",
      description: isEdit
        ? "Save the changes to this announcement?"
        : "Create this announcement and publish it to the admin list?",
      confirmLabel: isEdit ? "Save Changes" : "Create Announcement",
      confirmVariant: "primary",
      onConfirm: submitForm,
    });
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <main className="mx-auto space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search title, tag, excerpt..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-48"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <tr>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Tag</th>
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
                        <span className="text-sm">
                          Loading announcements...
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
                          No announcements found
                        </p>
                        <p className="text-xs text-slate-400">
                          {hasActiveFilters
                            ? "Try a different search term or clear your filters."
                            : "New announcements will show up here."}
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
                  items.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => openView(a)}
                      className="cursor-pointer hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {a.title}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {a.tag}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs capitalize ${STATUS_STYLES[a.status] ??
                            "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                            }`}
                        >
                          {a.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {formatDate(a.date)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openView(a);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(a);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(a);
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
          <div className="mt-5 flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-sm text-slate-500">
              {total > 0 ? `${total} total announcements` : null}
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
        <ModalBackdrop onClose={closeView}>
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Announcement details
              </h2>
              <button
                onClick={closeView}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              {/* Title + tag */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                    <Tag className="h-3 w-3" />
                    {viewTarget.tag}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(viewTarget.date)}
                  </span>
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {viewTarget.title}
                </p>
              </div>

              {/* Content */}
              <div>
                <dt className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                  <FileText className="h-3 w-3" /> Content
                </dt>
                <dd className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-white p-3 text-sm leading-relaxed text-slate-700">
                  {viewTarget.content || "—"}
                </dd>
              </div>

              {/* Meta */}
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Clock className="h-3 w-3" /> Created
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-700">
                    {formatDate(viewTarget.created_at)}
                  </dd>
                </div>
                {viewTarget.updated_at && (
                  <div>
                    <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <Clock className="h-3 w-3" /> Last updated
                    </dt>
                    <dd className="mt-0.5 text-sm text-slate-700">
                      {formatDate(viewTarget.updated_at)}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Social media — each platform with its own post link */}
              {normalizeSocialMedia(
                viewTarget.social_media,
                viewTarget.social_platforms,
                viewTarget.social_links,
              ).length > 0 && (
                <div>
                  <dt className="mb-1.5 text-xs font-medium text-slate-400">
                    Social media
                  </dt>
                  <dd className="space-y-1.5">
                    {formatSocialMedia(
                      viewTarget.social_media,
                      viewTarget.social_platforms,
                      viewTarget.social_links,
                    ).map((entry, i) => (
                        <div
                          key={`${entry.label}-${i}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2"
                        >
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {entry.label}
                          </span>
                          {entry.link ? (
                            <a
                              href={entry.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex min-w-0 items-center gap-1 truncate text-xs text-blue-600 hover:underline"
                            >
                              <Link2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{entry.link}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">
                              No link
                            </span>
                          )}
                        </div>
                      ),
                    )}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* Create / Edit Dialog */}
      {formOpen && (
        <ModalBackdrop onClose={() => setFormOpen(false)}>
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit Announcement" : "New Announcement"}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Tag
                  </label>
                  <input
                    value={form.tag}
                    onChange={(e) => updateField("tag", e.target.value)}
                    placeholder="e.g. Promo, Event"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {formErrors.tag && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.tag}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateField("date", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  {formErrors.date && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.date}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Announcement title"
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
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  rows={8}
                  placeholder="Full announcement content"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-slate-400">
                  The listing excerpt is generated automatically from this
                  content.
                </p>
                {formErrors.content && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.content}
                  </p>
                )}
              </div>

              {/* Social media — each row is a platform + the link to that
                  specific post, since the same announcement can go out to
                  several platforms with a different URL on each one. */}
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Social Media{" "}
                    <span className="font-normal text-slate-400">
                      (post to multiple platforms, each with its own link)
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  {form.social_media.map((entry, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 sm:flex-row sm:items-center"
                    >
                      <select
                        value={entry.platform}
                        onChange={(e) =>
                          updateSocialMedia(index, "platform", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-40"
                      >
                        {socialMediaOptionsFor(index).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={entry.link}
                          onChange={(e) =>
                            updateSocialMedia(index, "link", e.target.value)
                          }
                          placeholder="https://... (link to this post)"
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSocialMedia(index)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-50 sm:self-stretch"
                        aria-label="Remove social media"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {form.social_media.length === 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    Add one row per platform this announcement will be
                    posted to, along with the link to that post.
                  </p>
                )}
                {formErrors.social_media && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.social_media}
                  </p>
                )}

                <button
                  type="button"
                  onClick={addSocialMedia}
                  disabled={allSocialMediaUsed}
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  + Add social media
                </button>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Publishing
                </label>
                <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>Publish this announcement to connected social platforms</span>
                  <input
                    type="checkbox"
                    checked={Boolean(form.publish_to_social)}
                    onChange={(e) => updateField("publish_to_social", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <p className="mt-2 text-xs text-slate-400">
                  If no webhook is configured for a selected platform, the save will still succeed and that platform will be skipped.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Status
                </label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("status", opt)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${form.status === opt
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
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
                onClick={confirmCreateOrEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Create Announcement"}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* Confirmation modal — replaces native browser confirm()/alert() for
          delete, status-save, and create/edit actions. */}
      {confirmState && (
        <ModalBackdrop onClose={() => setConfirmState(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${confirmState.confirmVariant === "danger"
                    ? "bg-red-100"
                    : "bg-blue-100"
                    }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${confirmState.confirmVariant === "danger"
                      ? "text-red-600"
                      : "text-blue-600"
                      }`}
                  />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {confirmState.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {confirmState.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setConfirmState(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={deleting || saving || statusSaving}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${confirmState.confirmVariant === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {(deleting || saving || statusSaving) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}