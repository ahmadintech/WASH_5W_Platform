import React, { createContext, useContext, useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import {
  WashReport,
  INITIAL_WASH_REPORTS,
  ACTIVITY_CATEGORIES,
  UNITS,
  LOCATION_TYPES,
  POPULATION_GROUPS,
  LGA_BY_STATE,
  INITIAL_WARDS_BY_LGA,
} from "../types/wash";
import { useAuth } from "./AuthContext";

export interface ProgramCategory {
  category: string;
  activities: string[];
}

export interface ReportingConfig {
  activeCycle: string; // e.g. "2026-08"
  deadlineDate: string; // e.g. "2026-09-12"
  isFreezeActive: boolean;
  notes?: string;
}

export interface SystemConfig {
  platformTitle: string;
  leadAgency: string;
  operationalContext: string;
  defaultState: "Borno" | "Adamawa" | "Yobe";
  requireGps: boolean;
  requirePwd: boolean;
  autoSaveDrafts: boolean;
  draftIntervalSeconds: number;
  enableDeadlineReminders: boolean;
  reminderDaysBefore: number;
  choleraAlertThreshold: number;
  replyToEmail: string;
  enableHdxSync: boolean;
  hdxApiKey: string;
  enablePublicDashboard: boolean;
  dataRetentionDays: number;
}

export interface TechnicalResource {
  id: string | number;
  title: string;
  category: string;
  format: string;
  size: string;
  badge_color?: string;
  badgeColor?: string;
  description: string;
  highlights?: string[];
  file_name?: string;
  fileName?: string;
  file_url?: string;
  fileUrl?: string;
  download_count?: number;
  downloadCount?: number;
  is_published?: boolean;
  isPublished?: boolean;
  sort_order?: number;
  sortOrder?: number;
}

export const DEFAULT_RESOURCES: TechnicalResource[] = [
  {
    id: "sphere-standards",
    title: "SPHERE Standards: WASH in Humanitarian Response",
    category: "Global Cluster Benchmark",
    format: "PDF",
    size: "4.2 MB",
    badge_color: "#12707E",
    description: "Universal minimum standards for emergency water supply (15L/p/d), sanitation ratios (20 persons/latrine), and handwashing distances.",
    highlights: ["15L Water / Person / Day", "20 Persons Per Latrine", "FRC 0.5 mg/L Standard"],
    file_name: "SPHERE_Humanitarian_WASH_Standards_2026.pdf",
    file_url: "/documents/SPHERE_Humanitarian_WASH_Standards_2026.pdf",
    is_published: true,
    sort_order: 1,
  },
  {
    id: "chlorination-guidelines",
    title: "Emergency Water Chlorination & FRC Guidelines",
    category: "Water Quality TWG",
    format: "PDF",
    size: "2.8 MB",
    badge_color: "#2E7D47",
    description: "Standard operating procedures for batch chlorination, inline doser calibration, pool tester monitoring, and Free Residual Chlorine.",
    highlights: ["FRC Pool Tester SOP", "Shock Chlorination Protocol", "Borehole Inline Dosing"],
    file_name: "WASH_Cluster_Chlorination_Guidelines_NE_Nigeria.pdf",
    file_url: "/documents/WASH_Cluster_Chlorination_Guidelines_NE_Nigeria.pdf",
    is_published: true,
    sort_order: 2,
  },
  {
    id: "sludge-management",
    title: "Faecal Sludge Management & Camp Desludging Protocols",
    category: "Sanitation Working Group",
    format: "PDF",
    size: "3.5 MB",
    badge_color: "#C1722F",
    description: "Safe desludging procedures for IDP camps, containment pit designs, lime neutralization, and biological waste handling.",
    highlights: ["Camp Desludging SOP", "Lime Neutralization Pit", "Sanitation Worker PPE"],
    file_name: "Faecal_Sludge_Management_Camp_Protocol_2026.pdf",
    file_url: "/documents/Faecal_Sludge_Management_Camp_Protocol_2026.pdf",
    is_published: true,
    sort_order: 3,
  },
  {
    id: "reporting-guidance",
    title: "5W Technical Manual & Indicator Reporting Dictionary",
    category: "Information Management",
    format: "XLSX / PDF",
    size: "1.9 MB",
    badge_color: "#6D28D9",
    description: "Complete reporting dictionary defining all standard 5W activities, disaggregation rules (M/F/Girls/Boys/PWD), and GPS standards.",
    highlights: ["Full Indicator Glossary", "GPS Coordinate Rules", "Monthly Data Checklist"],
    file_name: "5W_Reporting_Manual_Indicator_Dictionary_v2026.xlsx",
    file_url: "/documents/5W_Reporting_Manual_Indicator_Dictionary_v2026.xlsx",
    is_published: true,
    sort_order: 4,
  },
  {
    id: "cholera-cati-sop",
    title: "Case-Area Targeted Intervention (CATI) Cholera SOP",
    category: "Outbreak Taskforce",
    format: "PDF",
    size: "2.1 MB",
    badge_color: "#B91C1C",
    description: "Operational guidelines for 48-hour rapid response cordoning around suspected cholera index cases, disinfection, and soap distribution.",
    highlights: ["48hr Rapid Response Trigger", "Household Disinfection Kits", "Ring Hygiene Promotion"],
    file_name: "CATI_Cholera_Response_Mechanism_NE_Nigeria.pdf",
    file_url: "/documents/CATI_Cholera_Response_Mechanism_NE_Nigeria.pdf",
    is_published: true,
    sort_order: 5,
  },
  {
    id: "solar-borehole-manual",
    title: "Solarized Motorized Borehole Design & QA Standards",
    category: "Infrastructure & RUWASSA",
    format: "PDF",
    size: "5.4 MB",
    badge_color: "#0B3C46",
    description: "Technical engineering specifications for submersible solar pumping systems, hybrid inverters, and aquifer yield testing in the Chad Basin.",
    highlights: ["Solar PV Sizing Tables", "Hybrid Inverter QA", "Aquifer Testing Rules"],
    file_name: "Solar_Borehole_Infrastructure_Manual_RUWASSA.pdf",
    file_url: "/documents/Solar_Borehole_Infrastructure_Manual_RUWASSA.pdf",
    is_published: true,
    sort_order: 6,
  },
];

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  platformTitle: "WASH 5W Activity Reporting Platform",
  leadAgency: "UNICEF / Federal Ministry of Water Resources",
  operationalContext: "North East Nigeria (BAY States Humanitarian Response)",
  defaultState: "Borno",
  requireGps: true,
  requirePwd: true,
  autoSaveDrafts: true,
  draftIntervalSeconds: 30,
  enableDeadlineReminders: true,
  reminderDaysBefore: 3,
  choleraAlertThreshold: 5,
  replyToEmail: "washcluster.nigeria@unicef.org",
  enableHdxSync: false,
  hdxApiKey: "",
  enablePublicDashboard: true,
  dataRetentionDays: 365,
};

