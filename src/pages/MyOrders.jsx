import { useState, useMemo } from "react";
import Table from "../components/tables/Table";
import Skeleton from "../components/ui/Skeleton";
import { useGetOrdersQuery } from "../store/Api/orderApi";

const MyOrders = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const limit = 10;

  // ✅ Fetch ALL orders
  const { data, isLoading, isError } = useGetOrdersQuery({
    page: 1,
    limit: 1000,
  });
  // console.log("orders data==",data)

  const allOrders = useMemo(() => {
  if (!Array.isArray(data?.data)) return [];

  return [...data.data].sort(
    (a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)
  );
}, [data]);

  // ✅ Search across all records
  const filteredOrders = useMemo(() => {
  return allOrders.filter((order) =>
    order.customerName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );
}, [allOrders, search]);

  // ✅ Frontend pagination
  const totalPages = Math.ceil(filteredOrders.length / limit);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const columns = [
  {
    label: "Customer",
    key: "customerName",
    render: (row) => row.customerName || "N/A",
  },
  {
    label: "Amount",
    key: "grandTotal",
    render: (row) => `₹${row.grandTotal}`,
  },
  {
    label: "Date",
    key: "orderedAt",
    render: (row) =>
      new Date(row.orderedAt).toLocaleDateString(),
  },
];

  if (isError) {
    return (
      <>
        <p className="text-red-500">Failed to load orders</p>
      </>
    );
  }

  return (
    <>
      {/* Header + Search */}
      <div className="mb-6 mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {isLoading ? (
          <>
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-full sm:w-64" />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold">All Orders</h1>
              <p className="text-sm text-gray-500">
                Showing {filteredOrders.length} orders
              </p>
            </div>

            <input
              type="text"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-4 py-2 pr-2 mr-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="sm:text-base text-xs">
          {isLoading ? (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center mb-4"
                >
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              ))}
            </div>
          ) : (
            <Table
              columns={columns}
              data={paginatedOrders}
              loading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm md:text-base transition-colors hover:bg-gray-300 font-medium"
          >
            Previous
          </button>

          <span className="px-3 md:px-4 py-2 text-sm md:text-base font-medium text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 md:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm md:text-base transition-colors hover:bg-gray-300 font-medium"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal remains same */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative
                 animate-[fadeInScale_.25s_ease-out]"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 
                   transition duration-200 text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-xl font-semibold mb-1">
              Order Details
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Customer: {selectedorder.customerName}
            </p>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedOrder.items?.length ? (
                selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 
                         hover:bg-gray-100 transition 
                         rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-gray-800">
                      × {item.quantity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  No items found
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 border-t pt-4 flex justify-between items-center">
              <span className="text-gray-500 text-sm">
                Grand Total
              </span>
              <span className="text-lg font-bold text-indigo-600">
                ₹{selectedOrder.grandTotal}
              </span>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default MyOrders;
