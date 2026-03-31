import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="fixed lg:sticky lg:top-0 lg:h-screen z-40">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-20 bg-white">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
        </div>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
