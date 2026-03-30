import React from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { CiCircleCheck } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { HiOutlineUserAdd } from "react-icons/hi";

const statusColor = {
  Pending: "bg-orange-100 text-orange-600",
  Completed: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-600",
  Upcoming: "bg-blue-100 text-blue-600",
};

const AppointmentCard = ({
  data,
  onCreatePrescription,
  onApprove,
  onReject,
  onReschedule,
  onTransfer,
}) => {

  const showActions = data.status?.toLowerCase() === "pending";
  const isUpcoming = data?.status?.toLowerCase() === "pending";


  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
            {data?.patientId?.patientName
              ? data.patientId.patientName.charAt(0)
              : "U"}
          </div>

          <div>
            <h3 className="font-semibold text-sm">
              {data?.patientId?.patientName || "Unknown Patient"}
            </h3>
            <p className="text-xs text-gray-500">
              {data?.patientId?.contact || "No Contact"}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs rounded-md font-medium ${statusColor[data.status?.charAt(0).toUpperCase() + data.status?.slice(1)] ||
            "bg-gray-100 text-gray-600"
            }`}
        >
          {data.status}
        </span>
      </div>

      {/* Date & Location */}
      <div className="bg-blue-50 rounded-lg p-3 space-y-2 text-sm mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <FaCalendarAlt className="text-blue-500" />
          <span>
            {data?.appointmentDate
              ? new Date(data.appointmentDate).toLocaleDateString()
              : "No Date"}
          </span>

          <FaClock className="ml-4 text-blue-500" />
          <span>{data?.timeSlot || "No Time"}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FaMapMarkerAlt className="text-blue-500" />
          <span>{data?.location || "No Location"}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <p className="text-xs text-gray-500">Reason For Visit</p>
        <p className="text-sm font-medium">{data?.notes || "No Notes"}</p>
      </div>

      {/* Actions - ONLY FOR PENDING */}
      {showActions && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onApprove}
            className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600"
          >
            <CiCircleCheck /> Approve
          </button>

          <button
            onClick={onReject}
            className="flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600"
          >
            <IoMdTime /> Reject
          </button>

          <button
            onClick={onReschedule}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg text-sm hover:bg-orange-600"
          >
            <GiCancel /> Reschedule
          </button>

          <button
            onClick={onTransfer}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600"
          >
            <HiOutlineUserAdd /> Transfer
          </button>
        </div>
      )}

      {/* Show button only if upcoming */}
      {isUpcoming && (
        <button
          onClick={() => onCreatePrescription(data?.patientId, data)}
          className="w-full bg-[#2D9AD8] text-white text-sm py-2 mt-3 rounded-lg hover:opacity-90"
        >
          Create Appointment
        </button>
      )}
    </div>
  );
};


export default AppointmentCard;
