/**
 * Simple responsive data table: renders as a table on md+ screens and
 * stacked cards on mobile, using the same column config for both.
 */
const DataTable = ({ columns, rows, keyField = '_id', emptyMessage = 'Nothing to show yet.' }) => {
  if (!rows || rows.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left font-medium text-slate-400">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[keyField]} className="neu-flat rounded-neu">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 first:rounded-l-neu last:rounded-r-neu">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row[keyField]} className="neu-flat rounded-neu p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-2 py-1 text-sm">
                <span className="text-slate-400">{col.header}</span>
                <span className="text-right">{col.render ? col.render(row) : row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;
