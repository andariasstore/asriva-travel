import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plane, Bus, Train, Ship, Search, ArrowLeftRight, Calendar, Users,
  MapPin, Clock, ShieldCheck, CheckCircle2, AlertCircle, ChevronRight,
  ChevronLeft, Filter, ArrowUpDown, Luggage, Wifi, Coffee, Zap,
  CreditCard, QrCode, Building2, Wallet, Copy, Printer, Download,
  HelpCircle, Phone, Mail, FileText, Info, X, Check, Menu, Ticket,
  Sparkles, Compass, Star, Car, Armchair, Briefcase, Award, RefreshCw
} from 'lucide-react';

// ============================================================================
// 1. DATA ARCHITECTURE & MOCK INVENTORY (INDONESIA MARKET - BAHASA INDONESIA)
// ============================================================================

const PROMO_CODES = [
  { code: 'ASRIBARU', discountType: 'percentage', value: 15, maxDiscount: 150000, minSpend: 200000, label: 'Diskon 15% Pengguna Baru (Maks. Rp150.000)' },
  { code: 'LIBURAN2026', discountType: 'fixed', value: 75000, maxDiscount: 75000, minSpend: 350000, label: 'Potongan Langsung Rp75.000' },
  { code: 'HEMAT50', discountType: 'fixed', value: 50000, maxDiscount: 50000, minSpend: 150000, label: 'Hemat Rp50.000 Semua Rute' },
];

const CITIES = {
  flight: [
    { id: 'CGK', city: 'Jakarta', code: 'CGK', hub: 'Bandara Internasional Soekarno-Hatta', popular: true },
    { id: 'DPS', city: 'Bali (Denpasar)', code: 'DPS', hub: 'Bandara Internasional I Gusti Ngurah Rai', popular: true },
    { id: 'SUB', city: 'Surabaya', code: 'SUB', hub: 'Bandara Internasional Juanda', popular: true },
    { id: 'YIA', city: 'Yogyakarta', code: 'YIA', hub: 'Bandara Internasional Yogyakarta', popular: true },
    { id: 'UPG', city: 'Makassar', code: 'UPG', hub: 'Bandara Internasional Sultan Hasanuddin', popular: true },
    { id: 'KNO', city: 'Medan', code: 'KNO', hub: 'Bandara Internasional Kualanamu', popular: false },
  ],
  bus: [
    { id: 'JKT-BUS', city: 'Jakarta', code: 'JKT', hub: 'Terminal Terpadu Pulo Gebang', popular: true },
    { id: 'BDG-BUS', city: 'Bandung', code: 'BDG', hub: 'Terminal Leuwi Panjang / Pool Pasteur', popular: true },
    { id: 'YOG-BUS', city: 'Yogyakarta', code: 'YOG', hub: 'Terminal Giwangan', popular: true },
    { id: 'SBY-BUS', city: 'Surabaya', code: 'SBY', hub: 'Terminal Purabaya (Bungurasih)', popular: true },
    { id: 'MLG-BUS', city: 'Malang', code: 'MLG', hub: 'Terminal Arjosari', popular: true },
  ],
  train: [
    { id: 'GMR', city: 'Jakarta', code: 'GMR', hub: 'Stasiun Gambir / Pasar Senen', popular: true },
    { id: 'BD', city: 'Bandung', code: 'BD', hub: 'Stasiun Bandung', popular: true },
    { id: 'YK', city: 'Yogyakarta', code: 'YK', hub: 'Stasiun Tugu Yogyakarta', popular: true },
    { id: 'SGU', city: 'Surabaya', code: 'SGU', hub: 'Stasiun Surabaya Gubeng', popular: true },
    { id: 'ML', city: 'Malang', code: 'ML', hub: 'Stasiun Malang Kotabaru', popular: true },
  ],
  ferry: [
    { id: 'MER', city: 'Merak (Banten)', code: 'MER', hub: 'Pelabuhan Penyeberangan Merak', popular: true },
    { id: 'BAK', city: 'Bakauheni (Lampung)', code: 'BAK', hub: 'Pelabuhan Penyeberangan Bakauheni', popular: true },
    { id: 'KTG', city: 'Ketapang (Banyuwangi)', code: 'KTG', hub: 'Pelabuhan Ketapang', popular: true },
    { id: 'GIL', city: 'Gilimanuk (Bali)', code: 'GIL', hub: 'Pelabuhan Gilimanuk', popular: true },
    { id: 'MKS-PRT', city: 'Makassar', code: 'MKS', hub: 'Pelabuhan Soekarno-Hatta Makassar', popular: true },
    { id: 'SUB-PRT', city: 'Surabaya', code: 'TPR', hub: 'Pelabuhan Tanjung Perak', popular: true },
  ]
};

const POPULAR_DESTINATIONS = [
  {
    id: 'dest-bali',
    title: 'Bali (Denpasar)',
    subtitle: 'Pulau Dewata & Pantai Tropis',
    priceFrom: 890000,
    category: 'flight',
    originId: 'CGK',
    destId: 'DPS',
    tag: 'Terpopuler',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-yogya',
    title: 'Yogyakarta',
    subtitle: 'Warisan Budaya & Kuliner Klasik',
    priceFrom: 340000,
    category: 'train',
    originId: 'GMR',
    destId: 'YK',
    tag: 'Favorit Kereta',
    image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-bandung',
    title: 'Bandung',
    subtitle: 'Sejuknya Kota Kembang',
    priceFrom: 135000,
    category: 'bus',
    originId: 'JKT-BUS',
    destId: 'BDG-BUS',
    tag: 'Perjalanan Singkat',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-makassar',
    title: 'Makassar',
    subtitle: 'Gerbang Timur Nusantara',
    priceFrom: 950000,
    category: 'flight',
    originId: 'UPG',
    destId: 'DPS',
    tag: 'Rute Unggulan',
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80'
  }
];

const RECOMMENDED_ROUTES = [
  { id: 'rec-1', category: 'flight', originId: 'CGK', destId: 'DPS', label: 'Jakarta → Bali', duration: '1j 50m', price: 985000, operator: 'Garuda Nusantara Air' },
  { id: 'rec-2', category: 'train', originId: 'GMR', destId: 'YK', label: 'Jakarta → Yogyakarta', duration: '6j 15m', price: 460000, operator: 'KAI Eksekutif Argo' },
  { id: 'rec-3', category: 'bus', originId: 'BDG-BUS', destId: 'JKT-BUS', label: 'Bandung → Jakarta', duration: '2j 30m', price: 145000, operator: 'Primajasa Executive Shuttle' },
  { id: 'rec-4', category: 'train', originId: 'SGU', destId: 'ML', label: 'Surabaya → Malang', duration: '1j 55m', price: 115000, operator: 'KAI Komuter & Eksekutif' },
  { id: 'rec-5', category: 'flight', originId: 'UPG', destId: 'DPS', label: 'Makassar → Bali', duration: '1j 25m', price: 875000, operator: 'Batik Nusantara' },
  { id: 'rec-6', category: 'ferry', originId: 'MKS-PRT', destId: 'SUB-PRT', label: 'Makassar → Surabaya', duration: '26j 00m', price: 320000, operator: 'PELNI Nusantara Liner' },
];

