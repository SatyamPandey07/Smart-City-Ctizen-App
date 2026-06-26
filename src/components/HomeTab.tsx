/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Droplet, CreditCard, Trash2, Bus, MapPin, HeartPulse, Building2, 
  ShieldAlert, Sparkles, TrendingUp, ChevronRight, Search,
  Sun, Compass, ShieldCheck, Ticket, QrCode, Camera, Loader2, Check, AlertCircle, Wifi
} from 'lucide-react';
import { CitizenProfile, ServiceType, BillRecord, ServiceRequest } from '../types';

interface HomeTabProps {
  profile: CitizenProfile;
  onSelectService: (type: ServiceType) => void;
  walletBalance: number;
  unreadCount: number;
  onNotificationClick: () => void;
  bills: BillRecord[];
  onPayBill: (billId: string) => void;
  onTopUpWallet: (amount: number) => void;
  requests?: ServiceRequest[];
}

export default function HomeTab({
  profile,
  onSelectService,
  walletBalance,
  unreadCount,
  onNotificationClick,
  bills,
  onPayBill,
  onTopUpWallet,
  requests = []
}: HomeTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'quick' | 'map'>('quick');
  const [selectedRequestPin, setSelectedRequestPin] = useState<ServiceRequest | null>(null);

  // Helper to place active request pins on a 400x180 SVG grid
  const getRequestCoords = (req: ServiceRequest) => {
    if (req.id === 'r1') return { x: 120, y: 130, road: 'Commercial St' };
    if (req.id === 'r2') return { x: 260, y: 60, road: 'Main Boulevard' };
    if (req.id === 'r3') return { x: 120, y: 75, road: 'Commercial St' };
    
    // Stable hash-based coordinates for newly added requests
    let hash = 0;
    for (let i = 0; i < req.title.length; i++) {
      hash = req.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.abs((hash % 260) + 70); // range 70 to 330
    const y = Math.abs(((hash >> 3) % 100) + 40); // range 40 to 140
    return { x, y, road: 'Citizen Zone' };
  };

  // Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Scan state flow: 'idle' | 'scanning' | 'detected' | 'success'
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'success'>('idle');
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);
  const [decodedData, setDecodedData] = useState<{
    type: 'bill' | 'transit' | 'wifi_kiosk';
    billId?: string;
    title: string;
    amount: number;
    description: string;
    refNo: string;
  } | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setScanStatus('scanning');
    setDecodedData(null);
    setScanErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera API permission or support issue:", err);
      setCameraError(err.message || 'Camera blocked or device has no source feeds.');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const handleOpenScanner = () => {
    setIsScannerOpen(true);
    startCamera();
  };

  const handleCloseScanner = () => {
    stopCamera();
    setIsScannerOpen(false);
    setScanStatus('idle');
    setDecodedData(null);
    setScanErrorMsg(null);
  };

  const handleConfirmAction = () => {
    if (!decodedData) return;

    if (decodedData.type === 'bill' && decodedData.billId) {
      if (walletBalance < decodedData.amount) {
        setScanErrorMsg(`Insufficient wallet balance. Bill: ₹${decodedData.amount.toFixed(2)}, Wallet: ₹${walletBalance.toFixed(2)}`);
        return;
      }
      onPayBill(decodedData.billId);
      setScanStatus('success');
      setTimeout(() => {
        handleCloseScanner();
      }, 2000);
    } else if (decodedData.type === 'transit') {
      if (walletBalance < decodedData.amount) {
        setScanErrorMsg(`Insufficient wallet balance. Fare: ₹${decodedData.amount.toFixed(2)}, Wallet: ₹${walletBalance.toFixed(2)}`);
        return;
      }
      onTopUpWallet(-decodedData.amount);
      setScanStatus('success');
      setTimeout(() => {
        handleCloseScanner();
      }, 2000);
    } else if (decodedData.type === 'wifi_kiosk') {
      // WiFi is free
      setScanStatus('success');
      setTimeout(() => {
        handleCloseScanner();
      }, 2000);
    }
  };

  const simulateScanTarget = (targetType: 'electricity_bill' | 'water_bill' | 'metro_fare' | 'wifi_terminal') => {
    setScanStatus('scanning');
    setScanErrorMsg(null);
    setDecodedData(null);
    
    setTimeout(() => {
      setScanStatus('detected');
      
      if (targetType === 'electricity_bill') {
        const matchingBill = bills.find(b => b.type === 'Electricity' && !b.isPaid) || bills.find(b => b.type === 'Electricity');
        if (!matchingBill) {
          setScanErrorMsg("Power bill already fully paid in local state.");
          setScanStatus('idle');
          return;
        }
        setDecodedData({
          type: 'bill',
          billId: matchingBill.id,
          title: matchingBill.title,
          amount: matchingBill.amount,
          description: `Outstanding power charge. Cycle ID Electic-A. Standard carbon credit subtotal.`,
          refNo: `QR-ELEC-${matchingBill.id.toUpperCase()}-NY`
        });
      } else if (targetType === 'water_bill') {
        const matchingBill = bills.find(b => b.type === 'Water' && !b.isPaid) || bills.find(b => b.type === 'Water');
        if (!matchingBill) {
          setScanErrorMsg("Water charge already settled in local state.");
          setScanStatus('idle');
          return;
        }
        setDecodedData({
          type: 'bill',
          billId: matchingBill.id,
          title: matchingBill.title,
          amount: matchingBill.amount,
          description: `Clean water utility and sewage disposal billing loop.`,
          refNo: `QR-WATR-${matchingBill.id.toUpperCase()}-NY`
        });
      } else if (targetType === 'metro_fare') {
        setDecodedData({
          type: 'transit',
          title: 'Sector 4 Metro Terminal Ride',
          amount: 2.50,
          description: 'Single transit gate access pass. Valid for standard subway boarding.',
          refNo: 'QR-METRO-BOARD-921'
        });
      } else if (targetType === 'wifi_terminal') {
        setDecodedData({
          type: 'wifi_kiosk',
          title: 'Smart City High-Speed Wi-Fi',
          amount: 0.00,
          description: 'Terminal #SR-849 access active. Decrypted voucher code: CITIZEN-WIFI-NEON-GUEST. Free access.',
          refNo: 'QR-WIFI-SR849-CITY'
        });
      }
    }, 1200);
  };

  useEffect(() => {
    // Cleanup video handles inside Component lifecycles
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  // 9 requested services
  const allServicesList = [
    { type: 'utilities', label: 'Utilities', desc: 'Gas, Water & Power info', color: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 border-amber-200', icon: Zap },
    { type: 'meter', label: 'Meter Scan', desc: 'Scan dials & submit readings', color: 'bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-600 border-indigo-200', icon: ShieldCheck },
    { type: 'payments', label: 'Payments', desc: 'Pay property & utility bills', color: 'bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 border-emerald-200', icon: CreditCard },
    { type: 'waste', label: 'Waste Collection', desc: 'Filing & schedule reminders', color: 'bg-gradient-to-br from-teal-50 to-emerald-100 text-teal-600 border-teal-200', icon: Trash2 },
    { type: 'transportation', label: 'Transportation', desc: 'Live buses & tickets booking', color: 'bg-gradient-to-br from-blue-50 to-sky-100 text-blue-600 border-blue-200', icon: Bus },
    { type: 'parking', label: 'Parking Bays', desc: 'Lock street & lot locations', color: 'bg-gradient-to-br from-red-50 to-rose-100 text-red-600 border-red-200', icon: MapPin },
    { type: 'health', label: 'Health Care', desc: 'Book consultations & air index', color: 'bg-gradient-to-br from-rose-50 to-pink-100 text-rose-600 border-rose-200', icon: HeartPulse },
    { type: 'housing', label: 'Housing Portal', desc: 'Social rentals waiting queues', color: 'bg-gradient-to-br from-orange-50 to-amber-100 text-orange-600 border-orange-200', icon: Building2 },
    { type: 'safety', label: 'Safety Concern', desc: 'Report potholes & live hazard SOS', color: 'bg-gradient-to-br from-rose-100 to-red-100 text-red-600 border-red-200', icon: ShieldAlert },
  ] as const;

  // Search logic
  const filteredServices = allServicesList.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto pb-6 font-sans">
      
      {/* 1. Welcomer Top Header */}
      <div className="px-4 pt-4 pb-3 bg-white flex justify-between items-center border-b border-slate-150 shrink-0">
        <div className="flex items-center space-x-3">
          <img 
            src={profile.avatarUrl} 
            alt="Citizen Profile Portrait" 
            className="w-10 h-10 rounded-full border border-slate-100 shadow-sm object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Good Morning</p>
            <h3 className="text-xs font-bold text-slate-800">{profile.name}</h3>
          </div>
        </div>

        {/* Live Weather Indicator / Notifs icon */}
        <div className="flex items-center space-x-2.5">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-700 block">Bengaluru • 24°C Clear</span>
            <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider block bg-emerald-50 px-2 py-0.5 rounded-full text-center">EXCELLENT AQI</span>
          </div>
          <button 
            onClick={onNotificationClick}
            id="btn_view_notifications_badge"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors relative"
          >
            <Sun className="w-4 h-4 text-amber-550 animate-spin" style={{ animationDuration: '45s' }} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-550 rounded-full border border-white animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Urgent Scrolling Bulletin Board notifications */}
        <div className="bg-blue-50/70 border border-blue-105 p-3.5 rounded-3xl flex items-start space-x-2.5 text-blue-900">
          <Sparkles className="w-4 h-4 shrink-0 text-blue-600 mt-0.5 animate-pulse" />
          <div className="flex-1 text-[11px] leading-relaxed">
            <p className="font-bold">City Maintenance Update</p>
            <p className="opacity-90">Sector 4 Clean Grid utility inspection is ongoing today. Standard rates are fully subsidized between 11:00 AM - 1:00 PM.</p>
          </div>
        </div>

        {/* 2. Passport Pass Digital Transit Card Preview */}
        <div className="bg-blue-600 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-650 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-6 translate-x-6">
            <Compass className="w-32 h-32" />
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[8px] font-mono tracking-widest text-blue-100 uppercase">SMART CITY DIGITAL PASS</p>
              <h4 className="text-xs font-bold text-white mt-0.5">{profile.citizenCardId}</h4>
            </div>
            <Ticket className="w-5 h-5 text-blue-200" />
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-blue-150 tracking-wider">E-Wallet Card Funds</p>
              <p className="text-xl font-bold text-white">₹{walletBalance.toFixed(2)}</p>
            </div>
            <button
              onClick={() => onSelectService('payments')}
              id="wallet_access_quick_btn"
              className="py-1 px-3 bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-bold rounded-xl transition"
            >
              Express Top Up
            </button>
          </div>
        </div>

        {/* QR Scanner Launch Widget */}
        <div className="bg-white border border-slate-200 rounded-3xl p-3.5 flex items-center justify-between shadow-3xs relative overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-850">Smart QR Scan Terminal</h4>
              <p className="text-[9px] text-slate-450 leading-tight">Settle local utility bills or tap transit gate kiosks instantly</p>
            </div>
          </div>
          <button
            onClick={handleOpenScanner}
            id="btn_open_qr_scanner"
            className="flex items-center space-x-1 py-1.5 px-3 bg-indigo-650 hover:bg-indigo-700 text-[10px] font-bold text-white rounded-2xl shadow-3xs transition-transform active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* 3. Search Services Inputs */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city systems (e.g. meter, water...)"
            className="w-full pl-9 pr-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* 4. Frequently Used Services - 3 Quick Hotkeys OR Interactive City View Map */}
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              {viewMode === 'quick' ? 'Frequently Used' : 'Interactive City View'}
            </h3>
            {/* Toggle Control */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-3xs">
              <button
                type="button"
                onClick={() => setViewMode('quick')}
                className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'quick'
                    ? 'bg-white text-blue-650 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Quick Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white text-indigo-650 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-855'
                }`}
              >
                City View
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'quick' ? (
              <motion.div
                key="quick-grid"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-3 gap-2"
              >
                {/* Quick action A: Submit readings */}
                <div 
                  onClick={() => onSelectService('meter')}
                  className="bg-white border border-slate-150 rounded-2xl p-3 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/25 active:scale-98 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5 border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">Quick Meter</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Submit Dials</p>
                </div>

                {/* Quick action B: Pay bill */}
                <div 
                  onClick={() => onSelectService('payments')}
                  className="bg-white border border-slate-150 rounded-2xl p-3 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/25 active:scale-98 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 border border-emerald-100">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">Direct Pay</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Settlements</p>
                </div>

                {/* Quick action C: Safety Hazard Report */}
                <div 
                  onClick={() => onSelectService('safety')}
                  className="bg-white border border-slate-150 rounded-2xl p-3 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/25 active:scale-98 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1.5 border border-rose-100">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">Report SOS</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Dispatch</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="city-map"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl p-3 border border-slate-200 shadow-3xs space-y-3 relative overflow-hidden"
              >
                {/* SVG Map Container */}
                <div className="relative h-44 w-full bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                    {/* Map Grid Pattern */}
                    <defs>
                      <pattern id="cityMapGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="1.5" cy="1.5" r="0.75" fill="#cbd5e1" opacity="0.4" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cityMapGrid)" />

                    {/* Scenic Waterway (River) */}
                    <path 
                      d="M -10,30 C 120,-10 180,110 410,130" 
                      fill="none" 
                      stroke="#bae6fd" 
                      strokeWidth="24" 
                      strokeLinecap="round" 
                      opacity="0.65" 
                    />
                    <path 
                      d="M -10,30 C 120,-10 180,110 410,130" 
                      fill="none" 
                      stroke="#e0f2fe" 
                      strokeWidth="12" 
                      strokeLinecap="round" 
                      opacity="0.85" 
                    />

                    {/* Parks / Forest Zones */}
                    <rect x="25" y="110" width="75" height="50" rx="10" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" opacity="0.9" />
                    <text x="62.5" y="138" textAnchor="middle" className="text-[7px] font-black fill-emerald-600/70 tracking-widest font-sans">GREEN SECTOR 4</text>

                    <rect x="290" y="20" width="85" height="40" rx="10" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" opacity="0.9" />
                    <text x="332.5" y="44" textAnchor="middle" className="text-[7px] font-black fill-emerald-600/70 tracking-widest font-sans">RESERVOIR PARK</text>

                    {/* Major Boulevards and Road Grids */}
                    {/* Main Boulevard */}
                    <path d="M 0,60 L 400,60" stroke="#f8fafc" strokeWidth="14" />
                    <path d="M 0,60 L 400,60" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="330" y="54" className="text-[6.5px] font-extrabold fill-slate-400 font-mono tracking-widest">MAIN BOULEVARD</text>

                    {/* Commercial Street */}
                    <path d="M 120,-10 L 120,190" stroke="#f8fafc" strokeWidth="14" />
                    <path d="M 120,-10 L 120,190" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="124" y="165" transform="rotate(-90 124 165)" className="text-[6.5px] font-extrabold fill-slate-400 font-mono tracking-widest">COMMERCIAL STREET</text>

                    {/* Pine Boulevard */}
                    <path d="M 0,140 L 400,140" stroke="#f8fafc" strokeWidth="14" />
                    <path d="M 0,140 L 400,140" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="330" y="134" className="text-[6.5px] font-extrabold fill-slate-400 font-mono tracking-widest">PINE BOULEVARD</text>

                    {/* Mini Landmark markers */}
                    <circle cx="120" cy="60" r="5" fill="#3b82f6" opacity="0.1" />
                    <circle cx="120" cy="60" r="2.5" fill="#3b82f6" />
                    <text x="120" y="51" textAnchor="middle" className="text-[6.5px] font-extrabold fill-blue-500/80 tracking-tight font-sans">MUNICIPAL KIOSK</text>

                    <circle cx="200" cy="110" r="4" fill="#8b5cf6" />
                    <text x="200" y="103" textAnchor="middle" className="text-[6px] font-extrabold fill-purple-500/80 tracking-tight font-sans">METRO STA.</text>
                  </svg>

                  {/* Active Service Request Map Pins (Overlaid with precise coordinates) */}
                  {requests.filter(r => r.status !== 'Completed').map((req) => {
                    const { x, y } = getRequestCoords(req);
                    
                    // Determine pin design by urgency
                    const urgencyColors = {
                      High: { bg: 'bg-rose-500', ring: 'bg-rose-400/35' },
                      Medium: { bg: 'bg-amber-500', ring: 'bg-amber-400/35' },
                      Low: { bg: 'bg-blue-500', ring: 'bg-blue-400/35' }
                    }[req.urgency] || { bg: 'bg-slate-500', ring: 'bg-slate-400/35' };

                    const isSelected = selectedRequestPin?.id === req.id;

                    return (
                      <div
                        key={req.id}
                        className="absolute cursor-pointer group"
                        style={{ left: `${(x / 400) * 100}%`, top: `${(y / 180) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        onClick={() => setSelectedRequestPin(isSelected ? null : req)}
                      >
                        {/* Pulse effect for outstanding issues */}
                        <div className={`absolute -inset-2 rounded-full ${urgencyColors.ring} animate-ping`} style={{ animationDuration: '2s' }} />

                        {/* Custom Pin Icon marker */}
                        <div className={`relative w-4 h-4 rounded-full ${urgencyColors.bg} border-2 border-white flex items-center justify-center shadow-md transition-all group-hover:scale-120 ${isSelected ? 'scale-125 ring-2 ring-indigo-500' : ''}`}>
                          <MapPin className="w-2.5 h-2.5 text-white" />
                        </div>

                        {/* Mini Tooltip on Hover */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                          {req.title}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state if zero active requests */}
                  {requests.filter(r => r.status !== 'Completed').length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/75 backdrop-blur-3xs p-4 text-center">
                      <Compass className="w-7 h-7 text-emerald-500 mb-1 animate-pulse" />
                      <p className="text-[10px] font-bold text-slate-700">All Municipal Systems Cleared</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">No active hazards or utility complaints on the grid.</p>
                    </div>
                  )}
                </div>

                {/* Selected Pin Detailed Drawer Info */}
                {selectedRequestPin ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          selectedRequestPin.urgency === 'High' ? 'bg-red-50 border-red-200 text-red-600' :
                          selectedRequestPin.urgency === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                          'bg-blue-50 border-blue-200 text-blue-600'
                        }`}>
                          {selectedRequestPin.urgency} Urgency
                        </span>
                        <h4 className="text-[11px] font-extrabold text-slate-800 mt-1.5">{selectedRequestPin.title}</h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400">{selectedRequestPin.referenceNo}</span>
                    </div>

                    <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-2">{selectedRequestPin.description}</p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-[9px]">
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Zone: {getRequestCoords(selectedRequestPin).road}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Status: <strong className="text-slate-700 uppercase">{selectedRequestPin.status}</strong></span>
                        <button
                          onClick={() => {
                            onSelectService(selectedRequestPin.serviceType);
                          }}
                          className="px-2.5 py-1 bg-indigo-550 hover:bg-indigo-650 text-white font-extrabold rounded-lg shadow-3xs cursor-pointer transition-colors"
                        >
                          Manage Sector
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[9px] text-slate-400 font-medium">
                      Select any active <span className="text-indigo-500 font-bold">radar pin</span> on the map to query telemetry data & dispatch status.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. All Services Grid (Contains all 9 demanded fields) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-0.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">All Smart City Services</h3>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-mono">9 SECTORS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredServices.map((srv) => {
              const IconComp = srv.icon;
              
              // Top border color accents for a premium look
              const topAccentColor = {
                utilities: 'border-t-amber-400',
                meter: 'border-t-indigo-400',
                payments: 'border-t-emerald-400',
                waste: 'border-t-teal-400',
                transportation: 'border-t-blue-400',
                parking: 'border-t-rose-400',
                health: 'border-t-pink-400',
                housing: 'border-t-orange-400',
                safety: 'border-t-red-400'
              }[srv.type] || 'border-t-slate-200';

              // Hover effect tints
              const hoverColorClass = {
                utilities: 'hover:bg-amber-50/10 hover:border-amber-300/40 hover:shadow-xs',
                meter: 'hover:bg-indigo-50/10 hover:border-indigo-300/40 hover:shadow-xs',
                payments: 'hover:bg-emerald-50/10 hover:border-emerald-300/40 hover:shadow-xs',
                waste: 'hover:bg-teal-50/10 hover:border-teal-300/40 hover:shadow-xs',
                transportation: 'hover:bg-blue-50/10 hover:border-blue-300/40 hover:shadow-xs',
                parking: 'hover:bg-rose-50/10 hover:border-rose-300/40 hover:shadow-xs',
                health: 'hover:bg-pink-50/10 hover:border-pink-300/40 hover:shadow-xs',
                housing: 'hover:bg-orange-50/10 hover:border-orange-300/40 hover:shadow-xs',
                safety: 'hover:bg-red-50/10 hover:border-red-300/40 hover:shadow-xs'
              }[srv.type] || 'hover:bg-slate-50';

              return (
                <div
                  key={srv.type}
                  onClick={() => onSelectService(srv.type)}
                  className={`bg-white border-x border-b border-t-2 border-slate-150 ${topAccentColor} ${hoverColorClass} rounded-2xl p-3 flex flex-col justify-between cursor-pointer active:scale-98 transition-all duration-200 shadow-3xs`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-1.5 rounded-xl border shadow-3xs ${srv.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-[11px] xs:text-xs font-black tracking-tight text-slate-800 truncate" title={srv.label}>
                      {srv.label}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5 line-clamp-1 leading-normal">
                      {srv.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No matching utilities or municipal systems found.</p>
          )}
        </div>

      </div>

      {/* 6. QR Scanner Absolute Slide-up Panel */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-slate-950 flex flex-col z-50 text-white overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-850 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-black tracking-tight uppercase">Smart QR Terminal</span>
              </div>
              <button
                onClick={handleCloseScanner}
                id="btn_close_qr_scanner"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] uppercase font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Main Viewfinder Section */}
            <div className="flex-1 relative bg-black flex flex-col overflow-y-auto">
              
              <div className="w-full aspect-[4/3] bg-slate-950 relative overflow-hidden shrink-0">
                {/* Real Video or fallbacks */}
                {!cameraError && videoStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900/90 flex flex-col items-center justify-center text-center p-4">
                    <Camera className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">SECURE CAMERA VIEWPORT</span>
                    <span className="text-[8px] text-slate-500 max-w-xs mt-1">
                      {cameraError ? `System code: ${cameraError}` : 'Hardware feed starting up...'}
                    </span>
                    <span className="text-[9px] text-indigo-455 font-bold bg-indigo-950/80 border border-indigo-900/50 px-2 py-1 rounded-lg mt-3">
                      Sandbox Simulator Active
                    </span>
                  </div>
                )}

                {/* Laser Sweep & Bounding corner targets */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-white/20 rounded-2xl relative flex items-center justify-center">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 -mt-0.5 -ml-0.5 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 -mt-0.5 -mr-0.5 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 -mb-0.5 -ml-0.5 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500 -mb-0.5 -mr-0.5 rounded-br-lg" />

                    {scanStatus === 'scanning' && (
                      <motion.div
                        initial={{ top: '5%' }}
                        animate={{ top: '90%' }}
                        transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                        className="absolute inset-x-2 h-0.5 bg-indigo-500 shadow-[0_0_12px_#6366f1]"
                      />
                    )}
                  </div>
                </div>

                {/* Overlaid Scanning text indicator */}
                <div className="absolute top-3 left-3 bg-black/75 px-2.5 py-1 rounded-full border border-white/10 text-[8px] font-mono tracking-widest text-indigo-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span>{scanStatus.toUpperCase()} VIEWPORT_FEED</span>
                </div>
              </div>

              {/* Error messages from checkout actions */}
              {scanErrorMsg && (
                <div className="m-3 p-3 bg-rose-950/80 border border-rose-900 rounded-2xl flex items-start space-x-2 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-rose-250 leading-normal font-sans font-bold">{scanErrorMsg}</p>
                </div>
              )}

              {/* Status workflow screens */}
              <div className="p-4 flex-1 space-y-4">
                {scanStatus === 'scanning' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Simulate Scanning targets</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed -mt-1">
                      Tap one of the quick municipal pass targets below to simulate aligning the hardware camera reader with a real QR code:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => simulateScanTarget('electricity_bill')}
                        className="p-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-2xl text-left text-xs transition duration-200 active:scale-97 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-amber-550 mb-1" />
                        <p className="font-extrabold text-slate-200 text-[10px]">Electricity QR</p>
                        <p className="text-[8px] text-slate-500 font-mono">Bill settlement</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => simulateScanTarget('water_bill')}
                        className="p-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-2xl text-left text-xs transition duration-200 active:scale-97 cursor-pointer"
                      >
                        <Droplet className="w-4 h-4 text-blue-400 mb-1" />
                        <p className="font-extrabold text-slate-200 text-[10px]">Water Bill QR</p>
                        <p className="text-[8px] text-slate-500 font-mono">Bill settlement</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => simulateScanTarget('metro_fare')}
                        className="p-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-2xl text-left text-xs transition duration-200 active:scale-97 cursor-pointer"
                      >
                        <Bus className="w-4 h-4 text-indigo-400 mb-1" />
                        <p className="font-extrabold text-slate-200 text-[10px]">Subway Rider QR</p>
                        <p className="text-[8px] text-slate-500 font-mono">Transport terminal</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => simulateScanTarget('wifi_terminal')}
                        className="p-2.5 bg-slate-900/90 border border-slate-850 border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-2xl text-left text-xs transition duration-200 active:scale-97 cursor-pointer"
                      >
                        <Wifi className="w-4 h-4 text-emerald-400 mb-1" />
                        <p className="font-extrabold text-slate-200 text-[10px]">Public Wi-Fi QR</p>
                        <p className="text-[8px] text-slate-500 font-mono">Smart info kiosk</p>
                      </button>
                    </div>
                  </div>
                )}

                {scanStatus === 'detected' && decodedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-850 rounded-3xl p-4 space-y-3 shadow-md"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-900/60 flex items-center justify-center text-indigo-400 shrink-0">
                        {decodedData.type === 'bill' ? <CreditCard className="w-4 h-4" /> : decodedData.type === 'transit' ? <Ticket className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">DECODED MUNICIPAL PAYLOAD</span>
                        <h4 className="text-[11px] font-extrabold text-slate-105 -mt-0.5">{decodedData.title}</h4>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-800 text-[10px] space-y-2 pt-1 font-sans">
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-slate-400">Terminal Reference</span>
                        <span className="font-mono text-slate-200 font-semibold">{decodedData.refNo}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-slate-400">Outstanding Fare / Charge</span>
                        <span className="font-extrabold text-white text-xs">₹{decodedData.amount.toFixed(2)}</span>
                      </div>
                      <div className="py-2">
                        <p className="text-slate-400 text-[9px] leading-relaxed font-sans">{decodedData.description}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setScanStatus('scanning');
                          setScanErrorMsg(null);
                          setDecodedData(null);
                        }}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 text-[10px] font-bold rounded-xl transition duration-150 cursor-pointer"
                      >
                        Rescan
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAction}
                        className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded-xl shadow-sm transition duration-150 active:scale-97 cursor-pointer"
                      >
                        {decodedData.amount > 0 ? `Authorize ₹${decodedData.amount.toFixed(2)}` : 'Connect Kiosk'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {scanStatus === 'success' && decodedData && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-950/80 border border-emerald-900/60 rounded-3xl p-5 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-450">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider font-mono font-bold">Authorization Cleared</h4>
                      <p className="text-[10px] text-emerald-200 font-medium">
                        {decodedData.type === 'bill' 
                          ? `Utility bill settled! Received receipt reference ${decodedData.refNo}.` 
                          : decodedData.type === 'transit'
                          ? `Transit fare deducted. Subway entry gate unlocked.`
                          : `Connected to Smart public Wi-Fi access point successfully.`}
                      </p>
                    </div>
                    <p className="text-[8px] text-emerald-500 font-mono">CONFIRMATION TOKEN DISPATCHED SECURELY</p>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
