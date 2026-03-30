import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import StatCard from "../components/cards/StatCard";
import Table from "../components/tables/Table";
import Skeleton from "../components/ui/Skeleton";
import { ShoppingCart, IndianRupee, Users, Building2 } from "lucide-react";
import {
  useGetHotelDashboardQuery,
  useGetSuperAdminDashboardQuery,
} from "../store/Api/orderApi";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("adminUser"));
  const role = user?.role;
  const hotelId = user?.hotel;

  const navigate = useNavigate();

  const isSuperAdmin = role === "SUPER_ADMIN";
  // console.log("hotelId",hotelId);
  const {
    data: hotelData,
    isLoading: hotelLoading,
  } = useGetHotelDashboardQuery(hotelId, {
    skip: isSuperAdmin || !hotelId,
  });

  const {
    data: superData,
    isLoading: superLoading,
  } = useGetSuperAdminDashboardQuery(
    { page: 1, limit: 10 },
    { skip: !isSuperAdmin }
  );

  const isLoading = isSuperAdmin ? superLoading : hotelLoading;

  /* ================= SUPER ADMIN ================= */

  const superStats = [
    {
      title: "Total Hotels",
      value: superData?.summary?.totalHotels || 0,
      icon: Building2,
      bg: "#EEF2FF",
      onClick: () => navigate("/allhotels"),
    },
    {
      title: "Total Staff",
      value: superData?.summary?.totalStaff || 0,
      icon: Users,
      bg: "#FFF4E6",
      onClick: () => navigate("/staff"),
    },
    {
      title: "Total Revenue",
      value: `₹${superData?.summary?.totalRevenue || 0}`,
      icon: IndianRupee,
      bg: "#F3EEFE",
    },
    {
      title: "Unique Customers",
      value: superData?.summary?.totalUniqueCustomers || 0,
      icon: ShoppingCart,
      bg: "#E6F9F0",
    },
  ];

  const hotelColumns = [
    { label: "Hotel Name", key: "name" },
    {
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${row.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Admin",
      render: (row) => row?.admin?.username || "N/A",
    },
    {
      label: "Orders",
      render: (row) => row.stats?.orderCount || 0,
    },
    {
      label: "Revenue",
      render: (row) => `₹${row.stats?.revenue || 0}`,
    },
  ];

  /* ================= HOTEL ADMIN ================= */

  const summary = hotelData?.data?.summary;
  const hotel = hotelData?.data?.hotel;
  const orders = hotelData?.data?.data?.orders || [];

  const hotelStats = [
    {
      title: "Total Orders",
      value: summary?.counts?.orders || 0,
      icon: ShoppingCart,
      bg: "#EEF2FF",
    },
    {
      title: "Total Revenue",
      value: `₹${summary?.financials?.totalRevenue || 0}`,
      icon: IndianRupee,
      bg: "#F3EEFE",
    },
    {
      title: "Total Staff",
      value: summary?.counts?.staff || 0,
      icon: Users,
      bg: "#FFF4E6",
    },
    {
      title: "Total Dishes",
      value: summary?.counts?.dishes || 0,
      icon: Building2,
      bg: "#E6F9F0",
    },
  ];

  const orderColumns = [
    {
      label: "Customer",
      render: (row) => {
        console.log("row==", row);
        return row?.customer?.name || "N/A";
      },
    },
    {
      label: "Order Date",
      render: (row) =>
        new Date(row.orderedAt).toLocaleString("en-IN"),
    },
    {
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${row.status === "billed"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Amount",
      render: (row) => `₹${row.grandTotal}`,
    },
  ];

  return (
    <Layout>
      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(isSuperAdmin ? superStats : hotelStats).map((item, i) =>
          isLoading ? (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ) : (
            <StatCard key={i} {...item} />
          )
        )}
      </div>

      {/* ================= SUPER ADMIN ================= */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">
            Registered Hotels ({superData?.summary?.totalHotels || 0})
          </h2>

          <Table
            columns={hotelColumns}
            data={superData?.hotels || []}
            loading={isLoading}
          />
        </div>
      )}

      {/* ================= HOTEL ADMIN ================= */}
      {!isSuperAdmin && (
        <>
          {/* Hotel Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold">{hotel?.name}</h2>
            <p className="text-gray-500 text-sm">
              {hotel?.address}, {hotel?.city}, {hotel?.country}
            </p>
          </div>

          {/* Orders Listing */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">
              Latest Orders
            </h2>

            <Table
              columns={orderColumns}
              data={orders}
              loading={isLoading}
            />
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;