import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, Navigate, OutletProvider } from "../utils/react-router-inertia-bridge";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useAuth } from "../context/AuthContext";

const LayoutContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[270px]" : "lg:ml-[86px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <OutletProvider>{children || <Outlet />}</OutletProvider>
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;
