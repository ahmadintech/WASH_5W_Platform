import React, { useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [activeDropdown, setActiveDropdown] = useState<"notifications" | "user" | null>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
      <div className="flex items-center justify-between w-full px-3 sm:px-4 lg:px-6">
        {/* Left: Sidebar toggle + Search */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Search bar (Desktop) */}
          <div className="hidden lg:block">
            <div className="relative">
              <span className="absolute -translate-y-1/2 pointer-events-none left-3.5 top-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search 5W indicators, partners, LGAs..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-12 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 xl:w-[360px]"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle + Notifications + User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton />
          <NotificationDropdown
            isOpen={activeDropdown === "notifications"}
            onToggle={() => setActiveDropdown((prev) => (prev === "notifications" ? null : "notifications"))}
            onClose={() => setActiveDropdown(null)}
          />
          <UserDropdown
            isOpen={activeDropdown === "user"}
            onToggle={() => setActiveDropdown((prev) => (prev === "user" ? null : "user"))}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
