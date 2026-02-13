import { useState, useMemo } from 'react';
import type { AnalysisRowData } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { getROIColorClass } from '@/lib/calculations';

interface ComparisonTableProps {
  rows: AnalysisRowData[];
  onNavigateToAnalysis: (id: string) => void;
  excludedIds?: Set<string>;
  onToggleExclude?: (id: string) => void;
  onDeleteAnalysis?: (id: string) => void;
  totalAnalysesCount?: number;
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

export function ComparisonTable({
  rows,
  onNavigateToAnalysis,
  excludedIds,
  onToggleExclude,
  onDeleteAnalysis,
  totalAnalysesCount,
}: ComparisonTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('savings');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const hasExclusionFeature = excludedIds !== undefined && onToggleExclude !== undefined;

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

  // Count active (non-excluded) rows for last-active protection
  const activeCount = hasExclusionFeature
    ? rows.filter((r) => !excludedIds.has(r.id)).length
    : rows.length;

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
              {hasExclusionFeature && (
                <th
                  scope="col"
                  className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wide text-center w-12"
                >
                  <span className="sr-only">Include in analysis</span>
                </th>
              )}
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
              {hasExclusionFeature && (
                <th
                  scope="col"
                  className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wide text-center w-20"
                >
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => {
              const isExcluded = hasExclusionFeature && excludedIds.has(row.id);
              const isLastActive = hasExclusionFeature && !isExcluded && activeCount <= 1;
              const canDelete = isExcluded && onDeleteAnalysis && (totalAnalysesCount ?? rows.length) > 1;

              return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 hover:bg-gray-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${isExcluded ? 'opacity-50' : ''}`}
                >
                  {hasExclusionFeature && (
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block">
                        <input
                          type="checkbox"
                          checked={!isExcluded}
                          onChange={() => onToggleExclude(row.id)}
                          disabled={isLastActive}
                          aria-label={`Include ${row.name} in global analysis`}
                          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${
                            isLastActive ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
                          title={isLastActive ? 'At least one process must remain active' : undefined}
                        />
                      </div>
                    </td>
                  )}
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
                  {hasExclusionFeature && (
                    <td className="px-4 py-3 text-center">
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteAnalysis(row.id)}
                          aria-label={`Supprimer ${row.name}`}
                          className="inline-flex items-center justify-center rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
