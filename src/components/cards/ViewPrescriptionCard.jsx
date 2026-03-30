import React from "react";
import { Mail, Phone, MapPin, Printer, Download, Share2 } from "lucide-react";

const ViewPrescriptionCard = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  const medicines = [
    {
      name: "Metformin 500mg",
      qty: 30,
      morning: 0,
      afternoon: 1,
      night: 1,
    },
    {
      name: "Metformin 500mg",
      qty: 10,
      morning: 0,
      afternoon: 1,
      night: 1,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-hidden">

      <div className="flex flex-col max-h-[90vh] overflow-y-auto py-10 hide-scrollbar">

        <div className="bg-white w-full max-w-[794px] h-[890px] rounded-2xl relative flex flex-col shadow-xl">

          <div className="absolute top-0 left-0 w-full h-48 pointer-events-none z-0">
            <img
              src=".././images/invoice1.png"
              alt=""
              className="absolute top-0 left-0 w-[420px]"
            />
            <img src=".././images/invoice2.png" alt="" className="absolute top-10 left-2/3 -translate-x-1/2 w-16 ml-8" />

            <img
              src=".././images/invoice3.png"
              alt=""
              className="absolute top-0 right-0 w-34"
            />
          </div>

          <button
            onClick={onClose}
            className="absolute bg-gray-100 border-2 border-gray-200 py-2 px-3 top-4 right-4 text-black hover:bg-gray-400 z-20"
          >
            ✕
          </button>

          <div className="px-10 pb-2 relative z-10 flex-1">

            <div className="px-8 pt-32 pb-4 flex justify-between items-start gap-4">
              <div className="grid">
                <img
                  src=".././images/techsuryalogo.png"
                  alt="logo"
                  className="w-28 mb-2"
                />
                <h1 className="text-xl font-semibold mb-3">Prescription</h1>

                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <p className="text-gray-500">Number</p>
                  <p className="font-medium">8653956</p>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">20/10/2025</p>
                </div>
              </div>

              <div className="text-right text-sm leading-5">
                <p className="font-semibold text-green-600 mb-1">To,</p>
                <p className="font-semibold">John Doe</p>
                <p>
                  Golden City Center,<br />
                  chhatrapati 431001
                </p>
                <p className="font-semibold mt-2">+91 4444 855 858</p>
              </div>
            </div>

            <div className="px-8">
              <div className="bg-[#EEF7FF] rounded-2xl p-4 mb-6">

                <div className="grid grid-cols-[2fr_70px_3fr] bg-[#D8ECFB] text-[#2D9AD9] font-medium text-sm rounded-xl px-4 py-2 mb-2">
                  <p className="border-r border-[#5FA9E6]">Medicine</p>
                  <p className="text-center border-r border-[#5FA9E6]">Qty</p>
                  <p className="pl-3">Time</p>
                </div>

                {medicines.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_70px_3fr] px-4 py-2 text-sm"
                  >
                    <p className="border-r border-[#5FA9E6]">
                      {item.name}
                    </p>

                    <p className="text-center border-r border-[#5FA9E6]">
                      {item.qty}
                    </p>

                    <p className="pl-3">
                      Morning : {item.morning} | Afternoon : {item.afternoon} | Night : {item.night}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-sm space-y-1 mb-6">
                <p className="font-semibold">Recommended Tests</p>
                <p className="text-gray-700">Blood report</p>
                <p className="text-gray-700">Blood report</p>
              </div>

              <div className="py-10 flex justify-end">
                <div className="text-center">
                  <div className="border-b border-black w-40 mb-2"></div>
                  <p className="text-sm font-medium">Doctor's Signature</p>
                </div>
              </div>

              <div className="px-4 py-4 text-center text-sm space-y-2 bg-transparent">
                <div className="flex justify-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Phone className="text-[#2D9AD9] w-4" />
                    <span className="font-semibold">+91 8485 222 333</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="text-[#2D9AD9] w-4" />
                    <span className="font-semibold">john@gmail.com</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-start gap-2 max-w-md">
                    <MapPin className="text-white bg-[#2D9AD9] rounded-full p-1 w-5 mt-1" />
                    <span className="font-semibold">
                      golden city center , chhatrapati sambhajinager
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="relative">
            <img
              src=".././images/invoice5.png"
              alt=""
              className="absolute left-0 bottom-0 w-[200px]"
            />

            <img
              src=".././images/invoice4.png"
              alt=""
              className="absolute right-0 bottom-0 w-[200px]"
            />
          </div>

        </div>

        <div className="bg-white px-6 py-4 border-t shadow-md">
          <div className="flex flex-col sm:flex-row justify-between gap-4 max-w-[794px] mx-auto">

            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium">
              <Printer className="w-5" />
              Print
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium">
              <Download className="w-5" />
              Download
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium">
              <Share2 className="w-5" />
              Share
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewPrescriptionCard;
