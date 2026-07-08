import { Customer, Appointment, Technician, CRMTask, Promotion, ServiceItem } from './types';

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'srv_1', name: 'Nâng cơ Ultherapy VIP', price: 45000000, durationMin: 90, category: 'Trẻ hoá da' },
  { id: 'srv_2', name: 'Trẻ hoá da Thermage FLX 900', price: 68000000, durationMin: 120, category: 'Trẻ hoá da' },
  { id: 'srv_3', name: 'Tiêm Meso căng bóng HA căng mọng', price: 8500000, durationMin: 60, category: 'Tiêm thẩm mỹ' },
  { id: 'srv_4', name: 'Laser Pico Premium trị nám sạm', price: 4200000, durationMin: 45, category: 'Laser điều trị' },
  { id: 'srv_5', name: 'Tắm trắng phi thuyền Hoàng Gia', price: 5500000, durationMin: 75, category: 'Body & Tắm trắng' },
  { id: 'srv_6', name: 'Điện di phục hồi Vitamin C Hàn Quốc', price: 1500000, durationMin: 40, category: 'Chăm sóc cơ bản' },
  { id: 'srv_7', name: 'Tiêm Botox thon gọn hàm Allergan', price: 12000000, durationMin: 45, category: 'Tiêm thẩm mỹ' },

  // --- MASSAGE CATEGORY ---
  { id: 'srv_m1', name: 'Massage Body Seoul Heal 60 phút', price: 350000, durationMin: 60, category: 'Massage' },
  { id: 'srv_m2', name: 'Massage Trị Liệu Seoul VIP', price: 450000, durationMin: 75, category: 'Massage' },

  // --- GỘI ĐẦU CATEGORY ---
  { id: 'srv_g1', name: 'Gội trải nghiệm', price: 39000, durationMin: 30, category: 'Gội đầu' },
  { id: 'srv_g2', name: 'Mang dầu đến gội', price: 69000, durationMin: 40, category: 'Gội đầu' },
  { id: 'srv_g3', name: 'Gội dầu thường', price: 69000, durationMin: 40, category: 'Gội đầu' },
  { id: 'srv_g4', name: 'Gội dầu cặp', price: 89000, durationMin: 45, category: 'Gội đầu' },

  // --- TRIỆT LÔNG CATEGORY ---
  { id: 'srv_tl1', name: 'Triệt lông Toàn Thân (Buổi lẻ)', price: 1300000, durationMin: 90, category: 'Triệt lông' },
  { id: 'srv_tl2', name: 'Triệt lông Nửa Cánh Tay (Buổi lẻ)', price: 180000, durationMin: 25, category: 'Triệt lông' },
  { id: 'srv_tl3', name: 'Triệt lông Cả Cánh Tay (Buổi lẻ)', price: 300000, durationMin: 35, category: 'Triệt lông' },
  { id: 'srv_tl4', name: 'Triệt lông Nửa Chân (Buổi lẻ)', price: 280000, durationMin: 30, category: 'Triệt lông' },
  { id: 'srv_tl5', name: 'Triệt lông Lưng/Gáy (Buổi lẻ)', price: 300000, durationMin: 35, category: 'Triệt lông' },
  { id: 'srv_tl6', name: 'Triệt lông Ngực (Buổi lẻ)', price: 200000, durationMin: 25, category: 'Triệt lông' },
  { id: 'srv_tl7', name: 'Triệt lông Bụng (Buổi lẻ)', price: 200000, durationMin: 25, category: 'Triệt lông' },
  { id: 'srv_tl8', name: 'Triệt lông Mặt (Buổi lẻ)', price: 100000, durationMin: 20, category: 'Triệt lông' },
  { id: 'srv_tl9', name: 'Triệt lông Nách (Buổi lẻ)', price: 80000, durationMin: 15, category: 'Triệt lông' },
  { id: 'srv_tl10', name: 'Triệt lông Râu Cằm (Buổi lẻ)', price: 150000, durationMin: 15, category: 'Triệt lông' },
  { id: 'srv_tl11', name: 'Triệt lông Râu Quai Nón (Buổi lẻ)', price: 300000, durationMin: 20, category: 'Triệt lông' },
  { id: 'srv_tl12', name: 'Triệt lông Bikini Toàn Bộ (Buổi lẻ)', price: 300000, durationMin: 30, category: 'Triệt lông' },

  // --- BOTOX CATEGORY ---
  { id: 'srv_bt1', name: 'Botox Xóa Nhăn Trán (Gói Chuyên Viên)', price: 2500000, durationMin: 30, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt2', name: 'Botox Xóa Nhăn Trán (Gói Bác Sĩ)', price: 3500000, durationMin: 30, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt3', name: 'Botox Trị Hôi Nách (Gói Chuyên Viên)', price: 3500000, durationMin: 40, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt4', name: 'Botox Trị Hôi Nách (Gói Bác Sĩ)', price: 4500000, durationMin: 40, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt5', name: 'Botox Xóa Nhăn Mắt Chân Chim (Gói Chuyên Viên)', price: 2500000, durationMin: 30, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt6', name: 'Botox Xóa Nhăn Mắt Chân Chim (Gói Bác Sĩ)', price: 3500000, durationMin: 30, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt7', name: 'Botox Thon Gọn Bắp Tay (Gói Chuyên Viên)', price: 4500000, durationMin: 40, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt8', name: 'Botox Thon Gọn Bắp Tay (Gói Bác Sĩ)', price: 5500000, durationMin: 40, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt9', name: 'Botox Thon Gọn Hàm (Gói Chuyên Viên)', price: 2500000, durationMin: 30, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt10', name: 'Botox Thon Gọn Hàm (Gói Bác Sĩ)', price: 3500000, durationMin: 30, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt11', name: 'Botox Thon Gọn Vai (Gói Chuyên Viên)', price: 4500000, durationMin: 45, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt12', name: 'Botox Thon Gọn Vai (Gói Bác Sĩ)', price: 5500000, durationMin: 45, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt13', name: 'Botox Lifting Toàn Mặt (Gói Chuyên Viên)', price: 4500000, durationMin: 45, category: 'Botox Hàn Quốc' },
  { id: 'srv_bt14', name: 'Botox Lifting Toàn Mặt (Gói Bác Sĩ)', price: 5500000, durationMin: 45, category: 'Botox Hàn Quốc' },

  // --- FILLER CATEGORY ---
  { id: 'srv_f1', name: 'Filler Môi 1-2 CC (Gói Chuyên Viên)', price: 3000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f2', name: 'Filler Môi 1-2 CC (Gói Bác Sĩ)', price: 5000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f3', name: 'Filler Rãnh Cằm 2-4 CC (Gói Chuyên Viên)', price: 6000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f4', name: 'Filler Rãnh Cằm 2-4 CC (Gói Bác Sĩ)', price: 8000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f5', name: 'Filler Má Baby 5-7 CC (Gói Chuyên Viên)', price: 12000000, durationMin: 45, category: 'Filler Hàn Quốc' },
  { id: 'srv_f6', name: 'Filler Má Baby 5-7 CC (Gói Bác Sĩ)', price: 15250000, durationMin: 45, category: 'Filler Hàn Quốc' },
  { id: 'srv_f7', name: 'Filler Thái Dương 1-2 CC (Gói Chuyên Viên)', price: 3000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f8', name: 'Filler Thái Dương 1-2 CC (Gói Bác Sĩ)', price: 4250000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f9', name: 'Filler Rãnh Cười 1-2 CC (Gói Chuyên Viên)', price: 3000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f10', name: 'Filler Rãnh Cười 1-2 CC (Gói Bác Sĩ)', price: 4750000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f11', name: 'Filler Hốc Mắt 1-2 CC (Gói Chuyên Viên)', price: 3000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f12', name: 'Filler Hốc Mắt 1-2 CC (Gói Bác Sĩ)', price: 4250000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f13', name: 'Filler Cằm 1-2 CC (Gói Chuyên Viên)', price: 3000000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f14', name: 'Filler Cằm 1-2 CC (Gói Bác Sĩ)', price: 4250000, durationMin: 40, category: 'Filler Hàn Quốc' },
  { id: 'srv_f15', name: 'Filler Châu Âu (Gói Chuyên Viên)', price: 9000000, durationMin: 50, category: 'Filler Hàn Quốc' },
  { id: 'srv_f16', name: 'Filler Châu Âu (Gói Bác Sĩ)', price: 12500000, durationMin: 50, category: 'Filler Hàn Quốc' }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech_1',
    name: 'Hoài Anh',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbqPaDKsIMo_SiwkGPXsi2BQQ3Hm1BgdfSxfNVIDCGvzt-4oM6e0uhejFC2D1jkIWoehRKVP8UrB7ALitKedqgw9nrZ3svIlkXIplilS1_VbHt2rH-ytcjc90X3gkcldt5JgTBOOQyFy9A95U4VKzxzCr8Y0b4LoXotDV7aBpQKuLrpeEkO0s3A6c6bik5hafUbwsw9aJbuQm3eDuU9SawTjAc5v9mf8nsbFf8jnyhjSiSbmw7y0j5qg',
    role: 'Bác Sĩ',
    status: 'Đang bận',
    currentRoom: 'Phòng VIP 1',
    rating: 4.9,
    completedJobs: 412,
    specialty: ['Thermage FLX', 'Ultherapy', 'Laser Pico', 'Tiêm Botox']
  },
  {
    id: 'tech_2',
    name: 'Nguyễn Thị Vân Anh',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxGJeAb7RjqCBvFf7cK957kTGrR7dvT2PNmAkaYy0f_F0_LujC5RkM7Lea268Xcb_zlalyHB7LRgJm5OfEdv64w-X5eaeh_EsvXHbGgmA__ufaJNf0XSlejw5wH4VrSODjd7WnoXjXd2YIHLKbXca-iFYE5HCERYUDrUG8HXhu6IrwBbx48gfjczl6KjQeEZjTML8y0o_cNKKkj45UllueL_oIH7w_MiutOZUgRnsk_EgorTiquZH1mQ',
    role: 'Kỹ thuật trưởng',
    status: 'Sẵn sàng',
    rating: 4.8,
    completedJobs: 620,
    specialty: ['Meso HA', 'Điện di Vitamin C', 'Chăm sóc cơ bản']
  },
  {
    id: 'tech_3',
    name: 'Nguyễn Thị Hạnh',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw2L6ea1TSxtM2Z3j4gF8jlOelq5MnmgqHRzEMiO05KMlCNg9Suo2Q7ixbDEQCiNFAlY_pWlfLjrCLvQRZwbyMuefhwAkjL4sb_YJQgOdCwMf3svxclnOBCRAr7HoAPs9vceV5nM7BV5qWaIsBvNCE0mKt4ilbkEeuFmbSn8LctgXzfrwa_WSeZx-U5AA1CxzOADYT9MQkNmkn_hqN0v4lRr8fwKbv4iVf8YtQ4RPAQQjV7CIHh86zAw',
    role: 'Chuyên viên kỹ thuật',
    status: 'Đang bận',
    currentRoom: 'Phòng Laser 2',
    rating: 4.9,
    completedJobs: 388,
    specialty: ['Tiêm Botox', 'Tiêm Meso HA', 'Thermage FLX']
  },
  {
    id: 'tech_4',
    name: 'Nguyễn Thị Quỳnh Trang',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGbb64dQP-apgcvWf6MAROln9wiVtp9eCmS3yakyMR5W9uVnwTIcc2UB4gj55zDIt9wBATeuUY7BUPga5P34AZLBfvrIJdNouKwLSydrhgPYzUUvSPVngxk0PlXotQRziLVK4EamKiNAvdyuoxuKdH9ro3hzV0FKqAsefHoZm4tYtkptUGu-mkTbWJzB631IPG2EtpOF3LAxFYbgSMmPCFwNgH-m5_xDTmToXufPYzkJXJZR7f1y62aw',
    role: 'Chuyên viên kỹ thuật',
    status: 'Sẵn sàng',
    rating: 4.7,
    completedJobs: 512,
    specialty: ['Tắm trắng phi thuyền', 'Laser điều trị', 'Điện di C']
  },
  {
    id: 'tech_5',
    name: 'Nguyễn Thị Phương Thảo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvrCjoDOCVr14BWsH-v0lHXHScZ1SScUmiiZRR2eYhlirctdM-n3Jicd7yugXscwGKgTl-iXQClwGS-k6q_Uv0g_efog304hJYgiWrOojDPr_9Gxud-SOp93842tJfcKJwG1t10i0k7T2JoklhPPbkjQpjzo7qXyKvAeuWtmbEkrgYFFUulfOH1R6sGSCFSvPR-ljIkqr8JCvywr93DJLt5XUCBjqQEue1soSXsYChGQgMdJj0nyy6jg',
    role: 'Sales',
    status: 'Sẵn sàng',
    rating: 4.8,
    completedJobs: 290,
    specialty: ['Tư vấn dịch vụ', 'Chăm sóc khách hàng', 'Tối ưu phác đồ']
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Nguyễn Phương Anh',
    phone: '0908 123 456',
    age: 28,
    gender: 'Nữ',
    rank: 'Diamond VIP',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6FJ_knYhgVdUozTF_zP-JMAaVTmEvBoM9noSc5B1wK3tW6G4nfIIfLOBDn9ZFxj1E3fslQBhWFclHYqpChaObdCunv11Yt04ea-t7b3J7O18gIy6NNdYaNyU4azmTLKRsj8LHIJoYoqn10VKsTuExCyMusAOEKZjG8d-PxmDda1OlKpp9zp07QtUX9MocnOFQhTlTt6z_Dy1LA0YvkWHwF0-JNcRaJ777gYZQ_bDts2-pfdycMBW3cw',
    totalSpent: 124500000,
    totalVisits: 14,
    notes: 'Khách hàng cực kỳ chú trọng vùng da mắt và rãnh cười. Da nhạy cảm nhẹ, thích nghe nhạc spa nhẹ khi trị liệu. Thường mua thêm kem dưỡng phục hồi sau điều trị.',
    activePackages: [
      { packageName: 'Combo Trẻ Hoá Toàn Diện 5 Buổi', totalSessions: 5, usedSessions: 3 }
    ],
    treatmentHistory: [
      {
        id: 'th_1_1',
        date: '2026-05-12',
        serviceName: 'Laser Carbon trẻ hoá da',
        technician: 'Nguyễn Đông Nhi',
        note: 'Da đáp ứng tốt, hơi ửng hồng nhẹ sau bắn, đã thoa dịu mát bằng gel lô hội.',
        status: 'Hoàn thành'
      },
      {
        id: 'th_1_2',
        date: '2026-06-02',
        serviceName: 'Tiêm Meso căng bóng HA căng mọng',
        technician: 'Phạm Minh Tú',
        note: 'Tiêm vi điểm đều khắp mặt, tập trung rãnh cười. Khách chịu đau tốt. Hướng dẫn chăm sóc da 24h sau tiêm.',
        status: 'Hoàn thành'
      },
      {
        id: 'th_1_3',
        date: '2026-06-20',
        serviceName: 'Điện di phục hồi Vitamin C Hàn Quốc',
        technician: 'Lê Quỳnh Anh',
        note: 'Chạy điện di 20 phút mát lạnh, da sáng bóng, khách cực kỳ hài lòng, mua thêm kem chống nắng vật lý.',
        status: 'Hoàn thành'
      }
    ],
    beforeAfterImages: [
      {
        title: 'Liệu trình trẻ hoá da toàn mặt Thermage FLX 900',
        before: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu824daQTdoztbzrvdYKK4kLCR8RiqJorOfOd0cyC0eD6J8IAARhF-0JqIHnIPJo3l71frL0n-PSphkzkFwCSffDsTwOEJ72WisGYOUKTiS0TIlKv6JjFgbMi29Eyz3lXIASrLIUv79bkKI1tRa28k1DxHyNZGTsOiR7HdjOTEsZM9-m1_eRcfnznNpA9GZ07YyjkQBDgYQPLBSZS3HVGbkmYl45NaaC1-IbeCJ8lV2E7amV2lF7Bzpg',
        after: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVjVWDa6FBPRupeWWw6KXc5SszA7RHeh7nR0cVADH-6lC50M_0XO8aAQfS9B4_KpYfLtKA8Ebo55BS6di3IIFbnPJc37vtaHsF4VtV90MND97tkUMoWbi6Iyc6rxV9VM67BNJ7l1XK2v5uwmQkINwuigefQZ3eg2uUyjFwPaIybaJH6lhMg2NNYRfINdX1eusZ7E-F5UvXOg05YVj2SFLU0KHTIsaL0CIBS7o33BQXPQNGG8U1GsPiew'
      },
      {
        title: 'Hiệu quả sau 2 buổi tiêm Meso căng bóng HA',
        before: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7z_NxvCyadLd3LSumbxbROb2nD9Ovrxs8AdzhWWq3sZUOnqC42WCWgIJNooRjLC1C9pUYzKB4RfJqfcmlUV2O-vRVB8Ty8LnNB312TsBWhhYonZBJw7a0HoL912q5wedFtQUb0SC8WbpyHqtyfpmruDlItrneJMlLahqZYlTXk3Ya6BXVEcC-NFfEagvGP4USPX-S6buBa6L7YxoygON09QYb8neKerJoEOSrPpt_80WXPueOscatVA',
        after: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFYufw6uzr8D2WISf0EZfzPSv2OoJ2qPFFF3l3PRpDIpQQDCNCU6kpxYF1gXw-RZtAHHFYAD2k03iw_fljwuDjen9y-WoIDKa5LR5DufMLFAyRc-J0FapG3bxz7iQ5yROzq4R_-OuW_ZEsGgAyR7ZnWMjpOR2sghacpmqvBySkifIjW8boGd5-12OGff2w7M59fIhco5heLP1v0YY3-DjYx6L931JX-clBMGK16gQARxbUtrGxqjKbcQ'
      }
    ]
  },
  {
    id: 'cust_2',
    name: 'Trần Thu Hà',
    phone: '0987 654 321',
    age: 35,
    gender: 'Nữ',
    rank: 'Gold Member',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuAofPzys8nO9ehhqe9MCk5DydSYieOkVDT6hB2cIycYgh03R0XHz2HKRpsJG4NM1c72BGic31Z2HKeAkMkWe9bmAKLDNfC7jWZUoWi5ro0xT-3ym0tjs-ETfDmo64LYD_I8UAlLvjmVtXsPZwxHS1JQU5WGGwTzRo11p2xwqMF_xQV4KwZpVyjqsLmb2VbC7YiBSecKxgvWvJAvHRqng9pw-Fyux4LORW2BGtMUYSZLgzNt6VFa09Ew',
    totalSpent: 45000000,
    totalVisits: 6,
    notes: 'Gặp vấn đề sắc tố da bẩm sinh, vùng má xuất hiện nám sạm chân sâu. Đang đi liệu trình Laser Pico. Yêu cầu bôi tê kỹ trước khi điều trị.',
    activePackages: [
      { packageName: 'Liệu Trình Laser Pico Sạch Nám 10 Buổi', totalSessions: 10, usedSessions: 4 }
    ],
    treatmentHistory: [
      { id: 'th_2_1', date: '2026-06-10', serviceName: 'Laser Pico Premium trị nám sạm', technician: 'Phạm Minh Tú', note: 'Bắn bước sóng 1064nm, năng lượng trung bình. Da đỏ nhẹ, khách cảm giác châm chích ổn.', status: 'Hoàn thành' }
    ],
    beforeAfterImages: []
  },
  {
    id: 'cust_3',
    name: 'Admin Kim',
    phone: '0912 333 444',
    age: 32,
    gender: 'Nam',
    rank: 'Silver Member',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIqPjhAp5cVJzS7gXkPMPWaqAQRJ6GonAhryRuDkZ4qL1qBRGx6rf04RxTWubqdpW1KUfNDBWlHRDlIpufZ6neYp9Y7LECMKxp7-T4Bw9LtpBPVDF8OUv-R4VjrjKB5gJD1w_0ohGMSjCzsFV2m5oEMG5XXcYzFICd9hB1sqPw_Lqh1Lo-a_VY6p5XORqMLaSVOxe_yCZph0KyWcm8Ps8FyOGhi6uCVrxlbzy0JFJuuooW7SVpZVYPSA',
    totalSpent: 18000000,
    totalVisits: 3,
    notes: 'Thích trải nghiệm công nghệ cao, quan tâm dịch vụ nâng cơ hàm và trẻ hoá da nam giới.',
    activePackages: [],
    treatmentHistory: [
      { id: 'th_3_1', date: '2026-06-15', serviceName: 'Nâng cơ Ultherapy VIP', technician: 'Trần Hà Phương', note: 'Điêu khắc gọn viền hàm bằng Ultherapy 300 lines. Khách rất ưng kết quả tức thì.', status: 'Hoàn thành' }
    ],
    beforeAfterImages: []
  },
  {
    id: 'cust_4',
    name: 'Vũ Hoàng Yến',
    phone: '0934 888 999',
    age: 41,
    gender: 'Nữ',
    rank: 'Diamond VIP',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqgNK7wDBCLPEB5ltOOeB5qtCNSflyX-OI917IvofLJeVdgjp33c0zZdqJUH8n-jCn9sYW-tpGg9lgcRrWwssTPawj2ssM_ZeCe3V7qGZW8cZyV86IC3rZlJbdLITeEKB9cJdv362OHACuSD5aIvW-dwU9dv9iviBUiV6T8QEza8DANmrkn9P48dQ2kMyr0q0W69Gv9af_ueE8Dwczt0DbWPQ1P-469JsUZOeVwX0UFU8J1w1GHOfqvg',
    totalSpent: 285000000,
    totalVisits: 22,
    notes: 'VIP Đặc biệt, phu nhân tập đoàn lớn. Rất nhạy cảm với thái độ phục vụ. Luôn xếp bác sĩ Tú điều trị Thermage hoặc Ultherapy. Luôn phục vụ tại phòng VIP cao cấp nhất.',
    activePackages: [
      { packageName: 'Thermage FLX Cao Cấp 1 năm', totalSessions: 3, usedSessions: 1 }
    ],
    treatmentHistory: [],
    beforeAfterImages: []
  },
  {
    id: 'cust_5',
    name: 'Lê Minh Tâm',
    phone: '0977 444 555',
    age: 30,
    gender: 'Nam',
    rank: 'Standard',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
    totalSpent: 8500000,
    totalVisits: 1,
    notes: 'Bị lỗ chân lông to ở cánh mũi, mong muốn tiêm Meso căng bóng cấp ẩm sâu thu nhỏ chân lông.',
    activePackages: [],
    treatmentHistory: [],
    beforeAfterImages: []
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt_1',
    customerId: 'cust_1',
    customerName: 'Nguyễn Phương Anh',
    customerPhone: '0908 123 456',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6FJ_knYhgVdUozTF_zP-JMAaVTmEvBoM9noSc5B1wK3tW6G4nfIIfLOBDn9ZFxj1E3fslQBhWFclHYqpChaObdCunv11Yt04ea-t7b3J7O18gIy6NNdYaNyU4azmTLKRsj8LHIJoYoqn10VKsTuExCyMusAOEKZjG8d-PxmDda1OlKpp9zp07QtUX9MocnOFQhTlTt6z_Dy1LA0YvkWHwF0-JNcRaJ777gYZQ_bDts2-pfdycMBW3cw',
    serviceName: 'Trẻ hoá da Thermage FLX 900',
    price: 68000000,
    technicianId: 'tech_1',
    technicianName: 'Hoài Anh',
    date: '2026-07-08',
    time: '09:30',
    status: 'Đang thực hiện',
    notes: 'Buổi làm liệu trình chính. Đi đầu tip 900 lines. Đã bôi tê 45 phút trước khi bắn.'
  },
  {
    id: 'appt_2',
    customerId: 'cust_2',
    customerName: 'Trần Thu Hà',
    customerPhone: '0987 654 321',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuAofPzys8nO9ehhqe9MCk5DydSYieOkVDT6hB2cIycYgh03R0XHz2HKRpsJG4NM1c72BGic31Z2HKeAkMkWe9bmAKLDNfC7jWZUoWi5ro0xT-3ym0tjs-ETfDmo64LYD_I8UAlLvjmVtXsPZwxHS1JQU5WGGwTzRo11p2xwqMF_xQV4KwZpVyjqsLmb2VbC7YiBSecKxgvWvJAvHRqng9pw-Fyux4LORW2BGtMUYSZLgzNt6VFa09Ew',
    serviceName: 'Laser Pico Premium trị nám sạm',
    price: 4200000,
    technicianId: 'tech_4',
    technicianName: 'Nguyễn Thị Quỳnh Trang',
    date: '2026-07-08',
    time: '11:00',
    status: 'Chờ phục vụ',
    notes: 'Bắn nám Pico buổi thứ 5. Khách đến đúng giờ, chuẩn bị đón tiếp.'
  },
  {
    id: 'appt_3',
    customerId: 'cust_3',
    customerName: 'Admin Kim',
    customerPhone: '0912 333 444',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIqPjhAp5cVJzS7gXkPMPWaqAQRJ6GonAhryRuDkZ4qL1qBRGx6rf04RxTWubqdpW1KUfNDBWlHRDlIpufZ6neYp9Y7LECMKxp7-T4Bw9LtpBPVDF8OUv-R4VjrjKB5gJD1w_0ohGMSjCzsFV2m5oEMG5XXcYzFICd9hB1sqPw_Lqh1Lo-a_VY6p5XORqMLaSVOxe_yCZph0KyWcm8Ps8FyOGhi6uCVrxlbzy0JFJuuooW7SVpZVYPSA',
    serviceName: 'Tiêm Meso căng bóng HA căng mọng',
    price: 8500000,
    technicianId: 'tech_3',
    technicianName: 'Nguyễn Thị Hạnh',
    date: '2026-07-08',
    time: '14:30',
    status: 'Chờ phục vụ',
    notes: 'Hẹn tư vấn tiêm Meso HA trẻ hoá căng tràn bóng mịn.'
  },
  {
    id: 'appt_4',
    customerId: 'cust_4',
    customerName: 'Vũ Hoàng Yến',
    customerPhone: '0934 888 999',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqgNK7wDBCLPEB5ltOOeB5qtCNSflyX-OI917IvofLJeVdgjp33c0zZdqJUH8n-jCn9sYW-tpGg9lgcRrWwssTPawj2ssM_ZeCe3V7qGZW8cZyV86IC3rZlJbdLITeEKB9cJdv362OHACuSD5aIvW-dwU9dv9iviBUiV6T8QEza8DANmrkn9P48dQ2kMyr0q0W69Gv9af_ueE8Dwczt0DbWPQ1P-469JsUZOeVwX0UFU8J1w1GHOfqvg',
    serviceName: 'Nâng cơ Ultherapy VIP',
    price: 45000000,
    technicianId: 'tech_1',
    technicianName: 'Hoài Anh',
    date: '2026-07-09',
    time: '10:00',
    status: 'Chờ phục vụ',
    notes: 'Khách VIP chỉ định Bác sĩ Tú làm trực tiếp tại phòng VIP 1. Chuẩn bị trà sâm đón tiếp.'
  },
  {
    id: 'appt_5',
    customerId: 'cust_5',
    customerName: 'Lê Minh Tâm',
    customerPhone: '0977 444 555',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
    serviceName: 'Tắm trắng phi thuyền Hoàng Gia',
    price: 5500000,
    technicianId: 'tech_5',
    technicianName: 'Nguyễn Thị Phương Thảo',
    date: '2026-07-08',
    time: '16:00',
    status: 'Hoàn thành',
    notes: 'Khách hàng hoàn tất liệu trình tắm trắng phi thuyền buổi đầu tiên.'
  }
];

