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
  Heart,
  MessageSquare,
  Bell,
  Check,
} from "lucide-react";
import {
  services,
  type AdminPsychologyPost,
  type PsychologyManagerItem,
  type AdminPsychologyNotification,
} from "../services";

export const PsychologyCMS: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"posts" | "activity" | "managers">("posts");
  const [posts, setPosts] = useState<AdminPsychologyPost[]>([]);
  const [managers, setManagers] = useState<PsychologyManagerItem[]>([]);
  const [notifications, setNotifications] = useState<AdminPsychologyNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
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

  // Load Posts, Managers & Activity Notifications
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

  const loadNotifications = useCallback(async () => {
    try {
      const res = await services.psychology.getNotifications({ limit: 50 });
      setNotifications(res.items);
      setUnreadNotifsCount(res.unreadCount);
    } catch (err: any) {
      console.error("[PsychologyCMS loadNotifications error]:", err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPosts(), loadManagers(), loadNotifications()]);
    setLoading(false);
  }, [loadPosts, loadManagers, loadNotifications]);

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
          text: `Post #${editingPost.id} updated successfully.`,
        });
      } else {
        const created = await services.psychology.createPost({
          content: cleanContent,
          photoUrl: formPhotoUrl || null,
          photoKey: formPhotoKey || null,
        });
        setActionMessage({
          type: "success",
          text: `New post created successfully (ID: ${created.id}).`,
        });
      }
      handleCloseComposer();
      await loadPosts();
    } catch (err: any) {
      alert(err.message || "Failed to save psychology post.");
    } finally {
      setSavingPost(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete post #${id}? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await services.psychology.deletePost(id);
      setActionMessage({
        type: "success",
        text: `Post #${id} deleted successfully.`,
      });
      await loadPosts();
    } catch (err: any) {
      alert(err.message || "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle Manager Permission
  const handleToggleManagerPermission = async (mgr: PsychologyManagerItem) => {
    const nextGranted = !mgr.granted;
    try {
      setPermissionUpdatingId(mgr.id);
      await services.psychology.setManagerPermission({
        userId: mgr.id,
        permission: "psychology_manage",
        granted: nextGranted,
      });
      setActionMessage({
        type: "success",
        text: `Updated permission for ${mgr.name}: ${nextGranted ? "Granted" : "Revoked"}.`,
      });
      await loadManagers();
    } catch (err: any) {
      alert(err.message || "Failed to update manager permission.");
    } finally {
      setPermissionUpdatingId(null);
    }
  };

  // Mark notification read
  const handleMarkNotifRead = async (notifId: number) => {
    try {
      await services.psychology.markNotificationRead(notifId);
      await loadNotifications();
    } catch (err: any) {
      alert(err.message || "Failed to update notification.");
    }
  };

  // Filtering
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const filteredManagers = useMemo(() => {
    if (!searchQuery.trim()) return managers;
    const q = searchQuery.toLowerCase();
    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [managers, searchQuery]);

  const activeManagersCount = useMemo(
    () => managers.filter((m) => m.granted).length,
    [managers]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Actions */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
              <Brain size={13} className="text-sky-400 animate-pulse" />
              <span>Phase 1 &amp; 2 — Feed, Discussion &amp; Interactions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Psychology Feed &amp; Mindset CMS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Publish official trading psychology lessons, monitor reader interactions (Loves &amp; Comments),
              and manage authoring permissions for Support and Admin Managers.
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
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-6">
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
              <Bell size={14} className={unreadNotifsCount > 0 ? "text-emerald-400 animate-pulse" : "text-sky-400"} />
              <span>Reader Alerts</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{notifications.length}</span>
              {unreadNotifsCount > 0 && (
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black text-white">
                  {unreadNotifsCount} new
                </span>
              )}
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

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/50 p-3.5">
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
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-rose-400" />
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
            onClick={() => setActiveSubTab("activity")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === "activity"
                ? "bg-sky-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell size={14} />
            <span>Live Alerts</span>
            {unreadNotifsCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black text-white">
                {unreadNotifsCount}
              </span>
            )}
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
                : activeSubTab === "activity"
                ? "Search alerts..."
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

      {/* SUB-TAB 1: POSTS LIST */}
      {activeSubTab === "posts" && (
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <RefreshCw size={24} className="mx-auto animate-spin text-sky-400 mb-3" />
              <div className="text-xs font-bold text-slate-300">Loading published posts...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-2">
              <Brain size={32} className="mx-auto text-slate-600" />
              <div className="text-sm font-extrabold text-white">No Psychology Posts Found</div>
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? "No posts match your search query."
                  : "Click 'Compose Post' above to publish your first daily mindset insight."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post) => {
                const isDeleting = deletingId === post.id;
                const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={post.id}
                    className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 transition hover:border-slate-700 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="size-10 rounded-2xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 font-extrabold text-xs border border-sky-500/20">
                            {post.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{post.authorName}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                post.authorBadge === "admin"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                              }`}
                            >
                              {post.authorBadge}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <Clock size={11} />
                            <span>{formattedDate}</span>
                            {post.isEdited && <span className="italic">(edited)</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          className="flex size-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isDeleting}
                          className="flex size-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-medium break-words">
                      {post.content}
                    </p>

                    {post.photoUrl && (
                      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 max-h-80">
                        <img
                          src={post.photoUrl}
                          alt="Post media"
                          className="w-full h-full object-contain max-h-80"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                      <span>ID: {post.id}</span>
                      <span className="text-slate-400">{post.content.length} characters</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ACTIVITY ALERTS (Phase 2 Reader Interactions) */}
      {activeSubTab === "activity" && (
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <RefreshCw size={24} className="mx-auto animate-spin text-sky-400 mb-3" />
              <div className="text-xs font-bold text-slate-300">Loading reader activity...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-2">
              <Bell size={32} className="mx-auto text-slate-600" />
              <div className="text-sm font-extrabold text-white">No Reader Activity Yet</div>
              <p className="text-xs text-slate-400">
                When verified traders love a post or leave discussion comments, events will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/60">
              {notifications.map((notif) => {
                const formattedTime = new Date(notif.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const isLove = notif.type === "love";
                const isReply = notif.type === "admin_reply";

                return (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      !notif.read ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isLove
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : isReply
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        }`}
                      >
                        {isLove ? (
                          <Heart size={16} className="fill-rose-500" />
                        ) : isReply ? (
                          <ShieldCheck size={16} />
                        ) : (
                          <MessageSquare size={16} />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-white">{notif.title}</span>
                          {!notif.read && (
                            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span className="text-[10px] text-slate-500">{formattedTime}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium break-words">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Target Post: {notif.postId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkNotifRead(notif.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 transition cursor-pointer"
                        >
                          <Check size={12} />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: MANAGER PERMISSIONS */}
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
                            {isUpdating ? "Saving..." : mgr.granted ? "Revoke Access" : "Grant Access"}
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

      {/* COMPOSER / EDIT MODAL */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingPost ? `Edit Psychology Post #${editingPost.id}` : "Compose Psychology Post"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Publish official trading psychology lessons for Cycle of Chart readers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseComposer}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">
                  Post Content (Required)
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share a mental framework, trade discipline rule, or cognitive bias mitigation..."
                  rows={6}
                  required
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition leading-relaxed resize-none"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Preserves exact paragraphs &amp; line breaks</span>
                  <span>{formContent.length} / 5,000</span>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 flex items-center justify-between">
                  <span>Photo Attachment (Optional)</span>
                  {formPhotoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                    >
                      Remove photo
                    </button>
                  )}
                </label>

                {formPhotoUrl ? (
                  <div className="rounded-2xl border border-slate-800 overflow-hidden relative group max-h-52 bg-slate-950">
                    <img
                      src={formPhotoUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-contain max-h-52"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 hover:border-slate-700 transition cursor-pointer">
                    <UploadCloud size={24} className="text-slate-500 mb-2" />
                    <span className="text-xs font-bold text-slate-300">
                      {uploadingPhoto ? "Uploading to Cloudflare R2..." : "Click to upload image (PNG, JPEG, WebP)"}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseComposer}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPost || uploadingPhoto || !formContent.trim()}
                  className="rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2 text-xs font-extrabold text-slate-950 shadow-md shadow-sky-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {savingPost ? "Publishing..." : editingPost ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
