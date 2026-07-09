import React, { useState, useEffect } from 'react';
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
  X,
  Edit3,
  Trash2,
  Download,
  Trophy,
  Users,
  CreditCard
} from 'lucide-react';
import { Customer, ServiceItem, Technician } from '../types';
import { exportToExcel } from '../utils/exportToExcel';

interface CustomersViewProps {
  customers: Customer[];
  services: ServiceItem[];
  technicians?: Technician[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'totalVisits' | 'treatmentHistory' | 'activePackages' | 'beforeAfterImages'>) => void;
  onAddTreatmentNote: (customerId: string, note: string, serviceName: string, technician: string) => void;
  onAddCustomerPackage: (customerId: string, packageName: string, totalSessions: number, price: number) => void;
  onUsePackageSession: (customerId: string, packageName: string, note: string, technician: string) => void;
  onAddBeforeAfterImage: (customerId: string, title: string, before: string, after: string) => void;
  onUpdateCustomer?: (id: string, updatedFields: Partial<Customer>) => void;
  onDeleteCustomer?: (id: string) => void;
}

// Packages are now fully dynamically generated from the service database in SettingsView

const PHOTO_TEMPLATES = [
  {
    title: 'Liệu trình trị nám Laser Pico',
    before: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu824daQTdoztbzrvdYKK4kLCR8RiqJorOfOd0cyC0eD6J8IAARhF-0JqIHnIPJo3l71frL0n-PSphkzkFwCSffDsTwOEJ72WisGYOUKTiS0TIlKv6JjFgbMi29Eyz3lXIASrLIUv79bkKI1tRa28k1DxHyNZGTsOiR7HdjOTEsZM9-m1_eRcfnznNpA9GZ07YyjkQBDgYQPLBSZS3HVGbkmYl45NaaC1-IbeCJ8lV2E7amV2lF7Bzpg',
    after: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVjVWDa6FBPRupeWWw6KXc5SszA7RHeh7nR0cVADH-6lC50M_0XO8aAQfS9B4_KpYfLtKA8Ebo55BS6di3IIFbnPJc37vtaHsF4VtV90MND97tkUMoWbi6Iyc6rxV9VM67BNJ7l1XK2v5uwmQkINwuigefQZ3eg2uUyjFwPaIybaJH6lhMg2NNYRfINdX1eusZ7E-F5UvXOg05YVj2SFLU0KHTIsaL0CIBS7o33BQXPQNGG8U1GsPiew'
  },
  {
    title: 'Tiêm Meso căng bóng',
    before: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7z_NxvCyadLd3LSumbxbROb2nD9Ovrxs8AdzhWWq3sZUOnqC42WCWgIJNooRjLC1C9pUYzKB4RfJqfcmlUV2O-vRVB8Ty8LnNB312TsBWhhYonZBJw7a0HoL912q5wedFtQUb0SC8WbpyHqtyfpmruDlItrneJMlLahqZYlTXk3Ya6BXVEcC-NFfEagvGP4USPX-S6buBa6L7YxoygON09QYb8neKerJoEOSrPpt_80WXPueOscatVA',
    after: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFYufw6uzr8D2WISf0EZfzPSv2OoJ2qPFFF3l3PRpDIpQQDCNCU6kpxYF1gXw-RZtAHHFYAD2k03iw_fljwuDjen9y-WoIDKa5LR5DufMLFAyRc-J0FapG3bxz7iQ5yROzq4R_-OuW_ZEsGgAyR7ZnWMjpOR2sghacpmqvBySkifIjW8boGd5-12OGff2w7M59fIhco5heLP1v0YY3-DjYx6L931JX-clBMGK16gQARxbUtrGxqjKbcQ'
  }
];

