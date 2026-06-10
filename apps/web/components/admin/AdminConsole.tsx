"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Eye, LogOut, Plus, RefreshCw, Save, Search, Trash2, Upload } from "lucide-react";
import { API_URL, assetUrl } from "../../lib/api";

type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "json"
    | "lines"
    | "media-list"
    | "key-value"
    | "content-blocks"
    | "number"
    | "checkbox"
    | "select"
    | "date"
    | "password"
    | "media";
  options?: string[];
  relation?: string;
  full?: boolean;
};

type Resource = {
  key: string;
  label: string;
  fields: Field[];
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | string;
  avatar?: string | null;
};

type ListMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const statusOptions = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const roleOptions = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
const mediaTypeOptions = ["image", "video"];
const sectionTypeOptions = [
  "hero",
  "text-media",
  "rich-text",
  "stats",
  "pricing",
  "work-showcase",
  "service-showcase",
  "team-showcase",
  "logo-strip",
  "capability-list",
  "contact",
  "contact-info",
  "portfolio",
  "services",
  "projects",
  "blog",
  "team",
  "faq"
];

const resources: Resource[] = [
  {
    key: "settings",
    label: "Global Settings",
    fields: [
      { name: "key", label: "Key" },
      { name: "value", label: "Setting Value", type: "json", full: true }
    ]
  },
  {
    key: "menus",
    label: "Menus",
    fields: [
      { name: "name", label: "Name" },
      { name: "location", label: "Location" }
    ]
  },
  {
    key: "menu-items",
    label: "Menu Items",
    fields: [
      { name: "menuId", label: "Menu", type: "select", relation: "menus" },
      { name: "label", label: "Label" },
      { name: "url", label: "URL" },
      { name: "target", label: "Target" },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "pages",
    label: "Pages CMS",
    fields: [
      { name: "title", label: "Title" },
      { name: "slug", label: "Slug" },
      { name: "pageType", label: "Page Type" },
      { name: "summary", label: "Summary", type: "textarea", full: true },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "seoTitle", label: "SEO Title" },
      { name: "seoDescription", label: "SEO Description", type: "textarea", full: true },
      { name: "ogImage", label: "OG Image", type: "media" },
      { name: "canonicalUrl", label: "Canonical URL" }
    ]
  },
  {
    key: "page-sections",
    label: "Page Sections",
    fields: [
      { name: "pageId", label: "Page", type: "select", relation: "pages" },
      { name: "key", label: "Key" },
      { name: "type", label: "Type", type: "select", options: sectionTypeOptions },
      { name: "title", label: "Title" },
      { name: "subtitle", label: "Subtitle", type: "textarea", full: true },
      { name: "content", label: "Content JSON", type: "json", full: true },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "enabled", label: "Enabled", type: "checkbox" }
    ]
  },
  {
    key: "services",
    label: "Services",
    fields: [
      { name: "title", label: "Title" },
      { name: "slug", label: "Slug" },
      { name: "shortDescription", label: "Short Description", type: "textarea", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "icon", label: "Icon URL", type: "media" },
      { name: "image", label: "Image URL", type: "media" },
      { name: "gallery", label: "Feature List", type: "lines", full: true },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "seoTitle", label: "SEO Title" },
      { name: "seoDescription", label: "SEO Description", type: "textarea", full: true },
      { name: "ogImage", label: "OG Image", type: "media" },
      { name: "canonicalUrl", label: "Canonical URL" }
    ]
  },
  {
    key: "project-categories",
    label: "Project Categories",
    fields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" }
    ]
  },
  {
    key: "projects",
    label: "Portfolio/Work",
    fields: [
      { name: "title", label: "Title" },
      { name: "slug", label: "Slug" },
      { name: "client", label: "Client" },
      { name: "categoryId", label: "Category", type: "select", relation: "project-categories" },
      { name: "date", label: "Date", type: "date" },
      { name: "location", label: "Location" },
      { name: "tools", label: "Tools" },
      { name: "duration", label: "Duration" },
      { name: "shortDescription", label: "Short Description", type: "textarea", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "mainImage", label: "Main Image", type: "media" },
      { name: "gallery", label: "Gallery Images", type: "media-list", full: true },
      { name: "videoUrl", label: "Video URL", type: "media" },
      { name: "contentBlocks", label: "Content Blocks", type: "content-blocks", full: true },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ]
  },
  {
    key: "portfolio-items",
    label: "Portfolio Gallery",
    fields: [
      { name: "title", label: "Title" },
      { name: "tag", label: "Tag" },
      { name: "mediaUrl", label: "Image or Video", type: "media" },
      { name: "mediaType", label: "Media Type", type: "select", options: mediaTypeOptions },
      { name: "alt", label: "Alt Text" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ]
  },
  {
    key: "blog-categories",
    label: "Blog Categories",
    fields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" }
    ]
  },
  {
    key: "tags",
    label: "Tags",
    fields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" }
    ]
  },
  {
    key: "blog-posts",
    label: "Blog",
    fields: [
      { name: "title", label: "Title" },
      { name: "slug", label: "Slug" },
      { name: "excerpt", label: "Excerpt", type: "textarea", full: true },
      { name: "content", label: "Content", type: "textarea", full: true },
      { name: "featuredImage", label: "Featured Image", type: "media" },
      { name: "categoryId", label: "Category", type: "select", relation: "blog-categories" },
      { name: "authorId", label: "Author", type: "select", relation: "users" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "publishedAt", label: "Published At", type: "date" },
      { name: "seoTitle", label: "SEO Title" },
      { name: "seoDescription", label: "SEO Description", type: "textarea", full: true },
      { name: "ogImage", label: "OG Image", type: "media" }
    ]
  },
  {
    key: "team",
    label: "Team",
    fields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "role", label: "Role" },
      { name: "bio", label: "Bio", type: "textarea", full: true },
      { name: "image", label: "Image", type: "media" },
      { name: "socialLinks", label: "Social Links", type: "key-value", full: true },
      { name: "skills", label: "Skills", type: "lines", full: true },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions }
    ]
  },
  {
    key: "faqs",
    label: "FAQ",
    fields: [
      { name: "question", label: "Question", type: "textarea", full: true },
      { name: "answer", label: "Answer", type: "textarea", full: true },
      { name: "category", label: "Category" },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "testimonials",
    label: "Testimonials",
    fields: [
      { name: "clientName", label: "Client Name" },
      { name: "position", label: "Position" },
      { name: "company", label: "Company" },
      { name: "rating", label: "Rating", type: "number" },
      { name: "image", label: "Image", type: "media" },
      { name: "reviewText", label: "Review", type: "textarea", full: true },
      { name: "sortOrder", label: "Sort Order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "contact-messages",
    label: "Contact Messages",
    fields: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "subject", label: "Subject" },
      { name: "message", label: "Message", type: "textarea", full: true },
      { name: "status", label: "Status", type: "select", options: ["unread", "read", "archived"] },
      { name: "adminNotes", label: "Admin Notes", type: "textarea", full: true }
    ]
  },
  {
    key: "media",
    label: "Media Library",
    fields: [
      { name: "url", label: "URL" },
      { name: "filename", label: "Filename" },
      { name: "originalName", label: "Original Name" },
      { name: "mimeType", label: "Mime Type" },
      { name: "size", label: "Size", type: "number" },
      { name: "alt", label: "Alt Text" },
      { name: "folder", label: "Folder" },
      { name: "metadata", label: "Metadata JSON", type: "json", full: true }
    ]
  },
  {
    key: "users",
    label: "Users & Roles",
    fields: [
      { name: "email", label: "Email" },
      { name: "password", label: "Password", type: "password" },
      { name: "name", label: "Name" },
      { name: "role", label: "Role", type: "select", options: roleOptions },
      { name: "avatar", label: "Avatar", type: "media" }
    ]
  }
];

