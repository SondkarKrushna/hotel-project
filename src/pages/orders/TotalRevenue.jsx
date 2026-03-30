import Layout from "../../components/layout/Layout";
import Table from "../../components/tables/Table";
import OrderStatCard from "../../components/cards/OrderStatCard";
import { ShoppingCart, IndianRupee } from "lucide-react";

const TotalRevenue = () => {
    const revenueData = [
        {
            billNo: "BILL-2001",
            orderNo: "ORD-1001",
            table: 1,
            amount: 750,
            paymentMode: "Cash",
            date: "2026-02-03T10:20:00",
        },
        {
            billNo: "BILL-2002",
            orderNo: "ORD-1002",
            table: 3,
            amount: 420,
            paymentMode: "UPI",
            date: "2026-02-03T10:50:00",
        },
        {
            billNo: "BILL-2003",
            orderNo: "ORD-1003",
            table: 5,
            amount: 1200,
            paymentMode: "Card",
            date: "2026-02-03T11:15:00",
        },
        {
            billNo: "BILL-2004",
            orderNo: "ORD-1004",
            table: 2,
            amount: 560,
            paymentMode: "UPI",
            date: "2026-02-03T11:40:00",
        },
        {
            billNo: "BILL-2005",
            orderNo: "ORD-1005",
            table: 4,
            amount: 980,
            paymentMode: "Cash",
            date: "2026-02-03T12:10:00",
        },
    ];

    const totalAmount = revenueData.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const columns = [
        { label: "Bill No", key: "billNo" },
        { label: "Order ID", key: "orderNo" },
        { label: "Table No", key: "table" },
        {
            label: "Amount",
            key: "amount",
            render: (row) => `₹${row.amount}`,
        },
        {
            label: "Payment Mode",
            key: "paymentMode",
            render: (row) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {row.paymentMode}
                </span>
            ),
        },
        {
            label: "Date",
            key: "date",
            render: (row) =>
                new Date(row.date).toLocaleDateString(),
        },
    ];

    return (
        <Layout>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <OrderStatCard title="Total Orders" 
                // waveimg="/images/wave1.png" 
                icon={ShoppingCart}
                    value={revenueData.length} percent="+12%" color="#2D9AD8" />
                <OrderStatCard title="Total Revenue" waveimg="/images/wave1.png" icon={IndianRupee}
                    value={totalAmount} percent="+12%" color="#2D9AD8" />
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Total Revenue</h1>
                    <p className="text-sm text-gray-500">
                        View all earnings
                    </p>
                </div>

                {/* Total Amount */}
                <div className="mt-3 sm:mt-0 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-green-700 font-medium">
                        Total: ₹{totalAmount}
                    </p>
                </div>
            </div>

            <Table
                columns={columns}
                data={revenueData}
                loading={false}
            />
        </Layout>
    );
};

export default TotalRevenue;