const BASE_TRIPS = [
  // ================= FLIGHTS =================
  {
    id: 'FL-101',
    category: 'flight',
    operator: 'Garuda Nusantara Air',
    operatorCode: 'GA',
    operatorColor: '#1E3A8A',
    serviceCode: 'GA-404',
    originId: 'CGK',
    destId: 'DPS',
    departureTime: '07:15',
    arrivalTime: '10:05',
    durationMinutes: 110,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Ekonomi Fleksi',
    availableSeats: 14,
    price: 1180000,
    recommended: true,
    details: {
      originTerminal: 'Terminal 3 Domestik (CGK)',
      destTerminal: 'Terminal Domestik (DPS)',
      baggage: 'Kabin 7 kg + Bagasi Terdaftar 20 kg',
      aircraft: 'Boeing 737-800NG',
      amenities: ['Makanan Hangat', 'Hiburan Dalam Penerbangan', 'Bagasi 20kg', 'Port USB'],
      cancellationPolicy: 'Dapat dibatalkan hingga 4 jam sebelum keberangkatan (biaya admin 25%).',
      reschedulePolicy: 'Gratis ubah jadwal 1x hingga 24 jam sebelum berangkat (selisih tarif berlaku).',
      importantNotes: [
        'Check-in bandara dibuka 2 jam sebelum jadwal keberangkatan.',
        'Wajib membawa KTP/Paspor asli yang masih berlaku sesuai data pemesanan.',
        'Gerbang keberangkatan ditutup 30 menit sebelum lepas landas.'
      ]
    }
  },
  {
    id: 'FL-102',
    category: 'flight',
    operator: 'Citilink Express',
    operatorCode: 'QG',
    operatorColor: '#059669',
    serviceCode: 'QG-682',
    originId: 'CGK',
    destId: 'DPS',
    departureTime: '11:30',
    arrivalTime: '14:25',
    durationMinutes: 115,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Ekonomi Hemat',
    availableSeats: 6,
    price: 890000,
    recommended: false,
    details: {
      originTerminal: 'Terminal 3 Domestik (CGK)',
      destTerminal: 'Terminal Domestik (DPS)',
      baggage: 'Kabin 7 kg (Bagasi tercatat berbayar)',
      aircraft: 'Airbus A320neo',
      amenities: ['Kabin 7kg', 'Pemesanan Makanan di Pesawat'],
      cancellationPolicy: 'Non-refundable (Tidak dapat diuangkan kembali).',
      reschedulePolicy: 'Dapat diubah jadwal hingga 6 jam sebelum keberangkatan dengan biaya Rp150.000.',
      importantNotes: [
        'Disarankan melakukan Web Check-in 24 jam sebelum keberangkatan.',
        'Ukuran tas kabin maksimal 56cm x 36cm x 23cm.'
      ]
    }
  },
  {
    id: 'FL-103',
    category: 'flight',
    operator: 'Batik Nusantara',
    operatorCode: 'ID',
    operatorColor: '#991B1B',
    serviceCode: 'ID-6508',
    originId: 'CGK',
    destId: 'DPS',
    departureTime: '16:40',
    arrivalTime: '19:35',
    durationMinutes: 115,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Bisnis',
    availableSeats: 4,
    price: 2450000,
    recommended: true,
    details: {
      originTerminal: 'Terminal 2E (CGK)',
      destTerminal: 'Terminal Domestik (DPS)',
      baggage: 'Kabin 10 kg + Bagasi Terdaftar 30 kg',
      aircraft: 'Airbus A330-300',
      amenities: ['Akses Executive Lounge', 'Kursi Rebah Luas', 'Hidangan Premium', 'Bagasi 30kg', 'Prioritas Boarding'],
      cancellationPolicy: 'Refund penuh hingga 90% sebelum keberangkatan.',
      reschedulePolicy: 'Gratis ubah jadwal tanpa batas hingga 2 jam sebelum berangkat.',
      importantNotes: [
        'Tunjukkan e-tiket Kelas Bisnis di konter check-in prioritas.',
        'Akses gratis ke Batik Business Lounge di Terminal 2E.'
      ]
    }
  },
  {
    id: 'FL-104',
    category: 'flight',
    operator: 'Pelita Sky',
    operatorCode: 'IP',
    operatorColor: '#2563EB',
    serviceCode: 'IP-204',
    originId: 'CGK',
    destId: 'DPS',
    departureTime: '19:15',
    arrivalTime: '23:30',
    durationMinutes: 195,
    transit: '1 Transit (SUB)',
    transitCount: 1,
    seatClass: 'Ekonomi',
    availableSeats: 19,
    price: 795000,
    recommended: false,
    details: {
      originTerminal: 'Terminal 3 (CGK)',
      destTerminal: 'Terminal Domestik (DPS)',
      baggage: 'Kabin 7 kg + Bagasi 15 kg',
      aircraft: 'Airbus A320',
      amenities: ['Snack & Air Mineral', 'Bagasi 15kg'],
      cancellationPolicy: 'Potongan 50% jika dibatalkan lebih dari 12 jam sebelum berangkat.',
      reschedulePolicy: 'Dapat diubah jadwal maksimal 12 jam sebelum keberangkatan.',
      importantNotes: [
        'Transit 45 menit di Bandara Juanda Surabaya (SUB) tanpa pindah pesawat.',
        'Pastikan barang berharga tetap dibawa saat transit.'
      ]
    }
  },
  {
    id: 'FL-105',
    category: 'flight',
    operator: 'Batik Nusantara',
    operatorCode: 'ID',
    operatorColor: '#991B1B',
    serviceCode: 'ID-6192',
    originId: 'UPG',
    destId: 'DPS',
    departureTime: '09:45',
    arrivalTime: '11:10',
    durationMinutes: 85,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Ekonomi',
    availableSeats: 11,
    price: 875000,
    recommended: true,
    details: {
      originTerminal: 'Terminal Keberangkatan Domestik (UPG)',
      destTerminal: 'Terminal Domestik (DPS)',
      baggage: 'Kabin 7 kg + Bagasi 20 kg',
      aircraft: 'Boeing 737-800',
      amenities: ['Snack Box', 'Hiburan Layar Sentuh', 'Bagasi 20kg'],
      cancellationPolicy: 'Dapat dibatalkan hingga 6 jam sebelum keberangkatan.',
      reschedulePolicy: 'Ubah jadwal fleksibel tersedia.',
      importantNotes: ['Harap tiba di Bandara Sultan Hasanuddin minimal 90 menit sebelum berangkat.']
    }
  },

  // ================= TRAINS =================
  {
    id: 'TR-201',
    category: 'train',
    operator: 'KAI Argo Dwipangga',
    operatorCode: 'KAI',
    operatorColor: '#EA580C',
    serviceCode: 'KA-10',
    originId: 'GMR',
    destId: 'YK',
    departureTime: '08:50',
    arrivalTime: '15:05',
    durationMinutes: 375,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Eksekutif (AA)',
    availableSeats: 18,
    price: 485000,
    recommended: true,
    details: {
      originTerminal: 'Stasiun Gambir (GMR) - Pintu Selatan',
      destTerminal: 'Stasiun Tugu Yogyakarta (YK)',
      baggage: 'Maksimal 20 kg tanpa biaya tambahan',
      trainInfo: 'Kereta Eksekutif Stainless Steel • Gerbong 1 - 6',
      amenities: ['Kursi Ergonomis Reclining', 'Stop Kontak Tiap Kursi', 'AC Sentral', 'Kereta Restorasi', 'Selimut & Bantal'],
      cancellationPolicy: 'Dapat dibatalkan hingga 30 menit sebelum berangkat (potongan bea 25%).',
      reschedulePolicy: 'Dapat diubah jadwal hingga 1 jam sebelum keberangkatan.',
      importantNotes: [
        'Boarding menggunakan Face Recognition atau KTP asli di gerbang stasiun.',
        'Harap berada di peron 15 menit sebelum kereta berangkat.'
      ]
    }
  },
  {
    id: 'TR-202',
    category: 'train',
    operator: 'KAI Taksaka Luxury',
    operatorCode: 'KAI',
    operatorColor: '#1D4ED8',
    serviceCode: 'KA-70L',
    originId: 'GMR',
    destId: 'YK',
    departureTime: '21:10',
    arrivalTime: '03:20',
    durationMinutes: 370,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Luxury Sleeper',
    availableSeats: 5,
    price: 920000,
    recommended: true,
    details: {
      originTerminal: 'Stasiun Gambir (GMR)',
      destTerminal: 'Stasiun Tugu Yogyakarta (YK)',
      baggage: 'Maksimal 25 kg',
      trainInfo: 'Kereta Luxury Generasi Terbaru • Gerbong Khusus',
      amenities: ['Kursi Tidur 170°', 'Makan Malam & Minuman Gratis', 'AVOD Personal Screen', 'Pramugari Khusus', 'Wi-Fi'],
      cancellationPolicy: 'Dapat dibatalkan hingga 30 menit sebelum berangkat (potongan 25%).',
      reschedulePolicy: 'Gratis ubah jadwal 1x di loket stasiun.',
      importantNotes: ['Termasuk akses ruang tunggu eksklusif di Stasiun Gambir.']
    }
  },
  {
    id: 'TR-203',
    category: 'train',
    operator: 'KAI Bogowonto',
    operatorCode: 'KAI',
    operatorColor: '#0D9488',
    serviceCode: 'KA-136',
    originId: 'GMR',
    destId: 'YK',
    departureTime: '22:00',
    arrivalTime: '05:45',
    durationMinutes: 465,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Ekonomi Premium (CA)',
    availableSeats: 28,
    price: 295000,
    recommended: false,
    details: {
      originTerminal: 'Stasiun Pasar Senen (PSE)',
      destTerminal: 'Stasiun Lempuyangan (LPN)',
      baggage: 'Maksimal 20 kg',
      trainInfo: 'Kereta Ekonomi New Generation • Formasi 2-2',
      amenities: ['AC', 'Stop Kontak', 'Kursi Hadap Depan', 'Restorasi'],
      cancellationPolicy: 'Potongan 25% maksimal 30 menit sebelum keberangkatan.',
      reschedulePolicy: 'Dapat diubah jadwal hingga 1 jam sebelum keberangkatan.',
      importantNotes: ['Keberangkatan dari Stasiun Pasar Senen dan tiba di Stasiun Lempuyangan Yogyakarta.']
    }
  },
  {
    id: 'TR-204',
    category: 'train',
    operator: 'KAI Jayabaya',
    operatorCode: 'KAI',
    operatorColor: '#EA580C',
    serviceCode: 'KA-108',
    originId: 'SGU',
    destId: 'ML',
    departureTime: '14:15',
    arrivalTime: '16:10',
    durationMinutes: 115,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Eksekutif',
    availableSeats: 16,
    price: 125000,
    recommended: true,
    details: {
      originTerminal: 'Stasiun Surabaya Gubeng (SGU)',
      destTerminal: 'Stasiun Malang Kotabaru (ML)',
      baggage: 'Maksimal 20 kg',
      trainInfo: 'Kereta Jarak Jauh Lintas Timur',
      amenities: ['AC', 'Stop Kontak', 'Kursi Reclining'],
      cancellationPolicy: 'Potongan 25% hingga 30 menit sebelum berangkat.',
      reschedulePolicy: 'Dapat diubah hingga 1 jam sebelum berangkat.',
      importantNotes: ['Tunjukkan kode booking atau KTP pada petugas boarding.']
    }
  },

  // ================= BUSES =================
  {
    id: 'BS-301',
    category: 'bus',
    operator: 'Primajasa Executive Shuttle',
    operatorCode: 'PJ',
    operatorColor: '#B91C1C',
    serviceCode: 'PJ-EX04',
    originId: 'BDG-BUS',
    destId: 'JKT-BUS',
    departureTime: '09:00',
    arrivalTime: '11:30',
    durationMinutes: 150,
    transit: 'Tol Cipularang (Langsung)',
    transitCount: 0,
    seatClass: 'Executive Captain Seat (1-1)',
    availableSeats: 7,
    price: 145000,
    recommended: true,
    details: {
      originTerminal: 'Pool Pasteur Bandung (Jl. Dr. Djunjunan)',
      destTerminal: 'Pool Cililitan / Cawang Jakarta',
      baggage: '1 Koper Bagasi Bawah + 1 Tas Kabin',
      busInfo: 'Toyota HiAce Premio Luxury • 8 Kursi',
      amenities: ['Captain Seat Kulit', 'AC Dingin', 'Air Mineral Gratis', 'USB Fast Charging', 'GPS Tracking'],
      cancellationPolicy: 'Dapat dibatalkan maksimal 3 jam sebelum keberangkatan (potongan 20%).',
      reschedulePolicy: 'Gratis ubah jam keberangkatan di hari yang sama selama kursi tersedia.',
      importantNotes: [
        'Harap hadir di titik keberangkatan 20 menit sebelum jadwal.',
        'Bagasi besar akan diberi label oleh petugas pool.'
      ]
    }
  },
  {
    id: 'BS-302',
    category: 'bus',
    operator: 'Cititrans Premier',
    operatorCode: 'CT',
    operatorColor: '#1E293B',
    serviceCode: 'CT-112',
    originId: 'BDG-BUS',
    destId: 'JKT-BUS',
    departureTime: '13:30',
    arrivalTime: '16:15',
    durationMinutes: 165,
    transit: 'Langsung',
    transitCount: 0,
    seatClass: 'Premier Lounge',
    availableSeats: 5,
    price: 165000,
    recommended: true,
    details: {
      originTerminal: 'Pool Dipatiukur Bandung',
      destTerminal: 'Pool SCBD / Semanggi Jakarta',
      baggage: 'Maksimal 15 kg',
      busInfo: 'Mercedes-Benz Sprinter Executive',
      amenities: ['Leg Rest', 'Wi-Fi', 'USB Port', 'Air Mineral'],
      cancellationPolicy: 'Refund 75% maksimal 4 jam sebelum keberangkatan.',
      reschedulePolicy: 'Ubah jadwal gratis 1x hingga 2 jam sebelum berangkat.',
      importantNotes: ['Keberangkatan tepat waktu sesuai jadwal.']
    }
  },
  {
    id: 'BS-303',
    category: 'bus',
    operator: 'Rosalia Indah Suites',
    operatorCode: 'RI',
    operatorColor: '#D97706',
    serviceCode: 'RI-SHD1',
    originId: 'JKT-BUS',
    destId: 'YOG-BUS',
    departureTime: '18:30',
    arrivalTime: '04:00',
    durationMinutes: 570,
    transit: '1 Rest Area (Tol Trans Jawa)',
    transitCount: 1,
    seatClass: 'First Class Double Decker',
    availableSeats: 9,
    price: 385000,
    recommended: true,
    details: {
      originTerminal: 'Terminal Terpadu Pulo Gebang',
      destTerminal: 'Terminal Giwangan Yogyakarta',
      baggage: 'Bagasi Bawah Luas (Maks. 25 kg)',
      busInfo: 'Scania K410iB Double Decker • Pramugara',
      amenities: ['Voucher Makan Prasmanan', 'Selimut & Bantal', 'AVOD Personal', 'Toilet di Dalam Bus', 'Leg Rest'],
      cancellationPolicy: 'Pembatalan H-1 dikenakan potongan 25%.',
      reschedulePolicy: 'Dapat diubah tanggal maksimal 12 jam sebelum keberangkatan.',
      importantNotes: ['Sudah termasuk 1x servis makan malam di Rest Area KM 229B.']
    }
  },

  // ================= FERRIES =================
  {
    id: 'FR-401',
    category: 'ferry',
    operator: 'ASDP Express Dermaga Eksekutif',
    operatorCode: 'ASDP',
    operatorColor: '#0284C7',
    serviceCode: 'KMP-PORTLINK',
    originId: 'MER',
    destId: 'BAK',
    departureTime: '10:00',
    arrivalTime: '11:15',
    durationMinutes: 75,
    transit: 'Penyeberangan Langsung',
    transitCount: 0,
    seatClass: 'Eksekutif Pejalan Kaki',
    availableSeats: 64,
    price: 85000,
    recommended: true,
    details: {
      originTerminal: 'Dermaga Eksekutif Sosoro Merak',
      destTerminal: 'Dermaga Eksekutif Anjungan Agung Bakauheni',
      baggage: 'Barang Bawaan Pribadi (Maks. 25 kg)',
      vesselInfo: 'KMP Portlink III • Kapal Ferry Cepat Eksekutif',
      amenities: ['Ruang Tunggu Mall & AC', 'Sofa Kabin Nyaman', 'Kafetaria', 'Mushola', 'Dek Pemandangan Laut'],
      cancellationPolicy: 'Dapat di-refund hingga 2 jam sebelum jadwal masuk pelabuhan (potongan 10%).',
      reschedulePolicy: 'Tiket berlaku hingga 2 jam setelah jadwal tertera.',
      importantNotes: [
        'Wajib melakukan check-in di gerbang pelabuhan maksimal 45 menit sebelum keberangkatan.',
        'Siapkan identitas KTP/SIM yang sesuai dengan manifes penumpang.'
      ]
    }
  },
  {
    id: 'FR-402',
    category: 'ferry',
    operator: 'ASDP Ferry Reguler',
    operatorCode: 'ASDP',
    operatorColor: '#0369A1',
    serviceCode: 'KMP-JATRA',
    originId: 'KTG',
    destId: 'GIL',
    departureTime: '08:30',
    arrivalTime: '09:30',
    durationMinutes: 60,
    transit: 'Penyeberangan Langsung',
    transitCount: 0,
    seatClass: 'Ekonomi Pejalan Kaki',
    availableSeats: 110,
    price: 15000,
    recommended: true,
    details: {
      originTerminal: 'Pelabuhan Ketapang Banyuwangi - Dermaga MB',
      destTerminal: 'Pelabuhan Gilimanuk Bali',
      baggage: 'Barang Bawaan Pribadi',
      vesselInfo: 'KMP Jatra II • Selat Bali',
      amenities: ['Ruang Duduk Terbuka & Tertutup', 'Kantin Kapal', 'Toilet', 'Jaket Pelampung Lengkap'],
      cancellationPolicy: 'Dapat dibatalkan sebelum validasi tiket masuk pelabuhan.',
      reschedulePolicy: 'Fleksibel pada hari keberangkatan yang sama.',
      importantNotes: ['Perbedaan waktu: Gilimanuk (Bali) menggunakan zona waktu WITA (+1 jam dari Ketapang WIB).']
    }
  },
  {
    id: 'FR-403',
    category: 'ferry',
    operator: 'PELNI Nusantara Liner',
    operatorCode: 'PELNI',
    operatorColor: '#1E3A8A',
    serviceCode: 'KM-DOROLONDA',
    originId: 'MKS-PRT',
    destId: 'SUB-PRT',
    departureTime: '15:00',
    arrivalTime: '17:00 (+1 Hari)',
    durationMinutes: 1560,
    transit: 'Langsung Laut Jawa',
    transitCount: 0,
    seatClass: 'Kabin Kelas 1B (2 Bed)',
    availableSeats: 8,
    price: 495000,
    recommended: true,
    details: {
      originTerminal: 'Terminal Penumpang Anging Mammiri - Pelabuhan Makassar',
      destTerminal: 'Terminal Gapura Surya Nusantara - Tanjung Perak Surabaya',
      baggage: 'Bagasi Kabin hingga 40 kg',
      vesselInfo: 'KM Dorolonda • Kapal Penumpang Antar Pulau',
      amenities: ['Kabin Pribadi Ber-AC', 'Makan 3x Sehari', 'Kamar Mandi Dalam', 'Klinik Kapal', 'Dek Observasi'],
      cancellationPolicy: 'Pembatalan H-2 dikenakan potongan 25%.',
      reschedulePolicy: 'Dapat diubah jadwal di kantor cabang PELNI maksimal 24 jam sebelum berangkat.',
      importantNotes: ['Penumpang wajib sudah berada di terminal pelabuhan 2 jam sebelum kapal bertolak.']
    }
  }
];

