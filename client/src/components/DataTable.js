'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function DataTable({ data, columns, title = 'Data' }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
  const [filterConfig, setFilterConfig] = useState({});

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filterConfig).every(([key, value]) => {
        if (!value) return true;
        return String(row[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [data, filterConfig]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleFilter = (key, value) => {
    setFilterConfig({
      ...filterConfig,
      [key]: value,
    });
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{title}</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map((col) => (
          <input
            key={col}
            type="text"
            placeholder={`Filter ${col}...`}
            value={filterConfig[col] || ''}
            onChange={(e) => handleFilter(col, e.target.value)}
            className="input-base text-sm"
          />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left font-semibold text-slate-900 cursor-pointer hover:bg-slate-200 transition"
                >
                  <div className="flex items-center gap-2">
                    {col}
                    {sortConfig.key === col && (
                      <>
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-600">
                  No data matches your filters
                </td>
              </tr>
            ) : (
              sortedData.slice(0, 100).map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  {columns.map((col) => (
                    <td key={`${idx}-${col}`} className="px-4 py-3 text-slate-600">
                      {typeof row[col] === 'number' ? row[col].toFixed(2) : row[col]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500 mt-4">
        Showing {Math.min(100, sortedData.length)} of {sortedData.length} rows
      </p>
    </div>
  );
}
