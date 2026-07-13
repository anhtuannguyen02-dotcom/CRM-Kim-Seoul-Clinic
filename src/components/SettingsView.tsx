import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  Save, 
  MapPin, 
  Clock, 
  Phone, 
  Trash2, 
  Plus, 
  DollarSign, 
  Edit3,
  CheckCircle,
  X,
  User,
  Image as ImageIcon,
  Download,
  Search,
  Filter,
  Target
} from 'lucide-react';
import { ServiceItem, ClinicProfile, Customer, Appointment, CRMTask, Technician } from '../types';
import { exportToExcel } from '../utils/exportToExcel';

interface SettingsViewProps {
  services: ServiceItem[];
  onUpdateService: (id: string, updatedFields: Partial<ServiceItem>) => void;
  onDeleteService: (id: string) => void;
  onAddService: (service: Omit<ServiceItem, 'id'>) => void;
  clinicProfile: ClinicProfile;
  onUpdateClinicProfile: (profile: ClinicProfile) => void;
  customers?: Customer[];
  appointments?: Appointment[];
  crmTasks?: CRMTask[];
  technicians?: Technician[];
  stats?: any;
  onUpdateStats?: (newStats: any) => void;
}

const SERVICE_CATEGORIES = [
  'Trẻ hoá da',
  'Tiêm thẩm mỹ',
  'Laser điều trị',
  'Body & Tắm trắng',
  'Chăm sóc cơ bản',
  'Massage',
  'Gội đầu',
  'Triệt lông',
  'Botox Hàn Quốc',
  'Filler Hàn Quốc'
] as const;