interface WashDataContextType {
  reports: WashReport[];
  addReport: (report: Omit<WashReport, "id" | "submittedAt">) => WashReport;
  submitBatchReports: (entries: any[]) => Promise<{ success: boolean; count?: number; message?: string }>;
  updateReport: (id: string, updates: Partial<WashReport>) => boolean;
  deleteReport: (id: string) => boolean;
  exportCsv: (customReports?: WashReport[]) => void;
  resetToSampleData: () => void;
  // Dynamic parameters managed by Admin
  activityCategories: ProgramCategory[];
  addCategory: (category: string) => void;
  addActivity: (category: string, activity: string) => void;
  removeActivity: (category: string, activity: string) => void;
  units: string[];
  addUnit: (unit: string) => void;
  removeUnit: (unit: string) => void;
  locationTypes: string[];
  addLocationType: (locType: string) => void;
  removeLocationType: (locType: string) => void;
  populationGroups: string[];
  addPopulationGroup: (group: string) => void;
  removePopulationGroup: (group: string) => void;
  reportingConfig: ReportingConfig;
  updateReportingConfig: (config: Partial<ReportingConfig>) => void;
  systemConfig: SystemConfig;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;
  resetAllSettingsToDefault: () => void;
  exportSettingsJson: () => void;
  // Dynamic location hierarchy managed by Admin
  states: string[];
  addState: (stateName: string) => void;
  removeState: (stateName: string) => void;
  lgasByState: Record<string, string[]>;
  getLgasForState: (stateName: string) => string[];
  addLga: (stateName: string, lgaName: string) => void;
  removeLga: (stateName: string, lgaName: string) => void;
  wardsByLga: Record<string, string[]>;
  getWardsForLga: (stateName: string, lgaName: string) => string[];
  addWard: (stateName: string, lgaName: string, wardName: string) => void;
  removeWard: (stateName: string, lgaName: string, wardName: string) => void;
  // Resource Centre & Technical Guidance
  resources: TechnicalResource[];
  addResource: (res: Partial<TechnicalResource>) => Promise<boolean>;
  updateResource: (id: string | number, res: Partial<TechnicalResource>) => Promise<boolean>;
  deleteResource: (id: string | number) => Promise<boolean>;
  stats: {
    totalReports: number;
    totalBeneficiaries: number;
    totalPartners: number;
    totalLgas: number;
  };
}

