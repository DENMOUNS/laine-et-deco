import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, FileText, Table as TableIcon } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
  }[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  searchPlaceholder = "Rechercher...",
  itemsPerPage = 5,
  onRowClick
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter(item => {
    const searchStr = searchQuery.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = (type: 'pdf' | 'excel') => {
    alert(`Exportation en ${type.toUpperCase()}... (Fonctionnalité simulée)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary w-full shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => handleExport('pdf')}
            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileText size={18} /> PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <TableIcon size={18} /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={`px-8 py-4 ${col.className || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onRowClick?.(item)}
                    className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
                  >
                    {columns.map((col, i) => (
                      <td key={i} className={`px-8 py-4 ${col.className || ''}`}>
                        {typeof col.accessor === 'function' 
                          ? col.accessor(item) 
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-12 text-center text-slate-400 italic">
                    Aucun résultat trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-slate-400">
            Affichage de <span className="font-bold text-slate-900">{startIndex + 1}</span> à <span className="font-bold text-slate-900">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> sur <span className="font-bold text-slate-900">{filteredData.length}</span> résultats
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    currentPage === page 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
