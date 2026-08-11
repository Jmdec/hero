"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Plus, Save, Search, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";

type CmsStatus = "draft" | "published" | "archived";

type CmsContent = {
  id: number;
  type: string;
  section: string;
  subsection: string | null;
  title: string | null;
  content: string | null;
  image: string | null;
  image_url: string | null;
  gallery: string[];
  gallery_urls: string[];
  data: Record<string, unknown>;
  category: string | null;
  status: CmsStatus;
  sort_order: number;
  parent_id: number | null;
  updated_at: string;
};

type CmsForm = {
  type: string;
  section: string;
  subsection: string;
  title: string;
  content: string;
  status: CmsStatus;
  category: string;
  sort_order: number;
  parent_id: string;
  dataJson: string;
};

const emptyForm: CmsForm = {
  type: "hero",
  section: "home",
  subsection: "slides",
  title: "",
  content: "",
  status: "draft",
  category: "",
  sort_order: 0,
  parent_id: "",
  dataJson: "{}",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function normalizeError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const obj = payload as {
    message?: string;
    error?: string;
    errors?: Record<string, string[] | string>;
  };

  if (obj.errors && typeof obj.errors === "object") {
    const first = Object.values(obj.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (typeof first === "string" && first) return first;
  }

  if (obj.message) return obj.message;
  if (obj.error) return obj.error;
  return fallback;
}

export default function CmsAdminPage() {
  const [items, setItems] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CmsStatus>("all");
  const [sectionFilter, setSectionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CmsForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<CmsContent | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const sections = useMemo(
    () => Array.from(new Set(items.map((item) => item.section).filter(Boolean))).sort(),
    [items],
  );

  const types = useMemo(
    () => Array.from(new Set(items.map((item) => item.type).filter(Boolean))).sort(),
    [items],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );

  async function loadItems(page = 1) {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        per_page: "20",
        page: String(page),
      });

      if (search.trim()) query.set("search", search.trim());
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (sectionFilter.trim()) query.set("section", sectionFilter.trim());
      if (typeFilter.trim()) query.set("type", typeFilter.trim());

      const res = await fetch(`/api/admin/cms-contents?${query.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(normalizeError(payload, `Failed to load CMS records (${res.status}).`));
      }

      const list = Array.isArray(payload?.data) ? payload.data : [];
      setItems(list);
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load CMS records.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setRemoveImage(false);
  }

  function startCreate() {
    resetForm();
    setSuccess(null);
    setError(null);
  }

  function startEdit(item: CmsContent) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      section: item.section,
      subsection: item.subsection ?? "",
      title: item.title ?? "",
      content: item.content ?? "",
      status: item.status,
      category: item.category ?? "",
      sort_order: item.sort_order ?? 0,
      parent_id: item.parent_id ? String(item.parent_id) : "",
      dataJson: JSON.stringify(item.data ?? {}, null, 2),
    });
    setImageFile(null);
    setRemoveImage(false);
    setSuccess(null);
    setError(null);
  }

  function onFormChange<K extends keyof CmsForm>(field: K, value: CmsForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function performSave() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let data: Record<string, unknown> = {};
      if (form.dataJson.trim()) {
        try {
          data = JSON.parse(form.dataJson);
        } catch {
          throw new Error("Data JSON must be valid JSON.");
        }
      }

      const formData = new FormData();
      formData.append("type", form.type.trim());
      formData.append("section", form.section.trim());
      if (form.subsection.trim()) formData.append("subsection", form.subsection.trim());
      if (form.title.trim()) formData.append("title", form.title.trim());
      if (form.content.trim()) formData.append("content", form.content.trim());
      if (form.category.trim()) formData.append("category", form.category.trim());
      formData.append("status", form.status);
      formData.append("sort_order", String(form.sort_order));
      if (form.parent_id.trim()) formData.append("parent_id", form.parent_id.trim());
      formData.append("data", JSON.stringify(data));

      if (editingId && removeImage) {
        formData.append("remove_image", "1");
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const isUpdate = Boolean(editingId);
      const endpoint = isUpdate ? `/api/admin/cms-contents/${editingId}` : "/api/admin/cms-contents";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(normalizeError(payload, `Failed to ${isUpdate ? "update" : "create"} CMS content.`));
      }

      setSuccess(isUpdate ? "CMS content updated." : "CMS content created.");
      resetForm();
      await loadItems(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save CMS content.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/cms-contents/${deleteCandidate.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok && res.status !== 204) {
        throw new Error(normalizeError(payload, "Failed to delete CMS content."));
      }

      if (editingId === deleteCandidate.id) {
        resetForm();
      }

      setDeleteCandidate(null);
      setSuccess("CMS content deleted.");
      await loadItems(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete CMS content.");
    } finally {
      setSubmitting(false);
    }
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];

    const withOrder = next.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setItems(withOrder);
  }

  async function saveOrder() {
    setReordering(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        items: items.map((item) => ({ id: item.id, sort_order: item.sort_order })),
      };

      const res = await fetch("/api/admin/cms-contents/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(normalizeError(body, "Failed to save order."));
      }

      setSuccess("Sort order updated.");
      await loadItems(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save order.");
    } finally {
      setReordering(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1E3F]">CMS Content Management</h1>
          <p className="text-sm text-gray-600">Manage About, Services, Contact FAQ, Hero Images, and Social content blocks.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D47A1] text-white hover:bg-[#0B3C8B]"
        >
          <Plus className="w-4 h-4" />
          New Content
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-xl border border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title/content/section"
                className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | CmsStatus)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => loadItems(1)}
                className="h-10 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                Apply
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading content...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No CMS records found for the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Section</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => moveItem(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => moveItem(index, 1)}
                            disabled={index === items.length - 1}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <span className="ml-1 text-gray-600">{item.sort_order}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{item.section}</td>
                      <td className="px-4 py-3 text-gray-600">{item.type}</td>
                      <td className="px-4 py-3 text-gray-800 max-w-55 truncate">{item.title || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {currentPage} of {lastPage}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loadItems(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadItems(Math.min(lastPage, currentPage + 1))}
                disabled={currentPage >= lastPage || loading}
                className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
              <button
                type="button"
                onClick={saveOrder}
                disabled={loading || reordering || items.length === 0}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded bg-[#0D47A1] text-white disabled:opacity-60"
              >
                {reordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Order
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Edit CMS Record" : "Create CMS Record"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-gray-600 hover:text-gray-900">Cancel edit</button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaveConfirmOpen(true);
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.section}
                onChange={(e) => onFormChange("section", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Section (home, about, services...)"
                required
              />
              <input
                value={form.type}
                onChange={(e) => onFormChange("type", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Type (hero, social, faq...)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.subsection}
                onChange={(e) => onFormChange("subsection", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Subsection"
              />
              <input
                value={form.category}
                onChange={(e) => onFormChange("category", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Category"
              />
            </div>

            <input
              value={form.title}
              onChange={(e) => onFormChange("title", e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
              placeholder="Title"
            />

            <textarea
              value={form.content}
              onChange={(e) => onFormChange("content", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-22.5"
              placeholder="Content"
            />

            <div className="grid grid-cols-3 gap-3">
              <select
                value={form.status}
                onChange={(e) => onFormChange("status", e.target.value as CmsStatus)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <input
                value={form.sort_order}
                type="number"
                min={0}
                onChange={(e) => onFormChange("sort_order", Number(e.target.value))}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Sort Order"
              />
              <input
                value={form.parent_id}
                onChange={(e) => onFormChange("parent_id", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Parent ID"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Data JSON</label>
              <textarea
                value={form.dataJson}
                onChange={(e) => onFormChange("dataJson", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-30 font-mono"
                placeholder='{"key":"value"}'
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">Image</label>
              {selectedItem?.image_url && !removeImage && !imageFile && (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={selectedItem.image_url} alt={selectedItem.title || "CMS image"} fill className="object-cover" unoptimized />
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              {editingId && selectedItem?.image && (
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                  />
                  Remove existing image
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center items-center gap-2 h-10 rounded-lg bg-[#0D47A1] text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? "Update Content" : "Create Content"}
            </button>
          </form>
        </section>
      </div>

      {saveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Save</h3>
            <p className="mt-2 text-sm text-gray-600">Apply these changes to the CMS record?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                onClick={() => setSaveConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[#0D47A1] text-white text-sm"
                onClick={async () => {
                  setSaveConfirmOpen(false);
                  await performSave();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Delete Content</h3>
              <button type="button" onClick={() => setDeleteCandidate(null)} className="text-gray-500 hover:text-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Delete “{deleteCandidate.title || `${deleteCandidate.section}/${deleteCandidate.type}`}”? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                onClick={confirmDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
