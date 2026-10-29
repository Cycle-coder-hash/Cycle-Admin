import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Brain,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  FileText,
} from "lucide-react";
import {
  services,
  type AdminPsychologyPost,
  type PsychologyManagerItem,
} from "../services";

export const PsychologyCMS: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"posts" | "managers">("posts");
  const [posts, setPosts] = useState<AdminPsychologyPost[]>([]);
  const [managers, setManagers] = useState<PsychologyManagerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Composer / Edit Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPsychologyPost | null>(null);
  const [formContent, setFormContent] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formPhotoKey, setFormPhotoKey] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  // Deletion / Action States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [permissionUpdatingId, setPermissionUpdatingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load Posts & Managers
  const loadPosts = useCallback(async () => {
    try {
      const res = await services.psychology.getPosts({ limit: 50 });
      setPosts(res.items);
    } catch (err: any) {
      console.error("[PsychologyCMS loadPosts error]:", err);
    }
  }, []);

  const loadManagers = useCallback(async () => {
    try {
      const list = await services.psychology.getManagers();
      setManagers(list);
    } catch (err: any) {
      console.error("[PsychologyCMS loadManagers error]:", err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPosts(), loadManagers()]);
    setLoading(false);
  }, [loadPosts, loadManagers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Open Composer
  const handleOpenAdd = () => {
    setEditingPost(null);
    setFormContent("");
    setFormPhotoUrl("");
    setFormPhotoKey(null);
    setIsComposerOpen(true);
    setActionMessage(null);
  };

  const handleOpenEdit = (post: AdminPsychologyPost) => {
    setEditingPost(post);
    setFormContent(post.content);
    setFormPhotoUrl(post.photoUrl || "");
    setFormPhotoKey(post.photoKey || null);
    setIsComposerOpen(true);
    setActionMessage(null);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
    setEditingPost(null);
    setFormContent("");
    setFormPhotoUrl("");
    setFormPhotoKey(null);
    setUploadingPhoto(false);
    setSavingPost(false);
  };

  // Image Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image exceeds maximum allowed size of 10MB.");
      return;
    }

    try {
      setUploadingPhoto(true);
      const res = await services.psychology.uploadImage(file);
      setFormPhotoUrl(res.url);
      setFormPhotoKey(res.key ?? null);
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setFormPhotoUrl("");
    setFormPhotoKey(null);
  };

  // Save Post (Create / Update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContent = formContent.trim();
    if (!cleanContent) {
      alert("Post content cannot be empty.");
      return;
    }

    if (cleanContent.length > 5000) {
      alert("Post content exceeds 5,000 character limit.");
      return;
    }

    try {
      setSavingPost(true);
      if (editingPost) {
        await services.psychology.updatePost(editingPost.id, {
          content: cleanContent,
          photoUrl: formPhotoUrl || null,
          photoKey: formPhotoKey || null,
        });
        setActionMessage({
          type: "success",
          text: `Post "${editingPost.id}" successfully updated.`,
        });
      } else {
        const created = await services.psychology.createPost({
          content: cleanContent,
          photoUrl: formPhotoUrl || null,
          photoKey: formPhotoKey || null,
        });
        setActionMessage({
          type: "success",
          text: `New post "${created.id}" published to Psychology feed.`,
        });
      }
      handleCloseComposer();
      await loadPosts();
    } catch (err: any) {
      alert(err.message || "Failed to save post.");
    } finally {
      setSavingPost(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (post: AdminPsychologyPost) => {
    if (!confirm(`Are you sure you want to delete post "${post.id}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(post.id);
      await services.psychology.deletePost(post.id);
      setActionMessage({
        type: "success",
        text: `Post "${post.id}" successfully deleted.`,
      });
      await loadPosts();
    } catch (err: any) {
      alert(err.message || "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  // Grant / Revoke Manager Permission
  const handleToggleManagerPermission = async (manager: PsychologyManagerItem) => {
    const nextGranted = !manager.granted;
    const confirmMsg = nextGranted
      ? `Grant Psychology management permission to ${manager.name} (#${manager.id})? They will be able to author and publish posts.`
      : `Revoke Psychology management permission from ${manager.name} (#${manager.id})?`;

    if (!confirm(confirmMsg)) return;

    try {
      setPermissionUpdatingId(manager.id);
      await services.psychology.setManagerPermission({
        userId: manager.id,
        permission: "psychology_manage",
        granted: nextGranted,
      });
      setActionMessage({
        type: "success",
        text: `${manager.name}'s psychology management permission set to ${nextGranted ? "GRANTED" : "REVOKED"}.`,
      });
      await loadManagers();
    } catch (err: any) {
      alert(err.message || "Failed to update permission.");
    } finally {
      setPermissionUpdatingId(null);
    }
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  // Filtered Managers
  const filteredManagers = useMemo(() => {
    if (!searchQuery.trim()) return managers;
    const q = searchQuery.toLowerCase().trim();
    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        String(m.id).includes(q)
    );
  }, [managers, searchQuery]);

  const activeManagersCount = useMemo(
    () => managers.filter((m) => m.granted).length,
    [managers]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick KPI Stats */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
              <Brain size={13} className="text-sky-400 animate-pulse" />
              <span>Phase 1 — Core Feed & Permission Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Psychology Feed & Mindset CMS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Publish official trading psychology lessons, market discipline insights, and manage
              authoring permissions for Support and Admin Managers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Compose Post</span>
            </button>

            <button
              onClick={loadAll}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-sky-400" : ""} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Mini KPI Row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-800/80 pt-6">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <FileText size={14} className="text-sky-400" />
              <span>Published Posts</span>
            </div>
            <div className="mt-1.5 text-xl font-extrabold text-white">
              {posts.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Authorized Managers</span>
            </div>
            <div className="mt-1.5 text-xl font-extrabold text-emerald-400">
              {activeManagersCount} <span className="text-xs text-slate-400 font-normal">/ {managers.length}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800/60 bg-slate-950/50 p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <Shield size={14} className="text-indigo-400" />
              <span>Access Level</span>
            </div>
            <div className="mt-1.5 text-xs font-bold text-slate-200">
              Full Administrator (All Privileges)
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-bold transition-all ${
            actionMessage.type === "success"
              ? "border-emerald-800 bg-emerald-950/40 text-emerald-200"
              : "border-rose-800 bg-rose-950/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Sub Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
          <button
            type="button"
            onClick={() => setActiveSubTab("posts")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === "posts"
                ? "bg-sky-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Brain size={14} />
            <span>Feed Posts ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("managers")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === "managers"
                ? "bg-sky-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>Manager Permissions ({activeManagersCount})</span>
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === "posts"
                ? "Search posts or authors..."
                : "Search manager name or email..."
            }
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: POSTS LIST */}
      {/* ========================================================================= */}
      {activeSubTab === "posts" && (
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <RefreshCw size={24} className="mx-auto animate-spin text-sky-400 mb-3" />
              <div className="text-xs font-bold text-slate-300">Loading Psychology feed...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
              <Brain size={36} className="mx-auto text-slate-600" />
              <div className="text-sm font-extrabold text-white">No Psychology Posts Found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? "No posts match your search query."
                  : "No psychology posts have been published yet. Be the first to publish a mindset lesson!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
                >
                  <Plus size={14} />
                  <span>Create First Post</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 transition hover:border-slate-700/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Author & Header Info */}
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-black text-sky-400 shrink-0 overflow-hidden">
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="size-full object-cover"
                          />
                        ) : (
                          post.authorName.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-white">
                            {post.authorName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              post.authorRole === "admin"
                                ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            <Shield size={10} />
                            <span>{post.authorRole === "admin" ? "Admin" : "Manager"}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {post.isEdited && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/90 font-medium">(edited)</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-500">ID: {post.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(post)}
                        title="Edit Post"
                        className="flex size-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post)}
                        disabled={deletingId === post.id}
                        title="Delete Post"
                        className="flex size-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/30 hover:border-rose-900 transition cursor-pointer"
                      >
                        <Trash2 size={13} className={deletingId === post.id ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mt-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>

                  {/* Attached Image Preview */}
                  {post.photoUrl && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800/80 max-h-80 bg-slate-950">
                      <img
                        src={post.photoUrl}
                        alt="Post Attachment"
                        className="w-full h-full max-h-80 object-cover"
                      />
                    </div>
                  )}

                  {/* Footer Stats / Link */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">Path: {post.canonicalPath}</span>
                    <span className="text-slate-400 font-medium">Status: published</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MANAGER PERMISSIONS */}
      {/* ========================================================================= */}
      {activeSubTab === "managers" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-sky-400">Security Rule:</span> Support and Admin Manager
            accounts can only create and manage psychology posts if explicitly granted the{" "}
            <code className="text-sky-300 font-mono">psychology_manage</code> permission below. Only Full
            Administrators may grant or revoke this privilege.
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <RefreshCw size={24} className="mx-auto animate-spin text-sky-400 mb-3" />
              <div className="text-xs font-bold text-slate-300">Loading manager accounts...</div>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-2">
              <Users size={32} className="mx-auto text-slate-600" />
              <div className="text-sm font-extrabold text-white">No Manager Accounts Found</div>
              <p className="text-xs text-slate-400">
                To manage permissions, ensure user accounts have role{" "}
                <code className="text-slate-300 font-mono">'support'</code> or{" "}
                <code className="text-slate-300 font-mono">'admin_manager'</code>.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-extrabold uppercase text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Permission Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredManagers.map((mgr) => {
                    const isUpdating = permissionUpdatingId === mgr.id;
                    return (
                      <tr key={mgr.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-white">{mgr.name}</div>
                          <div className="text-[11px] text-slate-400">{mgr.email || "No email"}</div>
                          <div className="font-mono text-[10px] text-slate-500">ID: #{mgr.id}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[10px] font-bold text-slate-300 capitalize">
                            {mgr.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {mgr.granted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-extrabold text-emerald-400">
                              <ShieldCheck size={12} />
                              <span>Granted</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-[11px] font-extrabold text-slate-400">
                              <ShieldAlert size={12} />
                              <span>Revoked / None</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleManagerPermission(mgr)}
                            disabled={isUpdating}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                              mgr.granted
                                ? "border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50"
                                : "bg-sky-500 text-slate-950 hover:bg-sky-400 font-extrabold"
                            }`}
                          >
                            {isUpdating ? "Updating..." : mgr.granted ? "Revoke Access" : "Grant Access"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPOSER / EDIT MODAL */}
      {/* ========================================================================= */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#070e1b] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Brain size={18} className="text-sky-400" />
                <span>{editingPost ? "Edit Psychology Post" : "Compose Psychology Post"}</span>
              </div>
              <button
                type="button"
                onClick={handleCloseComposer}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="mt-5 space-y-4">
              {/* Content Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Post Content *</label>
                  <span
                    className={`font-mono text-[11px] ${
                      formContent.length > 5000 ? "text-rose-400 font-bold" : "text-slate-500"
                    }`}
                  >
                    {formContent.length} / 5,000
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share a trading mindset lesson, discipline reminder, execution framework, or psychology breakdown..."
                  required
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition resize-y"
                />
              </div>

              {/* Photo Attachment Section */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-sky-400" />
                  <span>Photo Attachment (Optional, max 10MB)</span>
                </label>

                {formPhotoUrl ? (
                  <div className="relative rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 max-h-56">
                    <img
                      src={formPhotoUrl}
                      alt="Attachment Preview"
                      className="w-full h-full max-h-56 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-xl bg-slate-950/80 text-rose-400 hover:bg-rose-950 border border-slate-700 transition cursor-pointer"
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-2xl p-6 text-center cursor-pointer transition">
                    <UploadCloud size={24} className="text-slate-500 mb-2" />
                    <span className="text-xs font-bold text-slate-300">
                      {uploadingPhoto ? "Uploading image to cloud..." : "Click or drag image to upload"}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      PNG, JPEG, WebP, GIF supported
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseComposer}
                  disabled={savingPost}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPost || uploadingPhoto || !formContent.trim()}
                  className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2 text-xs font-extrabold text-slate-950 transition cursor-pointer disabled:opacity-50"
                >
                  {savingPost ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPost ? "Update Post" : "Publish Post"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
