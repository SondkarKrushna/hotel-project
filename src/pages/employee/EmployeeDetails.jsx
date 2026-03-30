import Layout from "../../components/layout/Layout";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "../../components/ui/Skeleton";
import Table from "../../components/tables/Table";
import {
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
} from "lucide-react";

import { useGetEmployeeProfileQuery } from "../../store/Api/employeeApi";

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 bg-[#F5FAFF] p-3 rounded border border-gray-100">
    <div className="w-8 h-8 bg-[#24435d] text-white flex items-center justify-center rounded-full">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium break-all">{value || "N/A"}</p>
    </div>
  </div>
);

const EmployeeDetails = () => {
  const { id } = useParams();

  const { data, isLoading, isError } = useGetEmployeeProfileQuery(id, {
    skip: !id,
  });

  const [activeTab, setActiveTab] = useState("orders");

  // ✅ Extract API Data FIRST (before using in useMemo)
  const staff = data?.profiles?.staff || {};
  const manager = data?.profiles?.manager || {};
  const hotel = data?.profiles?.hotel || {};
  const metrics = data?.metrics || {};
  const orders = data?.orders || [];

  // ✅ Hooks must always run before conditional returns
  const formattedOrders = React.useMemo(() => {
    return orders.map(order => ({
      id: order.id,
      customerName: order.customer?.name,
      customerPhone: order.customer?.phone,
      totalItems: 1,
      totalAmount: order.grandTotal,
      status: order.status,
    }));
  }, [orders]);

  const formattedCustomers = React.useMemo(() => {
    const customerMap = {};

    orders.forEach(order => {
      const phone = order.customer?.phone;
      const name = order.customer?.name;

      if (!customerMap[phone]) {
        customerMap[phone] = {
          customerName: name,
          customerPhone: phone,
          orderCount: 0,
        };
      }

      customerMap[phone].orderCount += 1;
    });

    return Object.values(customerMap);
  }, [orders]);

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-[#F2F8FF] min-h-screen p-6">
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen text-red-500">
          Failed to load employee details
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#F2F8FF] min-h-screen p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ================= LEFT SIDE ================= */}
          <div className="col-span-12 lg:col-span-4 space-y-4">

            {/* Profile Card */}
            <div className="bg-[#24435d] text-white rounded p-6 text-center">
              <div className="w-20 h-20 bg-[#e6f0f8] rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-[#24435d] shadow-md">
                {staff?.name ? staff.name.charAt(0).toUpperCase() : "?"}
              </div>
              <h2 className="font-semibold text-lg">
                {staff?.name || "N/A"}
              </h2>
              <p className="text-sm capitalize">
                {staff?.role?.toLowerCase() || "N/A"}
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-4 rounded space-y-3">
              <h3 className="font-semibold">Employee Information</h3>

              <InfoItem
                icon={Phone}
                label="Phone"
                value={staff?.phone}
              />

              <InfoItem
                icon={Mail}
                label="Email"
                value={staff?.email}
              />

              <InfoItem
                icon={MapPin}
                label="Address"
                value={`${hotel?.address || ""} ${hotel?.city || ""} ${hotel?.country || ""}`}
              />
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-2xl shadow p-6">

              {/* ================= TABS ================= */}
              <div className="flex gap-6 border-b pb-3 text-sm font-semibold">
                {["orders", "customers"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 capitalize ${activeTab === tab
                      ? "text-[#24435d] border-b-2 border-[#24435d]"
                      : "text-gray-500"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ================= TAB CONTENT ================= */}
              <div className="mt-6">

                {/* ===== ORDERS TAB ===== */}
                {activeTab === "orders" && (
                  <div className="space-y-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between border border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                          <h3 className="text-2xl font-bold text-[#24435d]">
                            {metrics?.totalOrders || 0}
                          </h3>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between border border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Total Revenue</p>
                          <h3 className="text-2xl font-bold text-green-600">
                            ₹ {metrics?.totalRevenue || 0}
                          </h3>
                        </div>
                      </div>

                    </div>

                    {/* Orders Table */}
                    <Table
                      columns={[
                        { label: "Customer", key: "customerName" },
                        { label: "Items", key: "totalItems" },
                        {
                          label: "Amount",
                          key: "totalAmount",
                          render: (row) => `₹ ${row.totalAmount}`,
                        },
                        { label: "Status", key: "status" },
                      ]}
                      data={formattedOrders}
                      loading={false}
                    />
                  </div>
                )}

                {/* ===== CUSTOMERS TAB ===== */}
                {activeTab === "customers" && (
                  <Table
                    columns={[
                      { label: "Customer Name", key: "customerName" },
                      { label: "Phone", key: "customerPhone" },
                      { label: "Total Orders", key: "orderCount" },
                    ]}
                    data={formattedCustomers}
                    loading={false}
                  />
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDetails;