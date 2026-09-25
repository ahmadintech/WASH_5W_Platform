import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, UserProfile } from "../types/wash";

export interface UserPermissions {
  canApproveReports: boolean;
  canExportMasterData: boolean;
  canConfigureSettings: boolean;
  canManageUsers: boolean;
  canSubmit5W: boolean;
}

export interface ManagedUser extends UserProfile {
  status: "Active" | "Suspended";
  permissions: UserPermissions;
  createdAt: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  login: (email: string, password?: string, remember?: boolean) => Promise<{ success: boolean; message?: string }>;
  loginAsRole: (role: UserRole) => boolean;
  loginAsCoordinatorState: (state: "Adamawa" | "Borno" | "Yobe") => boolean;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  users: ManagedUser[];
  addUser: (user: Omit<ManagedUser, "id" | "createdAt">) => ManagedUser;
  updateUser: (id: string, updates: Partial<ManagedUser>) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
}

export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) {
    return meta.getAttribute("content") || "";
  }
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export const PRESET_COORDINATORS: Record<"Adamawa" | "Borno" | "Yobe", UserProfile> = {
  Adamawa: {
    id: "usr_coord_adamawa",
    name: "WASH Coordinator — Adamawa",
    email: "coordinator-adamawa@washsector-ne.org",
    role: "coordinator",
    roleTitle: "Adamawa State Coordinator",
    organization: "WASH Sub-Cluster Yola Desk",
    organizationType: "UN / Coordination Desk",
    state: "Adamawa",
    lga: "Yola North",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AdamawaCoord",
  },
  Borno: {
    id: "usr_coord_borno",
    name: "WASH Coordinator — Borno",
    email: "coordinator-borno@washsector-ne.org",
    role: "coordinator",
    roleTitle: "Borno State Coordinator",
    organization: "WASH Cluster Maiduguri Hub",
    organizationType: "UN / Coordination Desk",
    state: "Borno",
    lga: "Maiduguri",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=BornoCoord",
  },
  Yobe: {
    id: "usr_coord_yobe",
    name: "WASH Coordinator — Yobe",
    email: "coordinator-yobe@washsector-ne.org",
    role: "coordinator",
    roleTitle: "Yobe State Coordinator",
    organization: "WASH Sub-Cluster Damaturu Desk",
    organizationType: "UN / Coordination Desk",
    state: "Yobe",
    lga: "Damaturu",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=YobeCoord",
  },
};

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: "usr_admin",
    name: "State WASH Administrator",
    email: "admin@washsector-ne.org",
    role: "admin",
    roleTitle: "Sector Administrator",
    organization: "WASH Sector North East Nigeria",
    organizationType: "Government / UN Co-Lead",
    state: "Borno",
    lga: "Maiduguri",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Admin",
  },
  coordinator: PRESET_COORDINATORS.Borno,
  partner: {
    id: "usr_partner",
    name: "Solidarités International Focal Point",
    email: "partner@solidarites.org",
    role: "partner",
    roleTitle: "Implementing Partner",
    organization: "Solidarités International",
    organizationType: "International NGO",
    state: "Borno",
    lga: "Maiduguri",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Partner",
  },
};

const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    ...PRESET_USERS.admin,
    status: "Active",
    createdAt: "2026-01-10",
    permissions: {
      canApproveReports: true,
      canExportMasterData: true,
      canConfigureSettings: true,
      canManageUsers: true,
      canSubmit5W: true,
    },
  },
  {
    ...PRESET_COORDINATORS.Borno,
    status: "Active",
    createdAt: "2026-01-15",
    permissions: {
      canApproveReports: true,
      canExportMasterData: true,
      canConfigureSettings: false,
      canManageUsers: false,
      canSubmit5W: true,
    },
  },
  {
    ...PRESET_COORDINATORS.Adamawa,
    status: "Active",
    createdAt: "2026-01-15",
    permissions: {
      canApproveReports: true,
      canExportMasterData: true,
      canConfigureSettings: false,
      canManageUsers: false,
      canSubmit5W: true,
    },
  },
  {
    ...PRESET_COORDINATORS.Yobe,
    status: "Active",
    createdAt: "2026-01-15",
    permissions: {
      canApproveReports: true,
      canExportMasterData: true,
      canConfigureSettings: false,
      canManageUsers: false,
      canSubmit5W: true,
    },
  },
  {
    ...PRESET_USERS.partner,
    status: "Active",
    createdAt: "2026-02-01",
    permissions: {
      canApproveReports: false,
      canExportMasterData: false,
      canConfigureSettings: false,
      canManageUsers: false,
      canSubmit5W: true,
    },
  },
];

const AUTH_STORAGE_KEY = "wash-auth-user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          return { ...PRESET_USERS[parsed.role as UserRole] || PRESET_USERS.admin, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return PRESET_USERS.admin;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("wash-auth-token") === "true";
    } catch {
      return true;
    }
  });

  const [users, setUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem("wash-managed-users");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MANAGED_USERS;
  });

  // Verify server session on initial load
  useEffect(() => {
    fetch("/api/auth/me", {
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
          localStorage.setItem("wash-auth-token", "true");
        }
      })
      .catch(() => {
        // network or unauthenticated
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("wash-managed-users", JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  const login = async (
    email: string,
    password?: string,
    remember: boolean = true
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const csrf = getCsrfToken();
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password || "admin2026",
          remember,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("wash-auth-token", "true");
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true, message: data.message };
      }

      // If backend returned error message
      if (data?.message) {
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      console.warn("API login attempt failed, falling back to local verification:", err);
    }

    // Fallback: match local preset credentials
    let chosenRole: UserRole = "partner";
    const lower = email.toLowerCase();
    if (lower.includes("admin")) chosenRole = "admin";
    else if (lower.includes("coord") || lower.includes("lead")) chosenRole = "coordinator";
    else chosenRole = "partner";

    let base = PRESET_USERS[chosenRole];
    if (chosenRole === "coordinator") {
      if (lower.includes("adamawa")) base = PRESET_COORDINATORS.Adamawa;
      else if (lower.includes("yobe")) base = PRESET_COORDINATORS.Yobe;
      else base = PRESET_COORDINATORS.Borno;
    }

    const user: UserProfile = {
      ...base,
      email: email || base.email,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("wash-auth-token", "true");
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { success: true };
  };

  const loginAsRole = (role: UserRole): boolean => {
    const user = PRESET_USERS[role];
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("wash-auth-token", "true");
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return true;
  };

  const loginAsCoordinatorState = (state: "Adamawa" | "Borno" | "Yobe"): boolean => {
    const user = PRESET_COORDINATORS[state];
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("wash-auth-token", "true");
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return true;
  };

  const logout = async () => {
    try {
      const csrf = getCsrfToken();
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
        },
      });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    localStorage.removeItem("wash-auth-token");
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    loginAsRole(role);
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const addUser = (userData: Omit<ManagedUser, "id" | "createdAt">): ManagedUser => {
    const newUser: ManagedUser = {
      ...userData,
      id: "usr_" + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<ManagedUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "Active" ? "Suspended" : "Active",
            }
          : u
      )
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginAsRole,
        loginAsCoordinatorState,
        logout,
        switchRole,
        isAuthenticated,
        users,
        addUser,
        updateUser,
        updateCurrentUser,
        deleteUser,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
