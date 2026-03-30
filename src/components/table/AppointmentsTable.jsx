import React from "react";
import { Link } from "react-router-dom";
const AppointmentsTable = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">
            Today’s Appointments
          </h2>
          <p className="text-xs text-gray-500">
            Manage your schedule for today
          </p>
        </div>


        <button className="bg-[#2D9AD8] hover:bg-[#1EAAAC] text-white text-xs px-4 py-2 font-semibold rounded-md">
          <Link to="/appointments">View All</Link>
        </button>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="py-10 text-center text-lg font-semibold text-black">
            No data found
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white text-sm font-semibold flex items-center justify-center">
                  {item.initials}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">
                  {item.time}
                </div>

                <span
                  className={`px-3 py-1 rounded-md text-xs font-medium ${item.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                    }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
export default AppointmentsTable;
