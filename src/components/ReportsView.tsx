import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Filter, 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  Edit, 
  Trash2, 
  X, 
  Info, 
  LineChart as LucideLineChart, 
  BarChart3, 
  ArrowUpRight, 
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Appointment, Customer, RevenueReport, ServiceItem } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { exportToExcel } from '../utils/exportToExcel';

interface ReportsViewProps {
  appointments: Appointment[];
  customers: Customer[];
  services: ServiceItem[];
}

export default function ReportsView({ appointments, customers, services }: ReportsViewProps) {
  // Local state for reports list synchronized from Firestore
  const [reports, setReports] = useState<RevenueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter/Search states
  const [activeSubTab, setActiveSubTab] = useState<'day' | 'month' | 'year'>('day');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minRevenue, setMinRevenue] = useState<string>('');

  // Form states for manual additions/adjustments
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  
  // Form fields
  const [formType, setFormType] = useState<'day' | 'month' | 'year'>('day');
  const [formPeriod, setFormPeriod] = useState<string>('');
  const [formRevenue, setFormRevenue] = useState<number>(0);
  const [formApptsCount, setFormApptsCount] = useState<number>(0);
  const [formCompletedCount, setFormCompletedCount] = useState<number>(0);
  const [formVisits, setFormVisits] = useState<number>(0);
  const [formNewCustomers, setFormNewCustomers] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>('');

  // 1. Listen to Firestore 'revenue_reports' collection
  useEffect(() => {
    const colRef = collection(db, 'revenue_reports');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items: RevenueReport[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as RevenueReport);
      });
      
      // Sort reports by period descending
      items.sort((a, b) => b.period.localeCompare(a.period));
      setReports(items);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching revenue reports:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to trigger success notifications
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 2. Generate historical reports from actual data (completed appointments)
  const handleAutoAggregate = async () => {
    setSyncing(true);
    try {
      const batch = writeBatch(db);

      // Maps to aggregate data
      const dailyMap: { [key: string]: Omit<RevenueReport, 'id' | 'type' | 'period' | 'updatedAt'> } = {};
      const monthlyMap: { [key: string]: Omit<RevenueReport, 'id' | 'type' | 'period' | 'updatedAt'> } = {};
      const yearlyMap: { [key: string]: Omit<RevenueReport, 'id' | 'type' | 'period' | 'updatedAt'> } = {};

      // Track unique customers by period to compute visits
      const dailyCusts: { [key: string]: Set<string> } = {};
      const monthlyCusts: { [key: string]: Set<string> } = {};
      const yearlyCusts: { [key: string]: Set<string> } = {};

      // Populate using existing appointments
      appointments.forEach((appt) => {
        const dateStr = appt.date; // YYYY-MM-DD
        if (!dateStr || dateStr.length < 10) return;

        const monthStr = dateStr.slice(0, 7); // YYYY-MM
        const yearStr = dateStr.slice(0, 4); // YYYY

        const isCompleted = appt.status === 'Hoàn thành';
        const matchedService = services.find(s => s.name === appt.serviceName);
        const actualPrice = matchedService ? matchedService.price : appt.price;
        const revenueAdd = isCompleted ? actualPrice : 0;

        // Daily Init
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = { revenue: 0, appointmentsCount: 0, completedAppointments: 0, visits: 0, newCustomers: 0, notes: 'Được đồng bộ tự động từ danh sách lịch hẹn' };
          dailyCusts[dateStr] = new Set();
        }
        // Monthly Init
        if (!monthlyMap[monthStr]) {
          monthlyMap[monthStr] = { revenue: 0, appointmentsCount: 0, completedAppointments: 0, visits: 0, newCustomers: 0, notes: 'Được tổng hợp tự động' };
          monthlyCusts[monthStr] = new Set();
        }
        // Yearly Init
        if (!yearlyMap[yearStr]) {
          yearlyMap[yearStr] = { revenue: 0, appointmentsCount: 0, completedAppointments: 0, visits: 0, newCustomers: 0, notes: 'Tổng hợp doanh thu cả năm' };
          yearlyCusts[yearStr] = new Set();
        }

        // Aggregate counts
        dailyMap[dateStr].appointmentsCount += 1;
        monthlyMap[monthStr].appointmentsCount += 1;
        yearlyMap[yearStr].appointmentsCount += 1;

        if (isCompleted) {
          dailyMap[dateStr].completedAppointments += 1;
          dailyMap[dateStr].revenue += revenueAdd;

          monthlyMap[monthStr].completedAppointments += 1;
          monthlyMap[monthStr].revenue += revenueAdd;

          yearlyMap[yearStr].completedAppointments += 1;
          yearlyMap[yearStr].revenue += revenueAdd;

          if (appt.customerId) {
            dailyCusts[dateStr].add(appt.customerId);
            monthlyCusts[monthStr].add(appt.customerId);
            yearlyCusts[yearStr].add(appt.customerId);
          }
        }
      });

      // Update visits count based on unique customers
      Object.keys(dailyMap).forEach(day => {
        dailyMap[day].visits = dailyCusts[day].size || dailyMap[day].completedAppointments;
      });
      Object.keys(monthlyMap).forEach(month => {
        monthlyMap[month].visits = monthlyCusts[month].size || monthlyMap[month].completedAppointments;
      });
      Object.keys(yearlyMap).forEach(year => {
        yearlyMap[year].visits = yearlyCusts[year].size || yearlyMap[year].completedAppointments;
      });

      const nowStr = new Date().toISOString();

      // Write Daily Reports
      Object.entries(dailyMap).forEach(([day, data]) => {
        const id = `day_${day}`;
        const docRef = doc(db, 'revenue_reports', id);
        batch.set(docRef, {
          id,
          type: 'day',
          period: day,
          ...data,
          updatedAt: nowStr
        });
      });

      // Write Monthly Reports
      Object.entries(monthlyMap).forEach(([month, data]) => {
        const id = `month_${month}`;
        const docRef = doc(db, 'revenue_reports', id);
        batch.set(docRef, {
          id,
          type: 'month',
          period: month,
          ...data,
          updatedAt: nowStr
        });
      });

      // Write Yearly Reports
      Object.entries(yearlyMap).forEach(([year, data]) => {
        const id = `year_${year}`;
        const docRef = doc(db, 'revenue_reports', id);
        batch.set(docRef, {
          id,
          type: 'year',
          period: year,
          ...data,
          updatedAt: nowStr
        });
      });

      await batch.commit();
      triggerSuccess('Đồng bộ & Tổng hợp dữ liệu báo cáo doanh thu thành công!');
    } catch (err) {
      console.error('Error during auto aggregation:', err);
    } finally {
      setSyncing(false);
    }
  };

  // 3. Handle save/update report manually
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPeriod) return;

    try {
      const generatedId = editingReportId || `${formType}_${formPeriod}`;
      const docRef = doc(db, 'revenue_reports', generatedId);

      const reportData: RevenueReport = {
        id: generatedId,
        type: formType,
        period: formPeriod,
        revenue: Number(formRevenue),
        appointmentsCount: Number(formApptsCount),
        completedAppointments: Number(formCompletedCount),
        visits: Number(formVisits),
        newCustomers: Number(formNewCustomers),
        notes: formNotes || 'Nhập thủ công',
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, reportData);
      triggerSuccess(editingReportId ? 'Cập nhật báo cáo thành công!' : 'Thêm báo cáo thủ công thành công!');
      
      // Reset Form
      setShowAddForm(false);
      setEditingReportId(null);
      setFormPeriod('');
      setFormRevenue(0);
      setFormApptsCount(0);
      setFormCompletedCount(0);
      setFormVisits(0);
      setFormNewCustomers(0);
      setFormNotes('');
    } catch (err) {
      console.error('Error saving report:', err);
    }
  };

  // Prepare edit
  const handleEditInit = (report: RevenueReport) => {
    setEditingReportId(report.id);
    setFormType(report.type);
    setFormPeriod(report.period);
    setFormRevenue(report.revenue);
    setFormApptsCount(report.appointmentsCount);
    setFormCompletedCount(report.completedAppointments);
    setFormVisits(report.visits);
    setFormNewCustomers(report.newCustomers);
    setFormNotes(report.notes || '');
    setShowAddForm(true);
  };

  // Delete manual record
  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xoá bản ghi báo cáo này không?')) {
      try {
        await deleteDoc(doc(db, 'revenue_reports', id));
        triggerSuccess('Đã xoá bản ghi báo cáo thành công.');
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  // Filtered and sorted records for display
  const filteredReports = useMemo(() => {
    return reports
      .filter(r => r.type === activeSubTab)
      .filter(r => {
        const matchesSearch = r.period.includes(searchQuery) || (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesMinRev = minRevenue ? r.revenue >= Number(minRevenue) : true;
        return matchesSearch && matchesMinRev;
      })
      .sort((a, b) => b.period.localeCompare(a.period)); // Sort latest period first
  }, [reports, activeSubTab, searchQuery, minRevenue]);

  // Chart data sorted chronological (period ascending)
  const chartData = useMemo(() => {
    return [...reports]
      .filter(r => r.type === activeSubTab)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12); // Limit to last 12 entries for visual balance
  }, [reports, activeSubTab]);

  // Total summary of current sub tab list
  const totals = useMemo(() => {
    return filteredReports.reduce((sums, r) => {
      sums.revenue += r.revenue;
      sums.appts += r.appointmentsCount;
      sums.completed += r.completedAppointments;
      sums.visits += r.visits;
      sums.newCustomers += r.newCustomers;
      return sums;
    }, { revenue: 0, appts: 0, completed: 0, visits: 0, newCustomers: 0 });
  }, [filteredReports]);

  // Currency Formatter
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Export filtered list to Excel-compatible CSV
  const handleExportCSV = () => {
    const headers = [
      'Giai đoạn',
      'Loại báo cáo',
      'Doanh thu (VND)',
      'Tổng số lịch hẹn',
      'Số lịch đã hoàn thành',
      'Số lượt khách thực tế',
      'Khách hàng mới',
      'Ghi chú',
      'Thời gian cập nhật'
    ];
    
    const keys = [
      'period',
      'type',
      'revenue',
      'appointmentsCount',
      'completedAppointments',
      'visits',
      'newCustomers',
      'notes',
      'updatedAt'
    ];

    const dataToExport = filteredReports.map(r => ({
      ...r,
      type: r.type === 'day' ? 'Ngày' : r.type === 'month' ? 'Tháng' : 'Năm',
      updatedAt: new Date(r.updatedAt).toLocaleString('vi-VN')
    }));

    exportToExcel(dataToExport, headers, keys, `Bao_cao_doanh_thu_${activeSubTab}`);
  };

  return (
    <div id="reports-view-root" className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header section with branding & active-sync indicator */}
      <div id="reports-header" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-amber-500" />
            Báo cáo Doanh thu Hệ thống
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Quản lý, theo dõi lịch sử doanh thu theo ngày, tháng, năm. Toàn bộ dữ liệu được lưu trữ dài hạn trên Cloud Firestore.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Main action: Sync / aggregate */}
          <button
            id="btn-auto-aggregate"
            onClick={handleAutoAggregate}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 hover:scale-[1.02] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Đang tổng hợp...' : 'Tổng hợp & Đồng bộ Firestore'}
          </button>
          
          <button
            id="btn-add-manual-report"
            onClick={() => {
              setEditingReportId(null);
              setFormType(activeSubTab);
              setShowAddForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm thủ công
          </button>

          <button
            id="btn-export-reports-excel"
            onClick={handleExportCSV}
            disabled={filteredReports.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Message Notifications */}
      {successMsg && (
        <div id="reports-success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Quick metrics overview based on filtered records */}
      <div id="reports-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng Doanh thu hiển thị</p>
            <p className="text-lg font-black text-slate-900 mt-1 font-mono">{formatVND(totals.revenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lượt phục vụ thực tế</p>
            <p className="text-lg font-black text-slate-900 mt-1 font-mono">{totals.visits} lượt</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lịch hoàn thành</p>
            <p className="text-lg font-black text-slate-900 mt-1 font-mono">{totals.completed} / {totals.appts}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khách mới phát sinh</p>
            <p className="text-lg font-black text-slate-900 mt-1 font-mono">+{totals.newCustomers} khách</p>
          </div>
        </div>
      </div>

      {/* Manual / Editing Form */}
      {showAddForm && (
        <div id="manual-report-form" className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative animate-fade-in">
          <button 
            onClick={() => { setShowAddForm(false); setEditingReportId(null); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="h-4 w-4" />
            {editingReportId ? 'Điều chỉnh/Sửa báo cáo doanh thu' : 'Thêm báo cáo doanh thu thủ công'}
          </h3>

          <form onSubmit={handleSaveReport} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loại báo cáo</label>
              <select
                value={formType}
                onChange={(e) => {
                  setFormType(e.target.value as any);
                  setFormPeriod('');
                }}
                disabled={!!editingReportId}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="day">Theo Ngày</option>
                <option value="month">Theo Tháng</option>
                <option value="year">Theo Năm</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {formType === 'day' ? 'Ngày (YYYY-MM-DD)' : formType === 'month' ? 'Tháng (YYYY-MM)' : 'Năm (YYYY)'}
              </label>
              <input
                type={formType === 'day' ? 'date' : 'text'}
                required
                placeholder={formType === 'month' ? '2026-07' : '2026'}
                value={formPeriod}
                onChange={(e) => setFormPeriod(e.target.value)}
                disabled={!!editingReportId}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doanh thu (VND)</label>
              <input
                type="number"
                required
                min="0"
                value={formRevenue}
                onChange={(e) => setFormRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng lịch hẹn</label>
              <input
                type="number"
                required
                min="0"
                value={formApptsCount}
                onChange={(e) => setFormApptsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lịch hoàn thành</label>
              <input
                type="number"
                required
                min="0"
                value={formCompletedCount}
                onChange={(e) => setFormCompletedCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lượt khách phục vụ</label>
              <input
                type="number"
                required
                min="0"
                value={formVisits}
                onChange={(e) => setFormVisits(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Khách hàng mới</label>
              <input
                type="number"
                required
                min="0"
                value={formNewCustomers}
                onChange={(e) => setFormNewCustomers(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ghi chú điều chỉnh</label>
              <input
                type="text"
                placeholder="Ví dụ: Đã cộng doanh số bán mỹ phẩm sỉ"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingReportId(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all"
              >
                Lưu báo cáo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main visualization section with visual Area/Bar chart */}
      <div id="reports-visuals-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        
        {/* Navigation tabs inside Reports View */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              id="subtab-day"
              onClick={() => { setActiveSubTab('day'); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'day' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Doanh thu Ngày
            </button>
            <button
              id="subtab-month"
              onClick={() => { setActiveSubTab('month'); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'month' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Doanh thu Tháng
            </button>
            <button
              id="subtab-year"
              onClick={() => { setActiveSubTab('year'); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'year' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Doanh thu Năm
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            Biểu đồ xu hướng: {activeSubTab === 'day' ? '12 ngày gần nhất' : activeSubTab === 'month' ? '12 tháng gần nhất' : 'Các năm hoạt động'}
          </div>
        </div>

        {/* Dynamic Charts via Recharts */}
        <div id="chart-container" className="h-72 mt-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="period" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="600"
                  fontFamily="monospace"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="600"
                  fontFamily="monospace"
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RevenueReport;
                      return (
                        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-xl text-xs">
                          <p className="font-extrabold text-amber-400 mb-1.5">Giai đoạn: {data.period}</p>
                          <p className="font-medium text-slate-200">
                            Doanh thu: <span className="font-bold text-white">{formatVND(data.revenue)}</span>
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            Hoàn thành: <span className="font-semibold text-slate-300">{data.completedAppointments} / {data.appointmentsCount} lịch</span>
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            Lượt khách: <span className="font-semibold text-slate-300">{data.visits} lượt</span>
                          </p>
                          {data.notes && (
                            <p className="text-[10px] text-amber-500/80 italic mt-1.5 border-t border-slate-800 pt-1 border-dashed">
                              {data.notes}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#d97706" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Doanh thu"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <BarChart3 className="h-8 w-8 text-slate-300 mb-2 animate-bounce" />
              <p className="text-xs text-slate-400 font-medium">Chưa có dữ liệu biểu đồ. Hãy bấm "Tổng hợp & Đồng bộ Firestore" để khởi tạo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Database Tables and Controls section */}
      <div id="reports-table-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Filter bar */}
        <div id="reports-table-filters" className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Danh sách báo cáo</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Period Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm giai đoạn (YYYY-MM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 w-full sm:w-48 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Min revenue filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                placeholder="Doanh thu tối thiểu..."
                value={minRevenue}
                onChange={(e) => setMinRevenue(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 w-full sm:w-48 focus:outline-none focus:border-amber-500 font-medium font-mono"
              />
            </div>
          </div>
        </div>

        {/* Main Records Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">Đang tải dữ liệu từ Firestore...</div>
          ) : filteredReports.length > 0 ? (
            <table id="reports-main-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4.5 px-6">Giai đoạn</th>
                  <th className="py-4.5 px-6">Doanh thu đạt được</th>
                  <th className="py-4.5 px-6">Tổng số lịch hẹn</th>
                  <th className="py-4.5 px-6">Đã hoàn thành</th>
                  <th className="py-4.5 px-6">Lượt phục vụ</th>
                  <th className="py-4.5 px-6">Khách mới</th>
                  <th className="py-4.5 px-6">Ghi chú hoạt động</th>
                  <th className="py-4.5 px-6 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr 
                    key={report.id}
                    id={`report-row-${report.id}`}
                    className="hover:bg-slate-50/50 transition-colors group text-xs font-medium text-slate-700"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {report.period}
                    </td>
                    <td className="py-4 px-6 font-mono font-extrabold text-slate-900">
                      {formatVND(report.revenue)}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {report.appointmentsCount} lịch
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold">
                        {report.completedAppointments} lịch
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {report.visits} lượt
                    </td>
                    <td className="py-4 px-6 text-indigo-600 font-bold font-mono">
                      +{report.newCustomers}
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-[11px] max-w-xs truncate" title={report.notes}>
                      {report.notes || '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`btn-edit-report-${report.id}`}
                          onClick={() => handleEditInit(report)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all"
                          title="Sửa bản ghi báo cáo"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`btn-delete-report-${report.id}`}
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                          title="Xoá bản ghi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">Không tìm thấy bản ghi báo cáo nào phù hợp.</p>
              <p className="text-[10px] text-slate-400 mt-1">Bấm nút "Tổng hợp & Đồng bộ Firestore" phía trên để tổng hợp dữ liệu lịch hẹn thực tế.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
