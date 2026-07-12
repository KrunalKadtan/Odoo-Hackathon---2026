import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './Input';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchField?: keyof T;
  filterComponent?: React.ReactNode;
  itemsPerPage?: number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  searchable = true, 
  searchField, 
  filterComponent,
  itemsPerPage = 10 
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = data;
    if (searchable && searchField && searchTerm) {
      result = result.filter((item) => {
        const value = item[searchField];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    return result;
  }, [data, searchable, searchField, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {searchable && (
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
        {filterComponent && <div className="flex items-center gap-2">{filterComponent}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-3 bg-zinc-900/80 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-zinc-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <div className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium text-zinc-300">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-medium text-zinc-300">{filteredData.length}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
