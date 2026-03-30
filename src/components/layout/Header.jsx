import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const role = adminUser?.role;

  // ✅ Get first letter dynamically
  const firstLetter = adminUser?.name
    ? adminUser.name.charAt(0).toUpperCase()
    : "A";

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 py-2 shadow-sm">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>

        <h1
          className="text-lg sm:text-xl font-semibold cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          {role === "SUPER_ADMIN" ? "Super Admin" : "Hotel Admin"}
        </h1>
      </div>

      {/* Right */}
      <div className="relative">
        {/* Dynamic Profile Circle */}
        <div
  onClick={() => navigate("/profile")}
  className="w-10 h-10 rounded-full 
             bg-[#0B1F3A] 
             flex items-center justify-center 
             text-[#C6A75E] 
             font-semibold 
             cursor-pointer shadow-md 
             hover:scale-105 transition"
>
  {firstLetter}
</div>
      </div>
    </header>
  );
};

export default Header;