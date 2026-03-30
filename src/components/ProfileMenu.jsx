import { useNavigate } from "react-router-dom";
import { LogOut, User, Phone, Shield, Crown, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetProfileQuery } from "../store/Api/profileApi";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  
  const { data: profileData, isLoading } = useGetProfileQuery();

  // ✅ Get adminUser from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("adminUser");
    navigate("/", { replace: true });
  };

  const displayUser = profileData?.user || adminUser;
  const subscription = profileData?.subscription;

  return (
    <div className="w-72 bg-white rounded-2xl shadow-xl border p-5 z-50">

      {/* User Info Section */}
      <div className="border-b pb-4 mb-4">
        <div className="flex items-center gap-3 text-gray-800 mb-2">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-md leading-tight">
              {displayUser?.name || "Admin"}
            </h3>
            <span className="text-xs text-gray-500">@{displayUser?.username || "admin"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Shield size={16} className="text-gray-400" />
            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-md text-xs">{displayUser?.role?.replace("_", " ") || "No Role"}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Phone size={16} className="text-gray-400" />
            <span>{displayUser?.phone || "-"}</span>
          </div>
        </div>
      </div>

      {/* Subscription Section (Only if available) */}
      {subscription && (
        <div className="mb-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2 text-orange-600 font-semibold text-sm">
            <Crown size={16} />
            <h4>Subscription</h4>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900">{subscription.planName}</p>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {subscription.status}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                <CalendarClock size={12} />
                {subscription.daysRemaining} days left
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-500 text-left rounded-xl transition"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default ProfileMenu;