export default function SettingsView({
  services,
  onUpdateService,
  onDeleteService,
  onAddService,
  clinicProfile,
  onUpdateClinicProfile,
  customers = [],
  appointments = [],
  crmTasks = [],
  technicians = [],
  stats,
  onUpdateStats
}: SettingsViewProps) {
  // Clinic Profile form state
  const [clinicName, setClinicName] = useState(clinicProfile.name);
  const [clinicAddress, setClinicAddress] = useState(clinicProfile.address);
  const [clinicPhone, setClinicPhone] = useState(clinicProfile.phone);
  const [clinicHours, setClinicHours] = useState(clinicProfile.hours);
  const [managerName, setManagerName] = useState(clinicProfile.managerName);
  const [managerAvatar, setManagerAvatar] = useState(clinicProfile.managerAvatar);
  const [logoUrl, setLogoUrl] = useState(clinicProfile.logoUrl);
  const [dashboardImageUrl, setDashboardImageUrl] = useState(clinicProfile.dashboardImageUrl);

  // Targets / KPI Settings state
  const [dailyRevTarget, setDailyRevTarget] = useState(stats?.dailyRevenueTarget || stats?.dailyTarget || 550000000);
  const [dailyVisTarget, setDailyVisTarget] = useState(stats?.dailyVisitsTarget || 40);
  const [monthlyRevTarget, setMonthlyRevTarget] = useState(stats?.monthlyRevenueTarget || stats?.monthlyTarget || 12000000000);
  const [monthlyVisTarget, setMonthlyVisTarget] = useState(stats?.monthlyVisitsTarget || 1000);

  React.useEffect(() => {
    if (stats) {
      setDailyRevTarget(stats.dailyRevenueTarget || stats.dailyTarget || 550000000);
      setDailyVisTarget(stats.dailyVisitsTarget || 40);
      setMonthlyRevTarget(stats.monthlyRevenueTarget || stats.monthlyTarget || 12000000000);
      setMonthlyVisTarget(stats.monthlyVisitsTarget || 1000);
    }
  }, [stats]);

  // Automatically estimate daily targets and scale customer visits proportionally
  const handleMonthlyRevChange = (val: number) => {
    setMonthlyRevTarget(val);

    // Calculate daily revenue target (divide by 30 days)
    const projectedDailyRev = Math.round(val / 30);
    setDailyRevTarget(projectedDailyRev);

    // Calculate daily & monthly visits based on 500,000đ per guest
    const projectedDailyVisits = Math.max(1, Math.round(projectedDailyRev / 500000));
    setDailyVisTarget(projectedDailyVisits);

    const projectedMonthlyVisits = Math.max(1, Math.round(val / 500000));
    setMonthlyVisTarget(projectedMonthlyVisits);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStats && stats) {
      onUpdateStats({
        ...stats,
        dailyTarget: Number(dailyRevTarget),
        dailyRevenueTarget: Number(dailyRevTarget),
        dailyVisitsTarget: Number(dailyVisTarget),
        monthlyRevenueTarget: Number(monthlyRevTarget),
        monthlyVisitsTarget: Number(monthlyVisTarget)
      });
      alert('Đã cập nhật chỉ tiêu doanh thu & lượt khách thành công!');
    }
  };

  // New Service form states
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState(0);
  const [newSrvDuration, setNewSrvDuration] = useState(60);
  const [newSrvCat, setNewSrvCat] = useState<ServiceItem['category']>('Trẻ hoá da');

  // Edit Service modal states
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editSrvName, setEditSrvName] = useState('');
  const [editSrvPrice, setEditSrvPrice] = useState(0);
  const [editSrvDuration, setEditSrvDuration] = useState(60);
  const [editSrvCat, setEditSrvCat] = useState<ServiceItem['category']>('Trẻ hoá da');

  // Search & Filter service catalog states
  const [srvSearchQuery, setSrvSearchQuery] = useState('');
  const [srvCatFilter, setSrvCatFilter] = useState<string>('All');

  const handleSaveClinicProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinicProfile({
      name: clinicName,
      address: clinicAddress,
      phone: clinicPhone,
      hours: clinicHours,
      managerName: managerName,
      managerAvatar: managerAvatar,
      logoUrl: logoUrl,
      dashboardImageUrl: dashboardImageUrl
    });
    alert('Hồ sơ cơ sở thẩm mỹ đã được đồng bộ hoá thành công!');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName || newSrvPrice <= 0) return;

    onAddService({
      name: newSrvName,
      price: Number(newSrvPrice),
      durationMin: Number(newSrvDuration),
      category: newSrvCat
    });

    setNewSrvName('');
    setNewSrvPrice(0);
    setNewSrvDuration(60);
    alert('Dịch vụ mới đã được thêm vào danh mục giá niêm yết!');
  };

  const handleTriggerEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setEditSrvName(srv.name);
    setEditSrvPrice(srv.price);
    setEditSrvDuration(srv.durationMin);
    setEditSrvCat(srv.category);
  };

  const handleSaveServiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    onUpdateService(editingService.id, {
      name: editSrvName,
      price: Number(editSrvPrice),
      durationMin: Number(editSrvDuration),
      category: editSrvCat
    });
    setEditingService(null);
    alert('Cập nhật dịch vụ thành công!');
  };

  const handleDeleteSrvClick = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xoá dịch vụ "${name}" khỏi danh mục không?`)) {
      onDeleteService(id);
    }
  };

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Filtered services based on search query and category filter
  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const filteredServices = services.filter((srv) => {
    const normalizedSrvName = removeAccents(srv.name.toLowerCase());
    const normalizedQuery = removeAccents(srvSearchQuery.toLowerCase());
    const matchesSearch = normalizedSrvName.includes(normalizedQuery) || srv.name.toLowerCase().includes(srvSearchQuery.toLowerCase());
    const matchesCategory = srvCatFilter === 'All' || srv.category === srvCatFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="settings-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-xs text-slate-700">
      
      {/* Left Column: Clinic Profile Settings */}
      <div id="settings-left-column" className="lg:col-span-1 space-y-6">
        <div>
          <h2 id="settings-page-title" className="text-xl font-bold text-slate-800 tracking-tight">Cài đặt Hệ thống</h2>
          <p className="text-[10px] text-slate-400">Đồng bộ hồ sơ bệnh viện thẩm mỹ, thông tin quản lý & quy chuẩn niêm yết</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-850 uppercase tracking-wider block">Thông tin cơ sở thẩm mỹ</span>
          </div>
          
          <form onSubmit={handleSaveClinicProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tên Viện Thẩm Mỹ</label>
              <input
                id="setting-clinic-name"
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Địa chỉ chi nhánh chính</label>
              <textarea
                id="setting-clinic-addr"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white h-16 resize-none text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hotline CSKH</label>
                <input
                  id="setting-clinic-phone"
                  type="text"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ mở cửa</label>
                <input
                  id="setting-clinic-hours"
                  type="text"
                  value={clinicHours}
                  onChange={(e) => setClinicHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin người Quản lý cơ sở</span>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Họ tên Quản lý *</label>
                <input
                  id="setting-manager-name"
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ảnh đại diện Quản lý (URL) *</label>
                <input
                  id="setting-manager-avatar"
                  type="text"
                  value={managerAvatar}
                  onChange={(e) => setManagerAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-700 bg-slate-50 text-[10px]"
                  required
                />
                <div className="mt-1.5 flex items-center gap-2">
                  <img src={managerAvatar} alt="preview manager" className="h-8 w-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                  <span className="text-[10px] text-slate-400">Hình ảnh minh họa quản lý</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hình ảnh nhận diện thương hiệu (URLs)</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Logo Viện Thẩm Mỹ (URL) *</label>
                <input
                  id="setting-logo-url"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-700 bg-slate-50 text-[10px]"
                  required
                />
                <div className="mt-1.5 p-2 bg-slate-900 rounded-lg inline-block">
                  <img src={logoUrl} alt="preview logo" className="h-8 w-auto object-contain max-w-[120px]" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ảnh Banner Trang Chủ (URL) *</label>
                <input
                  id="setting-dashboard-img"
                  type="text"
                  value={dashboardImageUrl}
                  onChange={(e) => setDashboardImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-700 bg-slate-50 text-[10px]"
                  required
                />
                <div className="mt-1.5">
                  <img src={dashboardImageUrl} alt="preview banner" className="h-16 w-full object-cover rounded-xl border border-slate-200" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all mt-4"
            >
              <Save className="h-4 w-4" />
              <span>Đồng bộ tất cả thông tin</span>
            </button>
          </form>
        </div>

        {/* Central Backup & Export Dashboard */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-850 uppercase tracking-wider block">Trung tâm Xuất Excel & Sao lưu</span>
          </div>
          
          <p className="text-[10px] text-slate-400">
            Xuất dữ liệu hệ thống ra file Excel (.csv tiêu chuẩn hỗ trợ tiếng Việt có dấu) để lưu trữ ngoại tuyến hoặc báo cáo nội bộ.
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              id="btn-settings-export-customers"
              type="button"
              onClick={() => {
                exportToExcel(
                  customers,
                  ['Mã Khách hàng', 'Họ và tên', 'Số điện thoại', 'Tuổi', 'Giới tính', 'Hạng thành viên', 'Tổng chi tiêu (VND)', 'Số lần điều trị', 'Ghi chú'],
                  ['id', 'name', 'phone', 'age', 'gender', 'rank', 'totalSpent', 'totalVisits', 'notes'],
                  'Sao_luu_Khach_hang'
                );
              }}
              className="w-full py-2 px-3 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Danh bạ Khách hàng</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {customers.length} dòng <Download className="h-3 w-3 text-emerald-600" />
              </span>
            </button>

            <button
              id="btn-settings-export-appointments"
              type="button"
              onClick={() => {
                exportToExcel(
                  appointments,
                  ['Mã Lịch hẹn', 'Khách hàng', 'Số điện thoại', 'Dịch vụ điều trị', 'Đơn giá (VND)', 'Bác sĩ/Kỹ thuật viên', 'Ngày hẹn', 'Giờ hẹn', 'Trạng thái', 'Ghi chú'],
                  ['id', 'customerName', 'customerPhone', 'serviceName', 'price', 'technicianName', 'date', 'time', 'status', 'notes'],
                  'Sao_luu_Lich_hen'
                );
              }}
              className="w-full py-2 px-3 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                <span>Lịch hẹn Thẩm mỹ</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {appointments.length} dòng <Download className="h-3 w-3 text-emerald-600" />
              </span>
            </button>

            <button
              id="btn-settings-export-care"
              type="button"
              onClick={() => {
                exportToExcel(
                  crmTasks,
                  ['Mã Nhiệm vụ', 'Khách hàng', 'Số điện thoại', 'Loại chăm sóc', 'Liên quan Dịch vụ', 'Nội dung dặn dò', 'Ngày cần gọi', 'Trạng thái'],
                  ['id', 'customerName', 'customerPhone', 'type', 'serviceName', 'description', 'dueDate', 'status'],
                  'Sao_luu_Nhiem_vu_Cham_soc'
                );
              }}
              className="w-full py-2 px-3 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                <span>Nhiệm vụ Chăm sóc (CRM)</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {crmTasks.length} dòng <Download className="h-3 w-3 text-emerald-600" />
              </span>
            </button>

            <button
              id="btn-settings-export-staff"
              type="button"
              onClick={() => {
                exportToExcel(
                  technicians,
                  ['Mã Nhân viên', 'Họ và tên', 'Chức danh', 'Chuyên khoa/Kỹ năng', 'Số ca phục vụ', 'Đánh giá (Sao)', 'Trạng thái hoạt động'],
                  ['id', 'name', 'role', 'specialty', 'completedJobs', 'rating', 'status'],
                  'Sao_luu_Nhan_su'
                );
              }}
              className="w-full py-2 px-3 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Đội ngũ Nhân sự & Bác sĩ</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {technicians.length} dòng <Download className="h-3 w-3 text-emerald-600" />
              </span>
            </button>

            <button
              id="btn-settings-export-services"
              type="button"
              onClick={() => {
                exportToExcel(
                  services,
                  ['Mã Dịch vụ', 'Tên Dịch vụ', 'Phân nhóm', 'Thời lượng (Phút)', 'Đơn giá niêm yết (VND)'],
                  ['id', 'name', 'category', 'durationMin', 'price'],
                  'Sao_luu_Danh_muc_Gia_dich_vu'
                );
              }}
              className="w-full py-2 px-3 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500"></span>
                <span>Danh mục Dịch vụ & Giá niêm yết</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {services.length} dòng <Download className="h-3 w-3 text-emerald-600" />
              </span>
            </button>
          </div>
        </div>

        {/* KPI & Targets settings card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-850 uppercase tracking-wider block">Cấu hình Chỉ tiêu & KPI</span>
          </div>

          <form onSubmit={handleSaveTargets} className="space-y-5">
            {/* Daily KPI */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Chỉ tiêu Ngày</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Doanh thu ngày (đ)</label>
                  <input
                    type="number"
                    value={dailyRevTarget}
                    onChange={(e) => setDailyRevTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-bold"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số lượt khách ngày</label>
                  <input
                    type="number"
                    value={dailyVisTarget}
                    onChange={(e) => setDailyVisTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-bold"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Monthly KPI */}
            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Chỉ tiêu Tháng</span>
                <span className="text-[8px] bg-blue-50 text-blue-700 border border-blue-150 rounded-full px-2 py-0.5 font-bold animate-pulse">
                  Dự tính & chia tỉ lệ tự động
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Doanh thu tháng (đ)</label>
                  <input
                    type="number"
                    value={monthlyRevTarget}
                    onChange={(e) => handleMonthlyRevChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-bold"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số lượt khách tháng</label>
                  <input
                    type="number"
                    value={monthlyVisTarget}
                    onChange={(e) => setMonthlyVisTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-bold"
                    min="0"
                    required
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed italic mt-1.5 bg-slate-50 border border-slate-150 p-2 rounded-xl">
                💡 <strong>Mẹo thông minh:</strong> Khi bạn nhập/thay đổi Doanh thu tháng, hệ thống sẽ tự động quy đổi sang Doanh thu ngày (chia 30 ngày) và phân chia tỷ lệ số lượt khách dự tính dựa trên định mức trung bình <strong>500.000đ/đầu khách</strong>. Bạn vẫn có thể tùy chỉnh thủ công các ô khác theo ý muốn.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all mt-4"
            >
              <Save className="h-4 w-4" />
              <span>Cập nhật chỉ tiêu KPI</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 2 Columns: Service price catalog */}
      <div id="settings-right-columns" className="lg:col-span-2 space-y-6">
        {/* Service Price Catalog List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Danh mục Dịch vụ & Giá niêm yết</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Tất cả tên dịch vụ, phân nhóm, thời lượng và đơn giá đều có thể chỉnh sửa.</p>
            </div>
            <span className="bg-amber-500/10 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
              {services.length} Dịch vụ
            </span>
          </div>

          {/* Bộ lọc và Tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                id="search-services-input"
                type="text"
                placeholder="Tìm tên dịch vụ..."
                value={srvSearchQuery}
                onChange={(e) => setSrvSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              />
              {srvSearchQuery && (
                <button 
                  type="button"
                  onClick={() => setSrvSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                id="filter-services-category"
                value={srvCatFilter}
                onChange={(e) => setSrvCatFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-medium"
              >
                <option value="All">Tất cả nhóm dịch vụ ({services.length})</option>
                {SERVICE_CATEGORIES.map((cat) => {
                  const count = services.filter(s => s.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Hiển thị số kết quả lọc */}
          {(srvSearchQuery || srvCatFilter !== 'All') && (
            <div className="flex items-center justify-between text-[10px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="text-slate-500">
                Đang hiển thị <span className="font-bold text-slate-800">{filteredServices.length}</span> trên <span className="font-bold text-slate-800">{services.length}</span> dịch vụ
              </span>
              <button
                type="button"
                onClick={() => {
                  setSrvSearchQuery('');
                  setSrvCatFilter('All');
                }}
                className="text-amber-600 hover:text-amber-700 font-bold"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table id="services-settings-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-2">
                  <th className="pb-3 w-[40%]">Tên Dịch vụ</th>
                  <th className="pb-3 w-[25%]">Phân nhóm</th>
                  <th className="pb-3 w-[15%]">Thời lượng</th>
                  <th className="pb-3 w-[20%]">Đơn giá niêm yết</th>
                  <th className="pb-3 text-right">Điều chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Không tìm thấy dịch vụ nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((srv) => (
                    <tr id={`srv-row-${srv.id}`} key={srv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{srv.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-amber-500/10 rounded text-[9px] font-bold text-amber-800">
                          {srv.category}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-500 font-semibold">{srv.durationMin} phút</td>
                      <td className="py-3 font-bold text-slate-800 font-mono">
                        {formatVND(srv.price)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-trigger-edit-${srv.id}`}
                            type="button"
                            onClick={() => handleTriggerEdit(srv)}
                            className="p-1.5 hover:bg-slate-100 rounded text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center"
                            title="Sửa toàn bộ dịch vụ"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-delete-${srv.id}`}
                            type="button"
                            onClick={() => handleDeleteSrvClick(srv.id, srv.name)}
                            className="p-1.5 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700 transition-colors inline-flex items-center"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Service Catalog item */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Thêm dịch vụ mới vào danh mục</span>
          
          <form onSubmit={handleCreateService} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Tên Dịch vụ Thẩm mỹ *</label>
              <input
                id="new-srv-name"
                type="text"
                placeholder="E.g. Trẻ hóa da Meso căng bóng Hàn Quốc..."
                value={newSrvName}
                onChange={(e) => setNewSrvName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Phân nhóm *</label>
              <select
                id="new-srv-cat"
                value={newSrvCat}
                onChange={(e) => setNewSrvCat(e.target.value as ServiceItem['category'])}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none font-medium"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Đơn giá niêm yết (đ) *</label>
              <input
                id="new-srv-price"
                type="number"
                placeholder="E.g. 5500000"
                value={newSrvPrice || ''}
                onChange={(e) => setNewSrvPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Thời lượng điều trị (Phút)</label>
              <input
                id="new-srv-duration"
                type="number"
                value={newSrvDuration}
                onChange={(e) => setNewSrvDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                id="btn-add-service-catalog"
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm dịch vụ</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div id="edit-service-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="edit-service-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Chỉnh sửa dịch vụ niêm yết</span>
              <button onClick={() => setEditingService(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceEdit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tên Dịch vụ Thẩm mỹ *</label>
                <input
                  type="text"
                  value={editSrvName}
                  onChange={(e) => setEditSrvName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Phân nhóm (Danh mục) *</label>
                <select
                  value={editSrvCat}
                  onChange={(e) => setEditSrvCat(e.target.value as ServiceItem['category'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none font-medium"
                >
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Thời lượng (Phút) *</label>
                  <input
                    type="number"
                    value={editSrvDuration}
                    onChange={(e) => setEditSrvDuration(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Đơn giá niêm yết (đ) *</label>
                  <input
                    type="number"
                    value={editSrvPrice}
                    onChange={(e) => setEditSrvPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