const referenceResourceKeys = Array.from(
  new Set([...resources.flatMap((resource) => resource.fields.flatMap((field) => (field.relation ? [field.relation] : []))), "media"])
);

export function AdminConsole() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [active, setActive] = useState("pages");
  const [items, setItems] = useState<any[]>([]);
  const [references, setReferences] = useState<Record<string, any[]>>({});
  const [dashboard, setDashboard] = useState<Record<string, number>>({});
  const [listMeta, setListMeta] = useState<ListMeta>({ total: 0, page: 1, limit: 25, pages: 1 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const accessibleResources = useMemo(
    () => resources.filter((item) => canAccessResource(item.key, currentUser?.role)),
    [currentUser?.role]
  );
  const resource = useMemo(
    () => accessibleResources.find((item) => item.key === active) ?? accessibleResources[0] ?? resources[0],
    [accessibleResources, active]
  );
  const statusField = resource.fields.find((field) => field.name === "status" && field.options?.length);

  useEffect(() => {
    setToken(localStorage.getItem("opplexify_token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    loadCurrentUser();
    loadDashboard();
  }, [token]);

  useEffect(() => {
    if (!token || !currentUser) return;
    if (!accessibleResources.some((item) => item.key === active)) {
      changeResource(accessibleResources[0]?.key ?? "pages");
    }
  }, [token, currentUser, accessibleResources, active]);

  useEffect(() => {
    if (!token || !resource.key) return;
    loadResource(resource.key);
  }, [token, resource.key, page, limit, searchTerm, statusFilter]);

  useEffect(() => {
    if (!token || !currentUser) return;
    loadReferences();
  }, [token, currentUser]);

  async function authed(path: string, init?: RequestInit) {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message ?? "Request failed");
    return payload;
  }

  async function loadDashboard() {
    try {
      setDashboard(await authed("/admin/dashboard"));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load dashboard");
    }
  }

  async function loadCurrentUser() {
    try {
      setCurrentUser(await authed("/auth/me"));
    } catch (error) {
      localStorage.removeItem("opplexify_token");
      setToken(null);
      setCurrentUser(null);
      setNotice(error instanceof Error ? error.message : "Session expired. Please sign in again.");
    }
  }

  async function loadResource(key: string) {
    setLoading(true);
    setNotice(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (searchTerm) params.set("q", searchTerm);
      if (statusFilter) params.set("status", statusFilter);
      const payload = await authed(`/admin/${key}?${params.toString()}`);
      setItems(payload.items ?? []);
      setListMeta({
        total: Number(payload.total ?? 0),
        page: Number(payload.page ?? page),
        limit: Number(payload.limit ?? limit),
        pages: Math.max(Number(payload.pages ?? 1), 1)
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load resource");
      setItems([]);
      setListMeta({ total: 0, page, limit, pages: 1 });
    } finally {
      setLoading(false);
    }
  }

  async function loadReferences() {
    const next: Record<string, any[]> = {};
    await Promise.all(
      referenceResourceKeys.map(async (key) => {
        if (key === "users" && currentUser && !canAccessResource("users", currentUser.role)) {
          next[key] = [currentUser];
          return;
        }
        if (!canAccessResource(key, currentUser?.role)) {
          next[key] = [];
          return;
        }
        try {
          const payload = await authed(`/admin/${key}?limit=100`);
          next[key] = payload.items ?? [];
        } catch {
          next[key] = [];
        }
      })
    );
    setReferences(next);
  }

  function changeResource(key: string) {
    setActive(key);
    setEditing(null);
    setForm({});
    setPage(1);
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  }

  function startCreate() {
    setEditing(null);
    const defaults: Record<string, any> = {};
    resource.fields.forEach((field) => {
      const value = defaultFieldValue(field);
      if (value !== undefined) defaults[field.name] = value;
      if (field.type === "select" && field.relation && references[field.relation]?.[0]?.id) {
        defaults[field.name] = references[field.relation][0].id;
      }
      if (field.type === "json") defaults[field.name] = "{}";
    });
    if (resource.key === "page-sections") {
      defaults.type = "rich-text";
      defaults.enabled = true;
      defaults.content = defaultSectionContent("rich-text");
    }
    setForm(defaults);
  }

  function startEdit(item: any) {
    setEditing(item);
    const next: Record<string, any> = {};
    resource.fields.forEach((field) => {
      const value = item[field.name];
      if (field.type === "json" && resource.key === "settings" && field.name === "value") next[field.name] = value ?? {};
      else if (field.type === "json" && resource.key === "page-sections" && field.name === "content") next[field.name] = value ?? {};
      else if (field.type === "json") next[field.name] = JSON.stringify(value ?? {}, null, 2);
      else if (field.type === "lines" || field.type === "media-list") next[field.name] = asLines(value);
      else if (field.type === "key-value") next[field.name] = contentObject(value);
      else if (field.type === "content-blocks") next[field.name] = asArray(value);
      else if (field.type === "date" && value) next[field.name] = String(value).slice(0, 10);
      else next[field.name] = value ?? "";
    });
    setForm(next);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    try {
      const body = buildBody(resource.fields, form);
      if (editing) {
        await authed(`/admin/${resource.key}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body)
        });
        setNotice("Updated successfully.");
      } else {
        await authed(`/admin/${resource.key}`, {
          method: "POST",
          body: JSON.stringify(body)
        });
        setNotice("Created successfully.");
      }
      setEditing(null);
      setForm({});
      await loadResource(resource.key);
      await loadReferences();
      await loadDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function remove(item: any) {
    if (!window.confirm("Delete this item?")) return;
    try {
      await authed(`/admin/${resource.key}/${item.id}`, { method: "DELETE" });
      setNotice("Deleted.");
      await loadResource(resource.key);
      await loadDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function uploadMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "admin");

    try {
      await authed("/admin/media/upload", { method: "POST", body: data });
      setFile(null);
      setNotice("File uploaded.");
      if (active === "media") await loadResource("media");
      await loadReferences();
      await loadDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed");
    }
  }

  function logout() {
    localStorage.removeItem("opplexify_token");
    window.location.href = "/admin/login";
  }

  if (!token) {
    return (
      <main className="admin-wrap">
        <div className="container page-hero">
          <h1>Admin dashboard</h1>
          <p>You need to sign in before managing content.</p>
          <Link className="btn accent" href="/admin/login">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-wrap">
      <header className="admin-top">
        <div>
          <strong>Opplexify CMS</strong>
          {currentUser ? (
            <span className="admin-user-chip">
              {currentUser.name} · {currentUser.role}
            </span>
          ) : null}
        </div>
        <div className="inline-actions">
          <Link className="btn secondary" href="/" target="_blank">
            <Eye size={16} /> View site
          </Link>
          <button className="btn secondary" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          {accessibleResources.map((item) => (
            <button
              key={item.key}
              className={`admin-tab ${active === item.key ? "active" : ""}`}
              onClick={() => changeResource(item.key)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <section className="admin-main">
          <div className="admin-cards">
            {Object.entries(dashboard).map(([key, value]) => (
              <div className="admin-card" key={key}>
                <strong>{value}</strong>
                <span>{humanize(key)}</span>
              </div>
            ))}
          </div>

          {notice ? <p className="notice">{notice}</p> : null}

          <div className="admin-panel">
            <div className="admin-toolbar">
              <div>
                <h2>{resource.label}</h2>
                <p>{resourceDescription(resource.key)}</p>
              </div>
              <div className="inline-actions">
                <button className="btn secondary" onClick={() => loadResource(resource.key)}>
                  <RefreshCw size={16} /> Refresh
                </button>
                <button className="btn accent" onClick={startCreate}>
                  <Plus size={16} /> New
                </button>
              </div>
            </div>

            <div className="admin-mobile-resource">
              <label>
                Section
                <select value={resource.key} onChange={(event) => changeResource(event.target.value)}>
                  {accessibleResources.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form className="admin-list-controls" onSubmit={submitSearch}>
              <label className="admin-search-field">
                Search records
                <span>
                  <Search size={16} />
                  <input
                    value={searchInput}
                    placeholder={`Search ${resource.label.toLowerCase()}`}
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                </span>
              </label>
              {statusField ? (
                <label>
                  Status
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setPage(1);
                      setStatusFilter(event.target.value);
                    }}
                  >
                    <option value="">All statuses</option>
                    {statusField.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label>
                Rows
                <select
                  value={limit}
                  onChange={(event) => {
                    setPage(1);
                    setLimit(Number(event.target.value));
                  }}
                >
                  {[10, 25, 50, 100].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn secondary" type="submit">
                <Search size={16} /> Search
              </button>
              {(searchTerm || statusFilter) ? (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setSearchInput("");
                    setSearchTerm("");
                    setStatusFilter("");
                  }}
                >
                  Clear
                </button>
              ) : null}
              <span className="admin-result-count">{listMeta.total} records</span>
            </form>

            {resource.key === "media" ? (
              <form className="form" onSubmit={uploadMedia}>
                <label>
                  Upload file
                  <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                </label>
                <button className="btn accent" type="submit">
                  <Upload size={16} /> Upload
                </button>
              </form>
            ) : null}

            {(editing !== undefined && Object.keys(form).length > 0) ? (
              <form className="form" onSubmit={submit}>
                <div className="admin-form-grid">
                  {resource.fields.map((field) => {
                    const updateField = (value: any) =>
                      setForm((current) => {
                        const next = { ...current, [field.name]: value };
                        if (resource.key === "page-sections" && field.name === "type" && isEmptyContent(current.content)) {
                          next.content = defaultSectionContent(value);
                        }
                        return next;
                      });

                    return resource.key === "settings" && field.name === "value" ? (
                      <SettingValueEditor
                        key={field.name}
                        settingKey={form.key}
                        value={form.value}
                        mediaItems={references.media ?? []}
                        onChange={updateField}
                      />
                    ) : resource.key === "page-sections" && field.name === "content" ? (
                      <SectionContentEditor
                        key={field.name}
                        sectionType={form.type}
                        value={form.content}
                        mediaItems={references.media ?? []}
                        onChange={updateField}
                      />
                    ) : (
                      <FieldInput
                        key={field.name}
                        field={field}
                        value={form[field.name]}
                        relationItems={field.relation ? references[field.relation] ?? [] : []}
                        mediaItems={references.media ?? []}
                        onChange={updateField}
                      />
                    );
                  })}
                </div>
                <div className="inline-actions">
                  <button className="btn accent" type="submit">
                    <Save size={16} /> Save
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Details</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>Loading...</td>
                    </tr>
                  ) : items.length ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Item">
                          <strong>{itemTitle(item)}</strong>
                          <br />
                          <small>{item.id}</small>
                        </td>
                        <td data-label="Details">{itemSummary(item)}</td>
                        <td data-label="Updated">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ""}</td>
                        <td data-label="Actions">
                          <div className="inline-actions">
                            <button className="btn secondary" onClick={() => startEdit(item)}>
                              <Edit3 size={15} /> Edit
                            </button>
                            {publicHrefFor(resource.key, item) ? (
                              <Link className="btn secondary" href={publicHrefFor(resource.key, item)!} target="_blank">
                                <Eye size={15} /> Preview
                              </Link>
                            ) : null}
                            <button className="btn secondary" onClick={() => remove(item)}>
                              <Trash2 size={15} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span>
                Page {listMeta.page} of {listMeta.pages} · {listMeta.total} total
              </span>
              <div className="inline-actions">
                <button
                  className="btn secondary"
                  type="button"
                  disabled={listMeta.page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  disabled={listMeta.page >= listMeta.pages || loading}
                  onClick={() => setPage((current) => Math.min(current + 1, listMeta.pages))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FieldInput({
  field,
  value,
  relationItems,
  mediaItems,
  onChange
}: {
  field: Field;
  value: any;
  relationItems: any[];
  mediaItems: any[];
  onChange: (value: any) => void;
}) {
  const className = `admin-field ${field.full ? "full" : ""}`;

  if (field.type === "checkbox") {
    return (
      <label className={className}>
        {field.label}
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
      </label>
    );
  }

  if (field.type === "textarea" || field.type === "json") {
    return (
      <label className={className}>
        {field.label}
        <textarea value={field.type === "json" && typeof value !== "string" ? JSON.stringify(value ?? {}, null, 2) : value ?? ""} onChange={(event) => onChange(event.target.value)} />
      </label>
    );
  }

  if (field.type === "lines") {
    return (
      <label className={className}>
        {field.label}
        <textarea value={asLines(value).join("\n")} onChange={(event) => onChange(event.target.value.split("\n").filter(Boolean))} />
      </label>
    );
  }

  if (field.type === "media-list") {
    return (
      <div className={className}>
        <span>{field.label}</span>
        <MediaListInput value={value} mediaItems={mediaItems} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "key-value") {
    return (
      <div className={className}>
        <span>{field.label}</span>
        <KeyValueEditor value={value} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "content-blocks") {
    return (
      <div className={className}>
        <span>{field.label}</span>
        <RepeaterEditor
          label="Content blocks"
          items={asArray(value)}
          mediaItems={mediaItems}
          blankItem={{ title: "New section", body: "", image: "", ctaLabel: "", href: "" }}
          fields={[
            { name: "title", label: "Title" },
            { name: "body", label: "Body", type: "textarea" },
            { name: "image", label: "Image", type: "media" },
            { name: "ctaLabel", label: "CTA label" },
            { name: "href", label: "CTA href" }
          ]}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "select") {
    const options = field.relation ? relationItems.map((item) => ({ value: item.id, label: relationLabel(item) })) : field.options?.map((option) => ({ value: option, label: option })) ?? [];

    return (
      <label className={className}>
        {field.label}
        <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "media") {
    return (
      <div className={className}>
        <span>{field.label}</span>
        <MediaValueInput value={value} mediaItems={mediaItems} onChange={onChange} />
      </div>
    );
  }

  return (
    <label className={className}>
      {field.label}
      <input
        type={field.type === "password" ? "password" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function contentObject(value: any): Record<string, any> {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function asLines(value: any): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return value.split("\n").filter(Boolean);
  return [];
}

function isEmptyContent(value: any) {
  if (!value) return true;
  if (typeof value === "string") return value.trim() === "" || value.trim() === "{}";
  if (typeof value === "object" && !Array.isArray(value)) return Object.keys(value).length === 0;
  return false;
}

function defaultSectionContent(type: string) {
  if (type === "hero") {
    return {
      eyebrow: "Full-stack web development agency",
      headline: "Page headline",
      primaryCta: { label: "Primary action", href: "/contact" },
      secondaryCta: { label: "Secondary action", href: "/portfolio" },
      metaItems: []
    };
  }
  if (type === "pricing") return { eyebrow: "Pricing", items: [] };
  if (type === "work-showcase") return { eyebrow: "Portfolio videos", limit: 4, cta: { label: "Browse all work", href: "/portfolio" }, fallbackItems: [] };
  if (type === "service-showcase") return { mockupLabel: "Development", mockupCta: { label: "Explore", href: "/services" } };
  if (type === "team-showcase") return { limit: 3 };
  if (type === "logo-strip") return { logos: [] };
  if (type === "capability-list") return { items: [] };
  if (type === "stats") return { items: [] };
  if (type === "contact-info") return { email: "", phone: "", address: "" };
  if (["contact", "portfolio", "services", "projects", "blog", "team", "faq"].includes(type)) {
    return { eyebrow: humanize(type), body: "", image: "", cta: { label: "", href: "" } };
  }
  return { body: "", image: "", cta: { label: "", href: "" } };
}

function MediaValueInput({
  value,
  mediaItems,
  onChange
}: {
  value: any;
  mediaItems: any[];
  onChange: (value: string) => void;
}) {
  const selected = mediaItems.find((item) => item.url === value);
  const preview = typeof value === "string" && value ? assetUrl(value) : "";
  const mimeType = selected?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(preview);

  return (
    <div className="media-field">
      <div className="media-picker-row">
        <input value={value ?? ""} placeholder="/uploads/file.webp or https://..." onChange={(event) => onChange(event.target.value)} />
        <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          <option value="">Media library</option>
          {mediaItems.map((item) => (
            <option key={item.id} value={item.url}>
              {item.alt || item.originalName || item.filename || item.url}
            </option>
          ))}
        </select>
      </div>
      {preview ? (
        <div className="admin-media-preview">
          {isVideo ? <video src={preview} muted playsInline /> : <img src={preview} alt={selected?.alt ?? "Selected media"} />}
        </div>
      ) : null}
    </div>
  );
}

function MediaListInput({
  value,
  mediaItems,
  onChange
}: {
  value: any;
  mediaItems: any[];
  onChange: (value: string[]) => void;
}) {
  const items = asLines(value);
  const updateItem = (index: number, nextValue: string) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)).filter(Boolean));
  };

  return (
    <div className="media-list-field">
      <div className="repeater-head">
        <strong>{items.length} media item{items.length === 1 ? "" : "s"}</strong>
        <button className="btn secondary" type="button" onClick={() => onChange([...items, ""])}>
          <Plus size={15} /> Add media
        </button>
      </div>
      {items.map((item, index) => (
        <div className="media-list-item" key={`${item}-${index}`}>
          <MediaValueInput value={item} mediaItems={mediaItems} onChange={(next) => updateItem(index, next)} />
          <button className="btn secondary" type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
            <Trash2 size={15} /> Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function KeyValueEditor({
  value,
  onChange
}: {
  value: any;
  onChange: (value: Record<string, string>) => void;
}) {
  const record = contentObject(value);
  const entries = Object.entries(record).map(([key, item]) => ({ key, value: String(item ?? "") }));
  const update = (nextEntries: Array<{ key: string; value: string }>) => {
    onChange(
      Object.fromEntries(
        nextEntries
          .map((item) => [item.key.trim(), item.value.trim()] as const)
          .filter(([key, itemValue]) => key && itemValue)
      )
    );
  };

  return (
    <div className="key-value-editor">
      <div className="repeater-head">
        <strong>{entries.length} link{entries.length === 1 ? "" : "s"}</strong>
        <button className="btn secondary" type="button" onClick={() => update([...entries, { key: `link${entries.length + 1}`, value: "https://" }])}>
          <Plus size={15} /> Add link
        </button>
      </div>
      {entries.map((entry, index) => (
        <div className="key-value-row" key={`${entry.key}-${index}`}>
          <label>
            Name
            <input
              value={entry.key}
              placeholder="linkedin"
              onChange={(event) =>
                update(entries.map((item, itemIndex) => (itemIndex === index ? { ...item, key: event.target.value } : item)))
              }
            />
          </label>
          <label>
            URL
            <input
              value={entry.value}
              placeholder="https://..."
              onChange={(event) =>
                update(entries.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)))
              }
            />
          </label>
          <button className="btn secondary" type="button" onClick={() => update(entries.filter((_, itemIndex) => itemIndex !== index))}>
            <Trash2 size={15} /> Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingValueEditor({
  settingKey,
  value,
  mediaItems,
  onChange
}: {
  settingKey: string;
  value: any;
  mediaItems: any[];
  onChange: (value: Record<string, any>) => void;
}) {
  const data = contentObject(value);
  const key = String(settingKey || "").trim();
  const setValue = (field: string, nextValue: any) => onChange({ ...data, [field]: nextValue });

  return (
    <div className="admin-field full section-content-editor">
      <div>
        <strong>{key ? humanize(key) : "Setting value"}</strong>
        <p>Structured controls are shown for the core site settings. Advanced JSON remains available for custom keys.</p>
      </div>

      {key === "site" ? (
        <>
          <ContentText label="Site title" value={data.title} onChange={(next) => setValue("title", next)} />
          <ContentText label="Description" value={data.description} textarea onChange={(next) => setValue("description", next)} />
          <ContentText label="Email" value={data.email} onChange={(next) => setValue("email", next)} />
          <ContentText label="Phone" value={data.phone} onChange={(next) => setValue("phone", next)} />
          <ContentText label="Address" value={data.address} textarea onChange={(next) => setValue("address", next)} />
          <div className="nested-fields">
            <strong>Logos</strong>
            <span>Light logo</span>
            <MediaValueInput value={data.logoLight} mediaItems={mediaItems} onChange={(next) => setValue("logoLight", next)} />
            <span>Dark logo</span>
            <MediaValueInput value={data.logoDark} mediaItems={mediaItems} onChange={(next) => setValue("logoDark", next)} />
          </div>
        </>
      ) : null}

      {key === "seo" ? (
        <>
          <ContentText label="Default SEO title" value={data.title} onChange={(next) => setValue("title", next)} />
          <ContentText label="Default SEO description" value={data.description} textarea onChange={(next) => setValue("description", next)} />
          <ContentText label="Canonical URL" value={data.canonicalUrl} onChange={(next) => setValue("canonicalUrl", next)} />
          <span>Default OG image</span>
          <MediaValueInput value={data.ogImage} mediaItems={mediaItems} onChange={(next) => setValue("ogImage", next)} />
        </>
      ) : null}

      {key === "social" ? <KeyValueEditor value={data} onChange={onChange} /> : null}

      {key === "footer" ? (
        <>
          <ContentText label="Headline line 1" value={data.headline} onChange={(next) => setValue("headline", next)} />
          <ContentText label="Headline line 2" value={data.headlineLine2} onChange={(next) => setValue("headlineLine2", next)} />
          <ContentText label="Headline line 3" value={data.headlineLine3} onChange={(next) => setValue("headlineLine3", next)} />
          <ContentText label="CTA label" value={data.ctaLabel} onChange={(next) => setValue("ctaLabel", next)} />
          <ContentText label="Copyright" value={data.copyright} onChange={(next) => setValue("copyright", next)} />
          <ContentText label="Footer text" value={data.text} textarea onChange={(next) => setValue("text", next)} />
          <RepeaterEditor
            label="Footer service links"
            items={asArray(data.serviceLinks)}
            mediaItems={mediaItems}
            blankItem={{ label: "Service", href: "/services" }}
            fields={[
              { name: "label", label: "Label" },
              { name: "href", label: "Href" }
            ]}
            onChange={(items) => setValue("serviceLinks", items)}
          />
        </>
      ) : null}

      {key === "theme" ? (
        <>
          <ContentText label="Loader text" value={data.loaderText} onChange={(next) => setValue("loaderText", next)} />
          <ContentText label="Accent color" value={data.accentColor} onChange={(next) => setValue("accentColor", next)} />
          <ContentText label="Mode" value={data.mode} onChange={(next) => setValue("mode", next)} />
        </>
      ) : null}

      {!["site", "seo", "social", "footer", "theme"].includes(key) ? (
        <p className="field-help">Use Advanced JSON below for custom setting keys.</p>
      ) : null}

      <details className="advanced-json">
        <summary>Advanced JSON</summary>
        <textarea
          key={`${key}-${JSON.stringify(data)}`}
          defaultValue={JSON.stringify(data, null, 2)}
          onBlur={(event) => {
            try {
              onChange(JSON.parse(event.target.value || "{}"));
            } catch {
              onChange(data);
            }
          }}
        />
      </details>
    </div>
  );
}

function SectionContentEditor({
  sectionType,
  value,
  mediaItems,
  onChange
}: {
  sectionType: string;
  value: any;
  mediaItems: any[];
  onChange: (value: any) => void;
}) {
  const content = contentObject(value);
  const type = sectionType || "rich-text";
  const setValue = (key: string, nextValue: any) => onChange({ ...content, [key]: nextValue });
  const setNested = (key: string, nestedKey: string, nextValue: any) => {
    const nested = contentObject(content[key]);
    onChange({ ...content, [key]: { ...nested, [nestedKey]: nextValue } });
  };

  return (
    <div className="admin-field full section-content-editor">
      <div>
        <strong>Structured section content</strong>
        <p>Editing controls change based on the selected section type. Advanced JSON stays available below.</p>
      </div>

      {type === "hero" ? (
        <>
          <ContentText label="Eyebrow" value={content.eyebrow} onChange={(next) => setValue("eyebrow", next)} />
          <ContentText label="Hero headline" value={content.headline} textarea onChange={(next) => setValue("headline", next)} />
          <ContentText label="Meta lines" value={asLines(content.metaItems).join("\n\n")} textarea onChange={(next) => setValue("metaItems", next.split(/\n\s*\n/).filter(Boolean))} />
          <MediaValueInput value={content.image} mediaItems={mediaItems} onChange={(next) => setValue("image", next)} />
          <CtaEditor label="Primary CTA" value={content.primaryCta} onChange={(key, next) => setNested("primaryCta", key, next)} />
          <CtaEditor label="Secondary CTA" value={content.secondaryCta} onChange={(key, next) => setNested("secondaryCta", key, next)} />
        </>
      ) : null}

      {["text-media", "rich-text"].includes(type) ? (
        <>
          <MediaValueInput value={content.image} mediaItems={mediaItems} onChange={(next) => setValue("image", next)} />
          <ContentText label="Body" value={content.body ?? asLines(content.paragraphs).join("\n\n")} textarea onChange={(next) => setValue("paragraphs", next.split(/\n\s*\n/).filter(Boolean))} />
          <CtaEditor label="CTA" value={content.cta} onChange={(key, next) => setNested("cta", key, next)} />
        </>
      ) : null}

      {type === "pricing" ? (
        <RepeaterEditor
          label="Pricing cards"
          items={asArray(content.items)}
          mediaItems={mediaItems}
          blankItem={{
            label: "Package",
            title: "New package",
            description: "",
            price: "$0",
            suffix: "starting",
            timeline: "",
            features: [],
            ctaLabel: "Request Package",
            href: "/contact",
            featured: false
          }}
          fields={[
            { name: "label", label: "Label" },
            { name: "title", label: "Title" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "price", label: "Price" },
            { name: "suffix", label: "Price suffix" },
            { name: "timeline", label: "Timeline" },
            { name: "features", label: "Features", type: "lines" },
            { name: "ctaLabel", label: "CTA label" },
            { name: "href", label: "CTA href" },
            { name: "featured", label: "Featured", type: "checkbox" }
          ]}
          onChange={(items) => setValue("items", items)}
        />
      ) : null}

      {type === "work-showcase" ? (
        <>
          <ContentText label="Eyebrow" value={content.eyebrow} onChange={(next) => setValue("eyebrow", next)} />
          <ContentText label="Limit" value={content.limit} type="number" onChange={(next) => setValue("limit", Number(next))} />
          <CtaEditor label="CTA" value={content.cta} onChange={(key, next) => setNested("cta", key, next)} />
          <RepeaterEditor
            label="Fallback videos"
            items={asArray(content.fallbackItems)}
            mediaItems={mediaItems}
            blankItem={{ title: "Portfolio video", tag: "Motion", date: "2026", href: "/portfolio", mediaUrl: "" }}
            fields={[
              { name: "title", label: "Title" },
              { name: "tag", label: "Tag" },
              { name: "date", label: "Year" },
              { name: "href", label: "Href" },
              { name: "mediaUrl", label: "Video", type: "media" }
            ]}
            onChange={(items) => setValue("fallbackItems", items)}
          />
        </>
      ) : null}

      {type === "service-showcase" ? (
        <>
          <ContentText label="Mockup label" value={content.mockupLabel} onChange={(next) => setValue("mockupLabel", next)} />
          <CtaEditor label="Mockup CTA" value={content.mockupCta} onChange={(key, next) => setNested("mockupCta", key, next)} />
        </>
      ) : null}

      {type === "team-showcase" ? <ContentText label="Team member limit" value={content.limit} type="number" onChange={(next) => setValue("limit", Number(next))} /> : null}

      {type === "logo-strip" ? (
        <RepeaterEditor
          label="Logos"
          items={asArray(content.logos)}
          mediaItems={mediaItems}
          blankItem={{ image: "", lightImage: "", alt: "Logo placeholder" }}
          fields={[
            { name: "image", label: "Dark mode image", type: "media" },
            { name: "lightImage", label: "Light mode image", type: "media" },
            { name: "alt", label: "Alt text" }
          ]}
          onChange={(items) => setValue("logos", items)}
        />
      ) : null}

      {type === "capability-list" ? (
        <RepeaterEditor
          label="Capability rows"
          items={asArray(content.items)}
          mediaItems={mediaItems}
          blankItem={{ category: "Category", text: "Capability", year: "01" }}
          fields={[
            { name: "category", label: "Category" },
            { name: "text", label: "Text" },
            { name: "year", label: "Index" }
          ]}
          onChange={(items) => setValue("items", items)}
        />
      ) : null}

      {type === "stats" ? (
        <RepeaterEditor
          label="Stats"
          items={asArray(content.items)}
          mediaItems={mediaItems}
          blankItem={{ value: "0", label: "Metric" }}
          fields={[
            { name: "value", label: "Value" },
            { name: "label", label: "Label" }
          ]}
          onChange={(items) => setValue("items", items)}
        />
      ) : null}

      {type === "contact-info" ? (
        <>
          <ContentText label="Email" value={content.email} onChange={(next) => setValue("email", next)} />
          <ContentText label="Phone" value={content.phone} onChange={(next) => setValue("phone", next)} />
          <ContentText label="Address" value={content.address} textarea onChange={(next) => setValue("address", next)} />
        </>
      ) : null}

      {["contact", "portfolio", "services", "projects", "blog", "team", "faq"].includes(type) ? (
        <>
          <ContentText label="Eyebrow" value={content.eyebrow} onChange={(next) => setValue("eyebrow", next)} />
          <ContentText label="Intro body" value={content.body} textarea onChange={(next) => setValue("body", next)} />
          <MediaValueInput value={content.image} mediaItems={mediaItems} onChange={(next) => setValue("image", next)} />
          <CtaEditor label="CTA" value={content.cta} onChange={(key, next) => setNested("cta", key, next)} />
        </>
      ) : null}

      {![
        "hero",
        "text-media",
        "rich-text",
        "pricing",
        "work-showcase",
        "service-showcase",
        "team-showcase",
        "logo-strip",
        "capability-list",
        "stats",
        "contact-info",
        "contact",
        "portfolio",
        "services",
        "projects",
        "blog",
        "team",
        "faq"
      ].includes(type) ? (
        <>
          <ContentText label="Body" value={content.body} textarea onChange={(next) => setValue("body", next)} />
          <MediaValueInput value={content.image} mediaItems={mediaItems} onChange={(next) => setValue("image", next)} />
          <CtaEditor label="CTA" value={content.cta} onChange={(key, next) => setNested("cta", key, next)} />
        </>
      ) : null}

      <details className="advanced-json">
        <summary>Advanced JSON</summary>
        <textarea
          key={JSON.stringify(content)}
          defaultValue={JSON.stringify(content, null, 2)}
          onBlur={(event) => {
            try {
              onChange(JSON.parse(event.target.value || "{}"));
            } catch {
              onChange(content);
            }
          }}
        />
      </details>
    </div>
  );
}

function ContentText({
  label,
  value,
  textarea = false,
  type = "text",
  onChange
}: {
  label: string;
  value: any;
  textarea?: boolean;
  type?: "text" | "number";
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      {textarea ? (
        <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function CtaEditor({
  label,
  value,
  onChange
}: {
  label: string;
  value: any;
  onChange: (key: string, value: string) => void;
}) {
  const cta = contentObject(value);
  return (
    <div className="nested-fields">
      <strong>{label}</strong>
      <ContentText label="Label" value={cta.label} onChange={(next) => onChange("label", next)} />
      <ContentText label="Href" value={cta.href} onChange={(next) => onChange("href", next)} />
    </div>
  );
}

type RepeaterField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "lines" | "media";
};

function RepeaterEditor({
  label,
  items,
  fields,
  blankItem,
  mediaItems,
  onChange
}: {
  label: string;
  items: any[];
  fields: RepeaterField[];
  blankItem: Record<string, any>;
  mediaItems: any[];
  onChange: (items: any[]) => void;
}) {
  const updateItem = (index: number, key: string, value: any) => {
    const next = items.map((item, itemIndex) => (itemIndex === index ? { ...contentObject(item), [key]: value } : item));
    onChange(next);
  };

  return (
    <div className="repeater">
      <div className="repeater-head">
        <strong>{label}</strong>
        <button className="btn secondary" type="button" onClick={() => onChange([...items, blankItem])}>
          <Plus size={15} /> Add
        </button>
      </div>
      {items.map((item, index) => {
        const record = contentObject(item);
        return (
          <div className="repeater-item" key={index}>
            <div className="repeater-item-head">
              <strong>Item {index + 1}</strong>
              <button className="btn secondary" type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
                <Trash2 size={15} /> Remove
              </button>
            </div>
            <div className="repeater-grid">
              {fields.map((field) => (
                <div className={field.type === "textarea" || field.type === "lines" || field.type === "media" ? "repeater-field full" : "repeater-field"} key={field.name}>
                  <span>{field.label}</span>
                  {field.type === "checkbox" ? (
                    <input type="checkbox" checked={Boolean(record[field.name])} onChange={(event) => updateItem(index, field.name, event.target.checked)} />
                  ) : field.type === "textarea" ? (
                    <textarea value={record[field.name] ?? ""} onChange={(event) => updateItem(index, field.name, event.target.value)} />
                  ) : field.type === "lines" ? (
                    <textarea value={asLines(record[field.name]).join("\n")} onChange={(event) => updateItem(index, field.name, event.target.value.split("\n").filter(Boolean))} />
                  ) : field.type === "media" ? (
                    <MediaValueInput value={record[field.name]} mediaItems={mediaItems} onChange={(next) => updateItem(index, field.name, next)} />
                  ) : (
                    <input type={field.type === "number" ? "number" : "text"} value={record[field.name] ?? ""} onChange={(event) => updateItem(index, field.name, field.type === "number" ? Number(event.target.value) : event.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildBody(fields: Field[], form: Record<string, any>) {
  const body: Record<string, any> = {};
  fields.forEach((field) => {
    const value = form[field.name];
    if (value === "" || value === undefined) return;
    if (field.type === "number") body[field.name] = Number(value);
    else if (field.type === "json") body[field.name] = typeof value === "string" ? JSON.parse(value) : value;
    else if (field.type === "lines" || field.type === "media-list") body[field.name] = asLines(value);
    else if (field.type === "key-value") body[field.name] = contentObject(value);
    else if (field.type === "content-blocks") body[field.name] = asArray(value);
    else body[field.name] = value;
  });
  return body;
}

function defaultFieldValue(field: Field) {
  if (field.type === "checkbox") return ["enabled", "isActive"].includes(field.name);
  if (field.name === "status") return "DRAFT";
  if (field.name === "mediaType") return "image";
  if (field.type === "lines" || field.type === "media-list" || field.type === "content-blocks") return [];
  if (field.type === "key-value") return {};
  return undefined;
}

function canAccessResource(resourceKey: string, role?: string) {
  if (!role) return true;
  if (role === "SUPER_ADMIN") return true;
  if (resourceKey === "users") return false;
  if (role === "EDITOR" && ["settings", "menus", "menu-items"].includes(resourceKey)) return false;
  return true;
}

function resourceDescription(resourceKey: string) {
  const descriptions: Record<string, string> = {
    settings: "Manage global site, SEO, theme, footer, and social JSON settings.",
    menus: "Create and organize navigation menus for the public website.",
    "menu-items": "Edit labels, destinations, active states, and ordering for navigation items.",
    pages: "Manage CMS pages, SEO metadata, publishing status, and ordering.",
    "page-sections": "Build page content with structured section editors and advanced JSON fallback.",
    services: "Maintain service pages, feature lists, images, SEO metadata, and publish status.",
    "project-categories": "Organize portfolio/work items by category.",
    projects: "Manage case studies, galleries, videos, metadata, and publish status.",
    "portfolio-items": "Curate the image and video gallery shown across portfolio surfaces.",
    "blog-categories": "Organize blog posts by category.",
    tags: "Manage reusable blog tags.",
    "blog-posts": "Write, publish, feature, and optimize blog content.",
    team: "Manage team profiles, portraits, skills, social links, and SEO data.",
    faqs: "Update FAQ content and active ordering.",
    testimonials: "Manage client testimonials and display ordering.",
    "contact-messages": "Review inbound leads, mark their status, and keep internal notes.",
    media: "Upload and maintain reusable images, videos, and file metadata.",
    users: "Manage admin accounts, roles, avatars, and passwords."
  };
  return descriptions[resourceKey] ?? "Manage CMS records through the admin API.";
}

function publicHrefFor(resourceKey: string, item: Record<string, any>) {
  if (!item.slug) return null;
  if (resourceKey === "pages") return item.slug === "home" ? "/" : `/${item.slug}`;
  if (resourceKey === "services") return `/services/${item.slug}`;
  if (resourceKey === "projects") return `/work/${item.slug}`;
  if (resourceKey === "blog-posts") return `/blog/${item.slug}`;
  if (resourceKey === "team") return `/team/${item.slug}`;
  return null;
}

function itemTitle(item: Record<string, any>) {
  return (
    item.title ??
    item.name ??
    item.clientName ??
    item.question ??
    item.key ??
    item.email ??
    item.filename ??
    item.label ??
    "Untitled"
  );
}

function itemSummary(item: Record<string, any>) {
  const value =
    item.slug ??
    item.status ??
    item.shortDescription ??
    item.subject ??
    item.url ??
    item.role ??
    item.location ??
    item.mimeType ??
    item.pageType ??
    "";
  return typeof value === "object" ? JSON.stringify(value).slice(0, 120) : String(value).slice(0, 160);
}

function relationLabel(item: Record<string, any>) {
  const title = itemTitle(item);
  const detail = item.slug ?? item.location ?? item.email ?? item.url;
  return detail && detail !== title ? `${title} (${detail})` : title;
}

function humanize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ");
}