export default function CustomersView({
  customers,
  services,
  technicians,
  onAddCustomer,
  onAddTreatmentNote,
  onAddCustomerPackage,
  onUsePackageSession,
  onAddBeforeAfterImage,
  onUpdateCustomer,
  onDeleteCustomer
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<'All' | Customer['rank']>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>('cust_1'); // default Nguyễn Phương Anh
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBuyPackageModal, setShowBuyPackageModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);

  // Helper to calculate age from birthday string (YYYY-MM-DD)
  const calculateAgeFromBirthday = (bday: string): number => {
    if (!bday) return 30;
    const birth = new Date(bday);
    if (isNaN(birth.getTime())) return 30;
    const today = new Date('2026-07-09'); // Consistent with current system date
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const parseViDate = (str: string): Date => {
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date(str);
  };

  const getDaysRemaining = (expiryStr: string): number => {
    const exp = parseViDate(expiryStr);
    const today = new Date();
    // Normalize today
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);
    const diff = exp.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Helper to estimate birthday from age if none exists
  const getBirthdayFromAge = (age: number): string => {
    const birthYear = 2026 - age;
    return `${birthYear}-01-01`;
  };

  // Edit Customer States
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustBirthday, setEditCustBirthday] = useState('1996-01-01');
  const [editCustGender, setEditCustGender] = useState<'Nam' | 'Nữ'>('Nữ');
  const [editCustRank, setEditCustRank] = useState<Customer['rank']>('Standard');
  const [editCustNotes, setEditCustNotes] = useState('');
  const [editCustAvatar, setEditCustAvatar] = useState('');
  const [editCustDiscountPercent, setEditCustDiscountPercent] = useState<number>(0);

  // Edit Clinical Photo States
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editBeforePhoto, setEditBeforePhoto] = useState('');
  const [editAfterPhoto, setEditAfterPhoto] = useState('');

  // Form states for new customer
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthday, setNewBirthday] = useState('1996-01-01');
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nữ');
  const [newRank, setNewRank] = useState<Customer['rank']>('Standard');
  const [newNotes, setNewNotes] = useState('');
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(0);
  const [initKimReward, setInitKimReward] = useState(false);
  const [initKimRewardBill, setInitKimRewardBill] = useState(3000000);
  const [initKimSkincarePass, setInitKimSkincarePass] = useState(false);

  // Form states for adding a treatment session note
  const [newTreatmentNote, setNewTreatmentNote] = useState('');
  const [newTreatmentService, setNewTreatmentService] = useState(() => services[0]?.name || 'Massage Body Seoul Heal 60 phút');
  const [newTreatmentTech, setNewTreatmentTech] = useState(() => technicians?.[0]?.name || 'Phạm Minh Tú');

  // Synchronize treatment service and technician if they change or get deleted from system
  useEffect(() => {
    if (services && services.length > 0) {
      if (!services.some(s => s.name === newTreatmentService)) {
        setNewTreatmentService(services[0].name);
      }
    }
  }, [services, newTreatmentService]);

  useEffect(() => {
    if (technicians && technicians.length > 0) {
      if (!technicians.some(t => t.name === newTreatmentTech)) {
        setNewTreatmentTech(technicians[0].name);
      }
    }
  }, [technicians, newTreatmentTech]);

  // Form states for buying package
  const [newPkgName, setNewPkgName] = useState('Combo Trẻ Hoá Toàn Diện 5 Buổi');
  const [customPkgName, setCustomPkgName] = useState('');
  const [newPkgSessions, setNewPkgSessions] = useState(5);
  const [newPkgPrice, setNewPkgPrice] = useState(35000000);

  // KIM REWARD States
  const [showAddReferralForm, setShowAddReferralForm] = useState(false);
  const [newReferralName, setNewReferralName] = useState('');
  const [newReferralPhone, setNewReferralPhone] = useState('');
  const [newReferralBill, setNewReferralBill] = useState<number>(3000000);
  const [kimRewardManualBill, setKimRewardManualBill] = useState<number>(2000000);

  // Form states for before after photos
  const [photoTitle, setPhotoTitle] = useState('');
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');

  // Package deduction toggle
  const [isPackageDeduction, setIsPackageDeduction] = useState(false);
  const [selectedPackageToDeduct, setSelectedPackageToDeduct] = useState('');

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

  // Dynamically generate packages 100% bound to services prop for real-time synchronization
  const getDynamicPackages = () => {
    const pkgs: { name: string; sessions: number; price: number }[] = [
      { name: 'Gói KIM REWARD 2.000.000đ', sessions: 1, price: 2000000 },
      { name: 'Gói KIM REWARD 3.000.000đ', sessions: 1, price: 3000000 },
      { name: 'Gói KIM REWARD 5.000.000đ', sessions: 1, price: 5000000 },
      { name: 'Gói KIM REWARD 8.000.000đ', sessions: 1, price: 8000000 },
      { name: 'Gói KIM REWARD 10.000.000đ', sessions: 1, price: 10000000 },
    ];

    if (services) {
      services.forEach(srv => {
        // Clinical / High-Tech Original Services packages
        if (srv.id === 'srv_1' || srv.name === 'Nâng cơ Ultherapy VIP') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Thermage FLX Nâng Cơ VIP 3 Buổi`, sessions: 3, price: 150000000 });
        } else if (srv.id === 'srv_2' || srv.name === 'Trẻ hoá da Thermage FLX 900') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Combo Trẻ Hoá Toàn Diện 5 Buổi`, sessions: 5, price: 35000000 });
        } else if (srv.id === 'srv_3' || srv.name === 'Tiêm Meso căng bóng HA căng mọng') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Meso Sáng Da Căng Bóng 6 Buổi`, sessions: 6, price: 48000000 });
        } else if (srv.id === 'srv_4' || srv.name === 'Laser Pico Premium trị nám sạm') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Laser Pico Sạch Nám Sạm 10 Buổi`, sessions: 10, price: 38000000 });
        }
        // I. CHĂM SÓC DA – SEOUL SKINCARE
        else if (srv.name === 'Chăm sóc da cơ bản') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `${srv.name} - Gói 5 buổi (Tặng 1 buổi)`, sessions: 6, price: srv.price * 5 });
          pkgs.push({ name: `${srv.name} - Gói 10 buổi (Tặng 3 buổi)`, sessions: 13, price: srv.price * 10 });
        } else if (srv.name === 'Chăm sóc da chuyên sâu') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `${srv.name} - Gói 5 buổi (Tặng 1 buổi)`, sessions: 6, price: srv.price * 5 });
          pkgs.push({ name: `${srv.name} - Gói 10 buổi (Tặng 3 buổi)`, sessions: 13, price: srv.price * 10 });
        }
        // II. CẤY TRẮNG NANO – CĂNG BÓNG
        else if (srv.name === 'Cấy trắng Nano buổi lẻ') {
          pkgs.push({ name: `${srv.name}`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Liệu trình ${srv.name} 4 buổi`, sessions: 4, price: srv.price * 4 });
          pkgs.push({ name: `Liệu trình ${srv.name} mua 4 buổi (Tặng 1 buổi)`, sessions: 5, price: srv.price * 4 });
          pkgs.push({ name: `Liệu trình ${srv.name} 5 buổi`, sessions: 5, price: srv.price * 5 });
        }
        // III. PEEL TẢO
        else if (srv.name === 'Peel tảo không bong + Cấy trắng Nano') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Gói 5 buổi ${srv.name} (Tặng 1 buổi)`, sessions: 6, price: srv.price * 5 });
          pkgs.push({ name: `Gói 10 buổi ${srv.name} (Tặng 3 buổi)`, sessions: 13, price: srv.price * 10 });
        }
        // IV. MASSAGE BODY
        else if (srv.category === 'Massage') {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `${srv.name} - Combo 10 Buổi (Tặng 10 buổi gội đầu)`, sessions: 10, price: srv.price * 10 });
        }
        // V. GỘI ĐẦU
        else if (srv.category === 'Gội đầu') {
          if (srv.name === 'Gội trải nghiệm') {
            pkgs.push({ name: `${srv.name} - Buổi lẻ`, sessions: 1, price: srv.price });
          } else if (srv.name === 'Mang dầu đến gội' || srv.name === 'Gội đầu thường') {
            pkgs.push({ name: `${srv.name} - Buổi lẻ`, sessions: 1, price: srv.price });
            pkgs.push({ name: `${srv.name} - Gói 10 buổi (Tặng 1)`, sessions: 11, price: Math.round(srv.price * 10 * 0.81) });
          } else if (srv.name === 'Gội đầu cấp') {
            pkgs.push({ name: `${srv.name} - Buổi lẻ`, sessions: 1, price: srv.price });
            pkgs.push({ name: `${srv.name} - Gói 10 buổi`, sessions: 10, price: Math.round(srv.price * 10 * 0.898) });
          } else {
            pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          }
        }
        // VI. TRIỆT LÔNG – SEOUL SMOOTH SKIN
        else if (srv.category === 'Triệt lông') {
          const rawName = srv.name.replace(' (Buổi lẻ)', '');
          pkgs.push({ name: `${srv.name}`, sessions: 1, price: srv.price });
          pkgs.push({ name: `${rawName} - Gói 10 Buổi`, sessions: 10, price: srv.price * 10 });
        }
        // VII & VIII & OTHERS (including Botox, Filler, etc.)
        else {
          pkgs.push({ name: `${srv.name} (Buổi lẻ)`, sessions: 1, price: srv.price });
          pkgs.push({ name: `Gói 5 buổi ${srv.name}`, sessions: 5, price: Math.round(srv.price * 5 * 0.95) });
          pkgs.push({ name: `Gói 10 buổi ${srv.name}`, sessions: 10, price: Math.round(srv.price * 10 * 0.90) });
        }
      });
    }

    return pkgs;
  };

  const openBuyPackageModal = () => {
    const dynamicPkgs = getDynamicPackages();
    if (dynamicPkgs.length > 0) {
      setNewPkgName(dynamicPkgs[0].name);
      setNewPkgSessions(dynamicPkgs[0].sessions);
      setNewPkgPrice(dynamicPkgs[0].price);
    } else {
      setNewPkgName('custom');
      setNewPkgSessions(5);
      setNewPkgPrice(10000000);
    }
    setCustomPkgName('');
    setShowBuyPackageModal(true);
  };

  // Auto-fill package sessions and prices based on chosen suggested package
  const handlePkgNameChange = (val: string) => {
    setNewPkgName(val);
    if (val !== 'custom') {
      const dynamicPkgs = getDynamicPackages();
      const selectedSug = dynamicPkgs.find(p => p.name === val);
      if (selectedSug) {
        setNewPkgSessions(selectedSug.sessions);
        setNewPkgPrice(selectedSug.price);
      }
    } else {
      setCustomPkgName('');
      setNewPkgSessions(5);
      setNewPkgPrice(10000000);
    }
  };

  // Handle Add Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const calculatedAge = calculateAgeFromBirthday(newBirthday);
    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3);

    onAddCustomer({
      name: newName,
      phone: newPhone,
      age: calculatedAge,
      birthday: newBirthday,
      gender: newGender,
      rank: newRank,
      notes: newNotes,
      discountPercent: Number(newDiscountPercent),
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
      ...(initKimReward ? {
        kimRewardBillGoc: initKimRewardBill,
        kimRewardReferrals: []
      } : {}),
      ...(initKimSkincarePass ? {
        kimSkincarePass: {
          activatedDate: today.toLocaleDateString('vi-VN'),
          expiryDate: expiry.toLocaleDateString('vi-VN'),
          price: 1000000,
          status: 'Hoạt động'
        }
      } : {})
    });

    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewBirthday('1996-01-01');
    setNewNotes('');
    setNewDiscountPercent(0);
    setInitKimReward(false);
    setInitKimRewardBill(3000000);
    setInitKimSkincarePass(false);
  };

  // Start edit customer details
  const handleStartEditCustomer = (cust: Customer) => {
    setEditCustName(cust.name);
    setEditCustPhone(cust.phone);
    setEditCustBirthday(cust.birthday || getBirthdayFromAge(cust.age));
    setEditCustGender(cust.gender);
    setEditCustRank(cust.rank);
    setEditCustNotes(cust.notes);
    setEditCustAvatar(cust.avatar);
    setEditCustDiscountPercent(cust.discountPercent || 0);
    setShowEditCustomerModal(true);
  };

  // Submit edit customer profile
  const handleEditCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !onUpdateCustomer) return;
    const calculatedAge = calculateAgeFromBirthday(editCustBirthday);
    onUpdateCustomer(selectedCustomerId, {
      name: editCustName,
      phone: editCustPhone,
      age: calculatedAge,
      birthday: editCustBirthday,
      gender: editCustGender,
      rank: editCustRank,
      notes: editCustNotes,
      avatar: editCustAvatar,
      discountPercent: Number(editCustDiscountPercent)
    });
    setShowEditCustomerModal(false);
    alert('Đồng bộ hồ sơ khách hàng thành công!');
  };

  // KIM REWARD Handlers
  const handleRegisterKimRewardManual = () => {
    if (!selectedCustomerId || !onUpdateCustomer) return;
    if (kimRewardManualBill < 2000000 || kimRewardManualBill > 10000000) {
      alert('Hạn mức bill gốc áp dụng từ 2.000.000đ đến 10.000.000đ.');
      return;
    }
    onUpdateCustomer(selectedCustomerId, {
      kimRewardBillGoc: kimRewardManualBill,
      kimRewardReferrals: []
    });
    alert('Kích hoạt chương trình KIM REWARD thành công!');
  };

  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !onUpdateCustomer || !selectedCustomer) return;
    if (!newReferralName || !newReferralPhone) {
      alert('Vui lòng điền đủ thông tin khách hàng mới.');
      return;
    }
    const currentReferrals = selectedCustomer.kimRewardReferrals || [];
    const updatedReferrals = [
      ...currentReferrals,
      {
        name: newReferralName,
        phone: newReferralPhone,
        billAmount: Number(newReferralBill),
        date: new Date().toLocaleDateString('vi-VN')
      }
    ];

    onUpdateCustomer(selectedCustomerId, {
      kimRewardReferrals: updatedReferrals
    });

    setNewReferralName('');
    setNewReferralPhone('');
    setNewReferralBill(3000000);
    setShowAddReferralForm(false);
    alert('Thêm khách hàng giới thiệu mới thành công!');
  };

  const handleDeleteReferral = (idx: number) => {
    if (!selectedCustomerId || !onUpdateCustomer || !selectedCustomer) return;
    const currentReferrals = selectedCustomer.kimRewardReferrals || [];
    const updatedReferrals = currentReferrals.filter((_, i) => i !== idx);
    onUpdateCustomer(selectedCustomerId, {
      kimRewardReferrals: updatedReferrals
    });
    alert('Đã xóa khách giới thiệu.');
  };

  // KIM SKINCARE PASS Handlers
  const handleRegisterKimSkincarePass = () => {
    if (!selectedCustomerId || !onUpdateCustomer) return;
    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3);

    onUpdateCustomer(selectedCustomerId, {
      kimSkincarePass: {
        activatedDate: today.toLocaleDateString('vi-VN'),
        expiryDate: expiry.toLocaleDateString('vi-VN'),
        price: 1000000,
        status: 'Hoạt động'
      }
    });
    alert('Kích hoạt thẻ KIM SKINCARE PASS MEMBER thành công cho khách hàng này!');
  };

  const handleCancelKimSkincarePass = () => {
    if (!selectedCustomerId || !onUpdateCustomer) return;
    onUpdateCustomer(selectedCustomerId, {
      kimSkincarePass: undefined
    });
    alert('Đã hủy thẻ KIM SKINCARE PASS của khách hàng này.');
  };

  // Start edit photo comparison
  const handleStartEditPhoto = (idx: number, img: { title: string; before: string; after: string }) => {
    setEditingPhotoIndex(idx);
    setEditPhotoTitle(img.title);
    setEditBeforePhoto(img.before);
    setEditAfterPhoto(img.after);
    setShowEditPhotoModal(true);
  };

  // Submit edit photo comparison
  const handleEditPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || editingPhotoIndex === null || !onUpdateCustomer) return;
    
    const updatedImages = [...selectedCustomer.beforeAfterImages];
    updatedImages[editingPhotoIndex] = {
      title: editPhotoTitle,
      before: editBeforePhoto,
      after: editAfterPhoto
    };

    onUpdateCustomer(selectedCustomer.id, {
      beforeAfterImages: updatedImages
    });
    setShowEditPhotoModal(false);
    setEditingPhotoIndex(null);
    alert('Cập nhật so sánh lâm sàng thành công!');
  };

  // Delete photo comparison
  const handleDeletePhoto = (idx: number) => {
    if (!selectedCustomer || !onUpdateCustomer) return;
    if (confirm('Bạn có chắc chắn muốn xóa hình ảnh so sánh lâm sàng này không?')) {
      const updatedImages = selectedCustomer.beforeAfterImages.filter((_, i) => i !== idx);
      onUpdateCustomer(selectedCustomer.id, {
        beforeAfterImages: updatedImages
      });
      alert('Đã xóa hình ảnh so sánh lâm sàng.');
    }
  };

  // Handle Add Treatment Session
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newTreatmentNote) return;

    if (isPackageDeduction) {
      if (!selectedPackageToDeduct) {
        alert('Vui lòng chọn gói sản phẩm cần trừ buổi.');
        return;
      }
      onUsePackageSession(
        selectedCustomerId,
        selectedPackageToDeduct,
        newTreatmentNote,
        newTreatmentTech
      );
    } else {
      onAddTreatmentNote(
        selectedCustomerId,
        newTreatmentNote,
        newTreatmentService,
        newTreatmentTech
      );
    }

    setNewTreatmentNote('');
  };

  // Handle Buy Package
  const handleBuyPackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    
    const finalName = newPkgName === 'custom' ? customPkgName : newPkgName;
    if (!finalName) {
      alert('Vui lòng nhập tên gói sản phẩm.');
      return;
    }

    const discountRate = selectedCustomer?.discountPercent || 0;
    const finalPrice = discountRate > 0 ? Math.round(newPkgPrice * (1 - discountRate / 100)) : newPkgPrice;

    onAddCustomerPackage(selectedCustomerId, finalName, newPkgSessions, finalPrice);
    
    if (finalName.toUpperCase().includes('KIM REWARD') && onUpdateCustomer) {
      onUpdateCustomer(selectedCustomerId, {
        kimRewardBillGoc: finalPrice,
        kimRewardReferrals: []
      });
    }

    setShowBuyPackageModal(false);
    setCustomPkgName('');
    setNewPkgSessions(5);
    setNewPkgPrice(35000000);
    if (discountRate > 0) {
      alert(`Bán gói thành công! Đã áp dụng giảm giá ${discountRate}%, tổng tiền thu thực tế: ${formatVND(finalPrice)}`);
    } else {
      alert('Bán gói thành công!');
    }
  };

  // Handle Add Before After Photo
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !photoTitle || !beforePhoto || !afterPhoto) {
      alert('Vui lòng điền đầy đủ thông tin so sánh lâm sàng.');
      return;
    }

    onAddBeforeAfterImage(selectedCustomerId, photoTitle, beforePhoto, afterPhoto);
    setShowAddPhotoModal(false);
    setPhotoTitle('');
    setBeforePhoto('');
    setAfterPhoto('');
  };

  const selectPhotoTemplate = (t: typeof PHOTO_TEMPLATES[0]) => {
    setPhotoTitle(t.title);
    setBeforePhoto(t.before);
    setAfterPhoto(t.after);
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
          <div className="flex items-center gap-1.5">
            <button
              id="btn-export-customers-excel"
              onClick={() => {
                exportToExcel(
                  filteredCustomers,
                  ['Mã Khách hàng', 'Họ và tên', 'Số điện thoại', 'Tuổi', 'Giới tính', 'Hạng thành viên', 'Tổng chi tiêu (VND)', 'Số lần điều trị', 'Ghi chú'],
                  ['id', 'name', 'phone', 'age', 'gender', 'rank', 'totalSpent', 'totalVisits', 'notes'],
                  'Danh_sach_Khach_hang'
                );
              }}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center transition-all"
              title="Xuất danh sách khách hàng ra Excel"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              id="btn-add-customer-modal"
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl flex items-center justify-center transition-all"
              title="Thêm khách hàng mới"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
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
            {(['All', 'Diamond VIP Plus', 'Diamond VIP', 'Gold Member', 'Silver Member', 'Standard'] as const).map((rank) => (
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
                {rank === 'All' ? 'Tất cả' : rank === 'Diamond VIP Plus' ? 'Plus' : rank.split(' ')[0]}
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
                      c.rank === 'Diamond VIP Plus' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      c.rank === 'Diamond VIP' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      c.rank === 'Gold Member' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      c.rank === 'Silver Member' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {c.rank === 'Diamond VIP Plus' ? 'Plus 💎' : c.rank.split(' ')[0]}
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
                    
                    {onUpdateCustomer && (
                      <button
                        onClick={() => handleStartEditCustomer(selectedCustomer)}
                        className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Chỉnh sửa hồ sơ khách hàng"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {onDeleteCustomer && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa khách hàng "${selectedCustomer.name}" khỏi hệ thống?`)) {
                            const remain = customers.filter(c => c.id !== selectedCustomer.id);
                            onDeleteCustomer(selectedCustomer.id);
                            setSelectedCustomerId(remain[0]?.id || null);
                            alert('Đã xóa khách hàng thành công!');
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Xóa hồ sơ khách hàng"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <span id="customer-profile-rank" className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      selectedCustomer.rank === 'Diamond VIP Plus' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
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
                    <span>
                      Ngày sinh: <strong className="text-slate-700">{selectedCustomer.birthday ? new Date(selectedCustomer.birthday).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date(getBirthdayFromAge(selectedCustomer.age)).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong> • Tuổi: <strong className="text-slate-700">{selectedCustomer.age}</strong> • Giới tính: <strong className="text-slate-700">{selectedCustomer.gender}</strong>
                    </span>
                    {selectedCustomer.discountPercent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-[10px] font-bold text-rose-600 border border-rose-100">
                        🎁 Giảm trừ đặc cách: {selectedCustomer.discountPercent}%
                      </span>
                    ) : null}
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
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-800 font-bold flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                    Liệu trình sở hữu
                  </span>
                  <button
                    onClick={openBuyPackageModal}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Plus className="h-2.5 w-2.5" /> Bán gói
                  </button>
                </div>
                <div className="space-y-4">
                  {selectedCustomer.activePackages.length > 0 ? (
                    selectedCustomer.activePackages.map((pkg, i) => (
                      <div key={i} className="space-y-2 pb-2 border-b border-indigo-100/30 last:border-0 last:pb-0">
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
            </div>

            {/* KIM REWARD Program Section */}
            <div id="customer-kim-reward-section" className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-amber-500" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-700 font-bold">Chương trình KIM REWARD (Tri ân 100%)</span>
                </div>
                {selectedCustomer.kimRewardBillGoc && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn hủy đăng ký chương trình KIM REWARD của khách hàng này?')) {
                        if (onUpdateCustomer) {
                          onUpdateCustomer(selectedCustomer.id, {
                            kimRewardBillGoc: undefined,
                            kimRewardReferrals: []
                          });
                        }
                      }
                    }}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:underline transition-colors animate-fade-in"
                  >
                    Hủy tham gia
                  </button>
                )}
              </div>

              {!selectedCustomer.kimRewardBillGoc ? (
                <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-200/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Khách chưa tham gia KIM REWARD</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Kim Reward là chương trình hoàn tiền lên tới <strong className="text-amber-700">100% Bill gốc</strong> (áp dụng cho bill từ 2.000.000đ - 10.000.000đ) khi khách giới thiệu thành công tối thiểu 3 khách mới có giao dịch thật với tổng doanh thu gấp 3 lần bill gốc.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-amber-200/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Nhập giá trị Bill gốc đăng ký (VND)</label>
                      <input
                        type="number"
                        min="2000000"
                        max="10000000"
                        step="500000"
                        value={kimRewardManualBill}
                        onChange={(e) => setKimRewardManualBill(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-amber-500 bg-white font-mono font-bold text-slate-800"
                      />
                    </div>
                    <button
                      onClick={handleRegisterKimRewardManual}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-all shrink-0 self-end sm:self-auto shadow-sm"
                    >
                      Kích hoạt ngay
                    </button>
                  </div>
                </div>
              ) : (
                (() => {
                  const billGoc = selectedCustomer.kimRewardBillGoc || 0;
                  const referrals = selectedCustomer.kimRewardReferrals || [];
                  const validReferrals = referrals.filter(r => r.billAmount >= 2000000);
                  const totalRevenue = validReferrals.reduce((sum, r) => sum + r.billAmount, 0);
                  const count = validReferrals.length;
                  const targetRevenue = billGoc * 3;

                  const moc1Unlocked = count >= 1 && totalRevenue >= billGoc;
                  const moc2Unlocked = count >= 2 && totalRevenue >= billGoc * 2;
                  const moc3Unlocked = count >= 3 && totalRevenue >= targetRevenue;

                  let totalRefund = 0;
                  if (moc1Unlocked) totalRefund += billGoc * 0.333;
                  if (moc2Unlocked) totalRefund += billGoc * 0.333;
                  if (moc3Unlocked) totalRefund += billGoc * 0.334;
                  totalRefund = Math.round(totalRefund);

                  const progressPercent = Math.min(100, Math.round((totalRevenue / targetRevenue) * 100));

                  return (
                    <div className="space-y-4 animate-fade-in">
                      {/* Stat summary grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Bill gốc đăng ký</span>
                          <span className="text-xs font-extrabold text-slate-800 font-mono mt-1">{formatVND(billGoc)}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Tri ân hoàn tối đa 100%</span>
                        </div>
                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Chỉ tiêu khách mới</span>
                          <span className="text-xs font-extrabold text-slate-800 font-mono mt-1">{formatVND(targetRevenue)}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Yêu cầu gấp 3 lần bill gốc</span>
                        </div>
                        <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold">Tổng hoàn tích lũy</span>
                          <span className="text-xs font-black text-amber-600 font-mono mt-1">{formatVND(totalRefund)}</span>
                          <span className="text-[9px] text-amber-600 font-bold mt-0.5">Đã đạt {count}/3 khách hợp lệ</span>
                        </div>
                      </div>

                      {/* Visual Milestones timeline */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Biểu đồ tiến độ hoàn mốc</span>
                        
                        {/* Progress Bar Container */}
                        <div className="relative pt-4 pb-2">
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>

                          {/* 3 Milestone Node Indicators */}
                          <div className="absolute top-1.5 left-0 right-0 flex justify-between pointer-events-none">
                            {/* Mốc 1 */}
                            <div className="flex flex-col items-center">
                              <span className={`h-5 w-5 rounded-full border-3 flex items-center justify-center text-[9px] font-bold ${
                                moc1Unlocked ? 'bg-amber-500 border-white text-white shadow' : 'bg-white border-slate-200 text-slate-400'
                              }`}>1</span>
                              <span className="text-[9px] font-bold text-slate-500 mt-1">Mốc 1 (33.3%)</span>
                            </div>

                            {/* Mốc 2 */}
                            <div className="flex flex-col items-center">
                              <span className={`h-5 w-5 rounded-full border-3 flex items-center justify-center text-[9px] font-bold ${
                                moc2Unlocked ? 'bg-amber-500 border-white text-white shadow' : 'bg-white border-slate-200 text-slate-400'
                              }`}>2</span>
                              <span className="text-[9px] font-bold text-slate-500 mt-1">Mốc 2 (33.3%)</span>
                            </div>

                            {/* Mốc 3 */}
                            <div className="flex flex-col items-center">
                              <span className={`h-5 w-5 rounded-full border-3 flex items-center justify-center text-[9px] font-bold ${
                                moc3Unlocked ? 'bg-amber-500 border-white text-white shadow' : 'bg-white border-slate-200 text-slate-400'
                              }`}>3</span>
                              <span className="text-[9px] font-bold text-slate-500 mt-1">Mốc 3 (33.4%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Text descriptions of milestones */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-200/50 text-[10px] text-slate-500 leading-relaxed">
                          <div className={`p-2.5 rounded-xl border ${moc1Unlocked ? 'bg-emerald-50/40 border-emerald-100 text-slate-700' : 'bg-white border-slate-200/50'}`}>
                            <p className="font-bold flex items-center gap-1">
                              <span>Mốc 1: {moc1Unlocked ? '🔓 Đã đạt' : '🔒 Đang khóa'}</span>
                            </p>
                            <p className="mt-1">Yêu cầu: ≥ 1 khách mới, doanh thu từ khách mới đạt ≥ {formatVND(billGoc)}</p>
                            <p className="mt-1 font-semibold text-emerald-600">Quyền lợi: Hoàn {formatVND(Math.round(billGoc * 0.333))}</p>
                          </div>

                          <div className={`p-2.5 rounded-xl border ${moc2Unlocked ? 'bg-emerald-50/40 border-emerald-100 text-slate-700' : 'bg-white border-slate-200/50'}`}>
                            <p className="font-bold flex items-center gap-1">
                              <span>Mốc 2: {moc2Unlocked ? '🔓 Đã đạt' : '🔒 Đang khóa'}</span>
                            </p>
                            <p className="mt-1">Yêu cầu: ≥ 2 khách mới, doanh thu từ khách mới đạt ≥ {formatVND(billGoc * 2)}</p>
                            <p className="mt-1 font-semibold text-emerald-600">Quyền lợi: Hoàn tiếp {formatVND(Math.round(billGoc * 0.333))}</p>
                          </div>

                          <div className={`p-2.5 rounded-xl border ${moc3Unlocked ? 'bg-emerald-50/40 border-emerald-100 text-slate-700' : 'bg-white border-slate-200/50'}`}>
                            <p className="font-bold flex items-center gap-1">
                              <span>Mốc 3: {moc3Unlocked ? '🔓 Đã đạt' : '🔒 Đang khóa'}</span>
                            </p>
                            <p className="mt-1">Yêu cầu: ≥ 3 khách mới, doanh thu từ khách mới đạt ≥ {formatVND(targetRevenue)}</p>
                            <p className="mt-1 font-semibold text-emerald-600">Quyền lợi: Hoàn tiếp {formatVND(Math.round(billGoc * 0.334))}</p>
                          </div>
                        </div>
                      </div>

                      {/* Referrals List Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-indigo-500" />
                            Danh sách khách hàng giới thiệu ({referrals.length} người)
                          </span>
                          {!showAddReferralForm && (
                            <button
                              onClick={() => setShowAddReferralForm(true)}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded text-[9px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Plus className="h-3 w-3" /> Ghi nhận khách mới
                            </button>
                          )}
                        </div>

                        {/* Add Referral Form Block */}
                        {showAddReferralForm && (
                          <form onSubmit={handleAddReferral} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3 animate-fade-in text-xs text-slate-700">
                            <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Ghi nhận giao dịch khách mới</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[9px] text-slate-400 font-bold block mb-1">Tên khách mới *</label>
                                <input
                                  type="text"
                                  placeholder="E.g. Nguyễn Văn A"
                                  value={newReferralName}
                                  onChange={(e) => setNewReferralName(e.target.value)}
                                  required
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-400 font-bold block mb-1">Số điện thoại *</label>
                                <input
                                  type="text"
                                  placeholder="E.g. 0912345678"
                                  value={newReferralPhone}
                                  onChange={(e) => setNewReferralPhone(e.target.value)}
                                  required
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-400 font-bold block mb-1">Tổng tiền thanh toán (VND) *</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="100000"
                                  value={newReferralBill}
                                  onChange={(e) => setNewReferralBill(Number(e.target.value))}
                                  required
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAddReferralForm(false)}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                type="submit"
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                              >
                                Thêm và tính toán
                              </button>
                            </div>
                          </form>
                        )}

                        {referrals.length > 0 ? (
                          <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white">
                            <table className="w-full text-[11px] text-slate-600">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[9px]">
                                  <th className="px-4 py-2 text-left">Khách hàng</th>
                                  <th className="px-4 py-2 text-left">Số điện thoại</th>
                                  <th className="px-4 py-2 text-right">Bill thanh toán</th>
                                  <th className="px-4 py-2 text-center">Trạng thái</th>
                                  <th className="px-4 py-2 text-center">Hành động</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {referrals.map((item, idx) => {
                                  const isValid = item.billAmount >= 2000000;
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-4 py-2.5 font-bold text-slate-800">{item.name}</td>
                                      <td className="px-4 py-2.5 font-mono text-slate-500">{item.phone}</td>
                                      <td className="px-4 py-2.5 text-right font-bold text-slate-700 font-mono">{formatVND(item.billAmount)}</td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold border ${
                                          isValid ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-rose-50 text-rose-600 border-rose-200/30'
                                        }`}>
                                          {isValid ? '✓ Hợp lệ' : '✗ Không hợp lệ (dưới 2tr)'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        <button
                                          onClick={() => {
                                            if (confirm(`Xóa ghi nhận khách hàng ${item.name}?`)) {
                                              handleDeleteReferral(idx);
                                            }
                                          }}
                                          className="text-slate-400 hover:text-rose-600 p-1"
                                          title="Xóa ghi nhận"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100 italic">
                            Chưa ghi nhận khách hàng giới thiệu nào. Nhấp vào nút "Ghi nhận khách mới" để bắt đầu tính mốc hoàn.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* KIM SKINCARE PASS MEMBER Section */}
            <div id="customer-kim-skincare-pass-section" className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-700 font-bold">Thẻ ưu đãi KIM SKINCARE PASS MEMBER</span>
                </div>
                {selectedCustomer.kimSkincarePass && (
                  <button
                    onClick={handleCancelKimSkincarePass}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:underline transition-colors animate-fade-in"
                  >
                    Hủy thẻ hội viên
                  </button>
                )}
              </div>

              {!selectedCustomer.kimSkincarePass ? (
                <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-200/40 rounded-2xl p-5 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Đặc Quyền Thẻ Hội Viên Kim Skincare Pass</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Chỉ với <strong className="text-amber-700">1.000.000đ / 3 tháng</strong>, hội viên được hưởng ưu đãi tinh tế và tiết kiệm tối đa tại Kim Seoul Clinic:
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid matching the image benefits */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/80 border border-amber-200/30 rounded-xl p-2.5 shadow-sm">
                      <span className="text-sm font-black text-amber-600 block">Giảm 50%</span>
                      <span className="text-[8px] text-slate-500 font-bold block leading-tight">Mọi dịch vụ Chăm Sóc Da</span>
                    </div>
                    <div className="bg-white/80 border border-amber-200/30 rounded-xl p-2.5 shadow-sm">
                      <span className="text-sm font-black text-amber-600 block">Giảm 20%</span>
                      <span className="text-[8px] text-slate-500 font-bold block leading-tight">Dịch vụ Filler & Botox</span>
                    </div>
                    <div className="bg-white/80 border border-amber-200/30 rounded-xl p-2.5 shadow-sm">
                      <span className="text-sm font-black text-amber-600 block">Giảm 10%</span>
                      <span className="text-[8px] text-slate-500 font-bold block leading-tight">Sản phẩm Chăm Sóc Da</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleRegisterKimSkincarePass}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Plus className="h-4 w-4 text-slate-950" />
                      <span>Kích hoạt Kim Skincare Pass (1.000.000đ / 3 tháng)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Digital Gold Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-amber-200 to-amber-400 rounded-3xl p-6 text-slate-900 border border-amber-300 shadow-xl max-w-sm sm:max-w-md mx-auto aspect-[1.586/1] flex flex-col justify-between">
                    {/* Watermark Logo K */}
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.06] text-[200px] font-black leading-none pointer-events-none font-sans select-none">
                      K
                    </div>
                    
                    {/* Card Header */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black tracking-[0.2em] text-amber-950 uppercase">KIM SEOUL CLINIC</span>
                        <span className="text-[5px] tracking-wider text-amber-900 uppercase">Viện Thẩm Mỹ Hoàng Gia</span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[7px] font-black tracking-wider rounded-full uppercase">
                        ACTIVE MEMBER
                      </span>
                    </div>

                    {/* Card Body Title */}
                    <div className="my-auto pt-2 relative z-10">
                      <h4 className="text-base font-black tracking-wide text-amber-950 leading-tight">KIM SKINCARE PASS</h4>
                      <p className="text-[8px] tracking-widest text-amber-900/80 uppercase font-semibold font-mono">ĐẶC QUYỀN HỘI VIÊN VÀNG</p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-end justify-between pt-2 border-t border-amber-950/20 relative z-10">
                      <div className="space-y-0.5">
                        <span className="text-[7px] uppercase tracking-wider text-amber-900/80 block font-bold">Họ tên hội viên</span>
                        <span className="text-xs font-extrabold text-amber-950 block tracking-tight uppercase">{selectedCustomer.name}</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[7px] uppercase tracking-wider text-amber-900/80 block font-bold">Hạn sử dụng</span>
                        <span className="text-[9px] font-bold text-amber-950 block font-mono">
                          {selectedCustomer.kimSkincarePass.activatedDate} - {selectedCustomer.kimSkincarePass.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Program integration status & alerts */}
                  <div className="bg-amber-500/5 border border-amber-200/30 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-800">Thẻ hội viên vàng hoạt động tốt</span>
                      </div>
                      {(() => {
                        const daysLeft = getDaysRemaining(selectedCustomer.kimSkincarePass.expiryDate);
                        return (
                          <p className="text-[10px] text-slate-500">
                            Còn lại <strong className="text-amber-700 font-mono text-xs">{daysLeft} ngày</strong> sử dụng ưu đãi đặc quyền (Giảm 50% Skincare | 20% Filler/Botox | 10% Sản phẩm).
                          </p>
                        );
                      })()}
                    </div>

                    <button
                      onClick={handleRegisterKimSkincarePass}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-amber-200 text-amber-700 font-bold text-[10px] rounded-xl shadow-sm transition-all text-center"
                    >
                      Gia hạn thẻ (+1.000.000đ)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BEFORE / AFTER Photo Comparisons */}
            <div id="customer-before-after-section" className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-600" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Hình ảnh kiểm chứng lâm sàng (Before/After)</span>
                </div>
                <button
                  onClick={() => setShowAddPhotoModal(true)}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" /> Thêm ảnh Before/After
                </button>
              </div>

              {selectedCustomer.beforeAfterImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCustomer.beforeAfterImages.map((img, idx) => (
                    <div id={`before-after-card-${idx}`} key={idx} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50 group relative">
                      
                      {/* Edit / Delete overlay buttons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 opacity-80 hover:opacity-100">
                        <button
                          onClick={() => handleStartEditPhoto(idx, img)}
                          className="p-1 bg-white hover:bg-slate-100 text-amber-600 hover:text-amber-700 rounded-lg shadow-sm border border-slate-100 transition-colors"
                          title="Sửa hình ảnh & tiêu đề"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(idx)}
                          className="p-1 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg shadow-sm border border-slate-100 transition-colors"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-xs font-bold text-slate-800 leading-tight pr-14">{img.title}</p>
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
                      
                      {/* URL display and edit status */}
                      <div className="text-[9px] text-slate-400 font-mono truncate pt-1">
                        <span>Lưu tại: {img.before.slice(0, 30)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa có hình ảnh kiểm chứng cho khách hàng này.</p>
              )}
            </div>

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
              
              {/* Payment/Deduction Mode Toggle */}
              {selectedCustomer.activePackages && selectedCustomer.activePackages.length > 0 && (
                <div className="flex gap-4 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="deductionMode"
                      checked={!isPackageDeduction}
                      onChange={() => setIsPackageDeduction(false)}
                      className="accent-amber-500"
                    />
                    Dịch vụ lẻ / Trực tiếp
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="deductionMode"
                      checked={isPackageDeduction}
                      onChange={() => {
                        setIsPackageDeduction(true);
                        if (selectedCustomer.activePackages && selectedCustomer.activePackages.length > 0) {
                          setSelectedPackageToDeduct(selectedCustomer.activePackages[0].packageName);
                        }
                      }}
                      className="accent-amber-500"
                    />
                    Trừ vào Gói Liệu Trình (Có sẵn)
                  </label>
                </div>
              )}

              <form onSubmit={handleAddSession} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isPackageDeduction && selectedCustomer.activePackages && selectedCustomer.activePackages.length > 0 ? (
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Chọn gói để trừ buổi</label>
                    <select
                      value={selectedPackageToDeduct}
                      onChange={(e) => setSelectedPackageToDeduct(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {selectedCustomer.activePackages.map((pkg, i) => (
                        <option key={i} value={pkg.packageName}>
                          {pkg.packageName} ({pkg.usedSessions}/{pkg.totalSessions})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Dịch vụ lẻ</label>
                    <select
                      id="new-session-srv"
                      value={newTreatmentService}
                      onChange={(e) => setNewTreatmentService(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    >
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.name}>
                          {srv.name} [{srv.category}]
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Kỹ thuật viên / Clinician</label>
                  <select
                    id="new-session-tech"
                    value={newTreatmentTech}
                    onChange={(e) => setNewTreatmentTech(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    {technicians && technicians.length > 0 ? (
                      technicians.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.role})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Phạm Minh Tú">Phạm Minh Tú</option>
                        <option value="Nguyễn Đông Nhi">Nguyễn Đông Nhi</option>
                        <option value="Trần Hà Phương">Trần Hà Phương</option>
                        <option value="Lê Quỳnh Anh">Lê Quỳnh Anh</option>
                      </>
                    )}
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
                      {isPackageDeduction ? 'Trừ 1 buổi & Lưu' : 'Lưu ca máy'}
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
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Ngày tháng năm sinh *</label>
                  <input
                    id="new-cust-birthday-input"
                    type="date"
                    value={newBirthday}
                    onChange={(e) => setNewBirthday(e.target.value)}
                    required
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
                    <option value="Diamond VIP Plus">Diamond VIP Plus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Giảm trừ đặc cách % từ khách hàng</label>
                <input
                  id="new-cust-discount-input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ví dụ: 10..."
                  value={newDiscountPercent}
                  onChange={(e) => setNewDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono text-rose-600 font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Khi khách hàng này thanh toán dịch vụ hoặc mua liệu trình, hệ thống sẽ tự động trừ đi số % giảm giá mặc định này.</p>
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

              {/* Special program direct links */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Kích hoạt nhanh chương trình đặc biệt</span>
                
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={initKimReward}
                      onChange={(e) => setInitKimReward(e.target.checked)}
                      className="mt-0.5 accent-amber-500 rounded h-3.5 w-3.5"
                    />
                    <div>
                      <span>Đăng ký KIM REWARD (Hoàn 100% Bill)</span>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">Giới thiệu 3 khách, nhận hoàn trả 100% hóa đơn gốc</p>
                    </div>
                  </label>
                  
                  {initKimReward && (
                    <div className="pl-6 pt-1 flex items-center gap-2 animate-fade-in">
                      <span className="text-[10px] text-slate-500 font-medium">Giá trị Bill gốc:</span>
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <input
                          type="number"
                          min="2000000"
                          max="10000000"
                          step="500000"
                          value={initKimRewardBill}
                          onChange={(e) => setInitKimRewardBill(Number(e.target.value))}
                          className="bg-transparent border-none p-0 w-24 text-xs font-mono font-bold text-slate-800 text-right focus:outline-none focus:ring-0"
                        />
                        <span className="text-slate-400 text-[10px]">đ</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={initKimSkincarePass}
                      onChange={(e) => setInitKimSkincarePass(e.target.checked)}
                      className="mt-0.5 accent-amber-500 rounded h-3.5 w-3.5"
                    />
                    <div>
                      <span>Đăng ký KIM SKINCARE PASS (Thẻ Vàng)</span>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">Gia nhập Hội viên Vàng giảm giá 50% Skincare, 20% Filler/Botox trong 3 tháng</p>
                    </div>
                  </label>
                </div>
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

      {/* Edit Customer Profile Modal */}
      {showEditCustomerModal && (
        <div id="edit-customer-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="edit-customer-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden text-xs text-slate-700">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Chỉnh sửa Hồ sơ Khách hàng</span>
              <button onClick={() => setShowEditCustomerModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Họ và tên khách hàng *</label>
                <input
                  type="text"
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Số điện thoại *</label>
                  <input
                    type="text"
                    value={editCustPhone}
                    onChange={(e) => setEditCustPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Ngày tháng năm sinh *</label>
                  <input
                    type="date"
                    value={editCustBirthday}
                    onChange={(e) => setEditCustBirthday(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Giới tính</label>
                  <select
                    value={editCustGender}
                    onChange={(e) => setEditCustGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạng thành viên</label>
                  <select
                    value={editCustRank}
                    onChange={(e) => setEditCustRank(e.target.value as Customer['rank'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver Member">Silver Member</option>
                    <option value="Gold Member">Gold Member</option>
                    <option value="Diamond VIP">Diamond VIP</option>
                    <option value="Diamond VIP Plus">Diamond VIP Plus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Giảm trừ đặc cách % từ khách hàng</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ví dụ: 10..."
                  value={editCustDiscountPercent}
                  onChange={(e) => setEditCustDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono text-rose-600 font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Khi khách hàng này thanh toán dịch vụ hoặc mua liệu trình, hệ thống sẽ tự động trừ đi số % giảm giá mặc định này.</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">URL hình ảnh đại diện (Avatar) *</label>
                <input
                  type="text"
                  value={editCustAvatar}
                  onChange={(e) => setEditCustAvatar(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-600 bg-slate-50 text-[10px]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Ghi chú lâm sàng / dặn dò da</label>
                <textarea
                  value={editCustNotes}
                  onChange={(e) => setEditCustNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 bg-white resize-none text-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
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

      {/* Buy/Register Package Modal */}
      {showBuyPackageModal && (
        <div id="buy-package-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="buy-package-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Bán & Đăng ký Gói sản phẩm mới</span>
              <button onClick={() => setShowBuyPackageModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBuyPackageSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Gói sản phẩm chỉ định</label>
                <select
                  value={newPkgName}
                  onChange={(e) => handlePkgNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  {getDynamicPackages().map((pkg, idx) => (
                    <option key={idx} value={pkg.name}>
                      {pkg.name} ({formatVND(pkg.price)})
                    </option>
                  ))}
                  <option value="custom">-- Tự nhập gói khác --</option>
                </select>
              </div>

              {newPkgName === 'custom' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tên gói sản phẩm tùy chọn *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên gói liệu trình..."
                    value={customPkgName}
                    onChange={(e) => setCustomPkgName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tổng số buổi *</label>
                  <input
                    type="number"
                    min="1"
                    value={newPkgSessions}
                    onChange={(e) => setNewPkgSessions(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Giá tiền trọn gói (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Xác nhận thanh toán</span>
                {selectedCustomer?.discountPercent ? (
                  <div className="space-y-0.5">
                    <p className="text-slate-400 line-through text-[11px] font-mono leading-none">
                      Giá niêm yết: {formatVND(newPkgPrice)}
                    </p>
                    <p className="text-rose-600 font-extrabold text-sm font-mono leading-none">
                      Ưu đãi ({selectedCustomer.discountPercent}%): {formatVND(Math.round(newPkgPrice * (1 - selectedCustomer.discountPercent / 100)))}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-semibold mt-1">
                      ✓ Đã tự động áp dụng chính sách giảm trừ đặc quyền của {selectedCustomer.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-800 font-bold text-sm font-mono">
                    {formatVND(newPkgPrice)}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Giá này sẽ cộng trực tiếp vào Tổng tích luỹ của khách hàng và Doanh thu của hệ thống.
                </p>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowBuyPackageModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Xác nhận mua & kích hoạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Before/After Photo Modal */}
      {showAddPhotoModal && (
        <div id="add-photo-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="add-photo-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Thêm so sánh lâm sàng Before / After</span>
              <button onClick={() => setShowAddPhotoModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Chọn mẫu điều trị nhanh</label>
                <div className="flex flex-wrap gap-2">
                  {PHOTO_TEMPLATES.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPhotoTemplate(t)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors text-[11px]"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tiêu đề liệu trình so sánh *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hiệu quả sau 3 buổi Laser Pico..."
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">URL hình ảnh TRƯỚC (Before) *</label>
                <input
                  type="text"
                  placeholder="http://..."
                  value={beforePhoto}
                  onChange={(e) => setBeforePhoto(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">URL hình ảnh SAU (After) *</label>
                <input
                  type="text"
                  placeholder="http://..."
                  value={afterPhoto}
                  onChange={(e) => setAfterPhoto(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Xác nhận thêm hình ảnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Before/After Photo Modal */}
      {showEditPhotoModal && (
        <div id="edit-photo-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-xs text-slate-700">
          <div id="edit-photo-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Chỉnh sửa so sánh lâm sàng Before / After</span>
              <button onClick={() => setShowEditPhotoModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditPhotoSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tiêu đề liệu trình so sánh *</label>
                <input
                  type="text"
                  value={editPhotoTitle}
                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">URL hình ảnh TRƯỚC (Before) *</label>
                <input
                  type="text"
                  value={editBeforePhoto}
                  onChange={(e) => setEditBeforePhoto(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono text-[10px]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">URL hình ảnh SAU (After) *</label>
                <input
                  type="text"
                  value={editAfterPhoto}
                  onChange={(e) => setEditAfterPhoto(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono text-[10px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block mb-1">XEM TRƯỚC TRƯỚC (BEFORE)</span>
                  <img src={editBeforePhoto} alt="before preview" className="w-full h-24 object-cover rounded-lg border border-slate-100" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block mb-1">XEM TRƯỚC SAU (AFTER)</span>
                  <img src={editAfterPhoto} alt="after preview" className="w-full h-24 object-cover rounded-lg border border-slate-100" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditPhotoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Xác nhận cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
