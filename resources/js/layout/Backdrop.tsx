import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 top-16 z-30 bg-gray-900/60 backdrop-blur-xs lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
