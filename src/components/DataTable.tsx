import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, FileText, Table as TableIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    exportValue?: (item: T) => string;
  }[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  initialItemsPerPage?: number;
  onRowClick?: (item: T) => void;
  title?: string;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  searchPlaceholder = "Rechercher...",
  initialItemsPerPage = 10,
  onRowClick,
  title = "Export"
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

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
    const exportData = filteredData.map(item => {
      const row: any = {};
      columns.forEach(col => {
        if (col.exportValue) {
          row[col.header] = col.exportValue(item);
        } else if (typeof col.accessor === 'string') {
          row[col.header] = item[col.accessor as keyof T];
        } else {
          row[col.header] = '';
        }
      });
      return row;
    });

    if (type === 'pdf') {
      const doc = new jsPDF();
      const tableColumn = columns.map(c => c.header);
      const tableRows = exportData.map(row => Object.values(row));
      
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.text(title, 14, 15);
      doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Afficher</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 focus:outline-none focus:border-primary shadow-sm"
            >
              {[10, 25, 50, 100, 250].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
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
            <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[150px] sm:max-w-none">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl font-bold text-sm transition-all ${
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
