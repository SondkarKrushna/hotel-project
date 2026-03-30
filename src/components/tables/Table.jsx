import Skeleton from "../ui/Skeleton";

const Table = ({ columns = [], data = [], loading }) => {
  return (
    <>
      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:block overflow-x-auto bg-gray-50 border border-gray-200 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-[#0d1827] border-b border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-semibold text-white"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // ✅ Skeleton Rows
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 last:border-none hover:bg-gray-50 transition"
                >
                  {columns.map((col, i) => (
                    <td key={i} className="px-4 py-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="md:hidden space-y-4">
        {loading ? (
          // ✅ Mobile Skeleton Cards
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3"
            >
              {columns.map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center"
                >
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data found
          </div>
        ) : (
          data.map((row, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="divide-y divide-gray-100">
                {columns.map((col, i) => {
                  const isAction =
                    col.label?.toLowerCase() === "actions";

                  return (
                    <div
                      key={i}
                      className={`py-2 ${
                        isAction
                          ? "pt-4"
                          : "flex justify-between gap-4"
                      }`}
                    >
                      {!isAction ? (
                        <>
                          {/* Label */}
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {col.label}
                          </span>

                          {/* Value */}
                          <span className="text-sm text-gray-800 text-right break-words max-w-[60%]">
                            {col.render
                              ? col.render(row)
                              : row[col.key]}
                          </span>
                        </>
                      ) : (
                        <div className="flex justify-end gap-2 w-full">
                          {col.render
                            ? col.render(row)
                            : row[col.key]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Table;