export function normalizeReport(raw: any): WashReport {
  if (!raw) return raw;
  const men = Number(raw.men ?? raw.boys_men ?? 0) || 0;
  const women = Number(raw.women ?? raw.girls_women ?? 0) || 0;
  const boys = Number(raw.boys ?? 0) || 0;
  const girls = Number(raw.girls ?? 0) || 0;
  const total = Number(raw.total) || (men + women + boys + girls);

  return {
    id: String(raw.id || raw.report_code || "r_" + Math.random().toString(36).slice(2, 8)),
    submittedAt: raw.submittedAt || raw.submitted_at || new Date().toISOString(),
    orgName: raw.orgName || raw.org_name || "WASH Partner",
    orgType: raw.orgType || raw.org_type || "International NGO",
    focalPoint: raw.focalPoint || raw.focal_point || "Focal Point",
    email: raw.email || "partner@washsector-ne.org",
    donor: raw.donor || "ECHO",
    activityType: raw.activityType || raw.activity_type || "Water Supply Provision",
    activityOther: raw.activityOther || raw.activity_other || "",
    quantity: Number(raw.quantity) || 1,
    unit: raw.unit || "Borehole (Solar Powered)",
    indicatorDesc: raw.indicatorDesc || raw.indicator_desc || "Standard WASH 5W Response",
    state: (raw.state || "Borno") as "Borno" | "Adamawa" | "Yobe",
    lga: raw.lga || "Maiduguri",
    ward: raw.ward || "",
    settlement: raw.settlement || "",
    locationType: raw.locationType || raw.location_type || "Host Community",
    period: raw.period || "2026-08",
    status: (raw.status || "Completed") as "Planned" | "Ongoing" | "Completed",
    startDate: raw.startDate || raw.start_date || "",
    endDate: raw.endDate || raw.end_date || "",
    populationGroup: raw.populationGroup || raw.population_group || "IDPs in Camp",
    pwd: Number(raw.pwd ?? 0),
    men,
    women,
    boys,
    girls,
    total,
    latitude: raw.latitude !== undefined && raw.latitude !== null ? Number(raw.latitude) : undefined,
    longitude: raw.longitude !== undefined && raw.longitude !== null ? Number(raw.longitude) : undefined,
  };
}

const STORAGE_KEY = "wash-5w-reports";
const SETTINGS_STORAGE_KEY = "wash-sector-settings";

const WashDataContext = createContext<WashDataContextType | undefined>(undefined);

