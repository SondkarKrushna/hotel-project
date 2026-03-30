const OrderStatCard = ({ title, img, value, percent, icon: Icon,  color, waveimg }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col h-[140px]">
      
      {/* Top Row */}
      <div className="flex justify-between items-start">

        {/* Left: Icon + Text */}
        <div className="flex items-center gap-3">
          {/* Icon Circle */}
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}` }} // light background
          >
            <Icon size={20} className="text-white" />
          </div>

          {/* Title & Value */}
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-md font-semibold leading-tight">{value}</p>
          </div>
        </div>

        {/* Right: Percent Badge */}
        <span
          className={`text-xs font-medium px-2 py-1 rounded-xl ${
            percent.startsWith("+")
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {percent}
        </span>
      </div>

      
    </div>
  );
};

export default OrderStatCard;
