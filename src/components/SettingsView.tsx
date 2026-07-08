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
  CheckCircle
} from 'lucide-react';
import { ServiceItem } from '../types';

interface SettingsViewProps {
  services: ServiceItem[];
  onUpdateServicePrice: (id: string, price: number) => void;
  onAddService: (service: Omit<ServiceItem, 'id'>) => void;
}

export default function SettingsView({
  services,
  onUpdateServicePrice,
  onAddService
}: SettingsViewProps) {
  // Clinic Profile State
  const [clinicName, setClinicName] = useState('Kim Seoul Clinic - Viện Thẩm Mỹ Hoàng Gia');
  const [clinicAddress, setClinicAddress] = useState('Số 18, Đường Sương Nguyệt Ánh, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
  const [clinicPhone, setClinicPhone] = useState('1900 888 999');
  const [clinicHours, setClinicHours] = useState('09:00 - 20:00 (Mỗi ngày)');

  // New Service form states
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState(0);
  const [newSrvDuration, setNewSrvDuration] = useState(60);
  const [newSrvCat, setNewSrvCat] = useState<ServiceItem['category']>('Trẻ hoá da');

  // Editing state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<number>(0);

  const handleSaveClinicProfile = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleSavePriceEdit = (id: string) => {
    onUpdateServicePrice(id, editingPriceVal);
    setEditingServiceId(null);
  };

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div id="settings-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-xs text-slate-700">
      
      {/* Left Column: Clinic Profile Settings */}
      <div id="settings-left-column" className="lg:col-span-1 space-y-6">
        <div>
          <h2 id="settings-page-title" className="text-xl font-bold text-slate-800 tracking-tight">Cài đặt Hệ thống</h2>
          <p className="text-[10px] text-slate-400">Đồng bộ hồ sơ bệnh viện thẩm mỹ & quy chuẩn niêm yết</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Thông tin cơ sở thẩm mỹ</span>
          
          <form onSubmit={handleSaveClinicProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Tên Viện Thẩm Mỹ</label>
              <input
                id="setting-clinic-name"
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Địa chỉ chi nhánh chính</label>
              <textarea
                id="setting-clinic-addr"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Hotline CSKH</label>
                <input
                  id="setting-clinic-phone"
                  type="text"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Giờ mở cửa</label>
                <input
                  id="setting-clinic-hours"
                  type="text"
                  value={clinicHours}
                  onChange={(e) => setClinicHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Đồng bộ thông tin</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 2 Columns: Service price catalog */}
      <div id="settings-right-columns" className="lg:col-span-2 space-y-6">
        {/* Service Price Catalog List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Danh mục Dịch vụ & Giá niêm yết</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Giá tiền trực tiếp tính vào hóa đơn của lịch hẹn và combo liệu trình.</p>
          </div>

          <div className="overflow-x-auto">
            <table id="services-settings-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-2">
                  <th className="pb-3">Tên Dịch vụ</th>
                  <th className="pb-3">Phân nhóm</th>
                  <th className="pb-3">Thời lượng</th>
                  <th className="pb-3">Đơn giá niêm yết</th>
                  <th className="pb-3 text-right">Điều chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {services.map((srv) => (
                  <tr id={`srv-row-${srv.id}`} key={srv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{srv.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">
                        {srv.category}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">{srv.durationMin} phút</td>
                    <td className="py-3">
                      {editingServiceId === srv.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            id={`input-edit-price-${srv.id}`}
                            type="number"
                            value={editingPriceVal}
                            onChange={(e) => setEditingPriceVal(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">đ</span>
                        </div>
                      ) : (
                        <span className="font-bold text-amber-600 font-mono">
                          {formatVND(srv.price)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {editingServiceId === srv.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-save-price-${srv.id}`}
                            onClick={() => handleSavePriceEdit(srv.id)}
                            className="px-2 py-1 bg-emerald-500 text-white font-bold text-[9px] rounded hover:bg-emerald-600"
                          >
                            Lưu
                          </button>
                          <button
                            id={`btn-cancel-price-${srv.id}`}
                            onClick={() => setEditingServiceId(null)}
                            className="px-2 py-1 bg-slate-100 text-slate-500 font-bold text-[9px] rounded hover:bg-slate-200"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-trigger-edit-${srv.id}`}
                          onClick={() => {
                            setEditingServiceId(srv.id);
                            setEditingPriceVal(srv.price);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center"
                          title="Sửa giá bán"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="Trẻ hoá da">Trẻ hoá da</option>
                <option value="Tiêm thẩm mỹ">Tiêm thẩm mỹ</option>
                <option value="Laser điều trị">Laser điều trị</option>
                <option value="Body & Tắm trắng">Body & Tắm trắng</option>
                <option value="Chăm sóc cơ bản">Chăm sóc cơ bản</option>
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

    </div>
  );
}
