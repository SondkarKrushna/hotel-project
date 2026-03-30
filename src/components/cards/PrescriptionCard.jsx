import { User, Stethoscope, CalendarDays, Eye } from "lucide-react";
import ViewPrescriptionCard from "./ViewPrescriptionCard";

const PrescriptionCard = ({
  patientName,
  age,
  gender,
  doctorName,
  lastVisit,
  nextVisit,
  activeTab,
  onView,
}) => {
  return (
    <>
    <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="  rounded-lg p-2 bg-[#2D9AD957] flex items-center justify-center">
          <img src=".././images/profile.png" alt="" />
        </div>
        <div>
          <p className="font-medium text-sm">{patientName}</p>
          <p className="text-xs text-gray-500">
            {age} Y • {gender}
          </p>
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-2 text-xs text-gray-600 mb-4">

        <div className="flex items-center gap-2">
          <img src=".././images/fontisto_doctor.png" alt="" />
          <span>{doctorName}</span>
        </div>

        <div className="flex items-center gap-2">
          <img src=".././images/calender1.png" alt="" />
          <span>Last Visit : {lastVisit}</span>
        </div>

        <div className="flex items-center gap-2">
          <img src=".././images/ion_time.png" alt="" />
          <span>Next Visit : {nextVisit}</span>
        </div>

      </div>

      {/* Action Button */}
      <button
        onClick={onView}
        className="w-full bg-[#2D9AD9] hover:bg-[#2388c4] text-white text-xs py-2 rounded-lg flex items-center justify-center gap-2"
      >
        <Eye />
        {activeTab === "invoice" ? "View Invoice" : "View Prescription"}
      </button>


    </div>

    </>

  );
};

export default PrescriptionCard;
