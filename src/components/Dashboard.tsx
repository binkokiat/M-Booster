import React, { useState, useMemo } from 'react';
import { ClientProfile, Officer, ScanStatus } from '../types';
import { 
  Plus, 
  Upload, 
  FileText, 
  Search, 
  Calendar, 
  RefreshCw, 
  Edit3, 
  Eye, 
  Trash2, 
  Send, 
  Download, 
  HardDrive, 
  Cloud,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  clients: ClientProfile[];
  currentUser: Officer;
  isLocalData: boolean;
  onToggleLocalData: (local: boolean) => void;
  onAddClient: () => void;
  onEditClient: (client: ClientProfile) => void;
  onViewReport: (client: ClientProfile) => void;
  onDeleteClient: (clientId: string) => void;
  onBulkAction: (action: 'send_ai' | 'export_raw' | 'delete', selectedIds: string[]) => void;
  onImportData: () => void;
  onImportReport: () => void;
  onSyncToCloud: () => void;
  isSyncing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  clients,
  currentUser,
  isLocalData,
  onToggleLocalData,
  onAddClient,
  onEditClient,
  onViewReport,
  onDeleteClient,
  onBulkAction,
  onImportData,
  onImportReport,
  onSyncToCloud,
  isSyncing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ScanStatus | 'all'>('all');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'send_ai' | 'export_raw' | 'delete'>('send_ai');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState('');

  // Status configuration matching original Mind Booster styling
  const statusConfigs: { status: ScanStatus; label: string; bg: string; text: string }[] = [
    { status: 'created', label: 'Created', bg: 'bg-slate-100', text: 'text-slate-700' },
    { status: 'ready_to_review', label: 'Ready to Review', bg: 'bg-amber-100', text: 'text-amber-800' },
    { status: 'approved', label: 'Approved', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { status: 'disapproved', label: 'Disapproved', bg: 'bg-rose-100', text: 'text-rose-800' },
    { status: 'ai_processing', label: 'AI-Processing', bg: 'bg-blue-100', text: 'text-blue-800' },
    { status: 'ai_resulted', label: 'AI-Resulted', bg: 'bg-purple-100', text: 'text-purple-800' },
    { status: 'analyst_reviewed', label: 'Analyst Reviewed', bg: 'bg-cyan-100', text: 'text-cyan-800' },
    { status: 'export_to_report', label: 'Export to Report', bg: 'bg-orange-100', text: 'text-orange-800' },
    { status: 'reported', label: 'Reported', bg: 'bg-teal-100', text: 'text-teal-800' },
  ];

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: clients.length };
    statusConfigs.forEach(s => counts[s.status] = 0);
    clients.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [clients]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Status filter
      if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) {
        return false;
      }
      // Search filter (ID, name, surname, nickname, phone, citizen id)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = c.user_id_code.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
        const matchesName = (c.first_name + ' ' + c.last_name).toLowerCase().includes(query);
        const matchesNick = c.nick_name.toLowerCase().includes(query);
        const matchesPhone = c.phone.includes(query);
        const matchesCitizen = c.citizen_id.includes(query);
        if (!matchesId && !matchesName && !matchesNick && !matchesPhone && !matchesCitizen) {
          return false;
        }
      }
      // Date filter
      if (dateFilter) {
        if (!c.created_at.startsWith(dateFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [clients, selectedStatusFilter, searchQuery, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const handleSelectAll = () => {
    if (selectedClientIds.length === paginatedClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(paginatedClients.map(c => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedClientIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApplyBulk = () => {
    if (selectedClientIds.length === 0) {
      alert('กรุณาเลือกรายชื่ออย่างน้อย 1 รายการ');
      return;
    }
    onBulkAction(bulkActionType, selectedClientIds);
    setSelectedClientIds([]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Client List
          </h1>

          {/* Local / Cloud pill button */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => onToggleLocalData(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                isLocalData ? 'bg-[#74B9FF] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Local ({clients.length})
            </button>
            <button
              onClick={() => onToggleLocalData(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                !isLocalData ? 'bg-[#74B9FF] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cloud
            </button>
          </div>

          {/* Sync Button */}
          {isLocalData && (
            <button
              onClick={onSyncToCloud}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#466BB2] hover:bg-[#3b5998] text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'Sync to Cloud'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons: Add Client, Import Data, Import Report */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onAddClient}
            className="flex items-center space-x-2 px-4 py-2 bg-[#A3CB38] hover:bg-[#8eb330] active:bg-[#7a9b29] text-white font-bold text-sm rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Client</span>
          </button>

          <button
            onClick={onImportData}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC312] hover:bg-[#e5ad0e] active:bg-[#cc990a] text-slate-900 font-bold text-sm rounded-lg shadow-xs transition-all"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Import Data</span>
          </button>

          {currentUser.role === 'analyst' && (
            <button
              onClick={onImportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-[#74B9FF] hover:bg-[#5da2e8] active:bg-[#478cd1] text-white font-bold text-sm rounded-lg shadow-xs transition-all"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>Import Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Bulk Actions + Search & Date Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Bulk Action Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={bulkActionType}
            onChange={(e) => setBulkActionType(e.target.value as any)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-[#466BB2] focus:outline-none"
          >
            <option value="send_ai">ส่งประมวลผล AI (Send to AI)</option>
            <option value="export_raw">ส่งออกข้อมูลดิบ (Export raw data)</option>
            <option value="delete">ลบข้อมูลที่เลือก (Delete)</option>
          </select>

          <button
            onClick={handleApplyBulk}
            disabled={selectedClientIds.length === 0}
            className="px-4 py-2 bg-[#466BB2] hover:bg-[#3b5998] active:bg-[#324b80] text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply ({selectedClientIds.length})
          </button>
        </div>

        {/* Filters: Date Range + Search Input */}
        <div className="flex items-center space-x-2.5 flex-1 max-w-xl justify-end">
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-2 text-slate-700 focus:ring-2 focus:ring-[#466BB2] focus:outline-none"
            />
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="text-[10px] text-rose-500 font-bold ml-1 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหา ID, ชื่อ, นามสกุล, เบอร์โทร..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#466BB2]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

      </div>

      {/* Status Badges Filter Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 text-xs font-semibold">
        <button
          onClick={() => setSelectedStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${
            selectedStatusFilter === 'all'
              ? 'bg-[#466BB2] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All ({statusCounts.all || 0})
        </button>

        {statusConfigs.map((cfg) => {
          const count = statusCounts[cfg.status] || 0;
          const isActive = selectedStatusFilter === cfg.status;
          return (
            <button
              key={cfg.status}
              onClick={() => setSelectedStatusFilter(cfg.status)}
              className={`px-3 py-1.5 rounded-lg shrink-0 transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-[#466BB2] text-white shadow-xs'
                  : `${cfg.bg} ${cfg.text} border border-slate-200/80 hover:opacity-80`
              }`}
            >
              <span>{cfg.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700 font-bold'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#466BB2] text-white font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedClients.length > 0 && selectedClientIds.length === paginatedClients.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#466BB2] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Client ID</th>
                <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3">ชื่อเล่น</th>
                <th className="py-3 px-3">เบอร์โทร</th>
                <th className="py-3 px-3">สถานะ (Status)</th>
                <th className="py-3 px-3">Collector</th>
                <th className="py-3 px-3">Analyst</th>
                <th className="py-3 px-3">วันที่บันทึก</th>
                <th className="py-3 px-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">ไม่พบรายชื่อ Client ตามเงื่อนไข</p>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const isSelected = selectedClientIds.includes(client.id);
                  const statusObj = statusConfigs.find(s => s.status === client.status) || statusConfigs[0];
                  return (
                    <tr 
                      key={client.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isSelected ? 'bg-blue-50/80' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(client.id)}
                          className="w-4 h-4 rounded text-[#466BB2] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 font-bold text-[#466BB2]">
                        {client.user_id_code}
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        <div className="flex items-center space-x-2">
                          {client.profile_image ? (
                            <img 
                              src={client.profile_image} 
                              alt={client.nick_name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                              {client.nick_name ? client.nick_name.charAt(0) : '?'}
                            </div>
                          )}
                          <span>{client.first_name} {client.last_name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {client.nick_name || '-'}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {client.phone || '-'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusObj.bg} ${statusObj.text}`}>
                          {statusObj.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 text-xs">
                        {client.assigned_collector || '-'}
                      </td>

                      <td className="py-3 px-3 text-slate-600 text-xs">
                        {client.assigned_analyst || '-'}
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-xs font-mono">
                        {client.created_at.slice(0, 10)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Edit / Scan button */}
                          <button
                            onClick={() => onEditClient(client)}
                            title="แก้ไข / สแกนลายนิ้วมือ"
                            className="p-1.5 text-slate-600 hover:text-[#466BB2] hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Report View Button */}
                          <button
                            onClick={() => onViewReport(client)}
                            title="ดูรายงานวิเคราะห์สมอง (Report)"
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบข้อมูลของ ${client.first_name} (${client.user_id_code}) ใช่หรือไม่?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            title="ลบข้อมูล"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span>แสดงต่อหน้า:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#466BB2]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>จากทั้งหมด {filteredClients.length} รายการ</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 font-semibold text-slate-700">
              หน้า {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
