import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/tables/Table";
//import { getAllOrders } from "../../api/orders.api";

const MyOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const data = await getAllOrders();
//       setOrders(data);
//     } catch (error) {
//       console.error("Failed to fetch orders", error);
//     } finally {
//       setLoading(false);
//     }
//   };
 const ordersData = [
  {
    orderNo: "ORD-1001",
    table: 1,
    amount: 750,
    status: "Completed",
    createdAt: "2026-02-03T10:15:00",
  },
  {
    orderNo: "ORD-1002",
    table: 3,
    amount: 420,
    status: "Pending",
    createdAt: "2026-02-03T10:45:00",
  },
  {
    orderNo: "ORD-1003",
    table: 5,
    amount: 1200,
    status: "Completed",
    createdAt: "2026-02-03T11:10:00",
  },
  {
    orderNo: "ORD-1004",
    table: 2,
    amount: 560,
    status: "Preparing",
    createdAt: "2026-02-03T11:35:00",
  },
  {
    orderNo: "ORD-1005",
    table: 4,
    amount: 980,
    status: "Completed",
    createdAt: "2026-02-03T12:05:00",
  },
];


  const columns = [
    { label: "Order ID", key: "orderNo" },
    { label: "Table No", key: "table" },
    {
      label: "Amount",
      key: "amount",
      render: (row) => `₹${row.amount}`,
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium
          ${
            row.status === "Completed"
              ? "bg-green-100 text-green-700"
              : row.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Date",
      key: "createdAt",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Total Orders</h1>
        <p className="text-sm text-gray-500">
          View all hotel orders
        </p>
      </div>

      <Table
        columns={columns}
        data={ordersData}
        loading={false}
      />
    </Layout>
  );
};

export default MyOrders;
