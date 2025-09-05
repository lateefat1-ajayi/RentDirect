export default function Table({ columns, data, renderRow, hover = false }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
      <table className="w-full border-collapse">
        <thead className="bg-primary dark:bg-primary/80">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="border border-primary/20 dark:border-primary/30 p-1 text-center text-sm font-semibold text-white w-fit"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-500 dark:text-gray-400 p-4 bg-white dark:bg-gray-800"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={i}
                className={`${hover ? "hover:bg-gray-50 dark:hover:bg-gray-700" : ""} bg-white dark:bg-gray-800`}
              >
                {renderRow(item)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
