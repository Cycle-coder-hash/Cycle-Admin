import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Pin,
  Trash2,
  Search,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  X,
  Maximize2,
} from "lucide-react";
import {
  fetchCommunityPostsApi,
  deleteCommunityPostApi,
  togglePinCommunityPostApi,
} from "../lib/api";
import type { AdminCommunityPost } from "../services/CommunityService";

export const CommunityModeration: React.FC = () => {
  const [posts, setPosts] = useState<AdminCommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pinned" | "charts">("all");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<number | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchCommunityPostsApi(50);
      setPosts(res.items || []);
    } catch (err: any) {
      console.error("[CommunityModeration.loadPosts error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeletePost = async (postId: number) => {
    if (!confirm(`Are you sure you want to delete post #${postId}? This will cascade delete its reactions and comments.`)) {
      return;
    }
    setIsProcessingId(postId);
    try {
      const res = await deleteCommunityPostApi(postId);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setActionMsg(`Post #${postId} deleted successfully.`);
      }
    } catch (err: any) {
      alert("Failed to delete post: " + err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleTogglePin = async (postId: number, currentPinned: boolean) => {
    setIsProcessingId(postId);
    try {
      const res = await togglePinCommunityPostApi(postId, !currentPinned);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isPinned: !currentPinned } : p))
        );
        setActionMsg(
          !currentPinned ? `Post #${postId} pinned to top.` : `Post #${postId} unpinned.`
        );
      }
    } catch (err: any) {
      alert("Failed to update pin status: " + err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filterType === "pinned" && !p.isPinned) return false;
    if (filterType === "charts" && !p.mediaUrl) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.content?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q) ||
        String(p.userId).includes(q) ||
        String(p.id).includes(q)
      );
    }
    return true;
  });

  const pinnedCount = posts.filter((p) => p.isPinned).length;
  const chartsCount = posts.filter((p) => !!p.mediaUrl).length;

  return (
    <div className="space-y-6">
      {/* Header and KPI strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="text-sky-400 size-6" />
            <span>Community Feed Moderation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit member discussions, pin educational thesis, and delete inappropriate content or media attachments.
          </p>
        </div>

        <button
          onClick={loadPosts}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition shadow-sm w-fit"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-sky-400" : ""} />
          <span>{loading ? "Loading..." : "Refresh Feed"}</span>
        </button>
      </div>

      {actionMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-800/80 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-400">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Posts</span>
          <p className="text-2xl font-black text-white mt-1">{posts.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 shadow-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Pinned Educational Posts</span>
          <p className="text-2xl font-black text-cyan-300 mt-1">{pinnedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chart Attachments (Premium)</span>
          <p className="text-2xl font-black text-white mt-1">{chartsCount}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by author, user ID, content..."
            className="w-full rounded-xl border border-slate-800 bg-[#070e1b] pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "pinned", "charts"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize ${
                filterType === type
                  ? "bg-sky-500 text-slate-950 shadow-md"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {type === "all" ? "All Posts" : type === "pinned" ? "Pinned Only" : "Charts Attached"}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-sky-400" />
            <span>Loading community database...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 italic">
            No community posts matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Post Content</th>
                  <th className="px-4 py-3">Chart Media</th>
                  <th className="px-4 py-3">Engagement</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5 font-mono text-slate-500">#{post.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center font-bold text-sky-400 text-xs">
                              {(post.authorName || "T")[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{post.authorName}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                                post.authorPlan === "admin"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : post.authorPlan === "premium"
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "bg-sky-500/20 text-sky-300"
                              }`}
                            >
                              {post.authorPlan}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            User ID: {post.userId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <p className="line-clamp-2 text-slate-200 leading-relaxed break-words">
                        {post.content}
                      </p>
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-cyan-400">
                          <Pin size={10} className="rotate-45" />
                          <span>Pinned Announcement</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {post.mediaUrl ? (
                        <div className="relative size-12 rounded-lg border border-slate-700 overflow-hidden bg-slate-950 group cursor-pointer" onClick={() => setPreviewImage(post.mediaUrl!)}>
                          <img
                            src={post.mediaUrl}
                            alt="Chart"
                            className="size-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                            <Maximize2 size={14} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">None (Text-only)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      <span>{post.likesCount} likes</span>
                      <span className="mx-1">•</span>
                      <span>{post.commentsCount} comments</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px] font-mono">
                      {new Date(post.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePin(post.id, post.isPinned)}
                          disabled={isProcessingId === post.id}
                          className={`p-1.5 rounded-lg border transition ${
                            post.isPinned
                              ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                              : "border-slate-800 bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title={post.isPinned ? "Unpin post" : "Pin post to top"}
                        >
                          <Pin size={14} className={post.isPinned ? "rotate-45" : ""} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isProcessingId === post.id}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 transition"
                          title="Delete post permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Size Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Chart preview"
              className="max-h-[85vh] max-w-full rounded-2xl border border-slate-800 object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
