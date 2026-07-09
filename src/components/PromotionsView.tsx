import React, { useState } from 'react';
import { 
  TicketPercent, 
  Search, 
  Plus, 
  Sparkles, 
  Calendar, 
  Check, 
  X, 
  Copy, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Edit3,
  Trash2,
  CreditCard,
  Trophy,
  UserCheck
} from 'lucide-react';
import { Promotion, Customer } from '../types';

interface PromotionsViewProps {
  promotions: Promotion[];
  onAddPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  onUpdatePromoStatus: (id: string, status: Promotion['status']) => void;
  onUpdatePromotion?: (id: string, updatedFields: Partial<Promotion>) => void;
  onDeletePromotion?: (id: string) => void;
  customers?: Customer[];
  onUpdateCustomer?: (id: string, updatedFields: Partial<Customer>) => void;
  onAddCustomer?: (customer: Omit<Customer, 'id' | 'totalSpent' | 'totalVisits' | 'treatmentHistory' | 'activePackages' | 'beforeAfterImages'>) => void;
}

export default function PromotionsView({
  promotions,
  onAddPromotion,
  onUpdatePromoStatus,
  onUpdatePromotion,
  onDeletePromotion,
  customers = [],
  onUpdateCustomer,
  onAddCustomer
}: PromotionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick setup program states
  const [selectedRewardCustId, setSelectedRewardCustId] = useState('');
  const [rewardBillAmount, setRewardBillAmount] = useState<number>(3000000);
  const [selectedPassCustId, setSelectedPassCustId] = useState('');

  // Quick Add customer state for KIM REWARD
  const [showQuickAddRewardCust, setShowQuickAddRewardCust] = useState(false);
  const [quickRewardCustName, setQuickRewardCustName] = useState('');
  const [quickRewardCustPhone, setQuickRewardCustPhone] = useState('');
  const [quickRewardCustBday, setQuickRewardCustBday] = useState('1996-01-01');

  // Quick Add customer state for KIM SKINCARE PASS
  const [showQuickAddPassCust, setShowQuickAddPassCust] = useState(false);
  const [quickPassCustName, setQuickPassCustName] = useState('');
  const [quickPassCustPhone, setQuickPassCustPhone] = useState('');
  const [quickPassCustBday, setQuickPassCustBday] = useState('1996-01-01');

  const handleQuickAddAndRegisterReward = () => {
    if (!onAddCustomer) return;
    if (!quickRewardCustName || !quickRewardCustPhone) {
      alert('Vui lòng điền đủ thông tin khách hàng mới.');
      return;
    }

    const today = new Date();
    const birth = new Date(quickRewardCustBday);
    let calculatedAge = 30;
    if (!isNaN(birth.getTime())) {
      calculatedAge = today.getFullYear() - birth.getFullYear();
    }

    onAddCustomer({
      name: quickRewardCustName,
      phone: quickRewardCustPhone,
      age: calculatedAge,
      birthday: quickRewardCustBday,
      gender: 'Nữ',
      rank: 'Standard',
      notes: 'Đăng ký nhanh từ KIM REWARD',
      discountPercent: 0,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
      kimRewardBillGoc: rewardBillAmount,
      kimRewardReferrals: []
    });

    alert(`Đăng ký và kích hoạt KIM REWARD thành công cho khách hàng "${quickRewardCustName}"!`);
    
    // Reset states
    setQuickRewardCustName('');
    setQuickRewardCustPhone('');
    setQuickRewardCustBday('1996-01-01');
    setShowQuickAddRewardCust(false);
  };

  const handleQuickAddAndRegisterPass = () => {
    if (!onAddCustomer) return;
    if (!quickPassCustName || !quickPassCustPhone) {
      alert('Vui lòng điền đủ thông tin khách hàng mới.');
      return;
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3);

    const birth = new Date(quickPassCustBday);
    let calculatedAge = 30;
    if (!isNaN(birth.getTime())) {
      calculatedAge = today.getFullYear() - birth.getFullYear();
    }

    onAddCustomer({
      name: quickPassCustName,
      phone: quickPassCustPhone,
      age: calculatedAge,
      birthday: quickPassCustBday,
      gender: 'Nữ',
      rank: 'Standard',
      notes: 'Đăng ký nhanh từ KIM SKINCARE PASS',
      discountPercent: 0,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
      kimSkincarePass: {
        activatedDate: today.toLocaleDateString('vi-VN'),
        expiryDate: expiry.toLocaleDateString('vi-VN'),
        price: 1000000,
        status: 'Hoạt động'
      }
    });

    alert(`Đăng ký và kích hoạt KIM SKINCARE PASS thành công cho hội viên "${quickPassCustName}"!`);
    
    // Reset states
    setQuickPassCustName('');
    setQuickPassCustPhone('');
    setQuickPassCustBday('1996-01-01');
    setShowQuickAddPassCust(false);
  };

  const handleQuickRegisterReward = () => {
    if (!onUpdateCustomer || !selectedRewardCustId) {
      alert('Vui lòng chọn khách hàng.');
      return;
    }
    const targetCust = customers.find(c => c.id === selectedRewardCustId);
    if (!targetCust) return;

    onUpdateCustomer(selectedRewardCustId, {
      kimRewardBillGoc: rewardBillAmount,
      kimRewardReferrals: []
    });
    alert(`Đăng ký chương trình KIM REWARD thành công cho khách hàng "${targetCust.name}"!`);
    setSelectedRewardCustId('');
  };

  const handleQuickRegisterPass = () => {
    if (!onUpdateCustomer || !selectedPassCustId) {
      alert('Vui lòng chọn khách hàng.');
      return;
    }
    const targetCust = customers.find(c => c.id === selectedPassCustId);
    if (!targetCust) return;

    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3);

    onUpdateCustomer(selectedPassCustId, {
      kimSkincarePass: {
        activatedDate: today.toLocaleDateString('vi-VN'),
        expiryDate: expiry.toLocaleDateString('vi-VN'),
        price: 1000000,
        status: 'Hoạt động'
      }
    });
    alert(`Đăng ký KIM SKINCARE PASS thành công cho hội viên "${targetCust.name}"!`);
    setSelectedPassCustId('');
  };

  // Edit Promotion States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editVal, setEditVal] = useState('');
  const [editMinSpend, setEditMinSpend] = useState(0);
  const [editExpiry, setEditExpiry] = useState('2026-12-31');
  const [editDesc, setEditDesc] = useState('');

  const handleStartEditPromo = (promo: Promotion) => {
    setSelectedPromoId(promo.id);
    setEditCode(promo.code);
    setEditTitle(promo.title);
    setEditVal(promo.discountValue);
    setEditMinSpend(promo.minSpend);
    setEditExpiry(promo.expiryDate);
    setEditDesc(promo.description || '');
    setShowEditModal(true);
  };

  const handleEditPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoId || !onUpdatePromotion) return;

    onUpdatePromotion(selectedPromoId, {
      code: editCode.toUpperCase().replace(/\s+/g, ''),
      title: editTitle,
      discountValue: editVal,
      minSpend: Number(editMinSpend),
      expiryDate: editExpiry,
      description: editDesc
    });

    setShowEditModal(false);
    setSelectedPromoId(null);
    alert('Cập nhật Voucher thành công!');
  };

  // Form states for new promo voucher
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newMinSpend, setNewMinSpend] = useState(0);
  const [newExpiry, setNewExpiry] = useState('2026-12-31');
  const [newDesc, setNewDesc] = useState('');

  // Filter promotions
  const filteredPromotions = promotions.filter(p => 
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle || !newVal) return;

    onAddPromotion({
      code: newCode.toUpperCase().replace(/\s+/g, ''),
      title: newTitle,
      discountValue: newVal,
      minSpend: Number(newMinSpend),
      expiryDate: newExpiry,
      description: newDesc,
      status: 'Hoạt động'
    });

    setShowAddModal(false);
    setNewCode('');
    setNewTitle('');
    setNewVal('');
    setNewMinSpend(0);
    setNewDesc('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div id="promotions-view-root" className="space-y-6 animate-fade-in">
      
      {/* Header section */}
      <div id="promotions-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="promo-page-title" className="text-xl font-bold text-slate-800 tracking-tight">Quản lý Khuyến mãi & Voucher</h2>
          <p className="text-[10px] text-slate-400">Thiết lập các chiến dịch kích cầu, mã giảm giá và thẻ quà tặng tri ân</p>
        </div>
        <button
          id="btn-add-promo-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 text-amber-500" />
          <span>Tạo mã Voucher mới</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div id="promotions-controls" className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5" />
          <input
            id="promo-search-field"
            type="text"
            placeholder="Tìm kiếm mã hoặc tên chiến dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* SPECIAL CLINC PROGRAMS (KIM REWARD & KIM SKINCARE PASS) */}
      <div id="special-programs-container" className="space-y-6">
        
        {/* KIM REWARD Program Showcase Section */}
        <div id="kim-reward-program-banner" className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl border border-amber-500/20 shadow-lg p-6 sm:p-8 text-white relative overflow-hidden animate-fade-in">
          {/* Background visual accents */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_bottom_right,var(--color-amber-500),transparent_70%)] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">CHƯƠNG TRÌNH ĐẶC BIỆT</span>
                <span className="text-amber-400 font-mono text-[10px] font-bold">KIM SEOUL CLINIC TRI ÂN</span>
              </div>
              
              <h3 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-400" />
                <span>KIM REWARD</span>
              </h3>
              
              <p className="text-sm font-bold text-slate-100">
                "Giới thiệu khách mới – Nhận lại đến 100% giá trị bill gốc."
              </p>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Kim Reward là chương trình tri ân sâu sắc dành riêng cho khách hàng của Kim Seoul Clinic. Khi giới thiệu thành công các thành viên mới tham gia trải nghiệm, quý khách có cơ hội được nhận lại hoàn toàn tới <strong className="text-amber-300">100% giá trị hóa đơn cũ</strong> của chính mình theo cơ chế phân mốc thông minh.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:flex-col md:items-end shrink-0">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">Tổng hoàn trả tối đa</span>
                <span className="text-sm font-extrabold font-mono text-white">100% Bill Gốc</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">Ngưỡng Bill Áp Dụng</span>
                <span className="text-sm font-extrabold font-mono text-white">2.000.000đ - 10.000.000đ</span>
              </div>
            </div>
          </div>

          {/* Detailed Mechanics Collapse/Accordion */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-1.5">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <span>🎯 Điểm cốt lõi</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                <li>Muốn hoàn <strong>100% bill gốc</strong>, tổng doanh thu khách mới phải tối thiểu gấp <strong>3 lần</strong> bill gốc.</li>
                <li>Có tối thiểu <strong>3 khách mới</strong> hợp lệ phát sinh giao dịch thực tế từ 2.000.000đ.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <span>📊 3 Mốc Hoàn Tiền</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                <li><strong>Mốc 1 (Hoàn 33.3%):</strong> ≥ 1 khách mới & tổng doanh thu mới ≥ 1x bill gốc.</li>
                <li><strong>Mốc 2 (Hoàn 33.3%):</strong> ≥ 2 khách mới & tổng doanh thu mới ≥ 2x bill gốc.</li>
                <li><strong>Mốc 3 (Hoàn 33.4%):</strong> ≥ 3 khách mới & tổng doanh thu mới ≥ 3x bill gốc.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-rose-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <span>⚠️ Điều kiện loại trừ</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                <li>Không tính: các giao dịch đặt cọc, hủy hóa đơn, hoàn/đổi dịch vụ.</li>
                <li>Không tính các bill trải nghiệm giá rẻ (179k, 199k, v.v.).</li>
                <li>Trùng thông tin/số điện thoại người giới thiệu sẽ không hợp lệ.</li>
              </ul>
            </div>
          </div>

          {/* Quick Setup for Kim Reward */}
          <div className="mt-5 pt-5 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl relative z-10">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">KÍCH HOẠT NHANH CHO KHÁCH HÀNG:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedRewardCustId}
                onChange={(e) => {
                  if (e.target.value === 'new_customer') {
                    setShowQuickAddRewardCust(true);
                    setSelectedRewardCustId('');
                  } else {
                    setSelectedRewardCustId(e.target.value);
                  }
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 md:w-52 font-medium"
              >
                <option value="">-- Chọn khách hàng nhận chương trình --</option>
                {onAddCustomer && (
                  <option value="new_customer" className="text-amber-400 font-bold bg-slate-950">+ Thêm nhanh khách hàng mới...</option>
                )}
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) {c.kimRewardBillGoc ? `✓ Đang tham gia (${new Intl.NumberFormat('vi-VN').format(c.kimRewardBillGoc)}đ)` : ''}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
                <span className="text-[10px] text-slate-400">Bill gốc:</span>
                <input
                  type="number"
                  min="2000000"
                  max="10000000"
                  step="500000"
                  value={rewardBillAmount}
                  onChange={(e) => setRewardBillAmount(Number(e.target.value))}
                  className="bg-transparent border-none p-0 w-20 text-white font-mono focus:outline-none focus:ring-0 text-right font-bold"
                />
                <span className="text-slate-400">đ</span>
              </div>

              <button
                onClick={handleQuickRegisterReward}
                disabled={!selectedRewardCustId}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs tracking-tight transition-all active:scale-95 whitespace-nowrap"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>

        {/* KIM SKINCARE PASS MEMBER Program Showcase Section */}
        <div id="kim-skincare-pass-banner" className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-3xl border border-amber-500/20 shadow-lg p-6 sm:p-8 text-white relative overflow-hidden animate-fade-in">
          {/* Background visual accents */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 bg-[radial-gradient(circle_at_bottom_right,var(--color-amber-500),transparent_70%)] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">THÈ HỘI VIÊN CAO CẤP</span>
                <span className="text-amber-400 font-mono text-[10px] font-bold">KIM SKINCARE PASS MEMBER</span>
              </div>
              
              <h3 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-amber-400" />
                <span>KIM SKINCARE PASS</span>
              </h3>
              
              <p className="text-sm font-bold text-slate-100">
                "Chăm sóc đều hơn – tận hưởng ưu đãi tinh tế và tiết kiệm tối đa."
              </p>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Kim Skincare Pass mang tới hành trình chăm sóc sắc đẹp hoàn hảo, tinh tế và tiết kiệm nhất tại Kim Seoul Clinic. Đồng hành cùng hội viên bền bỉ trong 3 tháng với mức chiết khấu sâu đặc biệt cho mọi liệu trình chăm sóc da cùng dịch vụ Filler & Botox.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:flex-col md:items-end shrink-0">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">Phí Đăng Ký Thẻ</span>
                <span className="text-sm font-extrabold font-mono text-amber-300">1.000.000đ / 3 tháng</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">Thời hạn sử dụng</span>
                <span className="text-sm font-extrabold font-mono text-white">90 Ngày</span>
              </div>
            </div>
          </div>

          {/* Detailed Benefits - matching the three gold badges in the user's image */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/10 space-y-1">
              <span className="text-xl font-black text-amber-400 block">GIẢM 50%</span>
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">Mọi dịch vụ chăm sóc da</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">Áp dụng trực tiếp cho tất cả liệu trình làm sạch da sâu, meso trẻ hoá căng bóng, laser điều trị tại Kim Seoul. Không áp dụng cho Filler & Botox.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/10 space-y-1">
              <span className="text-xl font-black text-amber-400 block">GIẢM 20%</span>
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">Dịch vụ Filler & Botox</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">Giảm giá trực tiếp cho dịch vụ tiêm thẩm mỹ chính hãng chuẩn Hàn Quốc như thon gọn hàm, làm đầy má hóp, rãnh cười.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/10 space-y-1">
              <span className="text-xl font-black text-amber-400 block">GIẢM 10%</span>
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">Sản phẩm chăm sóc da</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">Hỗ trợ chiết khấu khi mua trực tiếp mỹ phẩm cao cấp, serum dưỡng ẩm phục hồi chính hãng ngay tại viện thẩm mỹ.</p>
            </div>
          </div>

          {/* Quick Setup for Kim Skincare Pass */}
          <div className="mt-5 pt-5 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl relative z-10">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">KÍCH HOẠT NHANH KIM SKINCARE PASS:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedPassCustId}
                onChange={(e) => {
                  if (e.target.value === 'new_customer') {
                    setShowQuickAddPassCust(true);
                    setSelectedPassCustId('');
                  } else {
                    setSelectedPassCustId(e.target.value);
                  }
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 md:w-72 font-medium"
              >
                <option value="">-- Chọn khách hàng cài đặt Pass --</option>
                {onAddCustomer && (
                  <option value="new_customer" className="text-amber-400 font-bold bg-slate-950">+ Thêm nhanh khách hàng mới...</option>
                )}
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) {c.kimSkincarePass ? `✓ Đã sở hữu Pass` : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={handleQuickRegisterPass}
                disabled={!selectedPassCustId}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 disabled:hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs tracking-tight transition-all active:scale-95 whitespace-nowrap"
              >
                Kích hoạt thẻ ngay
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Promotion Cards Grid Layout */}
      <div id="promotions-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.length > 0 ? (
          filteredPromotions.map((promo) => (
            <div
              id={`promo-voucher-card-${promo.id}`}
              key={promo.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between overflow-hidden relative group hover:shadow-md transition-all duration-300"
            >
              {/* Dashed voucher divider ornament */}
              <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-slate-200 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute top-1/2 left-[-6px] h-3 w-3 bg-slate-50 rounded-full border border-slate-200 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute top-1/2 right-[-6px] h-3 w-3 bg-slate-50 rounded-full border border-slate-200 -translate-y-1/2 pointer-events-none"></div>

              {/* Upper Section */}
              <div className="p-6 pb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    promo.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {promo.status}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium font-mono mr-1.5">{promo.usageCount} lượt dùng</span>
                    
                    {onUpdatePromotion && (
                      <button
                        onClick={() => handleStartEditPromo(promo)}
                        className="p-1 text-slate-400 hover:text-amber-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Chỉnh sửa Voucher"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    {onDeletePromotion && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa mã voucher "${promo.code}" không?`)) {
                            onDeletePromotion(promo.id);
                            alert('Đã xóa voucher thành công!');
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Xóa Voucher"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{promo.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">{promo.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-xs text-slate-400 font-semibold">Ưu đãi:</span>
                  <span className="text-lg font-black text-amber-600 tracking-tight">{promo.discountValue}</span>
                </div>
              </div>

              {/* Lower Section */}
              <div className="p-6 pt-8 bg-slate-50/75 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-medium">Hạn sử dụng: <strong className="text-slate-700 font-mono">{promo.expiryDate}</strong></span>
                  {promo.minSpend > 0 && <span className="font-semibold">Đơn từ: {formatVND(promo.minSpend)}</span>}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-slate-800 tracking-wider select-all flex items-center justify-between gap-2 flex-1">
                    <span>{promo.code}</span>
                    <button
                      id={`btn-copy-${promo.id}`}
                      onClick={() => handleCopyCode(promo.code)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy mã voucher"
                    >
                      {copiedCode === promo.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {promo.status === 'Hoạt động' ? (
                      <button
                        id={`btn-promo-pause-${promo.id}`}
                        onClick={() => onUpdatePromoStatus(promo.id, 'Tạm dừng')}
                        className="px-2.5 py-2 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-[10px] transition-colors border border-slate-200"
                      >
                        Dừng
                      </button>
                    ) : (
                      <button
                        id={`btn-promo-resume-${promo.id}`}
                        onClick={() => onUpdatePromoStatus(promo.id, 'Hoạt động')}
                        className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-bold text-[10px] transition-colors"
                      >
                        Bật
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-xs text-slate-400">
            Không tìm thấy voucher phù hợp
          </div>
        )}
      </div>

      {/* Add Voucher Modal */}
      {showAddModal && (
        <div id="add-promo-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="add-promo-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Thiết lập Chiến dịch Khuyến mãi mới</span>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mã Voucher *</label>
                  <input
                    id="new-promo-code"
                    type="text"
                    placeholder="E.g. MESO30"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mức giảm giá *</label>
                  <input
                    id="new-promo-val"
                    type="text"
                    placeholder="E.g. 20% hoặc 1.000.000đ"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tên chiến dịch *</label>
                <input
                  id="new-promo-title"
                  type="text"
                  placeholder="E.g. Tri ân vàng nâng tầm rạng rỡ..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạn mức chi tiêu tối thiểu</label>
                  <input
                    id="new-promo-min"
                    type="number"
                    value={newMinSpend}
                    onChange={(e) => setNewMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạn hết hạn</label>
                  <input
                    id="new-promo-expiry"
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mô tả / Thể lệ tham gia</label>
                <textarea
                  id="new-promo-desc"
                  placeholder="Giảm giá áp dụng cho liệu trình bắn Laser..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 bg-white resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="promo-cancel-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="promo-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Kích hoạt mã Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Voucher Modal */}
      {showEditModal && (
        <div id="edit-promo-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="edit-promo-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Chỉnh sửa thông tin Voucher</span>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditPromoSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mã Voucher *</label>
                  <input
                    id="edit-promo-code"
                    type="text"
                    placeholder="E.g. MESO30"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mức giảm giá *</label>
                  <input
                    id="edit-promo-val"
                    type="text"
                    placeholder="E.g. 20% hoặc 1.000.000đ"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tên chiến dịch *</label>
                <input
                  id="edit-promo-title"
                  type="text"
                  placeholder="E.g. Tri ân vàng nâng tầm rạng rỡ..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạn mức chi tiêu tối thiểu</label>
                  <input
                    id="edit-promo-min"
                    type="number"
                    value={editMinSpend}
                    onChange={(e) => setEditMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạn hết hạn</label>
                  <input
                    id="edit-promo-expiry"
                    type="date"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mô tả / Thể lệ tham gia</label>
                <textarea
                  id="edit-promo-desc"
                  placeholder="Giảm giá áp dụng cho liệu trình bắn Laser..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 bg-white resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="edit-promo-cancel-btn"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="edit-promo-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
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
