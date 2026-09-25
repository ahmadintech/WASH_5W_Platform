import React, { useState, useEffect } from "react";
import AppLayout from "../../layout/AppLayout";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useWashData, TechnicalResource } from "../../context/WashDataContext";

type SettingsTab = "programs" | "cycles" | "resources" | "system" | "alerts" | "integrations" | "locations";

export default function SectorSettings() {
  const {
    activityCategories,
    addCategory,
    addActivity,
    removeActivity,
    units,
    addUnit,
    removeUnit,
    locationTypes,
    addLocationType,
    removeLocationType,
    populationGroups,
    addPopulationGroup,
    removePopulationGroup,
    reportingConfig,
    updateReportingConfig,
    systemConfig,
    updateSystemConfig,
    resetAllSettingsToDefault,
    exportSettingsJson,
    states,
    addState,
    removeState,
    lgasByState,
    getLgasForState,
    addLga,
    removeLga,
    wardsByLga,
    getWardsForLga,
    addWard,
    removeWard,
    resources,
    addResource,
    updateResource,
    deleteResource,
  } = useWashData();

  const [activeTab, setActiveTab] = useState<SettingsTab>("programs");
  const [toast, setToast] = useState<string | null>(null);

  // Location Tab Inputs
  const [selectedLocState, setSelectedLocState] = useState(states[0] || "Borno");
  const [selectedLocLga, setSelectedLocLga] = useState(() => getLgasForState(states[0] || "Borno")[0] || "Maiduguri");
  const [newStateInput, setNewStateInput] = useState("");
  const [newLgaInput, setNewLgaInput] = useState("");
  const [newWardInput, setNewWardInput] = useState("");

  // 5W Parameters inputs
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCatForNewAct, setSelectedCatForNewAct] = useState(
    activityCategories[0]?.category || "Water Supply"
  );
  const [newActivityName, setNewActivityName] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newLocType, setNewLocType] = useState("");
  const [newPopGroup, setNewPopGroup] = useState("");

  // Cycle config inputs
  const [cycleMonth, setCycleMonth] = useState(reportingConfig.activeCycle);
  const [cycleDeadline, setCycleDeadline] = useState(reportingConfig.deadlineDate);
  const [freezeToggle, setFreezeToggle] = useState(reportingConfig.isFreezeActive);
  const [cycleNotes, setCycleNotes] = useState(reportingConfig.notes || "");

  // Sync with context if updated from backend
  useEffect(() => {
    setCycleMonth(reportingConfig.activeCycle);
    setCycleDeadline(reportingConfig.deadlineDate);
    setFreezeToggle(reportingConfig.isFreezeActive);
    setCycleNotes(reportingConfig.notes || "");
  }, [reportingConfig]);

  // System config inputs
  const [platformTitle, setPlatformTitle] = useState(systemConfig.platformTitle);
  const [leadAgency, setLeadAgency] = useState(systemConfig.leadAgency);
  const [operationalContext, setOperationalContext] = useState(systemConfig.operationalContext);
  const [defaultState, setDefaultState] = useState<"Borno" | "Adamawa" | "Yobe">(systemConfig.defaultState);
  const [requireGps, setRequireGps] = useState(systemConfig.requireGps);
  const [requirePwd, setRequirePwd] = useState(systemConfig.requirePwd);
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(systemConfig.autoSaveDrafts);
  const [draftIntervalSeconds, setDraftIntervalSeconds] = useState(systemConfig.draftIntervalSeconds);

  useEffect(() => {
    setPlatformTitle(systemConfig.platformTitle);
    setLeadAgency(systemConfig.leadAgency);
    setOperationalContext(systemConfig.operationalContext);
    setDefaultState(systemConfig.defaultState);
    setRequireGps(systemConfig.requireGps);
    setRequirePwd(systemConfig.requirePwd);
    setAutoSaveDrafts(systemConfig.autoSaveDrafts);
    setDraftIntervalSeconds(systemConfig.draftIntervalSeconds);
  }, [systemConfig]);

  // Alerts config inputs
  const [enableDeadlineReminders, setEnableDeadlineReminders] = useState(systemConfig.enableDeadlineReminders);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(systemConfig.reminderDaysBefore);
  const [choleraAlertThreshold, setCholeraAlertThreshold] = useState(systemConfig.choleraAlertThreshold);
  const [replyToEmail, setReplyToEmail] = useState(systemConfig.replyToEmail);

  // Integrations config inputs
  const [enableHdxSync, setEnableHdxSync] = useState(systemConfig.enableHdxSync);
  const [hdxApiKey, setHdxApiKey] = useState(systemConfig.hdxApiKey);
  const [enablePublicDashboard, setEnablePublicDashboard] = useState(systemConfig.enablePublicDashboard);
  const [dataRetentionDays, setDataRetentionDays] = useState(systemConfig.dataRetentionDays);

  // Resource Centre Management State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<TechnicalResource | null>(null);
  const [resTitle, setResTitle] = useState("");
  const [resCategory, setResCategory] = useState("Global Cluster Benchmark");
  const [resFormat, setResFormat] = useState("PDF");
  const [resSize, setResSize] = useState("2.5 MB");
  const [resBadgeColor, setResBadgeColor] = useState("#12707E");
  const [resDesc, setResDesc] = useState("");
  const [resHighlights, setResHighlights] = useState("");
  const [resFileName, setResFileName] = useState("");
  const [resFileUrl, setResFileUrl] = useState("");
  const [resIsPublished, setResIsPublished] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers for 5W params
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName);
    showToast(`Program category "${newCategoryName}" created.`);
    setNewCategoryName("");
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;
    addActivity(selectedCatForNewAct, newActivityName);
    showToast(`Added "${newActivityName}" under ${selectedCatForNewAct}.`);
    setNewActivityName("");
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    addUnit(newUnitName);
    showToast(`Unit "${newUnitName}" added to 5W parameters.`);
    setNewUnitName("");
  };

  const handleAddLocType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocType.trim()) return;
    addLocationType(newLocType);
    showToast(`Location type "${newLocType}" added.`);
    setNewLocType("");
  };

  const handleAddPopGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopGroup.trim()) return;
    addPopulationGroup(newPopGroup);
    showToast(`Target population group "${newPopGroup}" added.`);
    setNewPopGroup("");
  };

  // Location Handlers
  const handleAddStateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateInput.trim()) return;
    addState(newStateInput.trim());
    setSelectedLocState(newStateInput.trim());
    showToast(`State "${newStateInput.trim()}" added to platform.`);
    setNewStateInput("");
  };

  const handleRemoveStateAction = (st: string) => {
    if (confirm(`Remove state "${st}" and its associated LGAs?`)) {
      removeState(st);
      if (selectedLocState === st) {
        const remaining = states.filter((s) => s.toLowerCase() !== st.toLowerCase());
        setSelectedLocState(remaining[0] || "");
      }
      showToast(`State "${st}" removed.`);
    }
  };

  const handleAddLgaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLgaInput.trim() || !selectedLocState) return;
    addLga(selectedLocState, newLgaInput.trim());
    setSelectedLocLga(newLgaInput.trim());
    showToast(`LGA "${newLgaInput.trim()}" added to ${selectedLocState}.`);
    setNewLgaInput("");
  };

  const handleRemoveLgaAction = (lga: string) => {
    if (confirm(`Remove LGA "${lga}" from ${selectedLocState}?`)) {
      removeLga(selectedLocState, lga);
      showToast(`LGA "${lga}" removed from ${selectedLocState}.`);
    }
  };

  const handleAddWardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardInput.trim() || !selectedLocState || !selectedLocLga) return;
    addWard(selectedLocState, selectedLocLga, newWardInput.trim());
    showToast(`Ward "${newWardInput.trim()}" added to ${selectedLocLga}.`);
    setNewWardInput("");
  };

  const handleRemoveWardAction = (ward: string) => {
    if (confirm(`Remove ward "${ward}" from ${selectedLocLga}?`)) {
      removeWard(selectedLocState, selectedLocLga, ward);
      showToast(`Ward "${ward}" removed.`);
    }
  };

  // Handler for Cycle
  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportingConfig({
      activeCycle: cycleMonth,
      deadlineDate: cycleDeadline,
      isFreezeActive: freezeToggle,
      notes: cycleNotes,
    });
    showToast("Reporting cycle and deadline parameters saved to database.");
  };

  // Handler for System Config
  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig({
      platformTitle,
      leadAgency,
      operationalContext,
      defaultState,
      requireGps,
      requirePwd,
      autoSaveDrafts,
      draftIntervalSeconds,
    });
    showToast("General system configuration updated in database.");
  };

  // Handler for Alerts Config
  const handleSaveAlertsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig({
      enableDeadlineReminders,
      reminderDaysBefore,
      choleraAlertThreshold,
      replyToEmail,
    });
    showToast("Alerts and automated notifications configured.");
  };

  // Handler for Integrations Config
  const handleSaveIntegrationsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig({
      enableHdxSync,
      hdxApiKey,
      enablePublicDashboard,
      dataRetentionDays,
    });
    showToast("Integration and data exchange settings saved.");
  };

  // Resource modal helpers
  const openNewResourceModal = () => {
    setEditingResource(null);
    setResTitle("");
    setResCategory("Global Cluster Benchmark");
    setResFormat("PDF");
    setResSize("2.5 MB");
    setResBadgeColor("#12707E");
    setResDesc("");
    setResHighlights("");
    setResFileName("");
    setResFileUrl("");
    setResIsPublished(true);
    setShowResourceModal(true);
  };

  const openEditResourceModal = (item: TechnicalResource) => {
    setEditingResource(item);
    setResTitle(item.title);
    setResCategory(item.category);
    setResFormat(item.format);
    setResSize(item.size);
    setResBadgeColor(item.badge_color || item.badgeColor || "#12707E");
    setResDesc(item.description);
    setResHighlights(Array.isArray(item.highlights) ? item.highlights.join(", ") : "");
    setResFileName(item.file_name || item.fileName || "");
    setResFileUrl(item.file_url || item.fileUrl || "");
    setResIsPublished(item.is_published ?? item.isPublished ?? true);
    setShowResourceModal(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resFileName.trim()) {
      alert("Please provide at least a title and file name.");
      return;
    }

    const highlightsArr = resHighlights
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<TechnicalResource> = {
      title: resTitle.trim(),
      category: resCategory.trim(),
      format: resFormat.trim(),
      size: resSize.trim(),
      badge_color: resBadgeColor,
      badgeColor: resBadgeColor,
      description: resDesc.trim(),
      highlights: highlightsArr,
      file_name: resFileName.trim(),
      fileName: resFileName.trim(),
      file_url: resFileUrl.trim() || `/documents/${resFileName.trim()}`,
      fileUrl: resFileUrl.trim() || `/documents/${resFileName.trim()}`,
      is_published: resIsPublished,
      isPublished: resIsPublished,
    };

    if (editingResource) {
      await updateResource(editingResource.id, payload);
      showToast(`Technical document "${resTitle}" updated.`);
    } else {
      await addResource(payload);
      showToast(`New document "${resTitle}" published to Resource Centre.`);
    }

    setShowResourceModal(false);
  };

  const handleDeleteResource = async (item: TechnicalResource) => {
    if (confirm(`Are you sure you want to delete "${item.title}" from Technical Guidance?`)) {
      await deleteResource(item.id);
      showToast(`Document "${item.title}" removed.`);
    }
  };

  const handleTogglePublishResource = async (item: TechnicalResource) => {
    const currentPub = item.is_published ?? item.isPublished ?? true;
    await updateResource(item.id, { is_published: !currentPub, isPublished: !currentPub });
    showToast(`Document "${item.title}" ${!currentPub ? "published" : "hidden"}.`);
  };

  const handleFactoryReset = () => {
    if (window.confirm("Are you sure you want to restore all platform settings, cycles, and parameters to default?")) {
      resetAllSettingsToDefault();
      setCycleMonth("2026-08");
      setCycleDeadline("2026-09-12");
      setFreezeToggle(false);
      setPlatformTitle("WASH 5W Activity Reporting Platform");
      setLeadAgency("UNICEF / Federal Ministry of Water Resources");
      setOperationalContext("North East Nigeria (BAY States Humanitarian Response)");
      setDefaultState("Borno");
      setRequireGps(true);
      setRequirePwd(true);
      setAutoSaveDrafts(true);
      setDraftIntervalSeconds(30);
      setEnableDeadlineReminders(true);
      setReminderDaysBefore(3);
      setCholeraAlertThreshold(5);
      setReplyToEmail("washcluster.nigeria@unicef.org");
      setEnableHdxSync(false);
      setEnablePublicDashboard(true);
      showToast("Platform configurations reset to factory defaults.");
    }
  };

  return (
    <>
      <PageMeta
        title="Settings & System Configurations | WASH Sector NE Nigeria"
        description="Configure standard 5W programs, activities, units, reporting deadlines, resource centre documents, automated alerts, and platform integrations."
      />
      <PageBreadcrumb pageTitle="Settings & Configurations" />

      {/* Floating Toast Notice */}
      {toast && (
        <div className="fixed top-20 right-6 z-99999 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs sm:text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 mb-6 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab("programs")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "programs"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Programs & 5W Parameters
        </button>

        <button
          onClick={() => setActiveTab("cycles")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "cycles"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Reporting Cycles & Deadlines
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "resources"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Resource Centre & Guidance
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "system"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          General System Configuration
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "alerts"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Alerts & Notification Rules
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "integrations"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Integrations & Data Backup
        </button>

        <button
          onClick={() => setActiveTab("locations")}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "locations"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Location Hierarchy (BAY States)
        </button>
      </div>

      {/* TAB 1: PROGRAMS & 5W PARAMETERS */}
      {activeTab === "programs" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              5W Response Sectors & Indicator Trees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Add or remove standard humanitarian WASH activities under primary sector pillars.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add category / activity forms */}
              <div className="space-y-4">
                <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                    Add Program Category
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Flood Early Warning"
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-xs text-gray-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>

                <form onSubmit={handleAddActivity} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                    Add Activity to Category
                  </h4>
                  <div className="space-y-2">
                    <select
                      value={selectedCatForNewAct}
                      onChange={(e) => setSelectedCatForNewAct(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-xs text-gray-900 dark:text-white"
                    >
                      {activityCategories.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newActivityName}
                        onChange={(e) => setNewActivityName(e.target.value)}
                        placeholder="e.g. Solar Borehole Yield Testing"
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-xs text-gray-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Live list of activity categories */}
              <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {activityCategories.map((cat) => (
                  <div key={cat.category} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        {cat.category}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {cat.activities.length} activities
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cat.activities.map((act) => (
                        <span
                          key={act}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium group"
                        >
                          {act}
                          <button
                            onClick={() => removeActivity(cat.category, act)}
                            className="text-gray-400 hover:text-rose-500 font-bold ml-1 cursor-pointer"
                            title="Remove activity"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Units, Location Types & Population Groups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Units */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Standard Units</h4>
              <form onSubmit={handleAddUnit} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="New unit..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-900 dark:text-white"
                />
                <button type="submit" className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  +
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {units.map((u) => (
                  <span key={u} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                    {u}
                    <button onClick={() => removeUnit(u)} className="text-gray-400 hover:text-rose-500 ml-1 cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location Types */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Location Types</h4>
              <form onSubmit={handleAddLocType} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newLocType}
                  onChange={(e) => setNewLocType(e.target.value)}
                  placeholder="New location type..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-900 dark:text-white"
                />
                <button type="submit" className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  +
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {locationTypes.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                    {l}
                    <button onClick={() => removeLocationType(l)} className="text-gray-400 hover:text-rose-500 ml-1 cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Target Population Groups */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Population Groups</h4>
              <form onSubmit={handleAddPopGroup} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPopGroup}
                  onChange={(e) => setNewPopGroup(e.target.value)}
                  placeholder="New target group..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-900 dark:text-white"
                />
                <button type="submit" className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  +
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {populationGroups.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                    {p}
                    <button onClick={() => removePopulationGroup(p)} className="text-gray-400 hover:text-rose-500 ml-1 cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTING CYCLES & DEADLINES */}
      {activeTab === "cycles" && (
        <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Sector Reporting Cycle & Submission Deadlines
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Configure the current active 5W reporting cycle, cutoff date, and operational freeze for North East Nigeria partners. Saved directly in database.
          </p>

          <form onSubmit={handleSaveCycle} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Active Reporting Cycle (Month)
                </label>
                <input
                  type="month"
                  required
                  value={cycleMonth}
                  onChange={(e) => setCycleMonth(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs sm:text-sm text-gray-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">Designates the operational round period (e.g. 2026-08).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Partner Submission Deadline
                </label>
                <input
                  type="date"
                  required
                  value={cycleDeadline}
                  onChange={(e) => setCycleDeadline(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs sm:text-sm text-gray-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">Reflected on public banner & submit report page.</p>
              </div>
            </div>

            {/* Cycle Lock / Freeze Toggle */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Cycle Submissions Freeze
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When enabled, partner field submissions are locked pending sector data cleaning and verification.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freezeToggle}
                    onChange={(e) => setFreezeToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
              {freezeToggle && (
                <div className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                  ⚠️ Freeze Active: Submissions for this round are locked across all 48 accredited agencies.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Sector Circular / Round Guidance Note
              </label>
              <textarea
                rows={3}
                value={cycleNotes}
                onChange={(e) => setCycleNotes(e.target.value)}
                placeholder="e.g. Please prioritize reporting on Flood Early Warning and Cholera Surge Response activities in Maiduguri, Jere and Bama..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Save Cycle & Deadlines to DB
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RESOURCE CENTRE & TECHNICAL GUIDANCE */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  Resource Centre & Technical Guidance Repository
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage official reference materials, SOPs, SPHERE standards, and reporting dictionaries displayed publicly.
                </p>
              </div>
              <button
                onClick={openNewResourceModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Technical Document</span>
              </button>
            </div>

            {/* Resources List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((item) => {
                const isPub = item.is_published ?? item.isPublished ?? true;
                const badgeColor = item.badge_color || item.badgeColor || "#12707E";
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                      isPub
                        ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40"
                        : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="text-[11px] font-mono font-bold px-2 py-0.5 rounded"
                          style={{ color: badgeColor, backgroundColor: `${badgeColor}15` }}
                        >
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                            {item.format} · {item.size}
                          </span>
                          {!isPub && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-1.5 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      {item.highlights && item.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                      <div className="text-[11px] text-gray-400 font-mono truncate max-w-[140px]" title={item.file_name || item.fileName}>
                        📄 {item.file_name || item.fileName}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublishResource(item)}
                          className="text-[11px] font-semibold text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 cursor-pointer"
                          title={isPub ? "Hide from public view" : "Publish to Resource Centre"}
                        >
                          {isPub ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => openEditResourceModal(item)}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteResource(item)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RESOURCE EDIT / CREATE MODAL */}
      {showResourceModal && (
        <div className="fixed inset-0 z-99999 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {editingResource ? "Edit Guidance Document" : "Publish Technical Guidance Document"}
              </h3>
              <button
                onClick={() => setShowResourceModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Emergency Water Chlorination & FRC Guidelines"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                  >
                    <option value="Global Cluster Benchmark">Global Cluster Benchmark</option>
                    <option value="Water Quality TWG">Water Quality TWG</option>
                    <option value="Sanitation Working Group">Sanitation Working Group</option>
                    <option value="Information Management">Information Management</option>
                    <option value="Outbreak Taskforce">Outbreak Taskforce</option>
                    <option value="Infrastructure & RUWASSA">Infrastructure & RUWASSA</option>
                    <option value="Hygiene & Community Engagement">Hygiene & Community Engagement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Badge Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={resBadgeColor}
                      onChange={(e) => setResBadgeColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={resBadgeColor}
                      onChange={(e) => setResBadgeColor(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs font-mono text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Format (e.g. PDF, XLSX)
                  </label>
                  <input
                    type="text"
                    required
                    value={resFormat}
                    onChange={(e) => setResFormat(e.target.value)}
                    placeholder="PDF"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    File Size (e.g. 4.2 MB)
                  </label>
                  <input
                    type="text"
                    required
                    value={resSize}
                    onChange={(e) => setResSize(e.target.value)}
                    placeholder="3.5 MB"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description & Operational Scope
                </label>
                <textarea
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="Summary of operational SOP, thresholds, and target audience..."
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Key Standards & Highlights (Comma separated)
                </label>
                <input
                  type="text"
                  value={resHighlights}
                  onChange={(e) => setResHighlights(e.target.value)}
                  placeholder="e.g. 15L Water / Person / Day, 20 Persons Per Latrine, FRC 0.5 mg/L"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    File Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={resFileName}
                    onChange={(e) => setResFileName(e.target.value)}
                    placeholder="SPHERE_WASH_Standards_2026.pdf"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs font-mono text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Download URL / Path
                  </label>
                  <input
                    type="text"
                    value={resFileUrl}
                    onChange={(e) => setResFileUrl(e.target.value)}
                    placeholder="/documents/SPHERE_WASH_Standards_2026.pdf"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Publish to Public Portal</span>
                  <span className="text-[11px] text-gray-400">Make visible on landing page and partner guidance tabs</span>
                </div>
                <input
                  type="checkbox"
                  checked={resIsPublished}
                  onChange={(e) => setResIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs cursor-pointer"
                >
                  {editingResource ? "Update Document" : "Publish Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL SYSTEM CONFIGURATION */}
      {activeTab === "system" && (
        <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            General Sector Platform Settings
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Configure platform branding, humanitarian operational scope, and data entry rules.
          </p>

          <form onSubmit={handleSaveSystemConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Platform Title & Branding
              </label>
              <input
                type="text"
                value={platformTitle}
                onChange={(e) => setPlatformTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Lead & Co-Lead Coordination Agencies
                </label>
                <input
                  type="text"
                  value={leadAgency}
                  onChange={(e) => setLeadAgency(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Default Target State
                </label>
                <select
                  value={defaultState}
                  onChange={(e) => setDefaultState(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                >
                  <option value="Borno">Borno (Hub / Highest Need)</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Yobe">Yobe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Humanitarian Response Context Tagline
              </label>
              <input
                type="text"
                value={operationalContext}
                onChange={(e) => setOperationalContext(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Submission Validation & QA Rules
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Strict GPS Coordinate Enforcement</div>
                  <div className="text-[11px] text-gray-400">Require valid latitude/longitude for all completed infrastructure works.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireGps}
                    onChange={(e) => setRequireGps(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Mandatory Disability (PWD) Disaggregation</div>
                  <div className="text-[11px] text-gray-400">Enforce Washington Group disability questions on hygiene & kit distributions.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requirePwd}
                    onChange={(e) => setRequirePwd(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Save System Configuration to DB
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: ALERTS & NOTIFICATION RULES */}
      {activeTab === "alerts" && (
        <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Automated Alerts & Communication Triggers
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Configure automated cluster circular triggers, cholera outbreak warning badges, and deadline reminders.
          </p>

          <form onSubmit={handleSaveAlertsConfig} className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Submission Deadline Automated Broadcasts</div>
                <div className="text-[11px] text-gray-400">Send reminder emails to partner focal points prior to cycle cutoff.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDeadlineReminders}
                  onChange={(e) => setEnableDeadlineReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reminder Window (Days Before Deadline)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cholera Surge Trigger Threshold (Cases/LGA)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={choleraAlertThreshold}
                  onChange={(e) => setCholeraAlertThreshold(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Official Sector Reply-To Email
              </label>
              <input
                type="email"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Save Alert Settings to DB
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: INTEGRATIONS & DATA BACKUP */}
      {activeTab === "integrations" && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Humanitarian Data Exchange (HDX) Connector
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Harmonize monthly 5W master indicators directly with UN OCHA HDX repository.
            </p>

            <form onSubmit={handleSaveIntegrationsConfig} className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Enable Automated HDX Dataset Feed</div>
                  <div className="text-[11px] text-gray-400">Syncs cleaned monthly master 5W CSVs upon admin approval.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableHdxSync}
                    onChange={(e) => setEnableHdxSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  HDX API Key
                </label>
                <input
                  type="password"
                  value={hdxApiKey}
                  onChange={(e) => setHdxApiKey(e.target.value)}
                  placeholder="Enter OCHA HDX organization API key..."
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs cursor-pointer"
                >
                  Save Integration Settings to DB
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Configuration Snapshot & Backup
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Export full system setup, program trees, and parameters, or restore factory standards.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={exportSettingsJson}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Configuration JSON</span>
              </button>

              <button
                type="button"
                onClick={handleFactoryReset}
                className="py-3 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
              >
                Restore Factory Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: LOCATIONS (STATES, LGAS & WARDS) */}
      {activeTab === "locations" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-gradient-to-r from-brand-50/70 to-emerald-50/50 dark:from-brand-950/40 dark:to-emerald-950/20 p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Administrative Boundary Hierarchy (States · LGAs · Wards)</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                    Live 5W Sync
                  </span>
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  Manage the geographic hierarchy used across the 5W reporting form, coverage maps, and partner submissions. Changes update the database in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Level 1: States */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">1</span>
                  <span>Covered States ({states.length})</span>
                </h4>
              </div>

              <form onSubmit={handleAddStateSubmit} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newStateInput}
                  onChange={(e) => setNewStateInput(e.target.value)}
                  placeholder="New state name..."
                  className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white"
                />
                <button type="submit" className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                  + Add
                </button>
              </form>

              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[400px]">
                {states.map((st) => (
                  <div
                    key={st}
                    onClick={() => {
                      setSelectedLocState(st);
                      const stateLgas = getLgasForState(st);
                      setSelectedLocLga(stateLgas[0] || "");
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedLocState.toLowerCase() === st.toLowerCase()
                        ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 shadow-xs font-bold"
                        : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 text-xs font-medium"
                    }`}
                  >
                    <span>{st}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {getLgasForState(st).length} LGAs
                      </span>
                      {states.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStateAction(st);
                          }}
                          className="text-gray-400 hover:text-rose-500 text-sm font-bold px-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 2: LGAs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">2</span>
                  <span>LGAs in {selectedLocState || "Selected State"}</span>
                </h4>
              </div>

              <form onSubmit={handleAddLgaSubmit} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newLgaInput}
                  onChange={(e) => setNewLgaInput(e.target.value)}
                  placeholder={`Add LGA to ${selectedLocState}...`}
                  disabled={!selectedLocState}
                  className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!selectedLocState}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Add
                </button>
              </form>

              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[400px]">
                {getLgasForState(selectedLocState).length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No LGAs configured for {selectedLocState}. Add one above.</div>
                ) : (
                  getLgasForState(selectedLocState).map((lga) => (
                    <div
                      key={lga}
                      onClick={() => setSelectedLocLga(lga)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedLocLga.toLowerCase() === lga.toLowerCase()
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs font-bold"
                          : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 text-xs font-medium"
                      }`}
                    >
                      <span>{lga}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {getWardsForLga(selectedLocState, lga).length} Wards
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLgaAction(lga);
                          }}
                          className="text-gray-400 hover:text-rose-500 text-sm font-bold px-1"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Level 3: Wards */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center">3</span>
                  <span>Wards in {selectedLocLga || "Selected LGA"}</span>
                </h4>
              </div>

              <form onSubmit={handleAddWardSubmit} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newWardInput}
                  onChange={(e) => setNewWardInput(e.target.value)}
                  placeholder={`Add Ward to ${selectedLocLga}...`}
                  disabled={!selectedLocLga}
                  className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!selectedLocLga}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Add
                </button>
              </form>

              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[400px]">
                {getWardsForLga(selectedLocState, selectedLocLga).length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No wards configured for {selectedLocLga}. Add one above.</div>
                ) : (
                  getWardsForLga(selectedLocState, selectedLocLga).map((ward) => (
                    <div
                      key={ward}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {ward}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWardAction(ward)}
                        className="text-gray-400 hover:text-rose-500 text-sm font-bold px-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

SectorSettings.layout = (page: any) => <AppLayout>{page}</AppLayout>;
