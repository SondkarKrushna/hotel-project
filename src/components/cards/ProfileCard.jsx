import React from "react";
import { Mail, Phone, Pencil } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ProfileCard = ({
  type = "patient",
  idValue,
  image,
  name,
  subtitle,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  profileId,
  onEdit,
  email,
  phone,
}) => {
  const location = useLocation();
  const isDoctor = location.pathname.startsWith("/doctor");
  const basePath = isDoctor ? "/doctor" : "/receptionist";

  const profileLink = `${basePath}/${type}-details/${profileId}`;

  return (
    <Link to={profileLink} className="block">
      <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition cursor-pointer">

        {/* Top Section */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
            #{idValue}
          </span>

          {type === "patient" && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="bg-[#CC25B0] text-white p-2 rounded hover:opacity-90"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center text-center mb-4">
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-full object-cover mb-2 border"
          />
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        {/* Stats */}
        <div className="flex border rounded border-gray-100 overflow-hidden mb-4">
          <div className="flex-1 text-center py-2">
            <p className="font-semibold text-sm">{leftLabel}</p>
            <p className="text-sm text-gray-500">{leftValue}</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex-1 text-center py-2">
            <p className="font-semibold text-sm">{rightLabel}</p>
            <p className="text-sm text-gray-500">{rightValue}</p>
          </div>
        </div>

        {/* Doctor Info */}
        {type === "doctor" && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2D9AD9]" />
              <p>{email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2D9AD9]" />
              <p>{phone}</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProfileCard;