const FAQS = [
  {
    q: 'Apakah saya harus membuat akun untuk memesan tiket di ASRI TRAVEL?',
    a: 'Tidak perlu. ASRI TRAVEL dirancang agar Anda dapat memesan tiket pesawat, kereta, bus, maupun kapal ferry secara langsung sebagai tamu tanpa proses registrasi yang rumit.'
  },
  {
    q: 'Bagaimana cara menemukan kembali e-tiket yang sudah saya pesan?',
    a: 'Anda dapat membuka menu "Pesanan Saya" di navigasi atas, lalu masukkan Kode Referensi Pemesanan (contoh: ASRI-XXXX) beserta alamat email yang digunakan saat pemesanan.'
  },
  {
    q: 'Apakah transaksi pembayaran di aplikasi ini bersifat nyata?',
    a: 'Aplikasi ini merupakan prototipe etalase pemesanan tiket interaktif. Seluruh metode pembayaran (Virtual Account, QRIS, Transfer Bank, E-Wallet) berjalan dalam mode simulasi/demo tanpa memotong saldo nyata.'
  },
  {
    q: 'Bisakah saya memesan tiket untuk beberapa penumpang sekaligus?',
    a: 'Tentu saja. Anda dapat memilih jumlah penumpang pada bilah pencarian, dan formulir data penumpang akan menyesuaikan secara otomatis untuk setiap individu.'
  }
];

// ============================================================================
// 2. UTILITY HELPERS
// ============================================================================

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
};

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getCityInfo = (category, cityId) => {
  const list = CITIES[category] || [];
  return list.find((c) => c.id === cityId) || { id: cityId, city: cityId, code: cityId, hub: '' };
};

const getCategoryMeta = (cat) => {
  switch (cat) {
    case 'flight':
      return { label: 'Pesawat', icon: Plane, badge: 'Penerbangan' };
    case 'bus':
      return { label: 'Bus & Travel', icon: Bus, badge: 'Bus Eksekutif' };
    case 'train':
      return { label: 'Kereta Api', icon: Train, badge: 'Kereta Api' };
    case 'ferry':
      return { label: 'Kapal Ferry', icon: Ship, badge: 'Penyeberangan Ferry' };
    default:
      return { label: 'Perjalanan', icon: Compass, badge: 'Tiket' };
  }
};

// Deterministic pseudo-QR matrix generator based on booking reference string
const generateDeterministicQRMatrix = (seedString) => {
  const size = 21;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  // Add standard 7x7 finder patterns on 3 corners
  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedString.length; i++) {
    hash ^= seedString.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      hash = (Math.imul(hash ^ (r * 31 + c * 17), 1664525) + 1013904223) >>> 0;
      matrix[r][c] = (hash % 100) < 48;
    }
  }
  return matrix;
};

// ============================================================================
// 3. REUSABLE UI COMPONENTS
// ============================================================================

const DeterministicQRCode = ({ value, size = 148 }) => {
  const matrix = useMemo(() => generateDeterministicQRMatrix(value || 'ASRI-DEMO'), [value]);
  const cellSize = size / 21;

  return (
    <div className="inline-flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`QR Code ${value}`}>
        <rect width={size} height={size} fill="#FFFFFF" />
        {matrix.map((row, rIdx) =>
          row.map((filled, cIdx) =>
            filled ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx * cellSize}
                y={rIdx * cellSize}
                width={cellSize + 0.2}
                height={cellSize + 0.2}
                fill="#101B35"
              />
            ) : null
          )
        )}
      </svg>
      <span className="mt-2 font-mono text-[11px] font-semibold tracking-wider text-slate-600">
        {value}
      </span>
    </div>
  );
};

