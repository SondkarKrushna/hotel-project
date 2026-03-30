import { useLocation } from "react-router-dom";

const StatCard = ({ icon: Icon, title, value, subtitle, bg, onClick }) => {
  const location = useLocation();
  const isDoctor = location.pathname.startsWith("/doctor");

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3 sm:p-4 border border-gray-200 
      shadow-sm transition h-full flex flex-col justify-between
      ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""}`}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        {Icon && <Icon size={18} className="text-black" />}
 </div>

      {/* Content */}
      <div className="mt-3">
        <h2 className="text-base sm:text-xl font-bold truncate">
          {value}
        </h2>

        <p className="text-gray-600 text-xs sm:text-sm truncate">
          {title}
        </p>

        {subtitle && (
          <p className="text-blue-500 text-xs mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
