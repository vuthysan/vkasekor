"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalRows = table.getFilteredRowModel().rows.length
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)" }}>
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-sm"
          style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
        >
          <thead className="bg-[#fafaf8]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#e5e5e0]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center gap-1.5 hover:text-[#333]"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#e5e5e0] bg-white">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors duration-100 hover:bg-[#f7f6f3]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-6 py-4 text-[#333]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-sm text-[#999]">
                  រកមិនឃើញហ្វូង/ដំណាំទេ។
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#e5e5e0] bg-white px-6 py-3.5">
        <p className="text-xs text-[#999]">
          {totalRows === 0 ? "គ្មានលទ្ធផល" : `${from}–${to} នៃ ${totalRows}`}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-7 w-7 items-center justify-center rounded border border-[#e5e5e0] text-[#666] transition-colors hover:border-[#a3b8aa] hover:text-[#333] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#16a34a]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-7 w-7 items-center justify-center rounded border border-[#e5e5e0] text-[#666] transition-colors hover:border-[#a3b8aa] hover:text-[#333] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#16a34a]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
