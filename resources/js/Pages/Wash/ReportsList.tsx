import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AppLayout from "../../layout/AppLayout";
import { useWashData } from "../../context/WashDataContext";
import { useAuth } from "../../context/AuthContext";
import { WashReport } from "../../types/wash";

export default function ReportsList() {
  const { reports, deleteReport, updateReport, exportCsv } = useWashData();
  const { currentUser } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>(() =>
    currentUser.role === "coordinator" && currentUser.state ? currentUser.state : ""
  );

  // Role based view toggle for partners
  const [showOnlyMine, setShowOnlyMine] = useState<boolean>(currentUser.role === "partner");

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Approval handling (local state for demo)
  const [selectedReport, setSelectedReport] = useState<WashReport | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Editing state
  const [editingReport, setEditingReport] = useState<WashReport | null>(null);
  const [editForm, setEditForm] = useState<Partial<WashReport>>({});

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = (id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    showToastMessage(`Report #${id.slice(-4)} approved.`);
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
  };

  const confirmReject = () => {
    if (rejectingId) {
      // In a real app you would persist this reason
      showToastMessage(`Report #${rejectingId.slice(-4)} rejected: ${rejectionReason}`);
      setRejectingId(null);
      setRejectionReason("");
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteReport(deletingId);
      showToastMessage(`Report #${deletingId.slice(-4)} deleted.`);
      setDeletingId(null);
    }
  };

  const handleEdit = (r: WashReport) => {
    setEditingReport(r);
    setEditForm({ ...r });
  };

  const handleEditFieldChange = (field: keyof WashReport, value: any) => {
    setEditForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-recalculate total when beneficiary fields change
      if (["men", "women", "boys", "girls"].includes(field)) {
        updated.total =
          (Number(updated.men) || 0) +
          (Number(updated.women) || 0) +
          (Number(updated.boys) || 0) +
          (Number(updated.girls) || 0);
      }
      return updated;
    });
  };

  const confirmEdit = () => {
    if (editingReport && editForm) {
      updateReport(editingReport.id, editForm);
      showToastMessage(`Report #${editingReport.id.slice(-4)} updated successfully.`);
      setEditingReport(null);
      setEditForm({});
      // Also refresh the detail modal if it was showing this report
      if (selectedReport?.id === editingReport.id) {
        setSelectedReport({ ...editingReport, ...editForm } as WashReport);
      }
    }
  };

  const filtered = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return [];
    const userOrg = (currentUser?.organization || "").toLowerCase();

    return reports.filter((r) => {
      if (!r) return false;
      const org = (r.orgName || "").toLowerCase();
      if (showOnlyMine && userOrg && !org.includes(userOrg)) {
        return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      if (stateFilter && r.state !== stateFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const act = (r.activityType || "").toLowerCase();
        const lga = (r.lga || "").toLowerCase();
        const sett = (r.settlement || "").toLowerCase();
        const focal = (r.focalPoint || "").toLowerCase();
        const donor = (r.donor || "").toLowerCase();
        const match =
          org.includes(q) ||
          act.includes(q) ||
          lga.includes(q) ||
          sett.includes(q) ||
          focal.includes(q) ||
          donor.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [reports, showOnlyMine, currentUser?.organization, statusFilter, stateFilter, searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filtered]);

  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleDelete = (r: WashReport) => {
    // Open confirmation modal instead of native alert
    setDeletingId(r.id);
  };

  return (
    <>
      <PageMeta
        title="Reports | WASH Sector North East Nigeria"
        description="Comprehensive 5W submissions directory and database for Borno, Adamawa, and Yobe"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentUser.role === "admin"
                ? "Review, verify, and manage 5W field submissions across Borno, Adamawa, and Yobe."
                : currentUser.role === "coordinator"
                ? "Monitor cluster interventions and review partner activity records."
                : `View and track 5W field submissions for ${currentUser.organization}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === "partner" && (
              <Link
                to="/submit-report"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-all"
              >
                <span>New Report</span>
              </Link>
            )}
            <button
              onClick={() => exportCsv(filtered)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span>Export {currentUser.role === "admin" ? "Master CSV" : "CSV"}</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search partner, activity, LGA, focal point..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {currentUser.role === "coordinator" && currentUser.state ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>State: {currentUser.state} (Cluster Assigned)</span>
                </div>
              ) : (
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:border-brand-500 outline-none"
                >
                  <option value="">All States</option>
                  <option value="Borno">Borno</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Yobe">Yobe</option>
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:border-brand-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Planned">Planned</option>
              </select>
            </div>

            {currentUser.role === "partner" && (
              <button
                type="button"
                onClick={() => setShowOnlyMine(!showOnlyMine)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border ${
                  showOnlyMine
                    ? "bg-brand-600 text-white border-brand-700 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showOnlyMine ? "bg-white" : "bg-gray-400"}`} />
                <span>Only My Organisation's Reports ({currentUser.organization})</span>
              </button>
            )}
          </div>
        </div>

        {/* Table of submissions */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Organisation</th>
                  <th className="py-3.5 px-4 font-semibold">Activity & Indicator</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Period</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total Reached</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Rejection Reason</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                      No 5W records found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white">{r.orgName}</div>
                        <div className="text-[11px] text-gray-400">{r.focalPoint}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {r.activityType === "Other" ? r.activityOther || "Other" : r.activityType}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {r.quantity} {r.unit} · {r.indicatorDesc || "Standard 5W response"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {r.state} · {r.lga}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {r.settlement || r.ward || r.locationType}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-400">{r.period}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            r.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : r.status === "Ongoing"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-right text-gray-900 dark:text-white">
                        {Number(r.total).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-500">
                        -
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View
                          </button>
                          {currentUser.role === "admin" && (
                            <button
                              onClick={() => handleEdit(r)}
                              className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Edit
                            </button>
                          )}
                           {(currentUser.role === "admin" || currentUser.role === "coordinator" || (Boolean(r.orgName) && Boolean(currentUser?.organization) && r.orgName.toLowerCase().includes(currentUser.organization.toLowerCase()))) && (
                            <button
                              onClick={() => handleDelete(r)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Delete
                            </button>
                          )}
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                className="px-2 py-1 rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-2 py-1 rounded ${currentPage === i ? "bg-brand-600 text-white" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-2 py-1 rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-99999 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-top-4 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold">{toast}</span>
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectingId && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Reject Report</h3>
                <button onClick={() => setRejectingId(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-2 border rounded focus:outline-none focus:ring"
                  rows={4}
                />
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setRejectingId(null)}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="px-3 py-1 text-sm bg-rose-600 text-white rounded"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Delete Report</h3>
                <button onClick={() => setDeletingId(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4 text-center">
                <p className="text-gray-800 dark:text-gray-200 mb-4">Are you sure you want to delete this report?</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setDeletingId(null)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">Cancel</button>
                  <button onClick={confirmDelete} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between bg-gradient-to-r from-gray-50 to-brand-50/20 dark:from-gray-900 dark:to-gray-850">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 font-mono">
                      Record {selectedReport.id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-200/80 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {selectedReport.orgType || "NGO"}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        selectedReport.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : selectedReport.status === "Ongoing"
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                      }`}
                    >
                      ● {selectedReport.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {selectedReport.orgName} — {selectedReport.activityType}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Operational cycle: {selectedReport.period} · Registered in {selectedReport.state}, {selectedReport.lga}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Modal Body - All 5W Sections */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">01. Organisation Details</h4>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Focal Point:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.focalPoint}</span></p>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.email}</span></p>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400 font-mono">Type:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.orgType}</span></p>
                    {selectedReport.donor && <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Donor:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.donor}</span></p>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">02. Intervention & Activity</h4>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Activity:</span> <span className="font-bold text-brand-600 dark:text-brand-400">{selectedReport.activityType}</span></p>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="font-semibold font-mono text-gray-900 dark:text-white">{selectedReport.quantity} {selectedReport.unit}</span></p>
                    {selectedReport.indicatorDesc && <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Indicator:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.indicatorDesc}</span></p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">03. Location Breakdown</h4>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">State & LGA:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.state} — {selectedReport.lga}</span></p>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Ward / Site:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.ward || "N/A"} / {selectedReport.settlement || "N/A"}</span></p>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Setting:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.locationType}</span></p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">04. Timeline & Status</h4>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Period:</span> <span className="font-semibold font-mono text-gray-900 dark:text-white">{selectedReport.period}</span></p>
                    <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Status:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReport.status}</span></p>
                    {selectedReport.startDate && <p className="py-0.5"><span className="text-gray-500 dark:text-gray-400">Duration:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedReport.startDate} to {selectedReport.endDate || "Ongoing"}</span></p>}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">05. Beneficiaries Disaggregation (Total: {Number(selectedReport.total).toLocaleString()})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center mt-3">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Men</span>
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{Number(selectedReport.men).toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Women</span>
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{Number(selectedReport.women).toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Boys</span>
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{Number(selectedReport.boys).toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Girls</span>
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{Number(selectedReport.girls).toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs">
                      <span className="block text-[10px] text-purple-500 font-bold uppercase">PWD</span>
                      <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">{Number(selectedReport.pwd).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-gray-900/50">
                {/* Left: Approve / Reject — admin & coordinator only */}
                <div className="flex items-center gap-2">
                  {(currentUser.role === "admin" || currentUser.role === "coordinator") && (
                    <>
                      <button
                        onClick={() => { handleApprove(selectedReport.id); }}
                        disabled={approvedIds.has(selectedReport.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          approvedIds.has(selectedReport.id)
                            ? "bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 cursor-default"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        {approvedIds.has(selectedReport.id) ? "Approved" : "Approve"}
                      </button>
                      <button
                        onClick={() => { handleReject(selectedReport.id); }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
                      </button>
                    </>
                  )}
                  {!(currentUser.role === "admin" || currentUser.role === "coordinator") && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      WASH 5W Submission · North East Nigeria Cluster Matrix
                    </span>
                  )}
                </div>
                {/* Right: Print + Close */}
                <div className="flex items-center gap-2">
                  <button onClick={() => { window.print(); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Print Record
                  </button>
                  <button onClick={() => setSelectedReport(null)} className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Edit Report Modal */}
        {editingReport && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between bg-gradient-to-r from-amber-50 to-orange-50/30 dark:from-gray-900 dark:to-amber-950/20">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 font-mono">
                      Editing {editingReport.id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      ✏️ Admin Edit Mode
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Edit Report — {editForm.orgName || editingReport.orgName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Modify any field below and save changes. Beneficiary total auto-calculates.
                  </p>
                </div>
                <button onClick={() => setEditingReport(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Modal Body - Editable 5W Sections */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
                {/* 01. Organisation Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">01. Organisation Details</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Organisation Name</label>
                      <input type="text" value={editForm.orgName || ""} onChange={(e) => handleEditFieldChange("orgName", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Focal Point</label>
                      <input type="text" value={editForm.focalPoint || ""} onChange={(e) => handleEditFieldChange("focalPoint", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</label>
                      <input type="email" value={editForm.email || ""} onChange={(e) => handleEditFieldChange("email", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">02. Intervention & Activity</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Activity Type</label>
                      <input type="text" value={editForm.activityType || ""} onChange={(e) => handleEditFieldChange("activityType", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Quantity</label>
                        <input type="number" value={editForm.quantity ?? ""} onChange={(e) => handleEditFieldChange("quantity", Number(e.target.value) || 0)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Unit</label>
                        <input type="text" value={editForm.unit || ""} onChange={(e) => handleEditFieldChange("unit", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Indicator Description</label>
                      <input type="text" value={editForm.indicatorDesc || ""} onChange={(e) => handleEditFieldChange("indicatorDesc", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Donor</label>
                      <input type="text" value={editForm.donor || ""} onChange={(e) => handleEditFieldChange("donor", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                  </div>
                </div>

                {/* 03. Location & 04. Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">03. Location Breakdown</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">State</label>
                      <select value={editForm.state || ""} onChange={(e) => handleEditFieldChange("state", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none">
                        <option value="Borno">Borno</option>
                        <option value="Adamawa">Adamawa</option>
                        <option value="Yobe">Yobe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">LGA</label>
                      <input type="text" value={editForm.lga || ""} onChange={(e) => handleEditFieldChange("lga", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Ward</label>
                        <input type="text" value={editForm.ward || ""} onChange={(e) => handleEditFieldChange("ward", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Settlement / Site</label>
                        <input type="text" value={editForm.settlement || ""} onChange={(e) => handleEditFieldChange("settlement", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Location Type</label>
                      <input type="text" value={editForm.locationType || ""} onChange={(e) => handleEditFieldChange("locationType", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs uppercase tracking-wider">04. Timeline & Status</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Period (YYYY-MM)</label>
                      <input type="text" value={editForm.period || ""} onChange={(e) => handleEditFieldChange("period", e.target.value)} placeholder="e.g. 2026-08" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                      <select value={editForm.status || ""} onChange={(e) => handleEditFieldChange("status", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none">
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Planned">Planned</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Suspended">Suspended</option>
                        <option value="In progress">In progress</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                        <input type="date" value={editForm.startDate || ""} onChange={(e) => handleEditFieldChange("startDate", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                        <input type="date" value={editForm.endDate || ""} onChange={(e) => handleEditFieldChange("endDate", e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 05. Beneficiaries */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-xs uppercase tracking-wider">05. Beneficiaries Disaggregation (Total: {Number(editForm.total || 0).toLocaleString()})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 text-center">Men</label>
                      <input type="number" value={editForm.men ?? 0} onChange={(e) => handleEditFieldChange("men", Number(e.target.value) || 0)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-mono font-bold text-center text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 text-center">Women</label>
                      <input type="number" value={editForm.women ?? 0} onChange={(e) => handleEditFieldChange("women", Number(e.target.value) || 0)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-mono font-bold text-center text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 text-center">Boys</label>
                      <input type="number" value={editForm.boys ?? 0} onChange={(e) => handleEditFieldChange("boys", Number(e.target.value) || 0)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-mono font-bold text-center text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 text-center">Girls</label>
                      <input type="number" value={editForm.girls ?? 0} onChange={(e) => handleEditFieldChange("girls", Number(e.target.value) || 0)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-mono font-bold text-center text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-purple-500 mb-1 text-center">PWD</label>
                      <input type="number" value={editForm.pwd ?? 0} onChange={(e) => handleEditFieldChange("pwd", Number(e.target.value) || 0)} className="w-full rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-mono font-bold text-center text-purple-600 dark:text-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none" />
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      Auto-Calculated Total: {Number(editForm.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-gray-900/50">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Edit · Changes are saved immediately
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingReport(null)} className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmEdit} className="px-5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

ReportsList.layout = (page: any) => <AppLayout>{page}</AppLayout>;
