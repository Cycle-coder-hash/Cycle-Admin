import React, { useState, useCallback, useMemo } from "react";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { DashboardOverview } from "./pages/DashboardOverview";
import { PaymentApprovals } from "./pages/PaymentApprovals";
import { StudentManagement } from "./pages/StudentManagement";
import { UserManagement } from "./pages/UserManagement";
import { SupportMessages } from "./pages/SupportMessages";
import { PlatformSettings } from "./pages/PlatformSettings";
import { AuditLogs } from "./pages/AuditLogs";
import { EbookManagement } from "./pages/EbookManagement";
import { LibraryManagement } from "./pages/LibraryManagement";
import { OwnerProfileCMS } from "./pages/OwnerProfileCMS";
import { LeaderboardSettings } from "./pages/LeaderboardSettings";
import { EbookModal } from "./modals/EbookModal";
import { DeleteEbookModal } from "./modals/DeleteEbookModal";
import {
  useOrders,
  useStudents,
  useEbooks,
  useSupportConversations,
  usePlatformSettings,
  useOwnerProfile,
} from "./hooks";
import { RefreshCw, CheckCircle2, X } from "lucide-react";

const tabTitles: Record<string, string> = {
  overview: "Executive Performance Overview",
  orders: "Payment Verification Queue",
  users: "User Management & Access Control",
  students: "Student & Access Management",
  library: "Library & Course Management CMS",
  ebooks: "Free eBooks & PDF Library CMS",
  owner: "Owner & Founder Profile CMS",
  support: "Customer Support Messages",
  settings: "Gateway & Platform Settings",
  leaderboard: "Global Leaderboard Scoring Matrix",
  audit: "Security & Audit Event Trail",
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Domain Custom Hooks
  const {
    orders,
    loading: loadingOrders,
    pendingCount: pendingOrdersCount,
    reload: reloadOrders,
    approveOrder,
    rejectOrder,
    deleteOrder,
    actionMessage: orderMsg,
    clearActionMessage: clearOrderMsg,
  } = useOrders();

  const {
    students,
    loading: loadingStudents,
    reload: reloadStudents,
    grantAccess,
    updateRole,
    actionMessage: studentMsg,
    clearActionMessage: clearStudentMsg,
  } = useStudents();

  const {
    ebooks,
    loading: loadingEbooks,
    reload: reloadEbooks,
    isModalOpen: isEbookModalOpen,
    setIsModalOpen: setIsEbookModalOpen,
    editingEbook,
    ebookForm,
    setEbookForm,
    isSaving: isSavingEbook,
    isUploadingPdf,
    deleteConfirmId: deleteConfirmEbookId,
    setDeleteConfirmId: setDeleteConfirmEbookId,
    isDeleting: isDeletingEbook,
    openAddModal: handleOpenAddEbook,
    openEditModal: handleOpenEditEbook,
    handleTogglePublish: handleTogglePublishEbook,
    handleSaveEbook,
    handlePdfUpload,
    handleConfirmDelete: handleDeleteEbookConfirm,
    actionMessage: ebookMsg,
    clearActionMessage: clearEbookMsg,
  } = useEbooks();

  const {
    unreadMessagesCount,
    loading: loadingSupport,
    reload: reloadSupport,
  } = useSupportConversations();

  const {
    config: paymentConfig,
    logs,
    isSaving: isSavingPayment,
    loading: loadingSettings,
    saveSettings: handleSavePaymentSettings,
    reload: reloadSettings,
    actionMessage: settingsMsg,
    clearActionMessage: clearSettingsMsg,
  } = usePlatformSettings();

  const {
    profile: ownerProfile,
    isSaving: isSavingOwner,
    loading: loadingOwner,
    saveProfile: handleSaveOwnerProfile,
    reload: reloadOwner,
    actionMessage: ownerMsg,
    clearActionMessage: clearOwnerMsg,
  } = useOwnerProfile();

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cycle_admin_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("cycle_admin_sidebar_collapsed", String(next));
        } catch {}
        return next;
      });
    }
  }, []);

  const isLoadingAny = useMemo(
    () =>
      loadingOrders ||
      loadingStudents ||
      loadingEbooks ||
      loadingSupport ||
      loadingSettings ||
      loadingOwner,
    [loadingOrders, loadingStudents, loadingEbooks, loadingSupport, loadingSettings, loadingOwner]
  );

  const handleGlobalRefresh = useCallback(async () => {
    await Promise.allSettled([
      reloadOrders(),
      reloadStudents(),
      reloadEbooks(),
      reloadSupport(),
      reloadSettings(),
      reloadOwner(),
    ]);
  }, [reloadOrders, reloadStudents, reloadEbooks, reloadSupport, reloadSettings, reloadOwner]);

  const activeActionMessage =
    orderMsg || studentMsg || ebookMsg || settingsMsg || ownerMsg;

  const handleClearActionMessage = () => {
    clearOrderMsg();
    clearStudentMsg();
    clearEbookMsg();
    clearSettingsMsg();
    clearOwnerMsg();
  };

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        unreadMessagesCount={unreadMessagesCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <AdminHeader
          currentTabTitle={tabTitles[activeTab] || "Operations Console"}
          pendingCount={pendingOrdersCount}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Global Live Status Bar */}
        <div className="mx-auto flex max-w-7xl w-full items-center justify-between px-6 pt-4 pb-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Live Database Connected</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400 font-medium">Standalone Operations Console</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGlobalRefresh}
              disabled={isLoadingAny}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <RefreshCw size={12} className={isLoadingAny ? "animate-spin text-sky-400" : ""} />
              <span>{isLoadingAny ? "Refreshing..." : "Refresh DB"}</span>
            </button>
          </div>
        </div>

        {activeActionMessage && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{activeActionMessage}</span>
            </div>
            <button onClick={handleClearActionMessage} className="text-emerald-400">
              <X size={15} />
            </button>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <DashboardOverview orders={orders} students={students} onNavigateTab={setActiveTab} />
          )}
          {activeTab === "orders" && (
            <PaymentApprovals
              orders={orders}
              onApprove={approveOrder}
              onReject={rejectOrder}
              onDelete={deleteOrder}
            />
          )}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "students" && (
            <StudentManagement
              students={students}
              onGrantAccess={grantAccess}
              onUpdateRole={updateRole}
            />
          )}
          {activeTab === "library" && (
            <LibraryManagement
              ebooks={ebooks}
              onOpenAddEbookModal={handleOpenAddEbook}
              onOpenEditEbookModal={handleOpenEditEbook}
              onTogglePublishEbook={handleTogglePublishEbook}
              onDeleteEbook={(id) => setDeleteConfirmEbookId(id)}
              onReloadEbooks={reloadEbooks}
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
              onReload={reloadOwner}
              isSaving={isSavingOwner}
            />
          )}
          {activeTab === "support" && <SupportMessages onReload={reloadSupport} />}
          {activeTab === "settings" && (
            <PlatformSettings
              config={paymentConfig}
              onSave={handleSavePaymentSettings}
              onReload={reloadSettings}
              isSaving={isSavingPayment}
            />
          )}
          {activeTab === "leaderboard" && <LeaderboardSettings />}
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
