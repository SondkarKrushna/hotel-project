import { Eye, Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import React, { useState } from "react";


const PaymentTable = ({ data, bgColor = "bg-gray-100", type = "payment", activeTab, onViewInvoice, onAddPrescription, openInvoiceModal, onCreateInvoice }) => {
    const location = useLocation();
    //console.log("Active Tab in PaymentTable:", activeTab);
    const isDoctor = location.pathname.startsWith("/doctor");
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto ">
            <div
                className={`bg-[${bgColor}] text-gray-700 text-sm grid ${type === "appointment" ? "grid-cols-6" : "grid-cols-8"
                    } px-4 py-3 font-medium min-w-[900px]`}
            >

                {type === "appointment" ? (
                    <>
                        <div>Patient ID</div>
                        <div>Name</div>
                        <div>Disease</div>
                        <div>Contact No</div>
                        <div>Email</div>
                        <div>Date & Time</div>
                        {/* <div className="text-center">Actions</div> */}
                    </>
                ) : (
                    <>
                        <div>{activeTab === "Pending" ? "SR No" : "Invoice ID"}</div>

                        <div>Patient</div>

                        {activeTab === "pending" && <div>Doctor</div>}

                        <div>Date</div>
                        <div>Contact No</div>

                        {activeTab !== "pending" && <div>Amount</div>}
                        {activeTab !== "pending" && <div>Method</div>}

                        <div>Status</div>
                        <div className="text-center">Actions</div>
                    </>

                )}
            </div>

            {/* ================= BODY ================= */}
            {data.length === 0 ? (
                <div className="px-4 py-10 text-center text-lg font-semibold text-black min-w-[900px]">
                    No data found
                </div>
            ) : (
                data.map((item, i) => (
                    <div
                        key={i}
                        className={`grid ${type === "appointment" ? "grid-cols-6" : "grid-cols-8"
                            } px-4 py-3 text-sm border-t border-gray-100 items-center min-w-[900px] hover:bg-gray-50 transition`}
                    >
                        {type === "appointment" ? (
                            <>
                                <div className="text-pink-500 font-medium">
                                    {item.patientId}
                                </div>

                                <div className="flex items-center gap-2">
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </div>

                                <div>{item.disease}</div>
                                <div>{item.contact}</div>
                                <div>{item.email}</div>
                                <div>{item.dateTime}</div>
                            </>
                        ) : (
                            <>
                                {/* Invoice ID / SR No */}
                                <div className="font-medium text-pink-500">
                                    {activeTab === "pending" ? i + 1 : item.invoiceId}
                                </div>

                                {/* Patient */}
                                <div className="font-medium">{item.patient}</div>

                                {/* Doctor → ONLY Pending */}
                                {activeTab === "pending" && (
                                    <div className="text-gray-500">{item.doctor}</div>
                                )}

                                {/* Date */}
                                <div>{item.date}</div>

                                {/* Contact */}
                                <div>{item.contact}</div>

                                {/* Amount */}
                                {activeTab !== "pending" && (
                                    <div className="font-medium">₹{item.amount}</div>
                                )}

                                {/* Method */}
                                {activeTab !== "pending" && <div>{item.method}</div>}

                                {/* Status */}
                                <div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "Paid"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-orange-100 text-orange-600"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-center gap-2">
                                    {item.status === "Paid" ? (
                                        <button
                                            onClick={() => onViewInvoice(item)}
                                            className="p-2 bg-orange-100 rounded hover:bg-orange-200"
                                        >
                                            <Download className="w-4 h-4 text-orange-600" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onCreateInvoice(item)}
                                            className="p-2 bg-green-100 rounded hover:bg-green-200"
                                        >
                                            <Plus className="w-4 h-4 text-green-600" />
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}

        </div>
    );
};

export default PaymentTable;
