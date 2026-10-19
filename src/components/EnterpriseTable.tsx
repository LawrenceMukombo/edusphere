// src/components/EnterpriseTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  Search,
  Filter,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  Edit3,
  Trash2,
  Save,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  render?: (row: T) => React.ReactNode;
  defaultVisible?: boolean;
}

interface EnterpriseTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  exportFilename?: string;
  actions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  onSaveRecord?: (row: T) => void;
  onDeleteRecord?: (row: T) => void;
  enableRecordModal?: boolean;
}

export function EnterpriseTable<T extends { id?: string | number }>({
  data,
  columns,
  title,
  description,
  isLoading = false,
  error = null,
  onRefresh,
  searchPlaceholder = 'Search records...',
  exportFilename = 'edusphere-export',
  actions,
  rowActions,
  onRowClick,
  onSaveRecord,
  onDeleteRecord,
  enableRecordModal = true,
}: EnterpriseTableProps<T>) {
  // State: Pre-filled Record CRUD Modal
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tableToast, setTableToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setTableToast(msg);
    setTimeout(() => setTableToast(null), 3500);
  };

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
    if (enableRecordModal) {
      setSelectedRecord(row);
      setEditFormData({ ...row });
      setIsEditingRecord(false);
    }
  };
  // State: Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // State: Sorting
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // State: Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.key] = col.defaultVisible !== false;
    });
    return initial;
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // State: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column toggle handler
  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((row: any) => {
      // 1. Search across all visible fields
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches = Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // 2. Active column filters
      for (const [key, filterVal] of Object.entries(activeFilters)) {
        if (!filterVal || filterVal === 'ALL') continue;
        const col = columns.find((c) => c.key === key);
        const cellValue = col?.accessor ? col.accessor(row) : row[key];
        if (String(cellValue) !== filterVal) return false;
      }

      return true;
    });
  }, [data, searchTerm, activeFilters, columns]);

  // Sort Logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);

    return [...filteredData].sort((a: any, b: any) => {
      const valA = col?.accessor ? col.accessor(a) : a[sortKey];
      const valB = col?.accessor ? col.accessor(b) : b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Pagination Logic
  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // CSV Export
  const handleExportCSV = () => {
    const exportableCols = columns.filter((col) => visibleColumns[col.key]);
    const headers = exportableCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');

    const rows = sortedData.map((row) =>
      exportableCols
        .map((col) => {
          const val = col.accessor ? col.accessor(row) : (row as any)[col.key];
          const stringVal = val === null || val === undefined ? '' : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Table Header Section */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions}

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Column Visibility Selector (Rule 24 requirement) */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Show / Hide Columns"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {showColumnDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-2">
                <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Visible Columns
                </div>
                <div className="max-h-60 overflow-y-auto px-1 py-1">
                  {columns.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                    >
                      <span>{col.header}</span>
                      {visibleColumns[col.key] && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CSV Export Option (Rule 24 requirement) */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            title="Export Table Data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Refresh Records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar if any filters exist */}
      {columns.some((c) => c.filterable && c.filterOptions) && (
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filters:
          </span>
          {columns
            .filter((c) => c.filterable && c.filterOptions)
            .map((col) => (
              <select
                key={col.key}
                value={activeFilters[col.key] || 'ALL'}
                onChange={(e) => {
                  setActiveFilters((prev) => ({ ...prev, [col.key]: e.target.value }));
                  setCurrentPage(1);
                }}
                className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All {col.header}s</option>
                {col.filterOptions?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ))}
          {Object.values(activeFilters).some((v) => v && v !== 'ALL') && (
            <button
              onClick={() => {
                setActiveFilters({});
                setCurrentPage(1);
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium ml-1"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table Content Area */}
      <div className="overflow-x-auto min-h-[280px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-xs font-medium">Loading enterprise records...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-16 text-rose-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-xs font-semibold">Failed to load records: {error}</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Search className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No records found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or active filter settings.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {columns
                  .filter((col) => visibleColumns[col.key])
                  .map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                        col.sortable !== false ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable !== false && (
                          <span className="text-slate-400">
                            {sortKey === col.key ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                {rowActions && (
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedData.map((row: any, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-blue-50/60 cursor-pointer transition select-none group"
                  title="Click to open and inspect full record"
                >
                  {columns
                    .filter((col) => visibleColumns[col.key])
                    .map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {col.render ? col.render(row) : col.accessor ? col.accessor(row) : row[col.key]}
                      </td>
                    ))}
                  {rowActions && (
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-3 text-right whitespace-nowrap"
                    >
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Enterprise Pagination Bar (Rule 24 requirement) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-slate-900">{totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, totalRecords)}</strong> of{' '}
            <strong className="text-slate-900">{totalRecords}</strong> records
          </span>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-slate-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {tableToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{tableToast}</span>
        </div>
      )}

      {/* Enterprise Full-CRUD Pre-filled Record Modal */}
      {selectedRecord && enableRecordModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col justify-between animate-in zoom-in-95">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {isEditingRecord ? 'Edit Record (Full CRUD)' : 'Record Inspection & Details'}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: {(selectedRecord as any).id || (selectedRecord as any).studentNumber || (selectedRecord as any).code || 'REC-ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingRecord ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData({ ...selectedRecord });
                        setIsEditingRecord(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Fields</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingRecord(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecord(null);
                      setIsEditingRecord(false);
                      setDeleteConfirmOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Record Fields View / Form */}
              <div className="py-4 overflow-y-auto max-h-[55vh]">
                {!isEditingRecord ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {columns.map((col) => {
                      const rawVal = col.accessor ? col.accessor(selectedRecord) : (selectedRecord as any)[col.key];
                      return (
                        <div key={col.key} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                          <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider mb-1">
                            {col.header}
                          </span>
                          <div className="font-medium text-slate-900 break-words">
                            {col.render ? col.render(selectedRecord) : String(rawVal ?? '—')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <form
                    id="table-crud-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const updated = { ...selectedRecord, ...editFormData };
                      if (onSaveRecord) onSaveRecord(updated);
                      setSelectedRecord(updated);
                      setIsEditingRecord(false);
                      showToast('Record changes saved successfully.');
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
                  >
                    {columns.map((col) => {
                      if (col.key === 'actions' || col.key === 'stageActions') return null;
                      const currentVal = editFormData[col.key] ?? (selectedRecord as any)[col.key] ?? '';

                      return (
                        <div key={col.key}>
                          <label className="font-bold text-slate-700 block mb-1">
                            {col.header}
                          </label>
                          <input
                            type="text"
                            value={typeof currentVal === 'object' ? JSON.stringify(currentVal) : String(currentVal)}
                            onChange={(e) => setEditFormData({ ...editFormData, [col.key]: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {!deleteConfirmOpen ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive / Delete</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                    <span className="text-[11px] font-bold text-rose-800">Confirm Archive?</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteRecord) onDeleteRecord(selectedRecord);
                        setSelectedRecord(null);
                        setDeleteConfirmOpen(false);
                        showToast('Record has been safely archived.');
                      }}
                      className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                    >
                      Yes, Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="px-2 py-0.5 text-slate-600 text-[10px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditingRecord ? (
                  <button
                    type="submit"
                    form="table-crud-form"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
