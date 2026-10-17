import React, { useState, useEffect } from "react";
import {
  Video,
  X,
  Play,
  Save,
  Clock,
  Layers,
  FileText,
  Link2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "../lib/mediaLinks";
import type { CourseClass, CourseId } from "../lib/types";

interface CourseClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: CourseId;
  courseTitle: string;
  editingClass: CourseClass | null;
  onSave: (formData: {
    courseId: CourseId;
    id?: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order?: number;
    isPublished?: boolean;
    resourceLink?: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

export const CourseClassModal: React.FC<CourseClassModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  editingClass,
  onSave,
  isSaving = false,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("45 min");
  const [order, setOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState(true);
  const [resourceLink, setResourceLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingClass) {
      setTitle(editingClass.title || "");
      setDescription(editingClass.description || "");
      setVideoUrl(editingClass.videoUrl || "");
      setDuration(editingClass.duration || "45 min");
      setOrder(editingClass.order || 1);
      setIsPublished(editingClass.isPublished !== false);
      setResourceLink(editingClass.resourceLink || "");
    } else {
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setDuration("45 min");
      setOrder(1);
      setIsPublished(true);
      setResourceLink("");
    }
    setError(null);
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  const videoId = extractYouTubeVideoId(videoUrl);
  const previewThumbnail = getYouTubeThumbnailUrl(videoUrl);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Class title is required.");
      return;
    }

    if (!videoUrl.trim()) {
      setError("YouTube Unlisted Video URL is required.");
      return;
    }

    if (!videoId) {
      setError("Please provide a valid YouTube URL (e.g., https://youtu.be/... or https://www.youtube.com/watch?v=...)");
      return;
    }

    try {
      await onSave({
        courseId,
        id: editingClass?.id,
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        duration: duration.trim() || "45 min",
        order: Number(order) || 1,
        isPublished,
        resourceLink: resourceLink.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save class");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-[#08101e] p-6 sm:p-8 shadow-2xl text-slate-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Video size={20} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                {editingClass ? "Edit Video Class" : "Add New Video Class"}
              </h3>
              <p className="text-xs text-sky-400 font-bold">{courseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-800/80 bg-rose-950/40 p-3 text-xs font-bold text-rose-300">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* Class Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300">
              Class Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Class 01: Foundations of Institutional Order Flow & Market Anatomy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          {/* YouTube Video URL */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                YouTube Unlisted Video URL *
              </label>
              <span className="text-[11px] font-semibold text-sky-400">
                Gated to purchased students only
              </span>
            </div>
            <div className="relative mt-1.5">
              <input
                type="url"
                required
                placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 pl-9 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-sky-500 font-mono"
              />
              <Video
                size={16}
                className="absolute left-3 top-3.5 text-slate-500"
              />
            </div>
          </div>

          {/* Video Preview */}
          {videoId ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Play size={13} /> Valid YouTube Video Detected (ID: {videoId})
                </span>
                {embedUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sky-400 hover:underline"
                  >
                    <span>Open link</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-slate-800">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="YouTube video player preview"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  previewThumbnail && (
                    <img
                      src={previewThumbnail}
                      alt="YouTube video preview thumbnail"
                      className="h-full w-full object-cover"
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            videoUrl.trim() && (
              <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-2.5 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>Could not detect video ID from URL. Please check formatting.</span>
              </div>
            )
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300">
              Class Description / Topics Covered
            </label>
            <textarea
              rows={3}
              placeholder="Outline the core concepts, trading setups, and practical exercises covered in this class..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          {/* Two Columns: Duration & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300">
                Duration (e.g. 45 min)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  placeholder="45 min"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 pl-8 text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                />
                <Clock
                  size={14}
                  className="absolute left-2.5 top-3 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                Display Order Sequence #
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 pl-8 text-xs font-bold text-white outline-none focus:border-sky-500"
                />
                <Layers
                  size={14}
                  className="absolute left-2.5 top-3 text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Study Resource Link */}
          <div>
            <label className="block text-xs font-bold text-slate-300">
              Optional Study Resource / Google Drive Link
            </label>
            <div className="relative mt-1.5">
              <input
                type="url"
                placeholder="https://drive.google.com/... (optional companion PDF or notes)"
                value={resourceLink}
                onChange={(e) => setResourceLink(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 pl-8 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-sky-500 font-mono"
              />
              <Link2
                size={14}
                className="absolute left-2.5 top-3 text-slate-500"
              />
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <input
              type="checkbox"
              id="courseClassPublishToggle"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
            />
            <label
              htmlFor="courseClassPublishToggle"
              className="text-xs font-bold text-slate-200 cursor-pointer select-none"
            >
              Publish Class Immediately (Visible to enrolled students)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-slate-800 bg-slate-900 font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-sky-500 font-bold text-slate-950 hover:bg-sky-400 shadow-md"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving..." : editingClass ? "Save Changes" : "Create Class"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
