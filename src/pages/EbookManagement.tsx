import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Paperclip,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";

interface EbookManagementProps {
  ebooks: any[];
  onOpenAddModal: () => void;
  onOpenEditModal: (ebook: any) => void;
  onTogglePublish: (id: number, currentPublished: boolean) => void;
  onDeleteEbook: (id: number) => void;
}

export const EbookManagement: React.FC<EbookManagementProps> = ({
  ebooks,
  onOpenAddModal,
  onOpenEditModal,
  onTogglePublish,
  onDeleteEbook,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = (ebooks || []).filter((eb: any) => {
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

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Free eBooks & PDF Library CMS
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Publish institutional strategy guides, upload custom PDFs, or auto-generate materials for students.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-sky-400 transition"
        >
          <Plus size={15} />
          <span>Add New Free eBook</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, topic, or concept..."
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
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-500"
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

      {/* eBooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((eb: any) => (
          <div
            key={eb.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#070e1b] p-5 shadow-sm hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-lg bg-sky-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-sky-400 border border-sky-500/20">
                    {eb.category || "General"}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase border ${
                      eb.isFree !== false && (Number(eb.price) === 0 || !eb.price)
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {eb.isFree !== false && (Number(eb.price) === 0 || !eb.price)
                      ? "FREE"
                      : `PAID · ৳${eb.price}`}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    eb.isPublished !== false
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {eb.isPublished !== false ? "Live / Published" : "Draft (Hidden)"}
                </span>
              </div>

              <h3 className="mt-3 text-base font-extrabold text-white leading-snug">
                {eb.titleEn}
              </h3>
              {eb.titleBn && (
                <div className="mt-0.5 text-xs font-semibold text-slate-400">
                  {eb.titleBn}
                </div>
              )}

              <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                {eb.subtitleEn || eb.subtitleBn}
              </p>

              <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen size={12} className="text-sky-400" />
                  {eb.pages || 15} Pages
                </span>
                {eb.fileUrl ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Paperclip size={12} />
                    Custom PDF
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sky-400 font-bold">
                    <Sparkles size={12} />
                    Dynamic Engine
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3.5">
              <button
                onClick={() => onTogglePublish(eb.id, eb.isPublished !== false)}
                className={`flex items-center gap-1 text-xs font-bold transition ${
                  eb.isPublished !== false
                    ? "text-slate-400 hover:text-amber-400"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                {eb.isPublished !== false ? (
                  <>
                    <EyeOff size={13} />
                    <span>Unpublish</span>
                  </>
                ) : (
                  <>
                    <Eye size={13} />
                    <span>Publish</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEditModal(eb)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 hover:text-white transition"
                >
                  <Edit size={12} className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDeleteEbook(eb.id)}
                  className="rounded-lg border border-rose-900/50 bg-rose-950/30 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-900/50 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-12 text-center text-slate-500">
          <BookOpen size={36} className="mx-auto mb-2 text-slate-600" />
          <p className="font-bold">No eBooks found</p>
          <p className="text-xs text-slate-600 mt-1">Try changing your search query or add a new eBook.</p>
        </div>
      )}
    </div>
  );
};
