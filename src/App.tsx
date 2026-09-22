import React, { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { DashboardOverview } from "./pages/DashboardOverview";
import { PaymentApprovals } from "./pages/PaymentApprovals";
import { StudentManagement } from "./pages/StudentManagement";
import { SupportTickets } from "./pages/SupportTickets";
import { PlatformSettings } from "./pages/PlatformSettings";
import { AuditLogs } from "./pages/AuditLogs";
import { EbookManagement } from "./pages/EbookManagement";
import { OwnerProfileCMS, OwnerProfileData } from "./pages/OwnerProfileCMS";
import { EbookModal, EbookFormData } from "./modals/EbookModal";
import { DeleteEbookModal } from "./modals/DeleteEbookModal";
import { Order, Student, SupportTicket, AuditEvent } from "./lib/types";
import {
  fetchAdminOrders,
  fetchAdminUsers,
  fetchAdminTickets,
  fetchAdminAuditLogs,
  fetchAdminEbooks,
  fetchOwnerProfileApi,
  approveOrderApi,
  rejectOrderApi,
  deleteOrderApi,
  grantAccessApi,
  updateRoleApi,
  updateTicketStatusApi,
  createEbookApi,
  updateEbookApi,
  deleteEbookApi,
  updateOwnerProfileApi,
  uploadPdfToFreeStorage,
  PaymentSettingsConfig,
  defaultPaymentConfig,
  fetchPaymentSettingsApi,
  updatePaymentSettingsApi,
} from "./lib/api";
import { RefreshCw, CheckCircle2, X } from "lucide-react";

const initialOwnerProfile: OwnerProfileData = {
  isVisible: true,
  name: "Al-Amin Islam",
  role: "Founder & Lead Institutional Analyst",
  roleBn: "প্রতিষ্ঠাতা ও প্রধান ইন্সটিটিউশনাল অ্যানালিস্ট",
  bioEn: "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution.",
  bioBn: "ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট। আবেগতাড়িত অনুমান দূর করে স্ট্রাকচার্ড আন্ডারস্ট্যান্ডিং, সিস্টেমেটিক অ্যানালাইসিস এবং সুশৃঙ্খল এক্সিকিউশন তৈরিতে প্রতিশ্রুতিবদ্ধ।",
  detailsEn: "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.",
  detailsBn: "",
  photoUrl: "/logo.jpg",
  experienceYears: "6+ Years",
  studentsCount: "1,500+",
  tradingStyle: "Institutional Order Flow, Liquidity & (SMC)",
  signatureQuoteEn: "Before you trade, understand trading. Before you deposit, understand trading.",
  signatureQuoteBn: "ট্রেড করার আগে ট্রেডিং বুঝুন। ডিপোজিট করার আগে ট্রেডিং বুঝুন।",
  telegram: "https://t.me/cycleofchart",
  youtube: "https://youtube.com/@cycleofchart",
  facebook: "https://facebook.com/cycleofchart",
  twitter: "",
  email: "contact@cycleofchart.com",
  showExperienceCard: false,
  experienceLabel: "Market Experience",
  experienceIcon: "clock",
  showMentoredCard: false,
  mentoredLabel: "Traders Mentored",
  mentoredIcon: "users",
  showMethodologyCard: true,
  methodologyLabel: "Core Methodology",
  methodologyIcon: "award",
  showDetailsParagraph: false,
};

const initialEbookForm: EbookFormData = {
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfileData>(initialOwnerProfile);
  const [paymentConfig, setPaymentConfig] = useState<PaymentSettingsConfig>(defaultPaymentConfig);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Ebook Modal States
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<any | null>(null);
  const [ebookForm, setEbookForm] = useState<EbookFormData>(initialEbookForm);
  const [isSavingEbook, setIsSavingEbook] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [deleteConfirmEbookId, setDeleteConfirmEbookId] = useState<number | null>(null);
  const [isDeletingEbook, setIsDeletingEbook] = useState(false);

  // Owner Profile Saving State
  const [isSavingOwner, setIsSavingOwner] = useState(false);

  const loadLiveData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, usersData, ticketsData, logsData, ebooksData, ownerData, paymentData] = await Promise.allSettled([
        fetchAdminOrders(),
        fetchAdminUsers(),
        fetchAdminTickets(),
        fetchAdminAuditLogs(),
        fetchAdminEbooks(),
        fetchOwnerProfileApi(),
        fetchPaymentSettingsApi(),
      ]);

      if (ordersData.status === "fulfilled") setOrders(ordersData.value);
      if (usersData.status === "fulfilled") setStudents(usersData.value);
      if (ticketsData.status === "fulfilled") setTickets(ticketsData.value);
      if (logsData.status === "fulfilled") setLogs(logsData.value);
      if (ebooksData.status === "fulfilled") setEbooks(ebooksData.value);
      if (ownerData.status === "fulfilled" && ownerData.value) {
        setOwnerProfile((prev) => ({ ...prev, ...ownerData.value }));
      }
      if (paymentData.status === "fulfilled" && paymentData.value) {
        setPaymentConfig(paymentData.value);
      }
    } catch (err: any) {
      console.warn("[Admin API load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  // Live Database Mutations
  const handleApproveOrder = async (orderId: number) => {
    try {
      await approveOrderApi(orderId);
      setActionSuccess(`Order #${orderId} approved and entitlement granted in DB.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to approve order: " + err.message);
    }
  };

  
  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${orderId} from the database?`)) {
      return;
    }
    try {
      await deleteOrderApi(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      alert(`Order #${orderId} has been successfully deleted from the database.`);
    } catch (err: any) {
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  const handleRejectOrder = async (orderId: number, reason: string) => {
    try {
      await rejectOrderApi(orderId, reason);
      setActionSuccess(`Order #${orderId} rejected.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to reject order: " + err.message);
    }
  };

  const handleGrantAccess = async (studentId: number, bundleId: number) => {
    try {
      await grantAccessApi(studentId, bundleId);
      setActionSuccess("Access granted to student in DB.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to grant access: " + err.message);
    }
  };

  const handleUpdateRole = async (studentId: number, role: "user" | "support" | "admin") => {
    try {
      await updateRoleApi(studentId, role);
      setActionSuccess("User role updated in DB.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, status: "open" | "in_progress" | "resolved") => {
    try {
      await updateTicketStatusApi(ticketId, status);
      setActionSuccess("Support ticket status updated in DB.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to update ticket: " + err.message);
    }
  };

  // Ebook Operations
  const handleOpenAddEbook = () => {
    setEditingEbook(null);
    setEbookForm(initialEbookForm);
    setIsEbookModalOpen(true);
  };

  const handleOpenEditEbook = (ebook: any) => {
    setEditingEbook(ebook);
    setEbookForm({
      titleEn: ebook.titleEn || "",
      titleBn: ebook.titleBn || "",
      subtitleEn: ebook.subtitleEn || "",
      subtitleBn: ebook.subtitleBn || "",
      category: ebook.category || "CHART ANALYSIS",
      pages: ebook.pages || 15,
      keyConceptsText: Array.isArray(ebook.keyConcepts) ? ebook.keyConcepts.join("\n") : (ebook.keyConcepts || ""),
      fileUrl: ebook.fileUrl || null,
      fileName: ebook.fileName || null,
      fileSize: ebook.fileSize || null,
      isPublished: ebook.isPublished !== false,
      isFree: ebook.isFree !== undefined ? ebook.isFree : (Number(ebook.price) === 0 || !ebook.price),
      price: ebook.price ? String(ebook.price) : "0",
      coverImageUrl: ebook.coverImageUrl || null,
    });
    setIsEbookModalOpen(true);
  };

  const handleTogglePublishEbook = async (id: number, currentPublished: boolean) => {
    try {
      await updateEbookApi(id, { isPublished: !currentPublished });
      setActionSuccess(`eBook ${!currentPublished ? "published" : "unpublished"} successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      const updated = await fetchAdminEbooks();
      setEbooks(updated);
    } catch (err: any) {
      alert("Failed to update publish status: " + err.message);
    }
  };

  const handleSaveEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingEbook(true);
      const keyConcepts = ebookForm.keyConceptsText
        .split("\n")
        .map((k) => k.trim())
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
        await updateEbookApi(editingEbook.id, payload);
        setActionSuccess("Free eBook updated successfully!");
      } else {
        await createEbookApi(payload);
        setActionSuccess("New Free eBook created successfully!");
      }
      setTimeout(() => setActionSuccess(null), 4000);
      setIsEbookModalOpen(false);
      const updated = await fetchAdminEbooks();
      setEbooks(updated);
    } catch (err: any) {
      alert("Failed to save eBook: " + err.message);
    } finally {
      setIsSavingEbook(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a valid PDF file (.pdf)");
      return;
    }
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    try {
      setIsUploadingPdf(true);
      const cdnUrl = await uploadPdfToFreeStorage(file);
      setEbookForm((prev) => ({
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
  };

  const handleDeleteEbookConfirm = async (id: number) => {
    try {
      setIsDeletingEbook(true);
      await deleteEbookApi(id);
      setActionSuccess("Free eBook deleted successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
      setDeleteConfirmEbookId(null);
      const updated = await fetchAdminEbooks();
      setEbooks(updated);
    } catch (err: any) {
      alert("Failed to delete eBook: " + err.message);
    } finally {
      setIsDeletingEbook(false);
    }
  };

  // Owner Profile Operation
  const handleSaveOwnerProfile = async (data: OwnerProfileData) => {
    try {
      setIsSavingOwner(true);
      const updated = await updateOwnerProfileApi(data);
      setOwnerProfile(updated || data);
      setActionSuccess("Owner profile updated! Public site live preview reflects changes.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert("Failed to save owner profile: " + err.message);
    } finally {
      setIsSavingOwner(false);
    }
  };

  // Payment Settings Operation
  const handleSavePaymentSettings = async (data: PaymentSettingsConfig) => {
    try {
      setIsSavingPayment(true);
      const updated = await updatePaymentSettingsApi(data);
      setPaymentConfig(updated || data);
      setActionSuccess("Payment gateway settings updated and synchronized with Supabase database!");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert("Failed to save payment settings: " + err.message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "pending").length;
  const openTicketsCount = tickets.filter((t) => t.status === "open").length;

  const tabTitles: Record<string, string> = {
    overview: "Executive Performance Overview",
    orders: "Payment Verification Queue",
    students: "Student & Access Management",
    ebooks: "Free eBooks & PDF Library CMS",
    owner: "Owner & Founder Profile CMS",
    support: "Student Support Desk",
    settings: "Gateway & Platform Settings",
    audit: "Security & Audit Event Trail",
  };

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        openTicketsCount={openTicketsCount}
      />

      <div className="lg:pl-64 flex min-h-screen flex-col">
        <AdminHeader
          currentTabTitle={tabTitles[activeTab] || "Operations Console"}
          pendingCount={pendingOrdersCount}
        />

        {/* Global Live Status & Control Bar */}
        <div className="mx-auto flex max-w-7xl w-full items-center justify-between px-6 pt-4 pb-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Live Database Connected</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400 font-medium">Standalone Operations Console</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLiveData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <RefreshCw size={12} className={loading ? "animate-spin text-sky-400" : ""} />
              <span>{loading ? "Refreshing..." : "Refresh DB"}</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400">
              <X size={15} />
            </button>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <DashboardOverview orders={orders} students={students} onNavigateTab={setActiveTab} />
          )}
          {activeTab === "orders" && (
            <PaymentApprovals orders={orders} onApprove={handleApproveOrder} onReject={handleRejectOrder} onDelete={handleDeleteOrder} />
          )}
          {activeTab === "students" && (
            <StudentManagement
              students={students}
              onGrantAccess={handleGrantAccess}
              onUpdateRole={handleUpdateRole}
            />
          )}
          {activeTab === "ebooks" && (
            <EbookManagement
              ebooks={ebooks}
              onOpenAddModal={handleOpenAddEbook}
              onOpenEditModal={handleOpenEditEbook}
              onTogglePublish={handleTogglePublishEbook}
              onDeleteEbook={(id) => setDeleteConfirmEbookId(id)}
            />
          )}
          {activeTab === "owner" && (
            <OwnerProfileCMS
              profile={ownerProfile}
              onSave={handleSaveOwnerProfile}
              onReload={loadLiveData}
              isSaving={isSavingOwner}
            />
          )}
          {activeTab === "support" && (
            <SupportTickets tickets={tickets} onUpdateStatus={handleUpdateTicketStatus} />
          )}
          {activeTab === "settings" && (
            <PlatformSettings
              config={paymentConfig}
              onSave={handleSavePaymentSettings}
              onReload={loadLiveData}
              isSaving={isSavingPayment}
            />
          )}
          {activeTab === "audit" && <AuditLogs logs={logs} />}
        </main>
      </div>

      {/* eBook Add / Edit Modal */}
      <EbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
        editingEbook={editingEbook}
        ebookForm={ebookForm}
        setEbookForm={setEbookForm}
        onSave={handleSaveEbook}
        onPdfUpload={handlePdfUpload}
        isSaving={isSavingEbook}
        isUploadingPdf={isUploadingPdf}
      />

      {/* eBook Delete Confirmation Modal */}
      <DeleteEbookModal
        ebookId={deleteConfirmEbookId}
        onClose={() => setDeleteConfirmEbookId(null)}
        onConfirmDelete={handleDeleteEbookConfirm}
        isPending={isDeletingEbook}
      />
    </div>
  );
};

export default App;