export const INITIAL_CRM_TASKS: CRMTask[] = [
  {
    id: 'task_1',
    customerId: 'cust_1',
    customerName: 'Nguyễn Phương Anh',
    customerPhone: '0908 123 456',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6FJ_knYhgVdUozTF_zP-JMAaVTmEvBoM9noSc5B1wK3tW6G4nfIIfLOBDn9ZFxj1E3fslQBhWFclHYqpChaObdCunv11Yt04ea-t7b3J7O18gIy6NNdYaNyU4azmTLKRsj8LHIJoYoqn10VKsTuExCyMusAOEKZjG8d-PxmDda1OlKpp9zp07QtUX9MocnOFQhTlTt6z_Dy1LA0YvkWHwF0-JNcRaJ777gYZQ_bDts2-pfdycMBW3cw',
    type: 'Sau liệu trình',
    serviceName: 'Thermage FLX 900',
    description: 'Đánh giá mức độ sưng và nâng cơ mặt sau 1 ngày bắn Thermage FLX. Gọi điện hỏi thăm dặn dò dưỡng ẩm chống nắng.',
    dueDate: '2026-07-09',
    status: 'Cần liên hệ',
    loggedInteractions: []
  },
  {
    id: 'task_2',
    customerId: 'cust_5',
    customerName: 'Lê Minh Tâm',
    customerPhone: '0977 444 555',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
    type: 'Nhắc lịch dặm',
    serviceName: 'Meso căng bóng HA',
    description: 'Nhắc nhở lịch hẹn tiêm Meso dặm lần 2 để duy trì độ bóng và ẩm cho da hiệu quả tối đa.',
    dueDate: '2026-07-10',
    status: 'Cần liên hệ',
    loggedInteractions: []
  },
  {
    id: 'task_3',
    customerId: 'cust_4',
    customerName: 'Vũ Hoàng Yến',
    customerPhone: '0934 888 999',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqgNK7wDBCLPEB5ltOOeB5qtCNSflyX-OI917IvofLJeVdgjp33c0zZdqJUH8n-jCn9sYW-tpGg9lgcRrWwssTPawj2ssM_ZeCe3V7qGZW8cZyV86IC3rZlJbdLITeEKB9cJdv362OHACuSD5aIvW-dwU9dv9iviBUiV6T8QEza8DANmrkn9P48dQ2kMyr0q0W69Gv9af_ueE8Dwczt0DbWPQ1P-469JsUZOeVwX0UFU8J1w1GHOfqvg',
    type: 'Sinh nhật',
    description: 'Sinh nhật khách VIP Thượng hạng (Vũ Hoàng Yến - 11/07). Gửi hoa chúc mừng tại nhà và thẻ đặc quyền liệu trình Premium trị giá 10.000.000đ.',
    dueDate: '2026-07-11',
    status: 'Cần liên hệ',
    loggedInteractions: []
  },
  {
    id: 'task_4',
    customerId: 'cust_2',
    customerName: 'Trần Thu Hà',
    customerPhone: '0987 654 321',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuAofPzys8nO9ehhqe9MCk5DydSYieOkVDT6hB2cIycYgh03R0XHz2HKRpsJG4NM1c72BGic31Z2HKeAkMkWe9bmAKLDNfC7jWZUoWi5ro0xT-3ym0tjs-ETfDmo64LYD_I8UAlLvjmVtXsPZwxHS1JQU5WGGwTzRo11p2xwqMF_xQV4KwZpVyjqsLmb2VbC7YiBSecKxgvWvJAvHRqng9pw-Fyux4LORW2BGtMUYSZLgzNt6VFa09Ew',
    type: 'Ưu đãi VIP',
    serviceName: 'Laser Pico Sạch Nám',
    description: 'Tặng Voucher 15% Laser buổi kế tiếp nhân dịp đạt hạng thành viên Gold Member.',
    dueDate: '2026-07-08',
    status: 'Đã hoàn thành',
    loggedInteractions: [
      { date: '2026-07-08', note: 'Đã gọi điện tư vấn và gửi mã voucher qua SMS. Khách vui vẻ ghi nhận.', channel: 'Gọi điện' }
    ]
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo_1',
    code: 'SEOULSUMMER',
    title: 'Ưu đãi hè rực rỡ - Meso Hàn Quốc',
    discountValue: '20%',
    minSpend: 5000000,
    expiryDate: '2026-08-31',
    status: 'Hoạt động',
    usageCount: 45,
    description: 'Giảm giá 20% khi đặt trước dịch vụ tiêm Meso căng bóng HA hoặc Laser Carbon làm sáng mịn trẻ hoá đón hè.'
  },
  {
    id: 'promo_2',
    code: 'THERMAGEVIP',
    title: 'Đặc quyền Thermage Trẻ Hoá Toàn Diện',
    discountValue: '10.000.000đ',
    minSpend: 50000000,
    expiryDate: '2026-12-31',
    status: 'Hoạt động',
    usageCount: 12,
    description: 'Trừ trực tiếp 10.000.000đ vào hoá đơn đăng ký thẻ Thermage FLX 900 hoặc Ultherapy VIP trọn gói.'
  },
  {
    id: 'promo_3',
    code: 'KIMSEOULBIRTHDAY',
    title: 'Sinh Nhật Hoà Ca - Tri Ân Thượng Khách',
    discountValue: '15%',
    minSpend: 2000000,
    expiryDate: '2026-07-31',
    status: 'Hoạt động',
    usageCount: 88,
    description: 'Voucher tri ân mừng tháng sinh nhật Kim Seoul Clinic giảm giá 15% tất cả các dịch vụ chăm sóc da cơ bản và chuyên sâu.'
  }
];

export const DAILY_STATS = {
  revenue: 428500000,
  revenueTrend: 12.5,
  appointmentsToday: 32,
  appointmentsCheckedIn: 18,
  newCustomers: 124,
  newCustomersTrend: 8.0,
  retentionRate: 68.2,
  retentionTrend: 2.1
};

export const REVENUE_WEEK_DATA = [
  { name: 'Thứ 2', revenue: 45000000, visits: 24 },
  { name: 'Thứ 3', revenue: 58000000, visits: 28 },
  { name: 'Thứ 4', revenue: 62000000, visits: 31 },
  { name: 'Thứ 5', revenue: 48000000, visits: 22 },
  { name: 'Thứ 6', revenue: 75000000, visits: 35 },
  { name: 'Thứ 7', revenue: 95000000, visits: 48 },
  { name: 'Chủ Nhật', revenue: 45500000, visits: 40 }
];
