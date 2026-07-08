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
  Trash2
} from 'lucide-react';
import { Promotion } from '../types';

interface PromotionsViewProps {
  promotions: Promotion[];
  onAddPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  onUpdatePromoStatus: (id: string, status: Promotion['status']) => void;
  onUpdatePromotion?: (id: string, updatedFields: Partial<Promotion>) => void;
  onDeletePromotion?: (id: string) => void;
}

export default function PromotionsView({
  promotions,
  onAddPromotion,
  onUpdatePromoStatus,
  onUpdatePromotion,
  onDeletePromotion
}: PromotionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