export const WashDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [allReports, setAllReports] = useState<WashReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeReport);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_WASH_REPORTS.map(normalizeReport);
  });

  // Dynamic Settings State
  const [activityCategories, setActivityCategories] = useState<ProgramCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_categories`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ACTIVITY_CATEGORIES;
  });

  const [units, setUnits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_units`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return UNITS;
  });

  const [locationTypes, setLocationTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_location_types`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return LOCATION_TYPES;
  });

  const [populationGroups, setPopulationGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_pop_groups`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return POPULATION_GROUPS;
  });

  const [reportingConfig, setReportingConfig] = useState<ReportingConfig>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_config`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      activeCycle: "2026-08",
      deadlineDate: "2026-09-12",
      isFreezeActive: false,
      notes: "August 2026 monthly reporting round for Borno, Adamawa, and Yobe states.",
    };
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_system_config`);
      if (saved) return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SYSTEM_CONFIG;
  });

  const [states, setStates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_states`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ["Borno", "Adamawa", "Yobe"];
  });

  const [lgasByState, setLgasByState] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_lgas`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return LGA_BY_STATE;
  });

  const [wardsByLga, setWardsByLga] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_wards`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_WARDS_BY_LGA;
  });

  const [resources, setResources] = useState<TechnicalResource[]>(() => {
    try {
      const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_resources`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_RESOURCES;
  });

  // Always fetch live reports and settings directly from database API on mount
  useEffect(() => {
    // 1. Fetch live 5W reports
    fetch("/api/reports", {
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reports && Array.isArray(data.reports) && data.reports.length > 0) {
          const dbReports = data.reports.map(normalizeReport);
          setAllReports(dbReports);
        }
      })
      .catch(() => {});

    // 2. Fetch live Sector Settings from DB
    fetch("/api/settings", {
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reportingConfig) setReportingConfig(data.reportingConfig);
        if (data?.systemConfig) setSystemConfig(data.systemConfig);
        if (data?.activityCategories) setActivityCategories(data.activityCategories);
        if (data?.units) setUnits(data.units);
        if (data?.locationTypes) setLocationTypes(data.locationTypes);
        if (data?.populationGroups) setPopulationGroups(data.populationGroups);
        if (data?.states) setStates(data.states);
        if (data?.lgasByState) setLgasByState(data.lgasByState);
        if (data?.wardsByLga) setWardsByLga(data.wardsByLga);
      })
      .catch(() => {});

    // 3. Fetch live Resource Centre documents from DB
    fetch("/api/resources", {
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.resources && Array.isArray(data.resources) && data.resources.length > 0) {
          setResources(data.resources);
        }
      })
      .catch(() => {});
  }, []);

  // Listen to Inertia Props for live server data
  try {
    const pageProps = usePage()?.props as any;
    useEffect(() => {
      if (pageProps?.initialReports && Array.isArray(pageProps.initialReports)) {
        setAllReports(pageProps.initialReports.map(normalizeReport));
      }
      if (pageProps?.sectorSettings?.reportingConfig) {
        setReportingConfig(pageProps.sectorSettings.reportingConfig);
      }
      if (pageProps?.sectorSettings?.systemConfig) {
        setSystemConfig(pageProps.sectorSettings.systemConfig);
      }
      if (pageProps?.resources && Array.isArray(pageProps.resources)) {
        setResources(pageProps.resources);
      }
    }, [pageProps?.initialReports, pageProps?.sectorSettings, pageProps?.resources]);
  } catch {
    // context rendered outside Inertia
  }

  // Local storage persistence fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allReports));
    } catch {}
  }, [allReports]);

  useEffect(() => {
    try {
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_categories`, JSON.stringify(activityCategories));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_units`, JSON.stringify(units));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_location_types`, JSON.stringify(locationTypes));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_pop_groups`, JSON.stringify(populationGroups));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_config`, JSON.stringify(reportingConfig));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_system_config`, JSON.stringify(systemConfig));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_states`, JSON.stringify(states));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_lgas`, JSON.stringify(lgasByState));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_wards`, JSON.stringify(wardsByLga));
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_resources`, JSON.stringify(resources));
    } catch {}
  }, [activityCategories, units, locationTypes, populationGroups, reportingConfig, systemConfig, states, lgasByState, wardsByLga, resources]);

  // Helper to persist settings to Laravel MySQL DB
  const saveSettingsToDb = (payload: Record<string, any>) => {
    if (typeof document === "undefined") return;
    const meta = document.querySelector('meta[name="csrf-token"]');
    const csrf = meta ? meta.getAttribute("content") || "" : "";
    fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": csrf,
      },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn("Could not persist settings to DB:", err));
  };

  // Scoped reports: if coordinator is logged in, strictly filter reports to their assigned state
  const reports = React.useMemo(() => {
    if (isAuthenticated && currentUser?.role === "coordinator" && currentUser?.state) {
      const targetState = (currentUser.state || "").toLowerCase();
      return allReports.filter((r) => r.state && r.state.toLowerCase() === targetState);
    }
    return allReports;
  }, [allReports, isAuthenticated, currentUser]);

  const addReport = (reportData: Omit<WashReport, "id" | "submittedAt">): WashReport => {
    const assignedState =
      currentUser?.role === "coordinator" && currentUser?.state
        ? (currentUser.state as "Borno" | "Adamawa" | "Yobe")
        : reportData.state;

    const newReport: WashReport = {
      ...reportData,
      state: assignedState,
      id: "r_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      submittedAt: new Date().toISOString(),
    };
    setAllReports((prev) => [newReport, ...prev]);

    if (typeof document !== "undefined") {
      const meta = document.querySelector('meta[name="csrf-token"]');
      const csrf = meta ? meta.getAttribute("content") || "" : "";
      fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({
          org_name: newReport.orgName,
          org_type: newReport.orgType,
          focal_point: newReport.focalPoint,
          email: newReport.email,
          donor: newReport.donor,
          activity_type: newReport.activityType,
          quantity: newReport.quantity,
          unit: newReport.unit,
          indicator_desc: newReport.indicatorDesc,
          state: newReport.state,
          lga: newReport.lga,
          ward: newReport.ward,
          settlement: newReport.settlement,
          location_type: newReport.locationType,
          period: newReport.period,
          status: newReport.status,
          start_date: newReport.startDate || null,
          end_date: newReport.endDate || null,
          population_group: newReport.populationGroup,
          pwd: newReport.pwd,
          men: newReport.men,
          women: newReport.women,
          boys: newReport.boys,
          girls: newReport.girls,
        }),
      }).catch((err) => console.warn("Failed to persist report to DB:", err));
    }

    return newReport;
  };

  const submitBatchReports = async (entries: any[]): Promise<{ success: boolean; count?: number; message?: string }> => {
    try {
      const meta = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null;
      const csrf = meta ? meta.getAttribute("content") || "" : "";
      const res = await fetch("/api/reports/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({ entries }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.reports)) {
        const newReports = data.reports.map(normalizeReport);
        setAllReports((prev) => [...newReports, ...prev]);
        return { success: true, count: newReports.length, message: data.message };
      }
    } catch (err: any) {
      console.warn("Backend batch submission failed, saving to local context:", err);
    }

    const newReports = entries.map((e) => {
      const report = normalizeReport(e);
      report.id = "r_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      report.submittedAt = new Date().toISOString();
      return report;
    });
    setAllReports((prev) => [...newReports, ...prev]);
    return { success: true, count: newReports.length };
  };

  const updateReport = (id: string, updates: Partial<WashReport>): boolean => {
    let found = false;
    setAllReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          found = true;
          return { ...r, ...updates };
        }
        return r;
      })
    );
    return found;
  };

  const deleteReport = (id: string): boolean => {
    setAllReports((prev) => prev.filter((r) => r.id !== id));
    if (typeof document !== "undefined") {
      const meta = document.querySelector('meta[name="csrf-token"]');
      const csrf = meta ? meta.getAttribute("content") || "" : "";
      fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
      }).catch(() => {});
    }
    return true;
  };

  const resetToSampleData = () => {
    setAllReports(INITIAL_WASH_REPORTS.map(normalizeReport));
  };

  const exportCsv = (customReports?: WashReport[]) => {
    const list = customReports || reports;
    if (list.length === 0) return;

    const headers = [
      "Report ID",
      "Submitted At",
      "Organization",
      "Org Type",
      "Focal Point",
      "Email",
      "Donor",
      "Activity Type",
      "Quantity",
      "Unit",
      "Indicator Description",
      "State",
      "LGA",
      "Ward",
      "Settlement",
      "Location Type",
      "Reporting Period",
      "Status",
      "Start Date",
      "End Date",
      "Population Group",
      "PWD Reach",
      "Men",
      "Women",
      "Boys",
      "Girls",
      "Total Beneficiaries",
    ];

    const rows = list.map((r) => [
      r.id,
      r.submittedAt,
      `"${(r.orgName || "").replace(/"/g, '""')}"`,
      `"${r.orgType || ""}"`,
      `"${(r.focalPoint || "").replace(/"/g, '""')}"`,
      `"${r.email || ""}"`,
      `"${r.donor || ""}"`,
      `"${(r.activityType || "").replace(/"/g, '""')}"`,
      r.quantity,
      `"${r.unit || ""}"`,
      `"${(r.indicatorDesc || "").replace(/"/g, '""')}"`,
      `"${r.state}"`,
      `"${r.lga}"`,
      `"${(r.ward || "").replace(/"/g, '""')}"`,
      `"${(r.settlement || "").replace(/"/g, '""')}"`,
      `"${r.locationType}"`,
      `"${r.period}"`,
      `"${r.status}"`,
      `"${r.startDate || ""}"`,
      `"${r.endDate || ""}"`,
      `"${r.populationGroup}"`,
      r.pwd || 0,
      r.men,
      r.women,
      r.boys,
      r.girls,
      r.total,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `WASH_5W_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSystemConfig = (cfg: Partial<SystemConfig>) => {
    const updated = { ...systemConfig, ...cfg };
    setSystemConfig(updated);
    saveSettingsToDb({ systemConfig: updated });
  };

  const updateReportingConfig = (config: Partial<ReportingConfig>) => {
    const updated = { ...reportingConfig, ...config };
    setReportingConfig(updated);
    saveSettingsToDb({ reportingConfig: updated });
  };

  const exportSettingsJson = () => {
    const payload = {
      systemConfig,
      reportingConfig,
      activityCategories,
      units,
      locationTypes,
      populationGroups,
      states,
      lgasByState,
      wardsByLga,
      resources,
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WASH_Sector_Configuration_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAllSettingsToDefault = () => {
    setSystemConfig(DEFAULT_SYSTEM_CONFIG);
    setReportingConfig({
      activeCycle: "2026-08",
      deadlineDate: "2026-09-12",
      isFreezeActive: false,
      notes: "August 2026 monthly reporting round for Borno, Adamawa, and Yobe states.",
    });
    setActivityCategories(ACTIVITY_CATEGORIES);
    setUnits(UNITS);
    setLocationTypes(LOCATION_TYPES);
    setPopulationGroups(POPULATION_GROUPS);
    setStates(["Borno", "Adamawa", "Yobe"]);
    setLgasByState(LGA_BY_STATE);
    setWardsByLga(INITIAL_WARDS_BY_LGA);
    setResources(DEFAULT_RESOURCES);

    saveSettingsToDb({
      systemConfig: DEFAULT_SYSTEM_CONFIG,
      reportingConfig: {
        activeCycle: "2026-08",
        deadlineDate: "2026-09-12",
        isFreezeActive: false,
        notes: "August 2026 monthly reporting round for Borno, Adamawa, and Yobe states.",
      },
      activityCategories: ACTIVITY_CATEGORIES,
      units: UNITS,
      locationTypes: LOCATION_TYPES,
      populationGroups: POPULATION_GROUPS,
      states: ["Borno", "Adamawa", "Yobe"],
      lgasByState: LGA_BY_STATE,
      wardsByLga: INITIAL_WARDS_BY_LGA,
    });
  };

  const addCategory = (category: string) => {
    if (!category.trim()) return;
    setActivityCategories((prev) => {
      if (prev.some((c) => c.category.toLowerCase() === category.toLowerCase())) return prev;
      const updated = [...prev, { category: category.trim(), activities: [] }];
      saveSettingsToDb({ activityCategories: updated });
      return updated;
    });
  };

  const addActivity = (category: string, activity: string) => {
    if (!activity.trim()) return;
    setActivityCategories((prev) => {
      const updated = prev.map((c) => {
        if (c.category.toLowerCase() === category.toLowerCase()) {
          if (c.activities.some((a) => a.toLowerCase() === activity.toLowerCase())) return c;
          return { ...c, activities: [...c.activities, activity.trim()] };
        }
        return c;
      });
      saveSettingsToDb({ activityCategories: updated });
      return updated;
    });
  };

  const removeActivity = (category: string, activity: string) => {
    setActivityCategories((prev) => {
      const updated = prev.map((c) => {
        if (c.category.toLowerCase() === category.toLowerCase()) {
          return { ...c, activities: c.activities.filter((a) => a !== activity) };
        }
        return c;
      });
      saveSettingsToDb({ activityCategories: updated });
      return updated;
    });
  };

  const addUnit = (unit: string) => {
    if (!unit.trim()) return;
    setUnits((prev) => {
      if (prev.some((u) => u.toLowerCase() === unit.toLowerCase())) return prev;
      const updated = [...prev, unit.trim()];
      saveSettingsToDb({ units: updated });
      return updated;
    });
  };

  const removeUnit = (unit: string) => {
    setUnits((prev) => {
      const updated = prev.filter((u) => u !== unit);
      saveSettingsToDb({ units: updated });
      return updated;
    });
  };

  const addLocationType = (locType: string) => {
    if (!locType.trim()) return;
    setLocationTypes((prev) => {
      if (prev.some((l) => l.toLowerCase() === locType.toLowerCase())) return prev;
      const updated = [...prev, locType.trim()];
      saveSettingsToDb({ locationTypes: updated });
      return updated;
    });
  };

  const removeLocationType = (locType: string) => {
    setLocationTypes((prev) => {
      const updated = prev.filter((l) => l !== locType);
      saveSettingsToDb({ locationTypes: updated });
      return updated;
    });
  };

  const addPopulationGroup = (group: string) => {
    if (!group.trim()) return;
    setPopulationGroups((prev) => {
      if (prev.some((g) => g.toLowerCase() === group.toLowerCase())) return prev;
      const updated = [...prev, group.trim()];
      saveSettingsToDb({ populationGroups: updated });
      return updated;
    });
  };

  const removePopulationGroup = (group: string) => {
    setPopulationGroups((prev) => {
      const updated = prev.filter((g) => g !== group);
      saveSettingsToDb({ populationGroups: updated });
      return updated;
    });
  };

  // Location Hierarchy Handlers
  const addState = (stateName: string) => {
    const trimmed = stateName.trim();
    if (!trimmed) return;
    if (states.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    const updatedStates = [...states, trimmed];
    const updatedLgas = { ...lgasByState, [trimmed]: [] };
    setStates(updatedStates);
    setLgasByState(updatedLgas);
    saveSettingsToDb({ states: updatedStates, lgasByState: updatedLgas });
  };

  const removeState = (stateName: string) => {
    const updatedStates = states.filter((s) => s.toLowerCase() !== stateName.toLowerCase());
    setStates(updatedStates);
    saveSettingsToDb({ states: updatedStates });
  };

  const getLgasForState = (stateName: string): string[] => {
    if (lgasByState[stateName]) return lgasByState[stateName];
    const match = Object.keys(lgasByState).find((k) => k.toLowerCase() === stateName.toLowerCase());
    return match ? lgasByState[match] : [];
  };

  const addLga = (stateName: string, lgaName: string) => {
    const trimmed = lgaName.trim();
    if (!trimmed) return;
    setLgasByState((prev) => {
      const key = Object.keys(prev).find((k) => k.toLowerCase() === stateName.toLowerCase()) || stateName;
      const existing = prev[key] || [];
      if (existing.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = {
        ...prev,
        [key]: [...existing, trimmed],
      };
      saveSettingsToDb({ lgasByState: updated });
      return updated;
    });
  };

  const removeLga = (stateName: string, lgaName: string) => {
    setLgasByState((prev) => {
      const key = Object.keys(prev).find((k) => k.toLowerCase() === stateName.toLowerCase()) || stateName;
      const updated = {
        ...prev,
        [key]: (prev[key] || []).filter((l) => l.toLowerCase() !== lgaName.toLowerCase()),
      };
      saveSettingsToDb({ lgasByState: updated });
      return updated;
    });
  };

  const getWardsForLga = (stateName: string, lgaName: string): string[] => {
    const compositeKey = `${stateName}_${lgaName}`;
    if (wardsByLga[compositeKey] && wardsByLga[compositeKey].length > 0) {
      return wardsByLga[compositeKey];
    }
    if (wardsByLga[lgaName] && wardsByLga[lgaName].length > 0) {
      return wardsByLga[lgaName];
    }
    const matchKey = Object.keys(wardsByLga).find((k) => k.toLowerCase() === lgaName.toLowerCase());
    if (matchKey && wardsByLga[matchKey].length > 0) {
      return wardsByLga[matchKey];
    }
    return ["Central Ward", "North Ward", "South Ward", "East Ward", "West Ward"];
  };

  const addWard = (stateName: string, lgaName: string, wardName: string) => {
    const trimmed = wardName.trim();
    if (!trimmed) return;
    const compositeKey = `${stateName}_${lgaName}`;
    setWardsByLga((prev) => {
      const existing = prev[compositeKey] || prev[lgaName] || [];
      if (existing.some((w) => w.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...existing, trimmed];
      const newMap = {
        ...prev,
        [compositeKey]: updated,
        [lgaName]: updated,
      };
      saveSettingsToDb({ wardsByLga: newMap });
      return newMap;
    });
  };

  const removeWard = (stateName: string, lgaName: string, wardName: string) => {
    const compositeKey = `${stateName}_${lgaName}`;
    setWardsByLga((prev) => {
      const existing = prev[compositeKey] || prev[lgaName] || [];
      const updated = existing.filter((w) => w.toLowerCase() !== wardName.toLowerCase());
      const newMap = {
        ...prev,
        [compositeKey]: updated,
        [lgaName]: updated,
      };
      saveSettingsToDb({ wardsByLga: newMap });
      return newMap;
    });
  };

  // Resource Centre CRUD
  const addResource = async (resData: Partial<TechnicalResource>): Promise<boolean> => {
    try {
      const meta = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null;
      const csrf = meta ? meta.getAttribute("content") || "" : "";
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify(resData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.resource) {
        setResources((prev) => [data.resource, ...prev]);
        return true;
      }
    } catch (err) {
      console.warn("Backend addResource failed, updating local state:", err);
    }
    const localNew: TechnicalResource = {
      id: "doc_" + Date.now(),
      title: resData.title || "Technical Document",
      category: resData.category || "General",
      format: resData.format || "PDF",
      size: resData.size || "1.5 MB",
      badge_color: resData.badge_color || "#12707E",
      description: resData.description || "",
      highlights: resData.highlights || [],
      file_name: resData.file_name || "document.pdf",
      file_url: resData.file_url || "#",
      is_published: resData.is_published ?? true,
      sort_order: resData.sort_order ?? 0,
    };
    setResources((prev) => [localNew, ...prev]);
    return true;
  };

  const updateResource = async (id: string | number, resData: Partial<TechnicalResource>): Promise<boolean> => {
    try {
      const meta = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null;
      const csrf = meta ? meta.getAttribute("content") || "" : "";
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify(resData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.resource) {
        setResources((prev) => prev.map((r) => (String(r.id) === String(id) ? data.resource : r)));
        return true;
      }
    } catch (err) {
      console.warn("Backend updateResource failed, updating local state:", err);
    }
    setResources((prev) => prev.map((r) => (String(r.id) === String(id) ? { ...r, ...resData } : r)));
    return true;
  };

  const deleteResource = async (id: string | number): Promise<boolean> => {
    setResources((prev) => prev.filter((r) => String(r.id) !== String(id)));
    try {
      const meta = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null;
      const csrf = meta ? meta.getAttribute("content") || "" : "";
      await fetch(`/api/resources/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
      });
    } catch (err) {
      console.warn("Backend deleteResource failed:", err);
    }
    return true;
  };

  const totalReports = reports.length;
  const totalBeneficiaries = reports.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
  const totalPartners = new Set(reports.map((r) => r.orgName.trim()).filter(Boolean)).size;
  const totalLgas = new Set(reports.filter((r) => r.lga).map((r) => `${r.state}|${r.lga}`)).size;

  return (
    <WashDataContext.Provider
      value={{
        reports,
        addReport,
        submitBatchReports,
        updateReport,
        deleteReport,
        exportCsv,
        resetToSampleData,
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
        stats: {
          totalReports,
          totalBeneficiaries,
          totalPartners,
          totalLgas,
        },
      }}
    >
      {children}
    </WashDataContext.Provider>
  );
};

export const useWashData = (): WashDataContextType => {
  const context = useContext(WashDataContext);
  if (!context) {
    throw new Error("useWashData must be used within a WashDataProvider");
  }
  return context;
};