const BookingProgressStepper = ({ currentView }) => {
  const steps = [
    { id: 'results', label: '1. Pilih Jadwal' },
    { id: 'detail', label: '2. Detail & Kebijakan' },
    { id: 'passengers', label: '3. Data Penumpang' },
    { id: 'summary', label: '4. Ringkasan' },
    { id: 'payment', label: '5. Pembayaran' },
    { id: 'confirmation', label: '6. E-Tiket' },
  ];

  const activeIdx = steps.findIndex((s) => s.id === currentView);
  if (activeIdx === -1) return null;

  return (
    <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 no-print">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 sm:pb-0">
          {steps.map((step, idx) => {
            const isDone = idx < activeIdx;
            const isCurrent = idx === activeIdx;
            return (
              <div key={step.id} className="flex items-center shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-[#101B35] text-white shadow-sm'
                      : isDone
                      ? 'bg-blue-50 text-[#315EF6]'
                      : 'text-[#788196]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#315EF6]" />
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isCurrent ? 'bg-[#FF9B50] text-[#101B35]' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span>{step.label.replace(/^\d+\.\s/, '')}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. MAIN APPLICATION COMPONENT (ASRI TRAVEL)
// ============================================================================

export default function App() {
  // Navigation & View State
  const [view, setView] = useState('home'); // home, results, detail, passengers, summary, payment, confirmation, my-booking, ticket, help
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Search State
  const [searchCriteria, setSearchCriteria] = useState({
    category: 'flight',
    originId: 'CGK',
    destId: 'DPS',
    departureDate: getTomorrowDateStr(),
    returnDate: '',
    isRoundTrip: false,
    passengers: 1,
    vehicleOption: 'Tanpa Kendaraan (Pejalan Kaki)',
  });

  // Search Results Filters & Sorting
  const [sortBy, setSortBy] = useState('recommended'); // recommended, cheapest, fastest, earliest
  const [filters, setFilters] = useState({
    maxPrice: 3000000,
    timeSlot: 'all', // all, morning, afternoon, evening
    directOnly: false,
    operator: 'all',
  });

  // Active Booking Flow State
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengersData, setPassengersData] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Payment & Completed Bookings State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('va'); // va, qris, transfer, ewallet
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingsHistory, setBookingsHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('asri_travel_bookings_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('asri_travel_bookings_v2', JSON.stringify(bookingsHistory));
    } catch (e) {
      console.error(e);
    }
  }, [bookingsHistory]);

  // Payment countdown timer (15 minutes = 900 seconds)
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState(900);
  const [isCreatingPoketoInvoice, setIsCreatingPoketoInvoice] = useState(false);

  useEffect(() => {
    if (view !== 'payment' || !activeBooking || activeBooking.status !== 'PENDING') return;
    const interval = setInterval(() => {
      setPaymentSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [view, activeBooking]);

  // Scroll to top smoothly on view change
  const navigateTo = (targetView) => {
    setMobileMenuOpen(false);
    setView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category Switch Handler (updates default valid route for that category)
  const handleCategorySelect = (cat, jumpToSearch = false) => {
    const cityList = CITIES[cat] || [];
    const defaultOrigin = cityList[0]?.id || '';
    const defaultDest = cityList[1]?.id || '';
    setSearchCriteria((prev) => ({
      ...prev,
      category: cat,
      originId: defaultOrigin,
      destId: defaultDest,
    }));
    setFilters({ maxPrice: 3000000, timeSlot: 'all', directOnly: false, operator: 'all' });

    if (jumpToSearch) {
      triggerSearch({
        ...searchCriteria,
        category: cat,
        originId: defaultOrigin,
        destId: defaultDest,
      });
    }
  };

  // Trigger Search with validation & simulated brief loading state
  const triggerSearch = (overrideCriteria = null) => {
    const crit = overrideCriteria || searchCriteria;
    if (!crit.originId || !crit.destId) {
      showToast('Silakan pilih kota keberangkatan dan kota tujuan.', 'error');
      return;
    }
    if (crit.originId === crit.destId) {
      showToast('Kota asal dan tujuan tidak boleh sama.', 'error');
      return;
    }
    if (!crit.departureDate) {
      showToast('Silakan tentukan tanggal keberangkatan.', 'error');
      return;
    }

    setIsLoading(true);
    setFilters((f) => ({ ...f, operator: 'all', directOnly: false, timeSlot: 'all' }));
    setTimeout(() => {
      setIsLoading(false);
      navigateTo('results');
    }, 320);
  };

  // Dynamic Inventory Generator: ensures ANY valid pair in the selected category returns realistic trips
  const availableTrips = useMemo(() => {
    const { category, originId, destId } = searchCriteria;
    const exactMatches = BASE_TRIPS.filter(
      (t) => t.category === category && t.originId === originId && t.destId === destId
    );

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Generate realistic trips for any selected Indonesian route pair in that category
    const templates = BASE_TRIPS.filter((t) => t.category === category);
    const originObj = getCityInfo(category, originId);
    const destObj = getCityInfo(category, destId);

    return templates.map((tpl, idx) => ({
      ...tpl,
      id: `${tpl.id}-${originId}-${destId}`,
      originId,
      destId,
      price: Math.round((tpl.price * (0.9 + idx * 0.12)) / 5000) * 5000,
      details: {
        ...tpl.details,
        originTerminal: `${originObj.hub} (${originObj.code})`,
        destTerminal: `${destObj.hub} (${destObj.code})`,
      },
    }));
  }, [searchCriteria]);

  // Filtered & Sorted Trips
  const filteredAndSortedTrips = useMemo(() => {
    let list = [...availableTrips];

    list = list.filter((t) => t.price <= filters.maxPrice);

    if (filters.directOnly) {
      list = list.filter((t) => t.transitCount === 0);
    }

    if (filters.operator !== 'all') {
      list = list.filter((t) => t.operator === filters.operator);
    }

    if (filters.timeSlot !== 'all') {
      list = list.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        if (filters.timeSlot === 'morning') return hour >= 5 && hour < 12;
        if (filters.timeSlot === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.timeSlot === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
      // recommended
      return (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0) || a.price - b.price;
    });

    return list;
  }, [availableTrips, filters, sortBy]);

  // Select a trip and move to Trip Detail
  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    navigateTo('detail');
  };

  // Initialize passenger forms matching passenger count
  const handleProceedToPassengers = () => {
    const count = searchCriteria.passengers || 1;
    setPassengersData((prev) => {
      const next = [];
      for (let i = 0; i < count; i++) {
        next.push(
          prev[i] || {
            title: 'Tuan',
            fullName: '',
            idType: selectedTrip?.category === 'flight' ? 'KTP' : 'KTP',
            idNumber: '',
            passportExpiry: '',
            nationality: 'Indonesia',
            passengerType: 'Dewasa',
            seatPreference: `${10 + i}${['A', 'B', 'C', 'D'][i % 4]}`,
          }
        );
      }
      return next;
    });
    navigateTo('passengers');
  };

  // Dynamic Pricing Breakdown
  const pricingSummary = useMemo(() => {
    if (!selectedTrip) return { baseTotal: 0, serviceFee: 0, vehicleFee: 0, discount: 0, grandTotal: 0 };
    const qty = searchCriteria.passengers || 1;
    const baseTotal = selectedTrip.price * qty;
    const serviceFee = 25000;
    const vehicleFee =
      selectedTrip.category === 'ferry' && searchCriteria.vehicleOption?.includes('Mobil')
        ? 450000
        : selectedTrip.category === 'ferry' && searchCriteria.vehicleOption?.includes('Motor')
        ? 65000
        : 0;

    const subtotal = baseTotal + serviceFee + vehicleFee;
    let discount = 0;
    if (appliedPromo && subtotal >= appliedPromo.minSpend) {
      if (appliedPromo.discountType === 'percentage') {
        discount = Math.min(Math.round((subtotal * appliedPromo.value) / 100), appliedPromo.maxDiscount);
      } else {
        discount = appliedPromo.value;
      }
    }

    const grandTotal = Math.max(0, subtotal - discount);
    return { baseTotal, serviceFee, vehicleFee, discount, grandTotal };
  }, [selectedTrip, searchCriteria, appliedPromo]);

  // Apply Promo Code
  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      showToast('Masukkan kode promo terlebih dahulu.', 'error');
      return;
    }
    const found = PROMO_CODES.find((p) => p.code === code);
    if (!found) {
      showToast('Kode promo tidak valid atau sudah kedaluwarsa.', 'error');
      return;
    }
    const subtotal = pricingSummary.baseTotal + pricingSummary.serviceFee + pricingSummary.vehicleFee;
    if (subtotal < found.minSpend) {
      showToast(`Minimal transaksi ${formatIDR(found.minSpend)} untuk kode ${found.code}.`, 'error');
      return;
    }
    setAppliedPromo(found);
    showToast(`Promo ${found.code} berhasil diterapkan!`, 'success');
  };

  // Create Booking & Move to Mock Payment
  const handleCreatePendingBooking = () => {
    if (!termsAccepted) {
      showToast('Anda harus menyetujui Syarat & Ketentuan pemesanan.', 'error');
      return;
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const bookingRef = `ASRI-${randomDigits}`;
    

    const newBooking = {
      bookingRef,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      travelStatus: 'MENUNGGU PEMBAYARAN',
      paymentMethod: selectedPaymentMethod,
      trip: selectedTrip,
      searchCriteria: { ...searchCriteria },
      passengers: passengersData.map((p, i) => ({
        ...p,
        seatNumber: p.seatPreference || `${11 + i}A`,
      })),
      contactEmail,
      contactPhone,
      pricing: { ...pricingSummary },
    };

    setActiveBooking(newBooking);
    setPaymentSecondsLeft(900);
    setBookingsHistory((prev) => [newBooking, ...prev]);
    navigateTo('payment');
  };

    // Create or reuse a Poketo sandbox invoice. The browser never marks an order paid.
  const handleCreatePoketoInvoice = async () => {
    if (!activeBooking || isCreatingPoketoInvoice) return;
    setIsCreatingPoketoInvoice(true);
    try {
      const env = (import.meta as any).env || {};
      const supabaseUrl = env.VITE_SUPABASE_URL;
      const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !publishableKey) throw new Error('Konfigurasi Supabase frontend belum tersedia.');
      const origin = getCityInfo(activeBooking.trip.category, activeBooking.trip.originId);
      const destination = getCityInfo(activeBooking.trip.category, activeBooking.trip.destId);
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/poketo-create-invoice`, {
        method: 'POST',
        headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: activeBooking.bookingRef,
          amount: Math.round(activeBooking.pricing.grandTotal),
          customer: {
            name: activeBooking.passengers?.[0]?.fullName || 'Pelanggan ASRIVA',
            email: activeBooking.contactEmail,
            phone: activeBooking.contactPhone,
          },
          orderData: {
            tripId: activeBooking.trip.id,
            operator: activeBooking.trip.operator,
            origin: origin.city,
            destination: destination.city,
            departureDate: activeBooking.searchCriteria.departureDate,
            passengerCount: activeBooking.passengers.length,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.paymentUrl) throw new Error(result.message || result.error || 'Gagal membuat invoice Poketo.');
      const updated = { ...activeBooking, paymentUrl: result.paymentUrl, poketoInvoiceId: result.invoiceId };
      setActiveBooking(updated);
      setBookingsHistory((prev) => prev.map((booking) => booking.bookingRef === updated.bookingRef ? updated : booking));
      window.location.assign(result.paymentUrl);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghubungi layanan pembayaran.', 'error');
    } finally {
      setIsCreatingPoketoInvoice(false);
    }
  };

    // 5. SUB-VIEWS / PAGES
  // ==========================================================================

  // -------------------- HEADER & NAVIGATION --------------------
  const renderNavbar = () => {
    const navItems = [
      { id: 'home', label: 'Beranda', action: () => navigateTo('home') },
      { id: 'flight', label: 'Pesawat', action: () => handleCategorySelect('flight', true) },
      { id: 'bus', label: 'Bus & Travel', action: () => handleCategorySelect('bus', true) },
      { id: 'train', label: 'Kereta Api', action: () => handleCategorySelect('train', true) },
      { id: 'ferry', label: 'Kapal Ferry', action: () => handleCategorySelect('ferry', true) },
      { id: 'my-booking', label: 'Pesanan Saya', action: () => navigateTo('my-booking') },
      { id: 'help', label: 'Pusat Bantuan', action: () => navigateTo('help') },
    ];

    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#101B35] flex items-center justify-center text-white shadow-sm group-hover:bg-[#315EF6] transition-colors">
              <Compass className="w-5 h-5 text-[#FF9B50]" />
            </div>
            <div>
              <span className="block text-lg sm:text-xl font-extrabold tracking-tight text-[#101B35]">
                ASRI <span className="text-[#315EF6]">TRAVEL</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-[#788196] -mt-1">
                Tiket Perjalanan Resmi
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                (item.id === 'home' && view === 'home') ||
                (item.id === 'my-booking' && view === 'my-booking') ||
                (item.id === 'help' && view === 'help') ||
                (['flight', 'bus', 'train', 'ferry'].includes(item.id) &&
                  view === 'results' &&
                  searchCriteria.category === item.id);

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#101B35] text-white'
                      : 'text-[#172033] hover:bg-slate-100 hover:text-[#315EF6]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Quick Lookup CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigateTo('my-booking')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#F7F8FC] hover:border-[#315EF6] text-sm font-semibold text-[#101B35] transition-all"
            >
              <Ticket className="w-4 h-4 text-[#315EF6]" />
              <span>Cek E-Tiket</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu Navigasi"
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-[#101B35] hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1 shadow-lg">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#172033] hover:bg-slate-100 flex items-center justify-between"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </header>
    );
  };

  // -------------------- PAGE A: HOMEPAGE --------------------
  const renderHomePage = () => {
    const cityOptions = CITIES[searchCriteria.category] || [];
    const catMeta = getCategoryMeta(searchCriteria.category);

    return (
      <div>
        {/* 2. Hero Section with Destination Photography */}
        <section className="relative bg-[#101B35] text-white overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
              alt="Destinasi Nusantara ASRI TRAVEL"
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#101B35]/80 via-[#101B35]/65 to-[#101B35]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 sm:pt-16 sm:pb-36">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-[#FF9B50] mb-5">
                <Sparkles className="w-4 h-4" />
                <span>Platform Pemesanan Tiket Resmi Seluruh Nusantara</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white mb-4">
                Perjalanan Anda, Lebih Mudah Dimulai.
              </h1>
              <p className="text-base sm:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl">
                Temukan perjalanan terbaik dan pesan tiket Anda dengan mudah. Satu pintu resmi untuk tiket pesawat, kereta api, bus antarkota, dan kapal ferry di Indonesia.
              </p>
            </div>
          </div>
        </section>

        {/* 3 & 4. Travel Category Selector + Main Travel Search Widget */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-4 sm:p-6 lg:p-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                {[
                  { id: 'flight', label: 'Pesawat', icon: Plane },
                  { id: 'train', label: 'Kereta Api', icon: Train },
                  { id: 'bus', label: 'Bus & Travel', icon: Bus },
                  { id: 'ferry', label: 'Kapal Ferry', icon: Ship },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const active = searchCriteria.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id, false)}
                      className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        active
                          ? 'bg-[#101B35] text-white shadow-md shadow-slate-900/10'
                          : 'bg-[#F7F8FC] text-[#172033] hover:bg-slate-200/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#FF9B50]' : 'text-[#315EF6]'}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Trip Type / Category-specific quick toggle */}
              <div className="flex items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-[#172033]">
                  <input
                    type="checkbox"
                    checked={searchCriteria.isRoundTrip}
                    onChange={(e) =>
                      setSearchCriteria((p) => ({
                        ...p,
                        isRoundTrip: e.target.checked,
                        returnDate: e.target.checked ? p.departureDate : '',
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-[#315EF6] focus:ring-[#315EF6]"
                  />
                  <span>Pulang-Pergi</span>
                </label>
              </div>
            </div>

            {/* Main Search Fields Grid */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Origin City */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-1.5">
                  {searchCriteria.category === 'ferry'
                    ? 'Pelabuhan Asal'
                    : searchCriteria.category === 'train'
                    ? 'Stasiun Asal'
                    : searchCriteria.category === 'bus'
                    ? 'Kota / Terminal Asal'
                    : 'Kota / Bandara Asal'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#315EF6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={searchCriteria.originId}
                    onChange={(e) => setSearchCriteria((p) => ({ ...p, originId: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3.5 bg-[#F7F8FC] border border-slate-200 rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#315EF6] focus:bg-white transition-colors"
                  >
                    {cityOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.city} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setSearchCriteria((p) => ({
                      ...p,
                      originId: p.destId,
                      destId: p.originId,
                    }))
                  }
                  title="Tukar Lokasi Asal & Tujuan"
                  aria-label="Tukar Lokasi Asal dan Tujuan"
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-[#315EF6] text-[#315EF6] transition-all shadow-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* Destination City */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-1.5">
                  {searchCriteria.category === 'ferry'
                    ? 'Pelabuhan Tujuan'
                    : searchCriteria.category === 'train'
                    ? 'Stasiun Tujuan'
                    : searchCriteria.category === 'bus'
                    ? 'Kota / Terminal Tujuan'
                    : 'Kota / Bandara Tujuan'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#FF9B50] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={searchCriteria.destId}
                    onChange={(e) => setSearchCriteria((p) => ({ ...p, destId: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3.5 bg-[#F7F8FC] border border-slate-200 rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#315EF6] focus:bg-white transition-colors"
                  >
                    {cityOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.city} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Departure Date */}
              <div className={searchCriteria.isRoundTrip ? 'md:col-span-2' : 'md:col-span-3'}>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-1.5">
                  Tanggal Berangkat
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#315EF6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={searchCriteria.departureDate}
                    onChange={(e) =>
                      setSearchCriteria((p) => ({ ...p, departureDate: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-3.5 bg-[#F7F8FC] border border-slate-200 rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#315EF6] focus:bg-white"
                  />
                </div>
              </div>

              {/* Optional Return Date */}
              {searchCriteria.isRoundTrip && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-1.5">
                    Tanggal Pulang
                  </label>
                  <input
                    type="date"
                    min={searchCriteria.departureDate}
                    value={searchCriteria.returnDate}
                    onChange={(e) =>
                      setSearchCriteria((p) => ({ ...p, returnDate: e.target.value }))
                    }
                    className="w-full px-3.5 py-3.5 bg-[#F7F8FC] border border-slate-200 rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#315EF6] focus:bg-white"
                  />
                </div>
              )}

              {/* Passengers */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-1.5">
                  Penumpang
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-[#315EF6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={searchCriteria.passengers}
                    onChange={(e) =>
                      setSearchCriteria((p) => ({ ...p, passengers: Number(e.target.value) }))
                    }
                    className="w-full pl-10 pr-3 py-3.5 bg-[#F7F8FC] border border-slate-200 rounded-xl text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#315EF6] focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Penumpang
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category-Specific Ferry Vehicle Option */}
              {searchCriteria.category === 'ferry' && (
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-1.5">
                    Opsi Kendaraan Penyeberangan (Ferry)
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-[#315EF6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={searchCriteria.vehicleOption}
                      onChange={(e) =>
                        setSearchCriteria((p) => ({ ...p, vehicleOption: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-3 bg-[#F7F8FC] border border-slate-200 rounded-xl text-sm font-semibold text-[#172033]"
                    >
                      <option value="Tanpa Kendaraan (Pejalan Kaki)">
                        Tanpa Kendaraan (Pejalan Kaki)
                      </option>
                      <option value="Golongan II - Sepeda Motor (+Rp65.000)">
                        Golongan II - Sepeda Motor (+Rp65.000)
                      </option>
                      <option value="Golongan IVA - Mobil Pribadi / Sedan (+Rp450.000)">
                        Golongan IVA - Mobil Pribadi / Sedan (+Rp450.000)
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* Search CTA Button */}
              <div className={searchCriteria.category === 'ferry' ? 'md:col-span-6' : 'md:col-span-12 pt-2'}>
                <button
                  type="button"
                  onClick={() => triggerSearch()}
                  className="w-full py-4 px-6 rounded-xl bg-[#315EF6] hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span>Cari Tiket {catMeta.label}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Popular Destinations */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#315EF6]">
                Inspirasi Nusantara
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] mt-1">
                Destinasi Populer Pilihan
              </h2>
            </div>
            <p className="text-sm text-[#788196] max-w-md">
              Klik destinasi untuk langsung melihat jadwal perjalanan tersedia dengan harga transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DESTINATIONS.map((dest) => {
              const meta = getCategoryMeta(dest.category);
              return (
                <div
                  key={dest.id}
                  onClick={() => {
                    const updated = {
                      ...searchCriteria,
                      category: dest.category,
                      originId: dest.originId,
                      destId: dest.destId,
                    };
                    setSearchCriteria(updated);
                    triggerSearch(updated);
                  }}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-200">
                    <img
                      src={dest.image}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#101B35]/85 backdrop-blur-sm text-white text-xs font-semibold">
                      {dest.tag}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 text-[#101B35] text-xs font-bold flex items-center gap-1 shadow-sm">
                      <meta.icon className="w-3.5 h-3.5 text-[#315EF6]" />
                      <span>{meta.label}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#101B35] group-hover:text-[#315EF6] transition-colors">
                        {dest.title}
                      </h3>
                      <p className="text-sm text-[#788196] mt-0.5">{dest.subtitle}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-[#788196]">Mulai dari</span>
                      <span className="text-base font-extrabold text-[#315EF6]">
                        {formatIDR(dest.priceFrom)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Recommended Routes */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#315EF6]">
              Rute Favorit Pelanggan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] mt-1">
              Rekomendasi Rute Perjalanan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RECOMMENDED_ROUTES.map((route) => {
              const meta = getCategoryMeta(route.category);
              const Icon = meta.icon;
              return (
                <button
                  key={route.id}
                  onClick={() => {
                    const updated = {
                      ...searchCriteria,
                      category: route.category,
                      originId: route.originId,
                      destId: route.destId,
                    };
                    setSearchCriteria(updated);
                    triggerSearch(updated);
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-[#315EF6] hover:shadow-md transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#315EF6] flex items-center justify-center shrink-0 group-hover:bg-[#315EF6] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#315EF6] uppercase">
                          {meta.label}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-[#788196]">{route.duration}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#101B35] mt-0.5">
                        {route.label}
                      </h3>
                      <p className="text-xs text-[#788196] mt-0.5">{route.operator}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="block text-[11px] text-[#788196]">Mulai</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#101B35] group-hover:text-[#315EF6]">
                      {formatIDR(route.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 7. Special Travel Offers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="bg-[#101B35] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FF9B50]/20 text-[#FF9B50] text-xs font-bold uppercase tracking-wider mb-3">
                  Penawaran Spesial ASRI TRAVEL
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Hemat Hingga 15% untuk Perjalanan Pertama Anda
                </h2>
                <p className="text-slate-300 text-sm sm:text-base mt-2">
                  Gunakan kode voucher resmi kami pada halaman Ringkasan Pemesanan untuk mendapatkan potongan harga instan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                {PROMO_CODES.slice(0, 2).map((promo) => (
                  <div
                    key={promo.code}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs text-slate-300 block">{promo.label}</span>
                      <span className="font-mono text-lg font-extrabold text-[#FF9B50] tracking-wider mt-1 block">
                        {promo.code}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(promo.code);
                        showToast(`Kode promo ${promo.code} disalin!`, 'success');
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#FF9B50]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Why Book With Us & 9. How Booking Works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Why Book With Us */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#315EF6]">
                Keunggulan Layanan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] mt-1 mb-6">
                Mengapa Memesan di ASRI TRAVEL?
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Etalase Tunggal Resmi & Terpercaya',
                    desc: 'Seluruh tiket diterbitkan langsung melalui sistem terintegrasi tanpa perantara pihak ketiga yang membingungkan.',
                  },
                  {
                    icon: Zap,
                    title: 'Tanpa Wajib Daftar Akun',
                    desc: 'Pesan tiket lebih cepat sebagai tamu dan akses e-tiket kapan saja menggunakan kode referensi pemesanan.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Harga Transparan Tanpa Biaya Tersembunyi',
                    desc: 'Rincian tarif dasar, biaya layanan, dan diskon promo ditampilkan secara jelas sebelum Anda membayar.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#315EF6] flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#101B35] text-base">{item.title}</h3>
                      <p className="text-sm text-[#788196] mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Booking Works */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#315EF6]">
                Langkah Mudah
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] mt-1 mb-6">
                Cara Pemesanan Tiket
              </h2>
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Pilih Moda & Rute Perjalanan',
                    desc: 'Tentukan kategori (Pesawat, Kereta, Bus, atau Ferry), rute asal-tujuan, serta tanggal keberangkatan.',
                  },
                  {
                    step: '02',
                    title: 'Isi Data Penumpang Sesuai Identitas',
                    desc: 'Lengkapi nama lengkap dan nomor identitas (KTP/Paspor) untuk setiap penumpang.',
                  },
                  {
                    step: '03',
                    title: 'Selesaikan Pembayaran & Terima E-Tiket',
                    desc: 'Pilih metode pembayaran pilihan Anda. E-Tiket digital dilengkapi kode QR siap cetak langsung diterbitkan.',
                  },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#101B35] text-[#FF9B50] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#101B35] text-base">{s.title}</h3>
                      <p className="text-sm text-[#788196] mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#315EF6]">
              Informasi & Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] mt-1">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-slate-200/90 p-5 open:border-[#315EF6] transition-all"
              >
                <summary className="font-bold text-[#101B35] cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="text-sm text-[#788196] mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // -------------------- PAGE B: SEARCH RESULTS --------------------
  const renderSearchResultsPage = () => {
    const originObj = getCityInfo(searchCriteria.category, searchCriteria.originId);
    const destObj = getCityInfo(searchCriteria.category, searchCriteria.destId);
    const catMeta = getCategoryMeta(searchCriteria.category);
    const CatIcon = catMeta.icon;

    const uniqueOperators = Array.from(new Set(availableTrips.map((t) => t.operator)));

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary Bar */}
        <div className="bg-[#101B35] text-white rounded-2xl p-5 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <CatIcon className="w-6 h-6 text-[#FF9B50]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#FF9B50] uppercase tracking-wider">
                <span>{catMeta.badge}</span>
                <span>•</span>
                <span>{formatDateIndo(searchCriteria.departureDate)}</span>
                <span>•</span>
                <span>{searchCriteria.passengers} Penumpang</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1 flex items-center gap-2.5">
                <span>{originObj.city}</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
                <span>{destObj.city}</span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2.5 rounded-xl bg-white text-[#101B35] hover:bg-slate-100 text-sm font-bold transition-colors self-start md:self-auto"
          >
            Ubah Pencarian
          </button>
        </div>

        {/* Category Quick Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
          {[
            { id: 'flight', label: 'Pesawat', icon: Plane },
            { id: 'train', label: 'Kereta Api', icon: Train },
            { id: 'bus', label: 'Bus & Travel', icon: Bus },
            { id: 'ferry', label: 'Kapal Ferry', icon: Ship },
          ].map((c) => {
            const Icon = c.icon;
            const active = searchCriteria.category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCategorySelect(c.id, true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 border transition-all ${
                  active
                    ? 'bg-[#315EF6] text-white border-[#315EF6]'
                    : 'bg-white text-[#172033] border-slate-200 hover:border-[#315EF6]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-[#101B35]">
                  <Filter className="w-4 h-4 text-[#315EF6]" />
                  <span>Filter Pencarian</span>
                </div>
                <button
                  onClick={() =>
                    setFilters({
                      maxPrice: 3000000,
                      timeSlot: 'all',
                      directOnly: false,
                      operator: 'all',
                    })
                  }
                  className="text-xs font-semibold text-[#315EF6] hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Price Range Filter */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-[#172033] mb-2">
                  <span>Harga Maksimal</span>
                  <span className="text-[#315EF6]">{formatIDR(filters.maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={3000000}
                  step={50000}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                  className="w-full accent-[#315EF6]"
                />
              </div>

              {/* Departure Time Filter */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-2">
                  Waktu Keberangkatan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'morning', label: 'Pagi (05-12)' },
                    { id: 'afternoon', label: 'Siang (12-18)' },
                    { id: 'evening', label: 'Malam (18-05)' },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setFilters((f) => ({ ...f, timeSlot: slot.id }))}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-center transition-colors ${
                        filters.timeSlot === slot.id
                          ? 'bg-[#101B35] text-white border-[#101B35]'
                          : 'bg-[#F7F8FC] text-[#172033] border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Filter */}
              <div className="mb-5">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-[#172033]">
                  <input
                    type="checkbox"
                    checked={filters.directOnly}
                    onChange={(e) => setFilters((f) => ({ ...f, directOnly: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#315EF6]"
                  />
                  <span>Hanya Perjalanan Langsung</span>
                </label>
              </div>

              {/* Operator Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#788196] mb-2">
                  Operator Penyedia
                </label>
                <select
                  value={filters.operator}
                  onChange={(e) => setFilters((f) => ({ ...f, operator: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#F7F8FC] text-xs font-semibold text-[#172033]"
                >
                  <option value="all">Semua Operator ({uniqueOperators.length})</option>
                  {uniqueOperators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Results Column */}
          <div className="lg:col-span-9">
            {/* Sort Controls */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#172033]">
                Menampilkan <span className="text-[#315EF6] font-extrabold">{filteredAndSortedTrips.length}</span> jadwal tersedia
              </p>

              <div className="flex items-center gap-2 overflow-x-auto">
                <ArrowUpDown className="w-4 h-4 text-[#788196] shrink-0" />
                {[
                  { id: 'recommended', label: 'Rekomendasi' },
                  { id: 'cheapest', label: 'Termurah' },
                  { id: 'fastest', label: 'Tercepat' },
                  { id: 'earliest', label: 'Berangkat Awal' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                      sortBy === s.id
                        ? 'bg-[#315EF6] text-white'
                        : 'bg-[#F7F8FC] text-[#172033] hover:bg-slate-200/70'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 text-[#315EF6] animate-spin mx-auto mb-3" />
                <p className="font-bold text-[#101B35]">Mencari jadwal terbaik untuk Anda...</p>
              </div>
            ) : filteredAndSortedTrips.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-10 h-10 text-[#FF9B50] mx-auto mb-3" />
                <h3 className="text-lg font-extrabold text-[#101B35]">
                  Tidak ada jadwal yang sesuai filter Anda
                </h3>
                <p className="text-sm text-[#788196] mt-1 max-w-md mx-auto">
                  Coba naikkan batas harga maksimal atau pilih opsi waktu keberangkatan lainnya.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      maxPrice: 3000000,
                      timeSlot: 'all',
                      directOnly: false,
                      operator: 'all',
                    })
                  }
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#315EF6] text-white text-sm font-bold"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              /* Result Cards */
              <div className="space-y-4">
                {filteredAndSortedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#315EF6] p-5 sm:p-6 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Operator Info */}
                      <div className="flex items-center gap-3.5 lg:w-1/4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm"
                          style={{ backgroundColor: trip.operatorColor }}
                        >
                          {trip.operatorCode}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-[#101B35] text-base leading-snug">
                              {trip.operator}
                            </h3>
                          </div>
                          <p className="text-xs font-medium text-[#788196] mt-0.5">
                            {trip.serviceCode} • {trip.seatClass}
                          </p>
                          {trip.recommended && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              Pilihan Terbaik
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Schedule & Duration Timeline */}
                      <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 lg:w-2/5">
                        <div className="text-left sm:text-center">
                          <span className="block text-xl font-extrabold text-[#101B35]">
                            {trip.departureTime}
                          </span>
                          <span className="text-xs font-bold text-[#788196]">{originObj.code}</span>
                        </div>

                        <div className="flex-1 max-w-[160px] text-center">
                          <span className="text-xs font-semibold text-[#788196] block mb-1">
                            {formatDuration(trip.durationMinutes)}
                          </span>
                          <div className="relative flex items-center justify-center">
                            <div className="w-full h-[2px] bg-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#315EF6] absolute left-0" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF9B50] absolute right-0" />
                          </div>
                          <span className="text-[11px] font-semibold text-[#315EF6] block mt-1">
                            {trip.transit}
                          </span>
                        </div>

                        <div className="text-right sm:text-center">
                          <span className="block text-xl font-extrabold text-[#101B35]">
                            {trip.arrivalTime}
                          </span>
                          <span className="text-xs font-bold text-[#788196]">{destObj.code}</span>
                        </div>
                      </div>

                      {/* Price & Select CTA */}
                      <div className="flex sm:items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:w-1/3">
                        <div className="lg:text-right">
                          <span className="text-xs text-[#788196] block">
                            Sisa <strong className="text-emerald-600">{trip.availableSeats} kursi</strong>
                          </span>
                          <span className="text-xl sm:text-2xl font-extrabold text-[#315EF6]">
                            {formatIDR(trip.price)}
                          </span>
                          <span className="text-[11px] text-[#788196] block">/ penumpang</span>
                        </div>

                        <button
                          onClick={() => handleSelectTrip(trip)}
                          className="px-5 py-3 rounded-xl bg-[#101B35] hover:bg-[#315EF6] text-white text-sm font-bold transition-colors shrink-0 cursor-pointer"
                        >
                          Pilih Tiket
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // -------------------- PAGE C: TRIP DETAIL --------------------
  const renderTripDetailPage = () => {
    if (!selectedTrip) return null;
    const originObj = getCityInfo(selectedTrip.category, selectedTrip.originId);
    const destObj = getCityInfo(selectedTrip.category, selectedTrip.destId);
    const catMeta = getCategoryMeta(selectedTrip.category);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigateTo('results')}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#315EF6] hover:underline mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Hasil Pencarian</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold"
                    style={{ backgroundColor: selectedTrip.operatorColor }}
                  >
                    {selectedTrip.operatorCode}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#315EF6]">
                      {catMeta.badge} • {selectedTrip.serviceCode}
                    </span>
                    <h1 className="text-xl font-extrabold text-[#101B35]">
                      {selectedTrip.operator}
                    </h1>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#315EF6] text-xs font-bold">
                  Kelas: {selectedTrip.seatClass}
                </span>
              </div>

              {/* Itinerary Timeline */}
              <div className="py-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#315EF6] ring-4 ring-blue-50" />
                    <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                  </div>
                  <div className="pb-2">
                    <span className="text-lg font-extrabold text-[#101B35]">
                      {selectedTrip.departureTime}
                    </span>
                    <span className="text-xs text-[#788196] ml-2">
                      {formatDateIndo(searchCriteria.departureDate)}
                    </span>
                    <h3 className="font-bold text-[#172033] mt-0.5">{originObj.city}</h3>
                    <p className="text-sm text-[#788196]">{selectedTrip.details.originTerminal}</p>
                  </div>
                </div>

                <div className="pl-7">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F7F8FC] text-xs font-semibold text-[#788196]">
                    <Clock className="w-3.5 h-3.5 text-[#315EF6]" />
                    Durasi Perjalanan: {formatDuration(selectedTrip.durationMinutes)} ({selectedTrip.transit})
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FF9B50] ring-4 ring-orange-50" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-[#101B35]">
                      {selectedTrip.arrivalTime}
                    </span>
                    <h3 className="font-bold text-[#172033] mt-0.5">{destObj.city}</h3>
                    <p className="text-sm text-[#788196]">{selectedTrip.details.destTerminal}</p>
                  </div>
                </div>
              </div>

              {/* Category Specific Equipment & Baggage */}
              <div className="pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F7F8FC]">
                  <span className="text-xs font-bold text-[#788196] block">Ketentuan Bagasi</span>
                  <span className="text-sm font-bold text-[#101B35] mt-0.5 block">
                    {selectedTrip.details.baggage}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F8FC]">
                  <span className="text-xs font-bold text-[#788196] block">Armada / Rangkaian</span>
                  <span className="text-sm font-bold text-[#101B35] mt-0.5 block">
                    {selectedTrip.details.aircraft ||
                      selectedTrip.details.trainInfo ||
                      selectedTrip.details.busInfo ||
                      selectedTrip.details.vesselInfo}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <h2 className="text-base font-extrabold text-[#101B35] mb-4">
                Fasilitas Termasuk dalam Tiket
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {selectedTrip.details.amenities.map((am, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{am}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Policies & Important Travel Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5">
              <div>
                <h2 className="text-base font-extrabold text-[#101B35] mb-2">
                  Kebijakan Pembatalan & Perubahan Jadwal
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="p-4 rounded-xl border border-slate-200/80">
                    <span className="text-xs font-bold text-[#315EF6] uppercase">Pembatalan (Refund)</span>
                    <p className="text-sm text-[#172033] mt-1">{selectedTrip.details.cancellationPolicy}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200/80">
                    <span className="text-xs font-bold text-[#315EF6] uppercase">Ubah Jadwal (Reschedule)</span>
                    <p className="text-sm text-[#172033] mt-1">{selectedTrip.details.reschedulePolicy}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-[#101B35] mb-2.5 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#FF9B50]" />
                  <span>Informasi Penting Perjalanan</span>
                </h3>
                <ul className="space-y-2">
                  {selectedTrip.details.importantNotes.map((note, idx) => (
                    <li key={idx} className="text-sm text-[#788196] flex items-start gap-2">
                      <span className="text-[#315EF6] font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Sticky Price Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sticky top-24 shadow-sm">
              <h2 className="text-base font-extrabold text-[#101B35] pb-4 border-b border-slate-100">
                Rincian Tarif Perjalanan
              </h2>

              <div className="py-4 space-y-3 text-sm">
                <div className="flex justify-between text-[#172033]">
                  <span>
                    Tiket ({searchCriteria.passengers}x {selectedTrip.seatClass})
                  </span>
                  <span className="font-bold">
                    {formatIDR(selectedTrip.price * searchCriteria.passengers)}
                  </span>
                </div>
                {pricingSummary.vehicleFee > 0 && (
                  <div className="flex justify-between text-[#172033]">
                    <span>Tarif Kendaraan Ferry</span>
                    <span className="font-bold">{formatIDR(pricingSummary.vehicleFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#788196]">
                  <span>Biaya Layanan Platform</span>
                  <span>{formatIDR(pricingSummary.serviceFee)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between mb-6">
                <span className="text-sm font-bold text-[#101B35]">Total Estimasi</span>
                <span className="text-2xl font-extrabold text-[#315EF6]">
                  {formatIDR(pricingSummary.grandTotal)}
                </span>
              </div>

              <button
                onClick={handleProceedToPassengers}
                className="w-full py-3.5 px-5 rounded-xl bg-[#315EF6] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                Lanjutkan ke Data Penumpang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------- PAGE D: PASSENGER INFORMATION --------------------
  const renderPassengerFormPage = () => {
    if (!selectedTrip) return null;

    const updatePassenger = (idx, field, val) => {
      setPassengersData((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
      );
    };

    const handleSubmitPassengers = (e) => {
      e.preventDefault();

      // Contact validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        showToast('Masukkan alamat email pemesan yang valid.', 'error');
        return;
      }
      const phoneClean = contactPhone.replace(/\D/g, '');
      if (phoneClean.length < 9 || phoneClean.length > 15) {
        showToast('Masukkan nomor telepon seluler yang valid (9-15 digit).', 'error');
        return;
      }

      // Each passenger validation
      for (let i = 0; i < passengersData.length; i++) {
        const p = passengersData[i];
        if (!p.fullName.trim() || p.fullName.trim().length < 3) {
          showToast(`Nama lengkap Penumpang ${i + 1} wajib diisi dengan benar.`, 'error');
          return;
        }
        if (!p.idNumber.trim() || p.idNumber.trim().length < 6) {
          showToast(`Nomor identitas (${p.idType}) Penumpang ${i + 1} wajib diisi.`, 'error');
          return;
        }
        if (p.idType === 'Paspor' && !p.passportExpiry) {
          showToast(`Tanggal masa berlaku paspor Penumpang ${i + 1} wajib diisi.`, 'error');
          return;
        }
      }

      navigateTo('summary');
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigateTo('detail')}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#315EF6] hover:underline mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Detail Perjalanan</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101B35]">
            Data Pemesan & Penumpang
          </h1>
          <p className="text-sm text-[#788196] mt-1">
            Pastikan data sesuai dengan KTP, Paspor, atau kartu identitas resmi yang akan ditunjukkan saat keberangkatan.
          </p>
        </div>

        <form onSubmit={handleSubmitPassengers} className="space-y-6">
          {/* Contact Person Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
            <h2 className="text-base font-extrabold text-[#101B35] pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#315EF6]" />
              <span>Informasi Kontak Pemesan (Pengiriman E-Tiket)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5">
                  Alamat Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] focus:bg-white focus:border-[#315EF6] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5">
                  Nomor Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] focus:bg-white focus:border-[#315EF6] focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Individual Passenger Cards */}
          {passengersData.map((p, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-[#101B35]">
                  Penumpang {idx + 1}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#315EF6]">
                  {selectedTrip.seatClass}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Title */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">Gelar</label>
                  <select
                    value={p.title}
                    onChange={(e) => updatePassenger(idx, 'title', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm font-semibold"
                  >
                    <option value="Tuan">Tuan</option>
                    <option value="Nyonya">Nyonya</option>
                    <option value="Nona">Nona</option>
                  </select>
                </div>

                {/* Full Name */}
                <div className="sm:col-span-9">
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">
                    Nama Lengkap (Sesuai KTP/Paspor) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={p.fullName}
                    onChange={(e) => updatePassenger(idx, 'fullName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] focus:bg-white focus:border-[#315EF6] focus:outline-none text-sm"
                  />
                </div>

                {/* ID Document Type */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">
                    Jenis Identitas *
                  </label>
                  <select
                    value={p.idType}
                    onChange={(e) => updatePassenger(idx, 'idType', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm font-semibold"
                  >
                    <option value="KTP">KTP (NIK)</option>
                    <option value="Paspor">Paspor</option>
                    {selectedTrip.category !== 'flight' && <option value="SIM">SIM</option>}
                  </select>
                </div>

                {/* ID Number */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">
                    Nomor {p.idType} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={p.idType === 'KTP' ? '16 digit NIK' : 'Nomor dokumen'}
                    value={p.idNumber}
                    onChange={(e) => updatePassenger(idx, 'idNumber', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] focus:bg-white focus:border-[#315EF6] focus:outline-none text-sm"
                  />
                </div>

                {/* Passenger Category */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">Kategori</label>
                  <select
                    value={p.passengerType}
                    onChange={(e) => updatePassenger(idx, 'passengerType', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm font-semibold"
                  >
                    <option value="Dewasa">Dewasa</option>
                    <option value="Anak">Anak (2-11 thn)</option>
                  </select>
                </div>

                {/* Conditional Passport Expiry for Flight / Passport ID */}
                {p.idType === 'Paspor' && (
                  <>
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-bold text-[#172033] mb-1.5">
                        Masa Berlaku Paspor *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={p.passportExpiry}
                        onChange={(e) => updatePassenger(idx, 'passportExpiry', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-bold text-[#172033] mb-1.5">
                        Kewarganegaraan
                      </label>
                      <input
                        type="text"
                        value={p.nationality}
                        onChange={(e) => updatePassenger(idx, 'nationality', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Seat / Carriage / Cabin Preference */}
                <div className="sm:col-span-12">
                  <label className="block text-xs font-bold text-[#172033] mb-1.5">
                    {selectedTrip.category === 'train'
                      ? 'Preferensi Gerbong & Kursi'
                      : selectedTrip.category === 'bus'
                      ? 'Pilih Nomor Kursi Bus'
                      : selectedTrip.category === 'ferry'
                      ? 'Preferensi Dek / Area Duduk'
                      : 'Preferensi Nomor Kursi'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTrip.category === 'train'
                      ? ['Eks-1 / 4A', 'Eks-1 / 4B', 'Eks-2 / 8C', 'Eks-2 / 8D']
                      : selectedTrip.category === 'bus'
                      ? ['Kursi 1A (Depan)', 'Kursi 2B', 'Kursi 3A', 'Kursi 4B']
                      : selectedTrip.category === 'ferry'
                      ? ['Dek Utama AC', 'Dek Jendela Laut', 'Area VIP']
                      : ['10A (Jendela)', '10C (Lorong)', '14A (Jendela)', '14F (Jendela)']
                    ).map((seat) => (
                      <button
                        key={seat}
                        type="button"
                        onClick={() => updatePassenger(idx, 'seatPreference', seat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          p.seatPreference === seat
                            ? 'bg-[#101B35] text-white border-[#101B35]'
                            : 'bg-[#F7F8FC] text-[#172033] border-slate-200 hover:border-[#315EF6]'
                        }`}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#315EF6] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              Lanjut ke Ringkasan Pemesanan
            </button>
          </div>
        </form>
      </div>
    );
  };

  // -------------------- PAGE E: BOOKING SUMMARY --------------------
  const renderBookingSummaryPage = () => {
    if (!selectedTrip) return null;
    const originObj = getCityInfo(selectedTrip.category, selectedTrip.originId);
    const destObj = getCityInfo(selectedTrip.category, selectedTrip.destId);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101B35]">
            Ringkasan Pemesanan
          </h1>
          <p className="text-sm text-[#788196] mt-1">
            Periksa kembali detail perjalanan, data penumpang, dan rincian pembayaran sebelum melanjutkan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Summary Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Trip Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#101B35]">Detail Perjalanan</h2>
                <button
                  onClick={() => navigateTo('results')}
                  className="text-xs font-bold text-[#315EF6] hover:underline"
                >
                  Ganti Jadwal
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#101B35]">{selectedTrip.operator}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-[#172033]">
                    {selectedTrip.serviceCode} • {selectedTrip.seatClass}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#172033]">
                  {originObj.city} ({originObj.code}) → {destObj.city} ({destObj.code})
                </p>
                <p className="text-xs text-[#788196]">
                  {formatDateIndo(searchCriteria.departureDate)} • Berangkat {selectedTrip.departureTime} - Tiba {selectedTrip.arrivalTime}
                </p>
              </div>
            </div>

            {/* Passengers Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#101B35]">
                  Daftar Penumpang ({passengersData.length})
                </h2>
                <button
                  onClick={() => navigateTo('passengers')}
                  className="text-xs font-bold text-[#315EF6] hover:underline"
                >
                  Ubah Data
                </button>
              </div>

              <div className="space-y-3">
                {passengersData.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F7F8FC] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#101B35]">
                        {idx + 1}. {p.title}. {p.fullName}
                      </p>
                      <p className="text-xs text-[#788196] mt-0.5">
                        {p.idType}: {p.idNumber} • {p.passengerType}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#315EF6] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {p.seatPreference}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#788196]">
                E-Tiket akan dikirimkan ke: <strong className="text-[#172033]">{contactEmail}</strong> ({contactPhone})
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <h2 className="text-base font-extrabold text-[#101B35] mb-3">
                Kode Promo / Voucher
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan kode (cth: ASRIBARU)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm font-semibold uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-5 py-3 rounded-xl bg-[#101B35] hover:bg-slate-800 text-white text-sm font-bold"
                >
                  Terapkan
                </button>
              </div>

              {appliedPromo && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <span>
                    Promo <strong>{appliedPromo.code}</strong> aktif ({appliedPromo.label})
                  </span>
                  <button
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoInput('');
                    }}
                    className="font-bold underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Payment Breakdown & Terms */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sticky top-24">
              <h2 className="text-base font-extrabold text-[#101B35] pb-4 border-b border-slate-100">
                Rincian Pembayaran
              </h2>

              <div className="py-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#788196]">
                    Harga Tiket ({searchCriteria.passengers}x)
                  </span>
                  <span className="font-bold text-[#172033]">
                    {formatIDR(pricingSummary.baseTotal)}
                  </span>
                </div>

                {pricingSummary.vehicleFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#788196]">Kendaraan Ferry</span>
                    <span className="font-bold text-[#172033]">
                      {formatIDR(pricingSummary.vehicleFee)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-[#788196]">Biaya Layanan & Pajak</span>
                  <span className="font-bold text-[#172033]">
                    {formatIDR(pricingSummary.serviceFee)}
                  </span>
                </div>

                {pricingSummary.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Promo ({appliedPromo?.code})</span>
                    <span>-{formatIDR(pricingSummary.discount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between mb-5">
                <span className="text-base font-extrabold text-[#101B35]">Total Pembayaran</span>
                <span className="text-2xl font-extrabold text-[#315EF6]">
                  {formatIDR(pricingSummary.grandTotal)}
                </span>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#788196] mb-5">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#315EF6]"
                />
                <span>
                  Saya telah memeriksa seluruh data penumpang dan menyetujui{' '}
                  <strong className="text-[#172033]">Syarat & Ketentuan</strong> serta kebijakan perjalanan ASRI TRAVEL.
                </span>
              </label>

              <button
                onClick={handleCreatePendingBooking}
                className="w-full py-4 px-5 rounded-xl bg-[#315EF6] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------- PAGE F: POKETO PAYMENT --------------------
  const renderMockPaymentPage = () => {
    if (!activeBooking) return null;
    const total = activeBooking.pricing?.grandTotal ?? 0;
    const hasInvoice = Boolean(activeBooking.paymentUrl);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900">
            <strong className="uppercase tracking-wider block font-extrabold">Poketo Sandbox</strong>
            <span>Pembayaran ini menggunakan lingkungan uji coba. Tidak ada dana nyata yang dipindahkan.</span>
          </div>
        </div>
        <div className="bg-[#101B35] text-white rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Kode Booking: {activeBooking.bookingRef}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-[#FF9B50] border border-amber-400/40">STATUS: {activeBooking.status}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">{formatIDR(total)}</h1>
          <p className="text-xs text-slate-300 mt-1">Biaya metode pembayaran Poketo dapat ditampilkan saat checkout.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-[#101B35]">Pembayaran melalui Poketo</h2>
            <p className="text-sm text-[#788196] mt-1">Lanjutkan ke halaman Poketo untuk memilih QRIS, Virtual Account, PayLater, atau kartu debit yang tersedia.</p>
          </div>
          {activeBooking.status === 'PAID' ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold">Pembayaran telah dikonfirmasi oleh webhook Poketo.</div>
          ) : (
            <button onClick={handleCreatePoketoInvoice} disabled={isCreatingPoketoInvoice}
              className="w-full py-3.5 px-4 rounded-xl bg-[#315EF6] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors">
              {isCreatingPoketoInvoice ? 'Menyiapkan invoice…' : hasInvoice ? 'Lanjutkan pembayaran di Poketo' : 'Buat invoice & bayar dengan Poketo'}
            </button>
          )}
          <div className="text-xs text-[#788196] bg-slate-50 p-4 rounded-xl space-y-1">
            <p className="font-bold text-[#172033]">Konfirmasi pembayaran</p>
            <p>Status pesanan hanya berubah menjadi PAID setelah server menerima dan memverifikasi webhook invoice.paid dari Poketo.</p>
            <p>Halaman redirect dan status checkout tidak digunakan sebagai bukti pembayaran.</p>
          </div>
          <button onClick={() => navigateTo('my-booking')} className="text-sm font-bold text-[#315EF6] hover:underline">Kembali ke cek pesanan</button>
        </div>
      </div>
    );
  };

  // -------------------- PAGE G: BOOKING CONFIRMATION --------------------
  const renderBookingConfirmationPage = () => {
    if (!activeBooking) return null;
    const originObj = getCityInfo(activeBooking.trip.category, activeBooking.trip.originId);
    const destObj = getCityInfo(activeBooking.trip.category, activeBooking.trip.destId);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
            PEMBAYARAN TERKONFIRMASI VIA POKETO
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] mt-3">
            Pemesanan Tiket Berhasil!
          </h1>
          <p className="text-sm text-[#788196] mt-1.5 max-w-lg mx-auto">
            Terima kasih telah memesan bersama ASRI TRAVEL. E-Tiket digital Anda telah diterbitkan dan siap digunakan.
          </p>

          {/* Booking Reference Box */}
          <div className="mt-6 p-4 rounded-2xl bg-[#F7F8FC] border border-slate-200 inline-flex flex-col sm:flex-row items-center gap-4">
            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#788196] block">
                Kode Referensi Pemesanan
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#101B35]">
                {activeBooking.bookingRef}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(activeBooking.bookingRef);
                showToast('Kode booking disalin!', 'success');
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#315EF6] hover:bg-blue-50 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Kode</span>
            </button>
          </div>

          {/* Summary Details */}
          <div className="mt-8 text-left border-t border-slate-100 pt-6 space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#788196] block">Rute Perjalanan</span>
                <span className="font-bold text-[#101B35]">
                  {originObj.city} → {destObj.city}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#788196] block">Operator & Jadwal</span>
                <span className="font-bold text-[#101B35]">
                  {activeBooking.trip.operator} ({activeBooking.trip.departureTime})
                </span>
              </div>
              <div>
                <span className="text-xs text-[#788196] block">Tanggal Keberangkatan</span>
                <span className="font-bold text-[#101B35]">
                  {formatDateIndo(activeBooking.searchCriteria.departureDate)}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#788196] block">Jumlah Penumpang</span>
                <span className="font-bold text-[#101B35]">
                  {activeBooking.passengers.length} Penumpang
                </span>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('ticket')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#315EF6] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Lihat E-Tiket Digital</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F7F8FC] hover:bg-slate-200 text-[#101B35] font-bold text-sm transition-colors cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------- PAGE I: DIGITAL E-TICKET --------------------
  const renderDigitalETicketPage = () => {
    const booking = activeBooking || bookingsHistory[0];
    if (!booking) return null;

    const originObj = getCityInfo(booking.trip.category, booking.trip.originId);
    const destObj = getCityInfo(booking.trip.category, booking.trip.destId);
    const catMeta = getCategoryMeta(booking.trip.category);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Controls (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
          <button
            onClick={() => navigateTo('my-booking')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#315EF6] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Daftar Pesanan</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(booking.bookingRef);
                showToast('Kode booking berhasil disalin!', 'success');
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#101B35] hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4 text-[#315EF6]" />
              <span>Salin Kode</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-[#101B35] hover:bg-[#315EF6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Digital E-Ticket Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg print-area">
          {/* Demo Watermark Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-center text-[11px] font-extrabold tracking-wider text-amber-800 uppercase">
            E-TIKET DEMONSTRASI / SIMULASI — ASRI TRAVEL INDONESIA
          </div>

          {/* Ticket Header */}
          <div className="bg-[#101B35] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-[#FF9B50]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight block">
                  ASRI <span className="text-[#315EF6]">TRAVEL</span>
                </span>
                <span className="text-xs text-slate-300">
                  E-Tiket Resmi • {catMeta.badge}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                Kode Booking
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#FF9B50]">
                {booking.bookingRef}
              </span>
            </div>
          </div>

          {/* Route & Schedule Body */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-dashed border-slate-300">
              <div>
                <span className="text-xs font-bold text-[#315EF6] uppercase">
                  {booking.trip.operator} • {booking.trip.serviceCode}
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <span className="text-2xl font-extrabold text-[#101B35] block">
                      {originObj.code}
                    </span>
                    <span className="text-xs text-[#788196]">{originObj.city}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-2xl font-extrabold text-[#101B35] block">
                      {destObj.code}
                    </span>
                    <span className="text-xs text-[#788196]">{destObj.city}</span>
                  </div>
                </div>
                <p className="text-xs text-[#788196] mt-2">
                  {booking.trip.details.originTerminal} → {booking.trip.details.destTerminal}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#F7F8FC] p-4 rounded-2xl shrink-0">
                <div>
                  <span className="text-[11px] text-[#788196] block">Tanggal</span>
                  <span className="text-xs sm:text-sm font-bold text-[#101B35]">
                    {booking.searchCriteria.departureDate}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#788196] block">Kelas</span>
                  <span className="text-xs sm:text-sm font-bold text-[#101B35]">
                    {booking.trip.seatClass}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#788196] block">Berangkat</span>
                  <span className="text-sm font-extrabold text-[#315EF6]">
                    {booking.trip.departureTime}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#788196] block">Tiba</span>
                  <span className="text-sm font-extrabold text-[#101B35]">
                    {booking.trip.arrivalTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Passengers Table & QR Code */}
            <div className="pt-6 flex flex-col md:flex-row justify-between gap-6 items-start">
              <div className="flex-1 w-full">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#788196] mb-3">
                  Data Penumpang Terdaftar
                </h3>
                <div className="space-y-2.5">
                  {booking.passengers.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-extrabold text-[#101B35]">
                          {p.title}. {p.fullName}
                        </p>
                        <p className="text-xs text-[#788196]">
                          {p.idType}: {p.idNumber} • {p.passengerType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#788196] block">Kursi</span>
                        <span className="text-xs font-extrabold text-[#315EF6]">
                          {p.seatNumber || p.seatPreference}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                    STATUS TIKET: AKTIF ({booking.status})
                  </span>
                </div>
              </div>

              {/* Deterministic QR */}
              <div className="self-center md:self-start text-center">
                <DeterministicQRCode value={`${booking.bookingRef}-${booking.trip.serviceCode}`} />
                <span className="block text-[10px] text-[#788196] mt-1.5">
                  Pindai saat boarding
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------- PAGE H: MY BOOKING (GUEST LOOKUP) --------------------
  const [lookupRef, setLookupRef] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const renderMyBookingPage = () => {
    const handleLookup = (e) => {
      e.preventDefault();
      setLookupError('');
      const refClean = lookupRef.trim().toUpperCase();
      const emailClean = lookupEmail.trim().toLowerCase();

      if (!refClean || !emailClean) {
        setLookupError('Silakan masukkan Kode Pemesanan dan Email pemesan.');
        return;
      }

      const found = bookingsHistory.find(
        (b) =>
          b.bookingRef.toUpperCase() === refClean &&
          b.contactEmail.toLowerCase() === emailClean
      );

      if (!found) {
        setLookupResult(null);
        setLookupError(
          'Pesanan tidak ditemukan. Periksa kembali Kode Referensi Pemesanan dan alamat email Anda.'
        );
      } else {
        setLookupResult(found);
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101B35]">
            Cek Pesanan & E-Tiket Saya
          </h1>
          <p className="text-sm text-[#788196] mt-1">
            Akses detail perjalanan dan e-tiket Anda tanpa perlu login menggunakan kode booking dan email.
          </p>
        </div>

        {/* Lookup Form */}
        <form
          onSubmit={handleLookup}
          className="bg-white rounded-2xl border border-slate-200/90 p-6 mb-8 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Kode Referensi Pemesanan
              </label>
              <input
                type="text"
                placeholder="Contoh: ASRI-88421"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm font-semibold uppercase"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Email Pemesan
              </label>
              <input
                type="email"
                placeholder="Contoh: budi.santoso@contoh.id"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F7F8FC] text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#315EF6] hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
              >
                Cari
              </button>
            </div>
          </div>

          {lookupError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}
        </form>

        {/* Lookup Result Card */}
        {lookupResult && (
          <div className="bg-white rounded-2xl border-2 border-[#315EF6] p-6 mb-8 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#315EF6] uppercase">
                  Hasil Pencarian Ditemukan
                </span>
                <h2 className="text-xl font-extrabold text-[#101B35]">
                  {lookupResult.bookingRef} — {lookupResult.trip.operator}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                {lookupResult.status}
              </span>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-[#172033]">
                <p className="font-bold">
                  {getCityInfo(lookupResult.trip.category, lookupResult.trip.originId).city} →{' '}
                  {getCityInfo(lookupResult.trip.category, lookupResult.trip.destId).city}
                </p>
                <p className="text-xs text-[#788196] mt-0.5">
                  {formatDateIndo(lookupResult.searchCriteria.departureDate)} • {lookupResult.passengers.length} Penumpang
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveBooking(lookupResult);
                  navigateTo('ticket');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#101B35] text-white text-xs font-bold hover:bg-[#315EF6]"
              >
                Buka E-Tiket
              </button>
            </div>
          </div>
        )}

        {/* Recent Bookings Stored in Browser */}
        <div>
          <h2 className="text-lg font-extrabold text-[#101B35] mb-4">
            Riwayat Pemesanan di Perangkat Ini ({bookingsHistory.length})
          </h2>

          {bookingsHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-[#101B35]">Belum ada riwayat pemesanan</p>
              <p className="text-xs text-[#788196] mt-1">
                Pesanan yang Anda buat akan otomatis tersimpan di sini untuk akses cepat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsHistory.map((item) => {
                const o = getCityInfo(item.trip.category, item.trip.originId);
                const d = getCityInfo(item.trip.category, item.trip.destId);
                return (
                  <div
                    key={item.bookingRef}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-[#315EF6]">
                          {item.bookingRef}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            item.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'FAILED'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#101B35] text-base mt-1">
                        {o.city} → {d.city} ({item.trip.operator})
                      </h3>
                      <p className="text-xs text-[#788196] mt-0.5">
                        {formatDateIndo(item.searchCriteria.departureDate)} • Pemesan: {item.contactEmail}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {item.status === 'PAID' ? (
                        <button
                          onClick={() => {
                            setActiveBooking(item);
                            navigateTo('ticket');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#101B35] hover:bg-[#315EF6] text-white text-xs font-bold transition-colors"
                        >
                          Lihat E-Tiket
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveBooking(item);
                            navigateTo('payment');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#FF9B50] text-[#101B35] text-xs font-bold"
                        >
                          Lanjutkan Bayar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // -------------------- HELP CENTER PAGE --------------------
  const renderHelpCenterPage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-[#101B35] text-white rounded-3xl p-8 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF9B50]">
          Layanan Pelanggan 24/7
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold mt-1">
          Pusat Bantuan ASRI TRAVEL
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
          Butuh bantuan terkait perubahan jadwal, pembatalan tiket, atau kendala pemesanan? Tim dukungan kami siap membantu Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#315EF6] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#101B35]">Call Center Resmi</h3>
            <p className="text-sm text-[#788196] mt-0.5">1500-890 (Pulsa Lokal Indonesia)</p>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">Aktif 24 Jam</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#315EF6] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#101B35]">Dukungan Email</h3>
            <p className="text-sm text-[#788196] mt-0.5">bantuan@asritravel.co.id</p>
            <span className="text-xs text-[#315EF6] font-semibold mt-1 block">Respon rata-rata &lt; 15 menit</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-[#101B35] mb-4">Panduan & Pertanyaan Umum</h2>
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-[#101B35] text-sm sm:text-base">{f.q}</h3>
            <p className="text-sm text-[#788196] mt-2 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // -------------------- FOOTER --------------------
  const renderFooter = () => (
    <footer className="bg-[#101B35] text-slate-300 border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 text-white mb-3">
              <Compass className="w-6 h-6 text-[#FF9B50]" />
              <span className="text-xl font-extrabold tracking-tight">
                ASRI <span className="text-[#315EF6]">TRAVEL</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Platform etalase pemesanan tiket perjalanan terpadu untuk masyarakat Indonesia. Pesan tiket pesawat, kereta api, bus antarkota, dan penyeberangan ferry dalam satu pengalaman yang bersih, cepat, dan terpercaya.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              Layanan Tiket
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleCategorySelect('flight', true)} className="hover:text-white">
                  Tiket Pesawat Domestik
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySelect('train', true)} className="hover:text-white">
                  Tiket Kereta Api KAI
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySelect('bus', true)} className="hover:text-white">
                  Tiket Bus & Shuttle
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySelect('ferry', true)} className="hover:text-white">
                  Tiket Kapal Ferry & PELNI
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              Bantuan & Akses
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigateTo('my-booking')} className="hover:text-white">
                  Cek Pesanan Tamu
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('help')} className="hover:text-white">
                  Pusat Bantuan 24/7
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 ASRI TRAVEL Indonesia. Hak Cipta Dilindungi.</p>
          <p>Mata Uang: Rupiah Indonesia (IDR) • Prototipe Storefront Resmi</p>
        </div>
      </div>
    </footer>
  );

  // ==========================================================================
  // 6. MAIN RENDER SHELL
  // ==========================================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] text-[#172033] font-sans antialiased">
      {/* Print Stylesheet for Clean Ticket Printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #FFFFFF !important; }
          .print-area { box-shadow: none !important; border: 1px solid #CBD5E1 !important; }
        }
      `}</style>

      {renderNavbar()}
      <BookingProgressStepper currentView={view} />

      <main className="flex-1">
        {view === 'home' && renderHomePage()}
        {view === 'results' && renderSearchResultsPage()}
        {view === 'detail' && renderTripDetailPage()}
        {view === 'passengers' && renderPassengerFormPage()}
        {view === 'summary' && renderBookingSummaryPage()}
        {view === 'payment' && renderMockPaymentPage()}
        {view === 'confirmation' && renderBookingConfirmationPage()}
        {view === 'ticket' && renderDigitalETicketPage()}
        {view === 'my-booking' && renderMyBookingPage()}
        {view === 'help' && renderHelpCenterPage()}
      </main>

      {renderFooter()}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-bounce-in no-print">
          <div
            className={`px-4 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : toast.type === 'success'
                ? 'bg-[#101B35] text-white border-slate-700'
                : 'bg-white text-[#101B35] border-slate-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#FF9B50] shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
