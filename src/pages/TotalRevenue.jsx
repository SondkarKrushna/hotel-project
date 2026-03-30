import Layout from "../components/layout/Layout";
import Table from "../components/tables/Table";
import OrderStatCard from "../components/cards/OrderStatCard";
import { ShoppingCart, IndianRupee } from "lucide-react";
import { useGetOrdersQuery } from "../store/Api/orderApi";

const TotalRevenue = () => {
  // ✅ Fetch ALL orders (set large limit)
  const { data, isLoading, isError } = useGetOrdersQuery({
    page: 1,
    limit: 10000, 
  });

  const orders = Array.isArray(data?.data) ? data.data : [];

  const totalAmount = orders.reduce(
    (sum, item) => sum + (item.grandTotal || 0),
    0
  );

  const columns = [
    {
      label: "Customer Name",
      key: "customer",
      render: (row) => row.customer?.name || "N/A",
    },
    {
      label: "Amount",
      key: "grandTotal",
      render: (row) => `₹${row.grandTotal}`,
    },
    {
      label: "Date",
      key: "createdAt",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (isError) {
    return <p className="text-red-500">Failed to load orders</p>;
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* <OrderStatCard
          title="Total Orders"
          icon={ShoppingCart}
          value={isLoading ? "Loading..." : orders.length}
          percent="+12%"
          color="#0d1827"
        /> */}
        <OrderStatCard
          title="Total Revenue"
          icon={IndianRupee}
          value={isLoading ? "Loading..." : `₹${totalAmount}`}
          percent="+12%"
          color="#0d1827"
        />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
       <div>
          <h1 className="text-xl font-semibold mt-6">Total Revenue</h1>
          <p className="text-sm text-gray-500">
            View all earnings
          </p>
        </div>

        <div className="mt-6 sm:mt-0 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <p className="text-sm text-green-700 font-medium">
            Total: ₹{totalAmount}
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={orders}
        loading={isLoading}
      />
    </Layout>
  );
};

export default TotalRevenue;