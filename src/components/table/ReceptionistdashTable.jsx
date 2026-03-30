const ReceptionistdashTable = () => {
  const payments = [
    { id: 1, name: "John Smith", amount: "₹500", status: "Paid", date: "12-03-2025" },
    { id: 2, name: "Anna Carter", amount: "₹800", status: "Pending", date: "13-03-2025" },
    { id: 3, name: "David Lee", amount: "₹300", status: "Paid", date: "14-03-2025" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold mb-4">Recent Payments</h3>

      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-2">#</th>
            <th className="text-left px-4 py-2">Patient</th>
            <th className="text-left px-4 py-2">Amount</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-lg font-semibold text-black"
              >
                No data found
              </td>
            </tr>
          ) : (
            payments.map((p, i) => (
              <tr
                key={p.id ?? i}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${p.status === "Paid"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">{p.date}</td>
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
};
export default ReceptionistdashTable;