import type { ReactNode } from "react"

export type Column<T> = {
  header: string
  accessor?: keyof T | ((row: T) => ReactNode)
  key?: string
  cell?: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  getRowKey?: (row: T) => string | number
}

export function DataTable<T>({ columns, data, getRowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-4 py-3 text-left font-semibold text-slate-700">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={getRowKey ? getRowKey(row) : rowIndex} className="bg-white">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-slate-600">
                  {column.cell
                    ? column.cell(row)
                    : typeof column.accessor === "function"
                      ? column.accessor(row)
                      : (row[column.accessor as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
