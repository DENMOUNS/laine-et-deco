import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Download, 
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { cn } from '../utils/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  exportValue?: (item: T) => string;
  className?: string;
  sortable?: boolean;
  sortKey?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  onRowClick?: (item: T) => void;
  defaultItemsPerPage?: number;
  searchable?: boolean;
  defaultSort?: { key: string; direction: 'asc' | 'desc' } | null;
  dateFilterKey?: keyof T; // Key to filter by date
}

type DateRangeType = 'all' | 'today' | 'yesterday' | 'this-week' | 'this-month' | 'this-year' | 'custom';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 250, 500];

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  title,
  onRowClick,
  defaultItemsPerPage = 5,
  searchable = true,
  defaultSort = null,
  dateFilterKey
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(defaultSort);
  
  // Date Filtering State
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // When items per page changes, restart from page 1
  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  // Filter data based on search and date
  const filteredData = useMemo(() => {
    let result = data;

    // Date Filtering
    if (dateFilterKey && dateRangeType !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter(item => {
        let itemDateVal = item[dateFilterKey];
        if (!itemDateVal && dateFilterKey === 'createdAt') {
          itemDateVal = (item as any).date || (item as any).subscribedAt || (item as any).sentAt || (item as any).joinDate;
        }
        if (!itemDateVal) return false;
        
        // Handle Firebase Timestamp or other date formats
        let itemDate: Date;
        if (itemDateVal && typeof itemDateVal === 'object' && 'toDate' in itemDateVal && typeof itemDateVal.toDate === 'function') {
          itemDate = itemDateVal.toDate();
        } else if (itemDateVal && typeof itemDateVal === 'object' && 'seconds' in itemDateVal) {
          itemDate = new Date((itemDateVal as any).seconds * 1000);
        } else {
          itemDate = new Date(String(itemDateVal));
        }

        if (isNaN(itemDate.getTime())) return true;

        switch (dateRangeType) {
          case 'today':
            return itemDate >= todayStart;
          case 'yesterday': {
            const yesterday = new Date(todayStart);
            yesterday.setDate(yesterday.getDate() - 1);
            return itemDate >= yesterday && itemDate < todayStart;
          }
          case 'this-week': {
            const weekStart = new Date(todayStart);
            weekStart.setDate(weekStart.getDate() - todayStart.getDay());
            return itemDate >= weekStart;
          }
          case 'this-month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return itemDate >= monthStart;
          }
          case 'this-year': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return itemDate >= yearStart;
          }
          case 'custom': {
            if (customStartDate && itemDate < new Date(customStartDate)) return false;
            if (customEndDate) {
              const end = new Date(customEndDate);
              end.setHours(23, 59, 59, 999);
              if (itemDate > end) return false;
            }
            return true;
          }
          default:
            return true;
        }
      });
    }

    // Search Filtering
    if (!searchTerm) return result;
    return result.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm, dateFilterKey, dateRangeType, customStartDate, customEndDate]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getExportData = () => {
    const headers = columns.map(c => c.header);
    const rows = sortedData.map(item => {
      return columns.map(c => {
        if (c.exportValue) return c.exportValue(item);
        return typeof c.accessor === 'function' ? '' : String(item[c.accessor] || '');
      });
    });
    return { headers, rows };
  };

  const exportCSV = () => {
    const { headers, rows } = getExportData();
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const { headers, rows } = getExportData();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${title || 'export'}.xlsx`);
  };

  const exportPDF = () => {
    const { headers, rows } = getExportData();
    const doc = new jsPDF();
    if (title) {
      doc.text(title, 14, 15);
    }
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title ? 20 : 10,
    });
    doc.save(`${title || 'export'}.pdf`);
  };

  return (
    <div className="bg-card rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col min-w-0">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-primary/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {title && <h4 className="text-2xl font-serif font-bold text-primary shrink-0">{title}</h4>}
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {dateFilterKey && (
            <div className="relative z-[110]">
              <Button 
                variant={dateRangeType !== 'all' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="rounded-2xl gap-2 min-w-[140px]"
              >
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {dateRangeType === 'all' ? 'Toutes les dates' : 
                   dateRangeType === 'today' ? "Aujourd'hui" :
                   dateRangeType === 'yesterday' ? 'Hier' :
                   dateRangeType === 'this-week' ? 'Cette semaine' :
                   dateRangeType === 'this-month' ? 'Ce mois' :
                   dateRangeType === 'this-year' ? 'Cette année' : 'Sur mesure'}
                </span>
              </Button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-72 bg-card border border-primary/20 rounded-2xl shadow-2xl z-[150] p-4 backdrop-blur-xl origin-top-left"
                  >
                    <div className="space-y-1 mb-4 border-b border-primary/5 pb-4">
                      {(['all', 'today', 'yesterday', 'this-week', 'this-month', 'this-year', 'custom'] as DateRangeType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setDateRangeType(type);
                            if (type !== 'custom') setIsFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            dateRangeType === type ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5 text-primary/70"
                          )}
                        >
                          {type === 'all' ? 'Tout' : 
                           type === 'today' ? "Aujourd'hui" :
                           type === 'yesterday' ? 'Hier' :
                           type === 'this-week' ? 'Cette semaine' :
                           type === 'this-month' ? 'Ce mois' :
                           type === 'this-year' ? 'Cette année' : 'Sur mesure'}
                        </button>
                      ))}
                    </div>

                    {dateRangeType === 'custom' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/50 ml-1">Début</label>
                          <input 
                            type="date" 
                            value={customStartDate} 
                            onChange={e => setCustomStartDate(e.target.value)}
                            className="w-full bg-secondary/50 px-4 py-2 rounded-xl text-xs font-bold text-primary border border-transparent focus:border-accent/30 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/50 ml-1">Fin</label>
                          <input 
                            type="date" 
                            value={customEndDate} 
                            onChange={e => setCustomEndDate(e.target.value)}
                            className="w-full bg-secondary/50 px-4 py-2 rounded-xl text-xs font-bold text-primary border border-transparent focus:border-accent/30 focus:outline-none"
                          />
                        </div>
                        <Button 
                          className="w-full text-[10px] py-1 h-auto" 
                          variant="accent" 
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          Appliquer
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {searchable && (
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-2xl border border-transparent focus:border-accent/30 focus:outline-none transition-colors text-sm"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-2xl shrink-0">
            <span className="text-xs font-bold text-primary/70 uppercase tracking-widest pl-2">Export</span>
            <Button variant="outline" size="sm" onClick={exportCSV} title="Exporter en CSV" className="rounded-xl">
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel} title="Exporter en Excel" className="rounded-xl">
              <FileSpreadsheet size={16} className="mr-1" /> XLS
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} title="Exporter en PDF" className="rounded-xl">
              <FileText size={16} className="mr-1" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-grow overflow-x-auto min-h-[300px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-secondary/30">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-primary/70 first:pl-8 last:pr-8 border-b border-primary/5"
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {typeof col.accessor === 'string' && (
                      <button 
                        onClick={() => setSortConfig({
                          key: col.accessor as string,
                          direction: sortConfig?.key === col.accessor && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        })}
                        className="hover:text-accent transition-colors p-1 -m-1"
                      >
                        {sortConfig?.key === col.accessor ? (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <MoreVertical size={14} className="opacity-30" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, i) => (
                <motion.tr
                  layout
                  key={item.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.05, 0.2) }}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-primary/5" : ""
                  )}
                >
                  {columns.map((col, j) => (
                    <td 
                      key={j} 
                      className={cn(
                        "px-6 py-5 first:pl-8 last:pr-8 text-sm",
                        col.className
                      )}
                    >
                      {typeof col.accessor === 'function' 
                        ? col.accessor(item) 
                        : (item[col.accessor] as any)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <Filter size={64} />
                    <p className="font-serif text-2xl text-primary">Aucune donnée trouvée</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Rows Per Page */}
      <div className="p-6 md:p-8 border-t border-primary/5 bg-secondary/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">Afficher</span>
          <select 
            value={itemsPerPage} 
            onChange={e => handleItemsPerPageChange(Number(e.target.value))}
            className="bg-card border border-primary/10 rounded-xl px-3 py-2 text-sm font-bold text-primary focus:outline-none focus:border-accent"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">par page</span>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-sm text-primary/70 font-medium">
            <span className="font-bold text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-primary">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> sur <span className="font-bold text-primary">{sortedData.length}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="rounded-xl"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="rounded-xl"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
