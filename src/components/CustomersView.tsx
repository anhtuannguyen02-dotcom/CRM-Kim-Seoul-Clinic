import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Sparkles, 
  Phone, 
  MapPin, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  CheckCircle, 
  Compass, 
  Calendar,
  ChevronLeft,
  Briefcase,
  X
} from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'totalVisits' | 'treatmentHistory' | 'activePackages' | 'beforeAfterImages'>) => void;
  onAddTreatmentNote: (customerId: string, note: string, serviceName: string, technician: string) => void;
}

export default function CustomersView({
  customers,
  onAddCustomer,
  onAddTreatmentNote
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<'All' | Customer['rank']>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>('cust_1'); // default Nguyễn Phương Anh
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new customer
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAge, setNewAge] = useState(30);
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nữ');
  const [newRank, setNewRank] = useState<Customer['rank']>('Standard');
  const [newNotes, setNewNotes] = useState('');

  // Form states for adding a treatment session note
  const [newTreatmentNote, setNewTreatmentNote] = useState('');
  const [newTreatmentService, setNewTreatmentService] = useState('Tiêm Meso căng bóng HA');
  const [newTreatmentTech, setNewTreatmentTech] = useState('Phạm Minh Tú');

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesRank = rankFilter === 'All' ? true : c.rank === rankFilter;
    return matchesSearch && matchesRank;
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Handle Add Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    onAddCustomer({
      name: newName,
      phone: newPhone,
      age: Number(newAge),
      gender: newGender,
      rank: newRank,
      notes: newNotes,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A'
    });

    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewAge(30);
    setNewNotes('');
  };

  // Handle Add Treatment Session
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newTreatmentNote) return;

    onAddTreatmentNote(
      selectedCustomerId,
      newTreatmentNote,
      newTreatmentService,
      newTreatmentTech
    );

    setNewTreatmentNote('');
  };

  return (
    <div id="customers-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Customer Directory */}
      <div id="customers-directory-column" className="lg:col-span-1 space-y-6 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="cust-dir-title" className="text-sm font-bold text-slate-800">Danh bạ Khách hàng</h2>
            <p className="text-[10px] text-slate-400">Quản lý hồ sơ và bệnh án thẩm mỹ</p>
          </div>
          <button
            id="btn-add-customer-modal"
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl flex items-center justify-center transition-all"
            title="Thêm khách hàng mới"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div id="customers-search-bar" className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 shrink-0">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3" />
            <input
              id="cust-search-input"
              type="text"
              placeholder="Tìm theo tên hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div id="cust-rank-filter-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['All', 'Diamond VIP', 'Gold Member', 'Silver Member', 'Standard'] as const).map((rank) => (
              <button
                id={`rank-filter-tab-${rank}`}
                key={rank}
                onClick={() => setRankFilter(rank)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold whitespace-nowrap transition-colors ${
                  rankFilter === rank 
                    ? 'bg-slate-900 text-amber-400' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {rank === 'All' ? 'Tất cả' : rank.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Listing */}
        <div id="customers-list-box" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex-1 min-h-[300px] overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-270px)]">
          <div className="divide-y divide-slate-100">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <div
                  id={`customer-item-${c.id}`}
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedCustomerId === c.id ? 'bg-amber-500/5 border-l-3 border-amber-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={c.avatar} 
                      alt={c.name} 
                      className="h-9 w-9 rounded-full object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">{c.phone}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      c.rank === 'Diamond VIP' ? 'bg-amber-50 text-amber-700' :
                      c.rank === 'Gold Member' ? 'bg-yellow-50 text-yellow-700' :
                      c.rank === 'Silver Member' ? 'bg-slate-100 text-slate-700' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {c.rank.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium font-mono mt-1">{c.totalVisits} ca</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Không tìm thấy khách hàng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT 2 COLUMNS: Profile & Clinical History Detail View */}
      <div id="customer-profile-column" className="lg:col-span-2">
        {selectedCustomer ? (
          <div id="customer-detailed-card" className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 space-y-8 animate-fade-in">
            {/* Profile Overview Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img 
                  id="customer-profile-avatar-img"
                  src={selectedCustomer.avatar} 
                  alt={selectedCustomer.name} 
                  className="h-16 w-16 rounded-full object-cover border-2 border-amber-300 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 id="customer-profile-name" className="text-base font-extrabold text-slate-900 leading-none">{selectedCustomer.name}</h3>
                    <span id="customer-profile-rank" className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      selectedCustomer.rank === 'Diamond VIP' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                      selectedCustomer.rank === 'Gold Member' ? 'bg-yellow-50 text-yellow-700 border-yellow-200/50' :
                      selectedCustomer.rank === 'Silver Member' ? 'bg-slate-100 text-slate-700 border-slate-200/50' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {selectedCustomer.rank}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {selectedCustomer.phone}
                    </span>
                    <span>Tuổi: <strong className="text-slate-700">{selectedCustomer.age}</strong> • Giới tính: <strong className="text-slate-700">{selectedCustomer.gender}</strong></span>
                  </div>
                </div>
              </div>

              {/* Spend Details */}
              <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start w-full sm:w-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 sm:p-0 sm:bg-transparent sm:border-none">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Tổng tích lũy</span>
                  <p id="customer-profile-spend" className="text-sm font-extrabold text-amber-600 font-mono mt-0.5">{formatVND(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="sm:mt-2.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Tổng số buổi</span>
                  <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{selectedCustomer.totalVisits} buổi</span>
                </div>
              </div>
            </div>

            {/* Grid details (Notes & Packages) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinical Notes */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5 mb-2.5">
                  <FileText className="h-3.5 w-3.5 text-amber-700" />
                  Đặc điểm Da & Chỉ định lâm sàng
                </span>
                <p id="customer-profile-notes" className="text-xs text-slate-600 leading-relaxed font-medium">
                  {selectedCustomer.notes || 'Chưa cập nhật chỉ định riêng.'}
                </p>
              </div>

              {/* Active Packages info */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-indigo-800 font-bold flex items-center gap-1.5 mb-2.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  Liệu trình sở hữu
                </span>
                {selectedCustomer.activePackages.length > 0 ? (
                  selectedCustomer.activePackages.map((pkg, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-xs font-bold text-slate-800">{pkg.packageName}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <span>Tiến trình buổi</span>
                        <span>{pkg.usedSessions} / {pkg.totalSessions} buổi</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${(pkg.usedSessions / pkg.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Khách chưa mua gói liệu trình combo.</p>
                )}
              </div>
            </div>

            {/* BEFORE / AFTER Photo Comparisons */}
            {selectedCustomer.beforeAfterImages.length > 0 && (
              <div id="customer-before-after-section" className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-600" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Hình ảnh kiểm chứng kết quả lâm sàng</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCustomer.beforeAfterImages.map((img, idx) => (
                    <div id={`before-after-card-${idx}`} key={idx} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{img.title}</p>
                      <div className="grid grid-cols-2 gap-3 relative">
                        <div className="relative rounded-xl overflow-hidden shadow-sm">
                          <img 
                            src={img.before} 
                            alt="Before clinical treatment" 
                            className="w-full h-36 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Trước</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden shadow-sm">
                          <img 
                            src={img.after} 
                            alt="After clinical treatment" 
                            className="w-full h-36 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 left-2 bg-amber-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Sau</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Timeline / Sessions History */}
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Biểu đồ bệnh án & Lịch sử ca điều trị</span>
              
              <div id="customer-timeline" className="relative pl-6 border-l border-slate-200 space-y-6">
                {selectedCustomer.treatmentHistory.length > 0 ? (
                  selectedCustomer.treatmentHistory.map((item) => (
                    <div id={`timeline-item-${item.id}`} key={item.id} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-amber-500 border-4 border-white flex items-center justify-center shadow-sm"></span>
                      
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-2 hover:border-amber-200 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900">{item.serviceName}</p>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {item.date}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {item.note}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                          <span className="font-semibold">Bác sĩ phụ trách: <strong className="text-slate-600">{item.technician}</strong></span>
                          <span className="text-emerald-600 font-bold">✓ {item.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có lịch sử điều trị trước đây.</p>
                )}
              </div>
            </div>

            {/* Clinical Logging Form */}
            <div className="pt-6 border-t border-slate-100">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-4">Ghi nhận buổi trị liệu mới</span>
              
              <form onSubmit={handleAddSession} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Dịch vụ</label>
                  <select
                    id="new-session-srv"
                    value={newTreatmentService}
                    onChange={(e) => setNewTreatmentService(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Trẻ hoá da Thermage FLX 900">Thermage FLX 900</option>
                    <option value="Tiêm Meso căng bóng HA căng mọng">Tiêm Meso HA</option>
                    <option value="Laser Pico Premium trị nám sạm">Laser Pico Premium</option>
                    <option value="Nâng cơ Ultherapy VIP">Ultherapy VIP</option>
                    <option value="Điện di phục hồi Vitamin C Hàn Quốc">Điện di Vitamin C</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Kỹ thuật viên / Clinician</label>
                  <select
                    id="new-session-tech"
                    value={newTreatmentTech}
                    onChange={(e) => setNewTreatmentTech(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Phạm Minh Tú">Phạm Minh Tú</option>
                    <option value="Nguyễn Đông Nhi">Nguyễn Đông Nhi</option>
                    <option value="Trần Hà Phương">Trần Hà Phương</option>
                    <option value="Lê Quỳnh Anh">Lê Quỳnh Anh</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Kết quả & dặn dò lâm sàng *</label>
                  <div className="flex gap-2">
                    <input
                      id="new-session-note"
                      type="text"
                      placeholder="Bác sĩ lưu bút: Da thích ứng tốt, dặn dò chống nắng..."
                      value={newTreatmentNote}
                      onChange={(e) => setNewTreatmentNote(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      id="btn-add-session"
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap transition-all"
                    >
                      Lưu ca máy
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
            Chọn một khách hàng để xem chi tiết hồ sơ bệnh án
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div id="add-customer-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="add-customer-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Đăng ký Hồ sơ Khách hàng mới</span>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Họ và tên khách hàng *</label>
                <input
                  id="new-cust-name-input"
                  type="text"
                  placeholder="Họ và tên..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Số điện thoại *</label>
                  <input
                    id="new-cust-phone-input"
                    type="text"
                    placeholder="SĐT..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tuổi</label>
                  <input
                    id="new-cust-age-input"
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Giới tính</label>
                  <select
                    id="new-cust-gender-input"
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạng thành viên</label>
                  <select
                    id="new-cust-rank-input"
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value as Customer['rank'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver Member">Silver Member</option>
                    <option value="Gold Member">Gold Member</option>
                    <option value="Diamond VIP">Diamond VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Ghi chú lâm sàng / dặn dò da</label>
                <textarea
                  id="new-cust-notes-input"
                  placeholder="Nhập ghi chú ví dụ: Da hỗn hợp nhạy cảm..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 bg-white resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="new-cust-cancel-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="new-cust-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Xác nhận lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
