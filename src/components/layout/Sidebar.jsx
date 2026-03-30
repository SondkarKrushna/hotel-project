import { useState, useMemo } from "react";
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
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slice/authSlice";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userRole = useMemo(() => {
      const user = JSON.parse(localStorage.getItem("adminUser"));
      return user?.role;
    }, []);
    const isAdmin = userRole === "HOTEL_ADMIN";

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
   ...(!isAdmin
    ? [
        {
          name: "Hotels",
          icon: Hotel,
          link: "/allhotels",
        },
        {
          name: "Subscriptions",
          icon: Layers ,
          link: "/subscriptions",
        },
      ]
    : []),
    {
      name: "Staff",
      icon: UserCog,
      link: "/staff",
    },
    // {
    //   name: "Users",
    //   icon: Users,
    //   link: "/users",
    //   name: "Revenue",
    //   icon: IndianRupee,
    //   link: "/totalrevenue",
    // },
    // {
    //   name: "Food Menu",
    //   icon: UtensilsCrossed,
    //   link: "/menu",
    // },
  ];

  return (
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
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <NavLink
          to={`/dashboard`}
          end
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center ${collapsed ? "justify-center" : "gap-3"
            } px-4 py-2 rounded-lg text-sm transition
            ${isActive
              ? "bg-[#0d1827] text-white"
              : "text-[#0d1827] hover:bg-[#0d1827b5] hover:text-white"
            }`
          }
          title={collapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard size={20} />

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
                `flex items-center ${collapsed ? "justify-center" : "gap-3"
                } px-4 py-2 rounded-lg text-sm transition
                ${isActive
                  ? "bg-[#0d1827] text-white"
                  : "text-[#0d1827] hover:bg-[#0d1827b5] hover:text-white"
                }`
              }
              title={collapsed ? item.name : ""}
            >
              <Icon size={20} />

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

      {/* Logout */}
      {/* <div className="px-2 mt-4">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"
            } px-4 py-2 rounded-lg text-sm transition
          text-red-600 hover:bg-red-50`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={20} />

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="logout-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div> */}
    </motion.aside>
  );
};

export default Sidebar;
