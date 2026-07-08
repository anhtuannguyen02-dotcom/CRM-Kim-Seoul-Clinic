import React, { useState } from 'react';
import { 
  UserRoundCheck, 
  Search, 
  Star, 
  Check, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Briefcase,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { Technician } from '../types';

interface StaffViewProps {
  technicians: Technician[];
  onUpdateTechStatus: (id: string, status: Technician['status']) => void;
  onAddStaff: (staff: Omit<Technician, 'id' | 'completedJobs' | 'rating'>) => void;
}

export default function StaffView({
  technicians,
  onUpdateTechStatus,
  onAddStaff
}: StaffViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Technician['status']>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding new clinician
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Bác sĩ Da liễu');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newStatus, setNewStatus] = useState<Technician['status']>('Sẵn sàng');

  // Filter technicians
  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) || tech.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : tech.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    onAddStaff({
      name: newName,
      role: newRole,
      specialty: newSpecialty.split(',').map(s => s.trim()).filter(Boolean),
      status: newStatus,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A' // default secondary avatar
    });

    setShowAddModal(false);
    setNewName('');
    setNewSpecialty('');
  };

  return (
    <div id="staff-view-root" className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div id="staff-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="staff-page-title" className="text-xl font-bold text-slate-800 tracking-tight">Điều phối Nhân sự & Clinicians</h2>
          <p className="text-[10px] text-slate-400">Điều phối ca kíp, trạng thái hoạt động bác sĩ chuyên khoa và kỹ thuật viên</p>
        </div>
        <button
          id="btn-add-staff-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 text-amber-500" />
          <span>Thêm bác sĩ/KTV mới</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div id="staff-controls" className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3" />
          <input
            id="staff-search-input"
            type="text"
            placeholder="Tìm theo tên hoặc chuyên khoa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div id="staff-status-tabs" className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['All', 'Sẵn sàng', 'Đang bận', 'Nghỉ phép'] as const).map((status) => (
            <button
              id={`staff-status-tab-${status}`}
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-slate-900 text-amber-400' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {status === 'All' ? 'Tất cả' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Technicians Grid Layout */}
      <div id="staff-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechs.length > 0 ? (
          filteredTechs.map((tech) => (
            <div
              id={`tech-card-${tech.id}`}
              key={tech.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Header card info */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={tech.avatar} 
                      alt={tech.name} 
                      className="h-14 w-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-3 border-white ${
                      tech.status === 'Sẵn sàng' ? 'bg-emerald-500' :
                      tech.status === 'Đang bận' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`}></span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{tech.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{tech.role}</p>
                    
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                      <span>{tech.rating}</span>
                      <span className="text-slate-400 font-medium">({tech.completedJobs} ca)</span>
                    </div>
                  </div>
                </div>

                {/* Specialties / Skills pills */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Thẩm mỹ Chuyên môn</span>
                  <div className="flex flex-wrap gap-1">
                    {tech.specialty.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Switch Controls */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-semibold">Cập nhật trạng thái:</span>

                <div className="flex bg-slate-50 p-1 rounded-lg gap-1 border border-slate-100">
                  {(['Sẵn sàng', 'Đang bận', 'Nghỉ phép'] as const).map((st) => (
                    <button
                      id={`btn-tech-${tech.id}-${st}`}
                      key={st}
                      type="button"
                      onClick={() => onUpdateTechStatus(tech.id, st)}
                      className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${
                        tech.status === st 
                          ? st === 'Sẵn sàng' ? 'bg-emerald-500 text-white' :
                            st === 'Đang bận' ? 'bg-amber-500 text-white' :
                            'bg-slate-500 text-white'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {st === 'Sẵn sàng' ? 'Trống' : st === 'Đang bận' ? 'Bận' : 'Nghỉ'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-xs text-slate-400">
            Không có nhân sự phù hợp
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div id="add-staff-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="add-staff-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Thêm mới Hồ sơ Bác sĩ / KTV</span>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Họ và tên bác sĩ / KTV *</label>
                <input
                  id="new-tech-name"
                  type="text"
                  placeholder="E.g. Bác sĩ Lê Văn Long..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Chức vụ / Học hàm *</label>
                <select
                  id="new-tech-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="Bác sĩ Thẩm mỹ Nội khoa">Bác sĩ Thẩm mỹ Nội khoa</option>
                  <option value="Bác sĩ Chuyên khoa Da liễu">Bác sĩ Chuyên khoa Da liễu</option>
                  <option value="Kỹ thuật viên Trị liệu Thẩm mỹ">Kỹ thuật viên Trị liệu Thẩm mỹ</option>
                  <option value="Kỹ thuật viên Trưởng">Kỹ thuật viên Trưởng</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Kỹ năng điều trị (Ngăn cách bằng dấu phẩy) *</label>
                <input
                  id="new-tech-specialty"
                  type="text"
                  placeholder="E.g. Meso HA, Thermage FLX, Botox thon gọn"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Trạng thái khởi tạo</label>
                <select
                  id="new-tech-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Technician['status'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="Sẵn sàng">Sẵn sàng</option>
                  <option value="Đang bận">Đang bận</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="staff-cancel-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="staff-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Lưu hồ sơ nhân sự
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
