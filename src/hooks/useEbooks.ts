import { useState, useEffect, useCallback, FormEvent, ChangeEvent, Dispatch, SetStateAction } from "react";
import { services } from "../services";
import { EbookFormData } from "../modals/EbookModal";

export const initialEbookForm: EbookFormData = {
  titleEn: "",
  titleBn: "",
  subtitleEn: "",
  subtitleBn: "",
  category: "CHART ANALYSIS",
  pages: 15,
  keyConceptsText: "",
  fileUrl: null,
  fileName: null,
  fileSize: null,
  isPublished: true,
  isFree: true,
  price: "0",
  coverImageUrl: null,
};

export interface UseEbooksReturn {
  ebooks: any[];
  loading: boolean;
  reload: () => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingEbook: any | null;
  ebookForm: EbookFormData;
  setEbookForm: Dispatch<SetStateAction<EbookFormData>>;
  isSaving: boolean;
  isUploadingPdf: boolean;
  deleteConfirmId: number | null;
  setDeleteConfirmId: (id: number | null) => void;
  isDeleting: boolean;
  openAddModal: () => void;
  openEditModal: (ebook: any) => void;
  handleTogglePublish: (id: number, currentPublished: boolean) => Promise<void>;
  handleSaveEbook: (e: FormEvent) => Promise<void>;
  handlePdfUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleConfirmDelete: (id: number) => Promise<void>;
  actionMessage: string | null;
  clearActionMessage: () => void;
}

export function useEbooks(): UseEbooksReturn {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<any | null>(null);
  const [ebookForm, setEbookForm] = useState<EbookFormData>(initialEbookForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.ebooks.fetchEbooks();
      setEbooks(data);
    } catch (err: any) {
      console.warn("[useEbooks load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const openAddModal = useCallback(() => {
    setEditingEbook(null);
    setEbookForm(initialEbookForm);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((ebook: any) => {
    setEditingEbook(ebook);
    setEbookForm({
      titleEn: ebook.titleEn || "",
      titleBn: ebook.titleBn || "",
      subtitleEn: ebook.subtitleEn || "",
      subtitleBn: ebook.subtitleBn || "",
      category: ebook.category || "CHART ANALYSIS",
      pages: ebook.pages || 15,
      keyConceptsText: Array.isArray(ebook.keyConcepts)
        ? ebook.keyConcepts.join("\n")
        : (ebook.keyConcepts || ""),
      fileUrl: ebook.fileUrl || null,
      fileName: ebook.fileName || null,
      fileSize: ebook.fileSize || null,
      isPublished: ebook.isPublished !== false,
      isFree: ebook.isFree !== undefined ? ebook.isFree : (Number(ebook.price) === 0 || !ebook.price),
      price: ebook.price ? String(ebook.price) : "0",
      coverImageUrl: ebook.coverImageUrl || null,
    });
    setIsModalOpen(true);
  }, []);

  const handleTogglePublish = useCallback(
    async (id: number, currentPublished: boolean) => {
      try {
        await services.ebooks.updateEbook(id, { isPublished: !currentPublished });
        setActionMessage(`eBook ${!currentPublished ? "published" : "unpublished"} successfully.`);
        setTimeout(() => setActionMessage(null), 4000);
        await reload();
      } catch (err: any) {
        alert("Failed to update publish status: " + err.message);
      }
    },
    [reload]
  );

  const handleSaveEbook = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      try {
        setIsSaving(true);
        const keyConcepts = ebookForm.keyConceptsText
          .split("\n")
          .map((k: string) => k.trim())
          .filter(Boolean);

        const payload = {
          titleEn: ebookForm.titleEn.trim(),
          titleBn: ebookForm.titleBn.trim() || undefined,
          subtitleEn: ebookForm.subtitleEn.trim(),
          subtitleBn: ebookForm.subtitleBn.trim() || undefined,
          category: ebookForm.category.trim(),
          pages: Number(ebookForm.pages) || 15,
          keyConcepts: keyConcepts.length ? keyConcepts : undefined,
          fileUrl: ebookForm.fileUrl,
          fileName: ebookForm.fileName,
          fileSize: ebookForm.fileSize,
          isPublished: ebookForm.isPublished,
          isFree: ebookForm.isFree,
          price: ebookForm.isFree ? "0" : (ebookForm.price || "299"),
          coverImageUrl: ebookForm.coverImageUrl || undefined,
        };

        if (editingEbook) {
          await services.ebooks.updateEbook(editingEbook.id, payload);
          setActionMessage("Free eBook updated successfully!");
        } else {
          await services.ebooks.createEbook(payload);
          setActionMessage("New Free eBook created successfully!");
        }
        setTimeout(() => setActionMessage(null), 4000);
        setIsModalOpen(false);
        await reload();
      } catch (err: any) {
        alert("Failed to save eBook: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [ebookForm, editingEbook, reload]
  );

  const handlePdfUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        alert("Please upload a valid PDF file (.pdf)");
        return;
      }
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      try {
        setIsUploadingPdf(true);
        const cdnUrl = await services.ebooks.uploadPdf(file);
        setEbookForm((prev: EbookFormData) => ({
          ...prev,
          fileUrl: cdnUrl,
          fileName: file.name,
          fileSize: sizeInMb,
        }));
      } catch (err: any) {
        alert("Failed to upload PDF: " + (err.message || err));
      } finally {
        setIsUploadingPdf(false);
        e.target.value = "";
      }
    },
    []
  );

  const handleConfirmDelete = useCallback(
    async (id: number) => {
      try {
        setIsDeleting(true);
        await services.ebooks.deleteEbook(id);
        setActionMessage("Free eBook deleted successfully!");
        setTimeout(() => setActionMessage(null), 4000);
        setDeleteConfirmId(null);
        await reload();
      } catch (err: any) {
        alert("Failed to delete eBook: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    },
    [reload]
  );

  return {
    ebooks,
    loading,
    reload,
    isModalOpen,
    setIsModalOpen,
    editingEbook,
    ebookForm,
    setEbookForm,
    isSaving,
    isUploadingPdf,
    deleteConfirmId,
    setDeleteConfirmId,
    isDeleting,
    openAddModal,
    openEditModal,
    handleTogglePublish,
    handleSaveEbook,
    handlePdfUpload,
    handleConfirmDelete,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
  };
}
