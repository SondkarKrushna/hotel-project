import { Download } from "lucide-react";

const ListCard = ({ title, buttonlable, href, items, type }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <a href={href} className="text-xs border border-gray-200 px-2 py-1 rounded-lg">
          {buttonlable}
        </a>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-b-0"
          >
            <div className="flex gap-3 items-center">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={item.img}
                  alt={item.name}
                  className=" object-cover"
                />
              </div>

              <div>
                <p className="text-sm font-medium">{item.name}</p>

                {type === "report" && (
                  <p className="text-xs text-gray-500">{item.report}</p>
                )}

                {type === "doctor" && (
                  <p className="text-xs text-gray-500">{item.role}</p>
                )}

                {!type && (
                  <p className="text-xs text-gray-500">
                    {item.date} • {item.time}
                  </p>
                )}
              </div>
            </div>

            {/* Right Side */}
            {type === "doctor" ? (
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  item.status === "Available"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {item.status}
              </span>
            ) : type === "report" ? (
            // <button className="w-8 h-8 ml-1 bg-blue-50 rounded-lg flex items-center justify-center">
            //   <Download className="w-4 h-4 text-black" />
            // </button>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600">
                {item.status}
              </span>

            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600">
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCard;
