"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  initialPageSize?: number;
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Search directory...",
  searchKeys = [],
  initialPageSize = 10
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 1. Search filter
  const searchedData = useMemo(() => {
    if (!searchQuery || searchKeys.length === 0) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val ? String(val).toLowerCase().includes(query) : false;
      })
    );
  }, [data, searchQuery, searchKeys]);

  // 2. Sort config
  const sortedData = useMemo(() => {
    if (!sortConfig) return searchedData;
    const sorted = [...searchedData];
    sorted.sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof T];
      let bVal: any = b[sortConfig.key as keyof T];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [searchedData, sortConfig]);

  // 3. Paginated pages
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  return (
    <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden" }}>
      {/* Top Search & Filter Bar */}
      {searchKeys.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", borderBottom: "1px solid var(--border-color)", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ position: "relative", maxWidth: "20rem", width: "100%" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", padding: "0.55rem 0.55rem 0.55rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <span>Show</span>
            <select 
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: "0.3rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontWeight: 600 }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      )}

      {/* Table Element */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  onClick={() => col.sortable && handleSort(String(col.sortKey || col.accessor))}
                  style={{ 
                    padding: "1rem", 
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      sortConfig?.key === String(col.sortKey || col.accessor) ? (
                        sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : <ChevronsUpDown size={14} style={{ opacity: 0.5 }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {columns.map((col, idx) => (
                    <td key={idx} style={{ padding: "1rem" }}>
                      {typeof col.accessor === "function" 
                        ? col.accessor(row) 
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderTop: "1px solid var(--border-color)", background: "var(--bg-secondary)", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn btn-outline"
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={currentPage === idx + 1 ? "btn btn-primary" : "btn btn-outline"}
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
              >
                {idx + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn btn-outline"
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
