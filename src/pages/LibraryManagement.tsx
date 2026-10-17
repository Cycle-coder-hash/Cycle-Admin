import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Paperclip,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Video,
  Play,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  ExternalLink,
  Download,
  Settings,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Link2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchCourseAlbumMetaApi,
  updateCourseAlbumMetaApi,
  fetchCourseClassesApi,
  createCourseClassApi,
  updateCourseClassApi,
  deleteCourseClassApi,
  reorderCourseClassesApi,
  reorderEbooksApi,
  CourseAlbumMeta,
  CourseClass,
  CourseId,
} from "../lib/api";
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getGoogleDrivePreviewUrl,
  getGoogleDriveDownloadUrl,
} from "../lib/mediaLinks";
import { CourseClassModal } from "../modals/CourseClassModal";
import { CourseAlbumMetaModal } from "../modals/CourseAlbumMetaModal";

interface LibraryManagementProps {
  ebooks: any[];
  onOpenAddEbookModal: () => void;
  onOpenEditEbookModal: (ebook: any) => void;
  onTogglePublishEbook: (id: number, currentPublished: boolean) => void;
  onDeleteEbook: (id: number) => void;
  onReloadEbooks?: () => void;
}

export const LibraryManagement: React.FC<LibraryManagementProps> = ({
  ebooks,
  onOpenAddEbookModal,
  onOpenEditEbookModal,
  onTogglePublishEbook,
  onDeleteEbook,
  onReloadEbooks,
}) => {
  // Category tab state: "free-pdfs" | "basic-to-advance" | "cycle-blueprint"
  const [activeCategory, setActiveCategory] = useState<"free-pdfs" | "basic-to-advance" | "cycle-blueprint">("free-pdfs");

  // Free PDFs Search & Filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Course Album States
  const [courseMetaA, setCourseMetaA] = useState<CourseAlbumMeta | null>(null);
  const [courseMetaB, setCourseMetaB] = useState<CourseAlbumMeta | null>(null);
  const [classesA, setClassesA] = useState<CourseClass[]>([]);
  const [classesB, setClassesB] = useState<CourseClass[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Modals for Courses
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null);
  const [isAlbumMetaModalOpen, setIsAlbumMetaModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<CourseId>("basic-to-advance");
  const [previewingClass, setPreviewingClass] = useState<CourseClass | null>(null);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Load Course Data
  const loadCourseData = async () => {
    try {
      setLoadingCourses(true);
      const [metaA, metaB, clsA, clsB] = await Promise.all([
        fetchCourseAlbumMetaApi("basic-to-advance"),
        fetchCourseAlbumMetaApi("cycle-blueprint"),
        fetchCourseClassesApi("basic-to-advance"),
        fetchCourseClassesApi("cycle-blueprint"),
      ]);
      setCourseMetaA(metaA);
      setCourseMetaB(metaB);
      setClassesA(clsA);
      setClassesB(clsB);
    } catch (err: any) {
      console.error("[loadCourseData error]:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, []);

  // Free PDFs Filter
  const filteredEbooks = (ebooks || []).filter((eb: any) => {
    if (categoryFilter !== "all" && eb.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        eb.titleEn?.toLowerCase().includes(q) ||
        eb.titleBn?.toLowerCase().includes(q) ||
        eb.subtitleEn?.toLowerCase().includes(q) ||
        eb.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(
    new Set((ebooks || []).map((e: any) => e.category).filter(Boolean))
  );

  // Reorder Free PDFs
  const handleMoveEbook = async (id: number, direction: "up" | "down") => {
    const list = [...(ebooks || [])];
    const index = list.findIndex((e) => Number(e.id) === Number(id));
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const orderedIds = list.map((e) => Number(e.id));
    try {
      await reorderEbooksApi(orderedIds);
      showNotification("success", "PDF ordering sequence updated.");
      onReloadEbooks?.();
    } catch (err: any) {
      showNotification("error", "Failed to update PDF sequence: " + err.message);
    }
  };

  // Class Actions
  const handleOpenAddClass = (courseId: CourseId) => {
    setSelectedCourseId(courseId);
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (courseId: CourseId, cls: CourseClass) => {
    setSelectedCourseId(courseId);
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (formData: {
    courseId: CourseId;
    id?: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order?: number;
    isPublished?: boolean;
    resourceLink?: string;
  }) => {
    if (formData.id) {
      await updateCourseClassApi(formData.courseId, formData.id, formData);
      showNotification("success", "Video class updated successfully.");
    } else {
      await createCourseClassApi(formData.courseId, formData);
      showNotification("success", "New video class added to album.");
    }
    await loadCourseData();
  };

  const handleDeleteClass = async (courseId: CourseId, cls: CourseClass) => {
    if (window.confirm(`Are you sure you want to permanently delete "${cls.title}"?`)) {
      try {
        await deleteCourseClassApi(courseId, cls.id);
        showNotification("success", "Class deleted.");
        await loadCourseData();
      } catch (err: any) {
        showNotification("error", err.message || "Failed to delete class.");
      }
    }
  };

  const handleToggleClassPublish = async (courseId: CourseId, cls: CourseClass) => {
    const nextPublished = cls.isPublished === false;
    try {
      await updateCourseClassApi(courseId, cls.id, { isPublished: nextPublished });
      showNotification("success", nextPublished ? "Class published." : "Class hidden from students.");
      await loadCourseData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to toggle status.");
    }
  };

  const handleMoveClass = async (courseId: CourseId, classId: string, direction: "up" | "down") => {
    const list = courseId === "basic-to-advance" ? [...classesA] : [...classesB];
    const index = list.findIndex((c) => String(c.id) === String(classId));
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const orderedIds = list.map((c) => String(c.id));
    try {
      await reorderCourseClassesApi(courseId, orderedIds);
      showNotification("success", "Class sequence updated.");
      await loadCourseData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to reorder classes.");
    }
  };

  // Album Meta Actions
  const handleOpenEditAlbum = (courseId: CourseId) => {
    setSelectedCourseId(courseId);
    setIsAlbumMetaModalOpen(true);
  };

  const handleSaveAlbumMeta = async (courseId: CourseId, updated: Partial<CourseAlbumMeta>) => {
    await updateCourseAlbumMetaApi(courseId, updated);
    showNotification("success", "Course album details saved successfully.");
    await loadCourseData();
  };

  // Currently active album data
  const currentMeta = activeCategory === "basic-to-advance" ? courseMetaA : courseMetaB;
  const currentClasses = activeCategory === "basic-to-advance" ? classesA : classesB;
  const currentCourseId = activeCategory === "basic-to-advance" ? "basic-to-advance" : "cycle-blueprint";
  const publishedCount = (currentClasses || []).filter((c) => c.isPublished !== false).length;
  const draftCount = (currentClasses || []).length - publishedCount;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner / Notification */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-bold ${
            feedback.type === "success"
              ? "border-emerald-800 bg-emerald-950/40 text-emerald-200"
              : "border-rose-800 bg-rose-950/40 text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              Student Resource & Course Catalog
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Library Management
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-3xl">
            Manage your entire learning library: publish free strategy PDFs with Google Drive integration, or manage your paid video course albums with unlimited YouTube unlisted classes.
          </p>
        </div>

        {/* Global Action depending on active category */}
        {activeCategory === "free-pdfs" ? (
          <button
            onClick={onOpenAddEbookModal}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-sky-400 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus size={15} />
            <span>Add Free PDF</span>
          </button>
        ) : (
          <button
            onClick={() => handleOpenAddClass(currentCourseId)}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-sky-400 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus size={15} />
            <span>Add Class to Album</span>
          </button>
        )}
      </div>

      {/* Three Manageable Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveCategory("free-pdfs")}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
            activeCategory === "free-pdfs"
              ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
              : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <BookOpen size={16} />
          <span>1. Free PDFs</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeCategory === "free-pdfs"
                ? "bg-slate-950 text-sky-400"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {ebooks?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("basic-to-advance")}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
            activeCategory === "basic-to-advance"
              ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
              : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Video size={16} />
          <span>2. Basic to Advance — ৳2,499 BDT</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeCategory === "basic-to-advance"
                ? "bg-slate-950 text-sky-400"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {classesA.length} classes
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("cycle-blueprint")}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
            activeCategory === "cycle-blueprint"
              ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
              : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Sparkles size={16} />
          <span>3. Cycle Blueprint — ৳4,999 BDT</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeCategory === "cycle-blueprint"
                ? "bg-slate-950 text-sky-400"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {classesB.length} classes
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* CATEGORY 1: FREE PDFS */}
      {/* ==================================================================== */}
      {activeCategory === "free-pdfs" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search PDF title, category, or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-400 shrink-0">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">All Categories ({ebooks?.length || 0})</option>
                {categories.map((c) => (
                  <option key={String(c)} value={String(c)}>
                    {String(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PDF Items List */}
          {filteredEbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#070e1b]/40 p-12 text-center">
              <BookOpen size={36} className="text-slate-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-300">No PDF eBooks Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Add your first Google Drive PDF or strategy guide using the "Add Free PDF" button above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEbooks.map((eb: any, idx: number) => {
                const drivePreview = eb.fileUrl ? getGoogleDrivePreviewUrl(eb.fileUrl) : null;
                const driveDownload = eb.fileUrl ? getGoogleDriveDownloadUrl(eb.fileUrl) : null;
                const isDrive = eb.fileUrl && (eb.fileUrl.includes("drive.google.com") || eb.fileUrl.includes("docs.google.com"));

                return (
                  <div
                    key={eb.id || idx}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#070e1b] p-4 sm:p-5 transition hover:border-slate-700"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Sequence Badge & Reorder */}
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-black text-slate-300">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveEbook(eb.id, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveEbook(eb.id, "down")}
                            disabled={idx === filteredEbooks.length - 1}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Cover Thumbnail */}
                      {eb.coverImageUrl ? (
                        <img
                          src={eb.coverImageUrl}
                          alt={eb.titleEn}
                          className="size-16 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="flex size-16 items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 shrink-0">
                          <FileText size={24} />
                        </div>
                      )}

                      {/* Content Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-sky-400 border border-sky-500/20">
                            {eb.category || "STRATEGY GUIDE"}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                            {eb.pages || 15} pages
                          </span>
                          {isDrive && (
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                              Google Drive Verified
                            </span>
                          )}
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                              eb.isPublished !== false
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {eb.isPublished !== false ? "Published" : "Draft / Hidden"}
                          </span>
                        </div>

                        <h4 className="mt-1.5 text-sm font-black text-white truncate">
                          {eb.titleEn}
                        </h4>
                        {eb.titleBn && (
                          <div className="text-xs text-slate-400 truncate">{eb.titleBn}</div>
                        )}
                        <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                          {eb.subtitleEn || eb.subtitleBn || "No description provided."}
                        </p>

                        {/* Link preview & test */}
                        {eb.fileUrl && (
                          <div className="mt-2 flex items-center gap-3 text-[11px]">
                            {drivePreview ? (
                              <a
                                href={drivePreview}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-bold text-sky-400 hover:underline"
                              >
                                <ExternalLink size={12} />
                                <span>Preview PDF</span>
                              </a>
                            ) : (
                              <a
                                href={eb.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-bold text-sky-400 hover:underline"
                              >
                                <ExternalLink size={12} />
                                <span>Open Direct Link</span>
                              </a>
                            )}

                            {driveDownload && (
                              <a
                                href={driveDownload}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-bold text-emerald-400 hover:underline"
                              >
                                <Download size={12} />
                                <span>Download PDF</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0 w-full md:w-auto justify-end">
                      {/* Publish / Unpublish Toggle */}
                      <button
                        type="button"
                        onClick={() => onTogglePublishEbook(eb.id, eb.isPublished !== false)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                          eb.isPublished !== false
                            ? "border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                        title={eb.isPublished !== false ? "Click to Unpublish" : "Click to Publish"}
                      >
                        {eb.isPublished !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{eb.isPublished !== false ? "Published" : "Draft"}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onOpenEditEbookModal(eb)}
                        className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDeleteEbook(eb.id)}
                        className="flex size-8 items-center justify-center rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                        title="Delete PDF"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* CATEGORY 2 & 3: PAID COURSE ALBUMS */}
      {/* ==================================================================== */}
      {(activeCategory === "basic-to-advance" || activeCategory === "cycle-blueprint") && (
        <div className="space-y-6">
          {/* Album Overview & Settings Card */}
          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-800 bg-gradient-to-br from-[#070e1b] to-slate-950 p-6 sm:p-8 sm:flex-row sm:items-center">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-sky-400 border border-sky-500/20">
                  Bundle ID {currentMeta?.bundleId || (currentCourseId === "basic-to-advance" ? 2 : 4)}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                  ৳{currentMeta?.priceBdt || (currentCourseId === "basic-to-advance" ? "2,499" : "4,999")} BDT
                </span>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-400 border border-amber-500/20">
                  YouTube Unlisted Gated
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${
                    currentMeta?.isPublished !== false
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {currentMeta?.isPublished !== false ? "Visible in Student Store & Library" : "Hidden"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {currentMeta?.title || (currentCourseId === "basic-to-advance" ? "Basic to Advance Course" : "Cycle Blueprint")}
              </h2>
              {currentMeta?.titleBn && (
                <div className="text-xs text-slate-400 font-semibold">{currentMeta.titleBn}</div>
              )}

              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {currentMeta?.description || "Manage video curriculum, unlisted video lessons, and order sequences."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
              <Button
                onClick={() => handleOpenEditAlbum(currentCourseId)}
                variant="outline"
                className="gap-2 border-slate-700 bg-slate-900 font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Settings size={15} />
                <span>Edit Album Details</span>
              </Button>

              <Button
                onClick={() => handleOpenAddClass(currentCourseId)}
                className="gap-2 bg-sky-500 font-bold text-slate-950 hover:bg-sky-400 shadow-md"
              >
                <Plus size={15} />
                <span>Add Class</span>
              </Button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Classes</div>
              <div className="mt-1 text-2xl font-black text-white">
                {currentClasses.length}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Published (Student View)</div>
              <div className="mt-1 text-2xl font-black text-emerald-300">
                {publishedCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Draft / Hidden</div>
              <div className="mt-1 text-2xl font-black text-slate-300">
                {draftCount}
              </div>
            </div>
            <div className="rounded-2xl border border-sky-900/40 bg-sky-950/20 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Gating Security</div>
              <div className="mt-1 text-sm font-black text-sky-200">
                Payment Approval Locked
              </div>
            </div>
          </div>

          {/* Classes Table / List */}
          <div className="rounded-2xl border border-slate-800 bg-[#070e1b] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:px-6">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-sky-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Course Classes ({currentClasses.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Drag or use arrows to change playback sequence
              </span>
            </div>

            {loadingCourses ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading course curriculum...</div>
            ) : currentClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Video size={36} className="text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-slate-300">No Classes Added Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Click "Add Class" to insert your first unlisted video lesson into this album.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {currentClasses.map((cls, idx) => {
                  const videoId = cls.videoUrl ? extractYouTubeVideoId(cls.videoUrl) : null;
                  const thumb = cls.videoUrl ? getYouTubeThumbnailUrl(cls.videoUrl) : null;
                  const embed = cls.videoUrl ? getYouTubeEmbedUrl(cls.videoUrl) : null;

                  return (
                    <div
                      key={cls.id || idx}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 transition hover:bg-slate-900/40"
                    >
                      {/* Left: Sequence & Thumbnail & Info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Sequence and Order Reordering */}
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-black text-slate-300">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveClass(currentCourseId, cls.id, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Move Class Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveClass(currentCourseId, cls.id, "down")}
                              disabled={idx === currentClasses.length - 1}
                              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Move Class Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>

                        {/* YouTube Thumbnail with click-to-preview */}
                        <div
                          onClick={() => setPreviewingClass(cls)}
                          className="group relative size-20 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-black border border-slate-800 shrink-0 cursor-pointer"
                          title="Click to preview video lesson"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={cls.title}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">
                              <Video size={20} />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                            <Play size={20} className="text-white fill-white" />
                          </div>
                        </div>

                        {/* Class Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                              Order #{cls.order || idx + 1}
                            </span>
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={10} />
                              {cls.duration || "45 min"}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                cls.isPublished !== false
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {cls.isPublished !== false ? "Published" : "Draft / Hidden"}
                            </span>
                          </div>

                          <h4 className="mt-1.5 text-sm font-black text-white truncate">
                            {cls.title}
                          </h4>
                          <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                            {cls.description || "No description provided."}
                          </p>

                          {/* Video and Resource Links */}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                            {cls.videoUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewingClass(cls)}
                                className="flex items-center gap-1 font-bold text-sky-400 hover:underline cursor-pointer"
                              >
                                <Play size={11} className="fill-sky-400" />
                                <span>Preview Video ({videoId || "YouTube"})</span>
                              </button>
                            )}

                            {cls.resourceLink && (
                              <a
                                href={cls.resourceLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-bold text-emerald-400 hover:underline"
                              >
                                <Link2 size={11} />
                                <span>Study Resource</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0 w-full md:w-auto justify-end">
                        {/* Publish Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleClassPublish(currentCourseId, cls)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            cls.isPublished !== false
                              ? "border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60"
                              : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                          title={cls.isPublished !== false ? "Click to Hide" : "Click to Publish"}
                        >
                          {cls.isPublished !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{cls.isPublished !== false ? "Published" : "Draft"}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditClass(currentCourseId, cls)}
                          className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(currentCourseId, cls)}
                          className="flex size-8 items-center justify-center rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Class Modal (Add / Edit) */}
      <CourseClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        courseId={selectedCourseId}
        courseTitle={
          selectedCourseId === "basic-to-advance"
            ? "Basic to Advance Course (৳2,499)"
            : "Cycle Blueprint (৳4,999)"
        }
        editingClass={editingClass}
        onSave={handleSaveClass}
      />

      {/* Album Meta Modal (Edit Details) */}
      <CourseAlbumMetaModal
        isOpen={isAlbumMetaModalOpen}
        onClose={() => setIsAlbumMetaModalOpen(false)}
        courseId={selectedCourseId}
        meta={selectedCourseId === "basic-to-advance" ? courseMetaA : courseMetaB}
        onSave={handleSaveAlbumMeta}
      />

      {/* Video Preview Modal */}
      {previewingClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewingClass(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-[#08101e] shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-sky-400 fill-sky-400" />
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {previewingClass.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewingClass(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {previewingClass.videoUrl && getYouTubeEmbedUrl(previewingClass.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewingClass.videoUrl)!}
                  title={previewingClass.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  Video preview unavailable
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
