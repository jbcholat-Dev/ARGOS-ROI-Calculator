import { useState, useMemo } from 'react';
import type { AnalysisRowData } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { getROIColorClass } from '@/lib/calculations';

interface ComparisonTableProps {
  rows: AnalysisRowData[];
  onNavigateToAnalysis: (id: string) => void;
}

type SortColumn = keyof AnalysisRowData;
type SortDirection = 'asc' | 'desc';

const COLUMNS: ReadonlyArray<{
  key: SortColumn;
  label: string;
  align: 'left' | 'right';
}> = [
  { key: 'name', label: 'Process Name', align: 'left' },
  { key: 'pumpQuantity', label: 'Pumps', align: 'right' },
  { key: 'failureRate', label: 'Failure Rate', align: 'right' },
  { key: 'totalFailureCost', label: 'Failure Cost', align: 'right' },
  { key: 'argosServiceCost', label: 'ARGOS Cost', align: 'right' },
  { key: 'savings', label: 'Savings', align: 'right' },
  { key: 'roiPercentage', label: 'ROI (%)', align: 'right' },
];

function formatCell(key: SortColumn, value: string | number): string {
  switch (key) {
    case 'totalFailureCost':
    case 'argosServiceCost':
    case 'savings':
      return formatCurrency(value as number);
    case 'failureRate':
      return formatPercentage(value as number, 1);
    case 'roiPercentage':
      return formatPercentage(value as number, 1);
    default:
      return String(value);
  }
}

export function ComparisonTable({ rows, onNavigateToAnalysis }: ComparisonTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('savings');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [rows, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent, column: SortColumn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(column);
    }
  };

  const getAriaSortValue = (column: SortColumn): 'ascending' | 'descending' | 'none' => {
    if (sortColumn !== column) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Process Comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={getAriaSortValue(col.key)}
                  tabIndex={0}
                  role="columnheader"
                  className={`cursor-pointer px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wide hover:bg-gray-100 ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  onClick={() => handleSort(col.key)}
                  onKeyDown={(e) => handleHeaderKeyDown(e, col.key)}
                >
                  {col.label}
                  {sortColumn === col.key && (
                    <span className="ml-1" aria-hidden="true">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-gray-100 hover:bg-gray-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {COLUMNS.map((col) => {
                  if (col.key === 'name') {
                    return (
                      <td key={col.key} className="px-4 py-3 text-left">
                        <button
                          type="button"
                          className="cursor-pointer text-left font-medium text-blue-600 hover:underline"
                          onClick={() => onNavigateToAnalysis(row.id)}
                        >
                          {row.name}
                        </button>
                      </td>
                    );
                  }

                  if (col.key === 'roiPercentage') {
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-right font-semibold ${getROIColorClass(row.roiPercentage)}`}
                      >
                        {formatCell(col.key, row[col.key])}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {formatCell(col.key, row[col.key])}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
