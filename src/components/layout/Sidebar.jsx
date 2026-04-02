import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  FolderTree,
  UtensilsCrossed,
  Hotel,
  UserCog,
  Users,
  Menu,
  Layers,
  X,
  LogOut,
  IndianRupee,
  Download,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slice/authSlice";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userRole = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return user?.role;
  }, []);
  const isAdmin = userRole === "HOTEL_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    dispatch(logout());
    setIsOpen(false);

    toast.success("Logged out successfully 👋");

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
  };

  const menuItems = [
    ...(!isSuperAdmin
      ? [
          {
            name: "Orders",
            icon: ShoppingCart,
            link: "/myorders",
          },
          {
            name: "Categories",
            icon: FolderTree,
            link: "/category",
          },
          {
            name: "Dishes",
            icon: UtensilsCrossed,
            link: "/dishes",
          },
        ]
      : []),
    ...(!isAdmin
      ? [
        {
          name: "Hotels",
          icon: Hotel,
          link: "/allhotels",
        },
      ]
      : []),
    {
      name: "Staff",
      icon: UserCog,
      link: "/staff",
    },

    // 👇 move subscriptions here
    ...(!isAdmin
      ? [
        {
          name: "Subscriptions",
          icon: Layers,
          link: "/subscriptions",
        },
      ]
      : []),
  ];

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          fixed inset-y-0 left-0
          ${collapsed ? "w-20" : "w-64"}
          bg-white border-r border-gray-200
          z-50 lg:z-40 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between text-[#0d1827]">
          <div className="flex items-center gap-2 overflow-hidden">
            <AnimatePresence>
              {!collapsed && (
                <motion.img
                  key="logo"
                  src="/images/logo_1.png"
                  alt="Tech Surya"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-36"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-md
                text-gray-500 hover:text-gray-500 hover:bg-gray-100 transition"
            >
              <Menu size={22} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-800"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 overflow-hidden">
          {/* Dashboard */}
          <NavLink
            to={`/dashboard`}
            end
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center ${collapsed ? "justify-center" : "gap-3"
              } px-4 py-2 rounded-lg text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm
              ${isActive
                ? "bg-[#0d1827] text-white"
                : "text-[#0d1827] hover:bg-[#0d1827b5] hover:text-white"
              }`
            }
            title={collapsed ? "Dashboard" : ""}
          >
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform duration-200" />

            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  key="dashboard-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>

          {/* Dynamic Menu */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.link}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center ${collapsed ? "justify-center" : "gap-3"
                  } px-4 py-2 rounded-lg text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm
                  ${isActive
                    ? "bg-[#0d1827] text-white"
                    : "text-[#0d1827] hover:bg-[#0d1827b5] hover:text-white"
                  }`
                }
                title={collapsed ? item.name : ""}
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Download App (Admins only) */}
        {isAdmin && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className={`w-full group flex items-center ${collapsed ? "justify-center" : "gap-3"
                } px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 hover:from-blue-100 hover:to-indigo-100 transition-all hover:-translate-y-0.5 hover:shadow-sm border border-indigo-100 font-medium`}
              title={collapsed ? "Download App" : ""}
            >
              <Download size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    Download App
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </motion.aside>

      {/* QR Code Modal — rendered via portal to document.body for true full-screen */}
      {isQrModalOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
              <Download size={32} />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Download Our App
            </h3>
            <p className="text-gray-500 text-center mb-8 px-4 leading-relaxed">
              Scan the QR code below to install the hotel management app directly on your mobile device.
            </p>

            <div className="bg-white p-5 rounded-2xl shadow-inner border-2 border-dashed border-gray-200 transition-transform hover:scale-105 duration-300">
              <QRCodeCanvas
                value="https://www.google.com"
                size={220}
                bgColor="#ffffff"
                fgColor="#0B1F3A"
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="mt-8 text-sm font-medium text-indigo-700 bg-indigo-50 px-5 py-2 rounded-full shadow-sm">
              Available for Android
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Sidebar;
