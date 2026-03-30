import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPrescription } from "../receptionist/api/prescription.api";
import { toast } from "react-toastify";

const PrescriptionDrawer = ({ open, onClose, patientName, patientData, appointmentData }) => {
  const queryClient = useQueryClient();

  const [medicines, setMedicines] = useState([]);

  const [currentMedicine, setCurrentMedicine] = useState({
    medicineName: "",
    quantity: "",
    dosage: "",
    dosageUnit: "",
    frequency: "",
    duration: "",
    timing: "",
    price: "",
  });


  const [recommendedTests, setRecommendedTests] = useState("");
  const [complaints, setComplaints] = useState("");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [currentDiagnosis, setCurrentDiagnosis] = useState("");
  const [diagnosis, setDiagnosis] = useState([]);
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // ------------------ MUTATION ------------------
  const prescriptionMutation = useMutation({
    mutationFn: ({ appointmentId, data }) => createPrescription(appointmentId, data),
    onSuccess: () => {
      toast.success("Prescription created successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      onClose();
    },
    onError: (error) => {
      console.error("Error creating prescription:", error);
      toast.error(
        "Failed to create prescription: " +
        (error.response?.data?.error || error.message)
      );
    },
  });

  // ------------------ RESET FORM ------------------
  const resetForm = () => {
    setMedicines([]);
    setDiagnosis([]);
    setCurrentDiagnosis("");

    setCurrentMedicine({
      medicineName: "",
      quantity: "",
      dosage: "",
      dosageUnit: "",
      frequency: "",
      duration: "",
      timing: "",
      price: ""
    });

    setRecommendedTests("");
    setComplaints("");
    setExaminationFindings("");
    setAdvice("");
    setFollowUpDate("");
  };

  // ------------------ DIAGNOSIS ------------------
  const handleAddDiagnosis = () => {
    if (!currentDiagnosis.trim()) {
      toast.error("Please enter diagnosis");
      return;
    }

    if (diagnosis.includes(currentDiagnosis.trim())) {
      toast.error("Diagnosis already added");
      return;
    }

    setDiagnosis([...diagnosis, currentDiagnosis.trim()]);
    setCurrentDiagnosis("");
  };

  const handleRemoveDiagnosis = (index) => {
    setDiagnosis(diagnosis.filter((_, i) => i !== index));
  };

  // ------------------ MEDICINES ------------------
  const handleAddMedicine = () => {
    if (
      !currentMedicine.medicineName.trim() ||
      !currentMedicine.quantity ||
      !currentMedicine.dosage ||
      !currentMedicine.dosageUnit ||
      !currentMedicine.frequency ||
      !currentMedicine.duration ||
      !currentMedicine.timing
    ) {
      toast.error("Please fill all medicine details");
      return;
    }

    setMedicines([...medicines, currentMedicine]);

    setCurrentMedicine({
      medicineName: "",
      quantity: "",
      dosage: "",
      dosageUnit: "",
      frequency: "",
      duration: "",
      timing: "",
      price: ""
    });
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // ------------------ FORMAT DISPLAY ------------------
  const formatTimeFromFrequency = (frequency) => {
    if (!frequency) return "";
    return `Frequency : ${frequency}`;
  };
  //console.log("Appointment Data in Drawer:", appointmentData);
  // ------------------ PAYLOAD MAPPING ------------------
  const mapMedicinesForPayload = (medicines) =>
    medicines.map((m) => ({
      name: m.medicineName,
      dosage: `${m.dosage} ${m.dosageUnit}`,   // "1 tablet"
      frequency: m.frequency,                 // "BD / TDS / HS"
      duration: `${m.duration} days`,         // "5 days"
      route: "oral",                          // default
      instructions: m.timing || null,         // "after food"
      price: Number(m.price) || 0,            // optional
      quantity: Number(m.quantity),
    }));


  // ------------------ SUBMIT ------------------
  const handleSubmitPrescription = () => {
    if (!patientData?._id) {
      toast.error("Patient data missing");
      return;
    }

    if (!appointmentData?.hospital) {
      toast.error("Hospital missing");
      return;
    }

    if (!appointmentData?.doctorId) {
      toast.error("Doctor missing");
      return;
    }

    if (!appointmentData?._id) {
      toast.error("Appointment missing");
      return;
    }

    if (medicines.length === 0) {
      toast.error("Add at least one medicine");
      return;
    }

    const payload = {
      complaints,
      examinationFindings,
      diagnosis,

      vitals: {
        bp: patientData?.bloodPressure || "",
        pulse: patientData?.pulse || "",
        temp: patientData?.temperature || "",
        spo2: patientData?.spo2 || "",
        weight: patientData?.weight || "",
        height: patientData?.height || "",
      },

      medicines: mapMedicinesForPayload(medicines),

      recommendedTests: recommendedTests
        ? recommendedTests.split(",").map((t) => t.trim()).filter(Boolean)
        : [],

      advice,

      followUp: followUpDate
        ? {
          date: followUpDate,
          note: "Review if symptoms persist",
        }
        : null,
    };



    prescriptionMutation.mutate({
      appointmentId: appointmentData._id,
      data: payload,
    });

    //console.log("Submitting Prescription with payload:", payload);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full lg:w-[550px] bg-white z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-[20px]">Create Prescription</h2>

          <button
            onClick={onClose}
            className="absolute bg-gray-100 border-2 border-gray-200 py-2 px-3 top-4 right-4 text-black hover:bg-gray-300 z-20 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-5 overflow-y-auto h-[calc(100vh-120px)]">
          {/* Patient */}
          <div>
            <label className="text-sm font-semibold block mb-1">Patient</label>
            <input
              type="text"
              value={patientName || ""}
              disabled
              className="w-full bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              placeholder="Patient name will appear here"
            />
          </div>

          <hr className="border-gray-300" />

          {/* Medicines */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Add Medicines
            </label>

            <input
              type="text"
              placeholder="Medicine name"
              value={currentMedicine.medicineName}
              onChange={(e) =>
                setCurrentMedicine({
                  ...currentMedicine,
                  medicineName: e.target.value,
                })
              }
              className="w-full bg-gray-100 rounded-lg px-3 py-4 text-sm mb-3 outline-none"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                placeholder="Quantity"
                value={currentMedicine.quantity}
                onChange={(e) =>
                  setCurrentMedicine({
                    ...currentMedicine,
                    quantity: e.target.value,
                  })
                }
                className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              />

              <input
                type="text"
                placeholder="Frequency (e.g., twice daily)"
                value={currentMedicine.frequency}
                onChange={(e) =>
                  setCurrentMedicine({
                    ...currentMedicine,
                    frequency: e.target.value,
                  })
                }
                className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Dosage"
                value={currentMedicine.dosage}
                onChange={(e) =>
                  setCurrentMedicine({
                    ...currentMedicine,
                    dosage: e.target.value,
                  })
                }
                className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              />

              <select
                value={currentMedicine.dosageUnit}
                onChange={(e) =>
                  setCurrentMedicine({
                    ...currentMedicine,
                    dosageUnit: e.target.value,
                  })
                }
                className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              >
                <option value="">Dosage Unit</option>
                <option value="tablet">tablet</option>
                <option value="capsule">capsule</option>
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="puff">puff</option>
                <option value="drops">drops</option>
                <option value="unit">unit</option>
                <option value="patch">patch</option>
                <option value="other">other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                placeholder="Duration in days"
                value={currentMedicine.duration}
                onChange={(e) =>
                  setCurrentMedicine({
                    ...currentMedicine,
                    duration: e.target.value,
                  })
                }
                className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              />

              <select
                value={currentMedicine.timing}
                onChange={(e) =>
                  setCurrentMedicine({
                    ...currentMedicine,
                    timing: e.target.value,
                  })
                }
                className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
              >
                <option value="">Timing</option>
                <option value="before food">before food</option>
                <option value="after food">after food</option>
                <option value="with food">with food</option>
                <option value="empty stomach">empty stomach</option>
                <option value="anytime">anytime</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="Price"
              value={currentMedicine.price || ""}
              onChange={(e) =>
                setCurrentMedicine({
                  ...currentMedicine,
                  price: e.target.value,
                })
              }
              className="bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
            />


            <button
              onClick={handleAddMedicine}
              className="w-full mt-2 bg-[#2D9AD9] text-white py-4 rounded-lg text-sm font-medium hover:opacity-90"
            >
              + Add Medicine
            </button>
          </div>

          {/* Added Medicines */}
          {medicines.length > 0 && (
            <div className="space-y-2">
              {medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#CC25B0] flex items-center justify-center text-white">
                    💊
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {medicine.medicineName}
                    </p>

                    <p className="text-xs text-gray-500">
                      QTY - {medicine.quantity} | Dosage : {medicine.dosage}{" "}
                      {medicine.dosageUnit}
                    </p>

                    <p className="text-xs text-blue-600">
                      {formatTimeFromFrequency(medicine.frequency)}
                    </p>

                    {medicine.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duration : {medicine.duration} days
                      </p>
                    )}

                    {medicine.timing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Timing : {medicine.timing}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveMedicine(index)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <hr className="border-gray-300" />

          {/* Diagnosis */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Add Diagnosis
            </label>

            <input
              type="text"
              placeholder="Enter diagnosis"
              value={currentDiagnosis}
              onChange={(e) => setCurrentDiagnosis(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none mb-3"
            />

            <button
              onClick={handleAddDiagnosis}
              className="w-full bg-[#2D9AD9] text-white py-4 rounded-lg text-sm font-medium hover:opacity-90"
            >
              + Add Diagnosis
            </button>

            {diagnosis.length > 0 && (
              <div className="space-y-2 mt-3">
                {diagnosis.map((item, index) => (
                  <div
                    key={index}
                    className="bg-green-50 rounded-xl p-3 flex items-center justify-between"
                  >
                    <p className="text-sm font-medium text-gray-700">{item}</p>

                    <button
                      onClick={() => handleRemoveDiagnosis(index)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-300" />

          {/* Complaints */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Complaints
            </label>
            <textarea
              placeholder="Enter patient complaints"
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none min-h-[80px]"
            />
          </div>

          <hr className="border-gray-300" />

          {/* Examination Findings */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Examination Findings
            </label>
            <textarea
              placeholder="Enter examination findings"
              value={examinationFindings}
              onChange={(e) => setExaminationFindings(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none min-h-[80px]"
            />
          </div>

          <hr className="border-gray-300" />

          {/* Follow Up Date */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Follow Up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-3 py-4 text-sm outline-none"
            />
          </div>

          {/* Recommended Tests */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Recommended Tests
            </label>
            <textarea
              placeholder="List any tests (comma separated)"
              value={recommendedTests}
              onChange={(e) => setRecommendedTests(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none min-h-[80px]"
            />
          </div>

          <hr className="border-gray-300" />

          {/* Advice */}
          <div>
            <label className="text-sm font-medium block mb-1">Advice</label>
            <textarea
              placeholder="Enter advice for patient"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none min-h-[80px]"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitPrescription}
            disabled={prescriptionMutation.isLoading || medicines.length === 0}
            className="w-full bg-[#2D9AD9] text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prescriptionMutation.isLoading ? "Creating..." : "Create Prescription"}
          </button>
        </div>
      </div>
    </>
  );
};

export default PrescriptionDrawer;
