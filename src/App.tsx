/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, BarChart3, History, User, Smartphone, Sparkles, LogIn,
  Wifi, Battery, ShieldAlert, X, ChevronRight, CheckCircle2,
  AlertOctagon, Eye, Moon, Sun, SmartphoneIcon, Circle, ToggleLeft, PhoneCall
} from 'lucide-react';
import { CitizenProfile, ServiceRequest, BillRecord, NotificationItem, ServiceType } from './types';
import LoginScreen from './components/LoginScreen';
import HomeTab from './components/HomeTab';
import DashboardTab from './components/DashboardTab';
import ActivityTab from './components/ActivityTab';
import ProfileTab from './components/ProfileTab';
import ServicePanels from './components/ServicePanels';

// Initial pre-populated data to make the sandbox immediately rich and interactive
const DEFAULT_BILLS: BillRecord[] = [
  { id: 'b1', title: 'Power Grid Account (June)', type: 'Electricity', amount: 35.40, dueDate: '2026-06-28', isPaid: false, usageVal: 142, unit: 'kWh' },
  { id: 'b2', title: 'Water & Sewerage Charge (June)', type: 'Water', amount: 16.20, dueDate: '2026-06-30', isPaid: false, usageVal: 195, unit: 'Liters' },
  { id: 'b3', title: 'High-Speed Gas Link (May)', type: 'Gas', amount: 22.10, dueDate: '2026-05-30', isPaid: true, paidDate: '2026-05-28', usageVal: 45, unit: 'Units' },
];

const DEFAULT_REQUESTS: ServiceRequest[] = [
  { id: 'r1', serviceType: 'waste', title: 'Missed Recycling Recycle Collection', description: 'Household blue recycling bins were missed during Sector 4 commercial sweeps on Commercial St.', status: 'Pending', date: '2026-06-20', urgency: 'Medium', referenceNo: 'SR-92841-A' },
  { id: 'r2', serviceType: 'safety', title: 'Broken Lamp: Main Boulevard #102', description: 'Bulb is damaged and sparking intermittently during heavy winds. Risk to pedestrians.', status: 'In Progress', date: '2026-06-19', urgency: 'High', referenceNo: 'SR-11029-X' },
  { id: 'r3', serviceType: 'parking', title: 'Commercial St. Smart Bay Reservation', description: 'Parking reserved for vehicle license plate 7XYZ99 for 2 hours.', status: 'Completed', date: '2026-06-21', urgency: 'Low', referenceNo: 'SR-38291-P', specificDetails: { 'Vehicle Plate': '7XYZ99', 'Duration Hours': 2, 'Total Reserved Fee': '₹5.00' } }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Water Bill Issued', body: 'A municipal water utility statement of ₹16.20 is due for processing.', time: '2 hrs ago', isRead: false, category: 'payments' },
  { id: 'n2', title: 'Safety Hazard Dispatch', body: 'Municipal patrol officer has been dispatched to inspect sparking Streetlight #102.', time: '5 hrs ago', isRead: false, category: 'safety' },
  { id: 'n3', title: 'Welcome to Smart City Passport', body: 'Universal authentication successful. Enjoy automated, eco-subsidized civic management services.', time: '1 day ago', isRead: true, category: 'general' }
];

export default function App() {
  // Mobile device simulation state
  const [osSkin, setOsSkin] = useState<'iOS' | 'Android'>('iOS');
  const [deviceColor, setDeviceColor] = useState<'slate' | 'gold' | 'silver'>('slate');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [statusBarTime, setStatusBarTime] = useState<string>('09:41');

  // Bottom tab routing state
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'activity' | 'profile'>('home');
  const [activeService, setActiveService] = useState<ServiceType | null>(null);

  // Core citizen authentication state (null means locked passport screen)
  const [profile, setProfile] = useState<CitizenProfile | null>(() => {
    const cached = localStorage.getItem('smartcity_user_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.name === 'Alex Mercer' || !parsed.name || parsed.name === 'Jane Doe')) {
          parsed.name = 'Satyam Pandey';
          localStorage.setItem('smartcity_user_profile', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Smart city listings & transaction records state
  const [bills, setBills] = useState<BillRecord[]>(() => {
    const cached = localStorage.getItem('smartcity_bills');
    if (cached) return JSON.parse(cached);
    return DEFAULT_BILLS;
  });

  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const cached = localStorage.getItem('smartcity_requests');
    if (cached) return JSON.parse(cached);
    return DEFAULT_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const cached = localStorage.getItem('smartcity_notifications');
    if (cached) return JSON.parse(cached);
    return DEFAULT_NOTIFICATIONS;
  });

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Dynamic system/island alert banners popping up inside phone notch
  const [systemAlert, setSystemAlert] = useState<{ title: string; desc: string } | null>(null);

  // Tick cell clock
  useEffect(() => {
    const tickTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setStatusBarTime(`${hrs}:${mins}`);
    };
    tickTime();
    const timer = setInterval(tickTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize state outputs to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('smartcity_user_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('smartcity_user_profile');
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('smartcity_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('smartcity_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('smartcity_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // System dynamic island alert dispatcher helper
  const triggerSystemAlert = (title: string, desc: string) => {
    setSystemAlert({ title, desc });
    setTimeout(() => {
      setSystemAlert(null);
    }, 4500);
  };

  // Actions handlers
  const handleLogin = (userProfile: CitizenProfile) => {
    setProfile(userProfile);
    triggerSystemAlert('Passport Unlocked', `Signed in as ${userProfile.name}`);
  };

  const handleLogout = () => {
    setProfile(null);
    setActiveTab('home');
    setActiveService(null);
    setShowNotificationsModal(false);
    localStorage.removeItem('smartcity_user_profile');
  };

  const handleUpdateProfile = (updated: Partial<CitizenProfile>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      ...updated,
    });
  };

  const handlePayBill = (billId: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          // Subtract from balance
          if (profile) {
            setProfile({
              ...profile,
              balance: profile.balance - b.amount,
            });
          }
          return { ...b, isPaid: true, paidDate: new Date().toISOString().split('T')[0] };
        }
        return b;
      })
    );
    // Push confirmation notification
    const matched = bills.find((b) => b.id === billId);
    if (matched) {
      const newNotif: NotificationItem = {
        id: `n-pay-${Date.now()}`,
        title: 'Settled Successfully',
        body: `Paid ₹${matched.amount.toFixed(2)} for ${matched.type} utilities. Receipt cleared in activity track.`,
        time: 'Just now',
        isRead: false,
        category: 'payments',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      triggerSystemAlert('Payment Verified', `₹${matched.amount.toFixed(2)} municipal credit settled.`);
    }
  };

  const handleTopUpWallet = (amount: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      balance: profile.balance + amount,
    });
    if (amount > 0) {
      const newNotif: NotificationItem = {
        id: `n-topup-${Date.now()}`,
        title: 'Pass Top Up Received',
        body: `Topped up ₹${amount.toFixed(2)} to Citizen Pay Account using Visa core integration.`,
        time: 'Just now',
        isRead: false,
        category: 'payments',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      triggerSystemAlert('Wallet Topped Up', `₹${amount.toFixed(2)} credited to virtual pass card.`);
    }
  };

  const handleSubmitRequest = (requestData: Partial<ServiceRequest>) => {
    const referenceNo = `SR-${Math.floor(10000 + Math.random() * 90000)}-NY`;
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      serviceType: requestData.serviceType || 'safety',
      title: requestData.title || 'Filing Service Request',
      description: requestData.description || 'No detailed log provided.',
      status: requestData.status || 'Pending',
      date: new Date().toISOString().split('T')[0],
      urgency: requestData.urgency || 'Medium',
      referenceNo,
      specificDetails: requestData.specificDetails,
    };

    setRequests((prev) => [newReq, ...prev]);

    // Push notification response simulating dispatcher assignment
    const newNotif: NotificationItem = {
      id: `n-req-${Date.now()}`,
      title: 'Filing Dispatched',
      body: `Your smart request for ${newReq.serviceType === 'waste' ? 'Waste Pickup' : newReq.serviceType === 'safety' ? 'Safety dispatch' : newReq.serviceType} (${referenceNo}) has been successfully submitted.`,
      time: 'Just now',
      isRead: false,
      category: newReq.serviceType,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    triggerSystemAlert('Filing Submitted', `Municipal dispatch: Issued Ref ${referenceNo}`);
    setActiveService(null);
  };

  const handleCancelRequest = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    setRequests((prev) => prev.filter((r) => r.id !== requestId));

    const newNotif: NotificationItem = {
      id: `n-cancel-${Date.now()}`,
      title: 'Filing Retracted',
      body: `Filing reference ${target.referenceNo} for ${target.title} was cancelled by citizen action.`,
      time: 'Just now',
      isRead: false,
      category: target.serviceType,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    triggerSystemAlert('Filing Retracted', `Filing reference ${target.referenceNo} deleted.`);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 flex flex-col md:flex-row justify-center items-center py-6 px-4 md:px-12 gap-8`}>
      
      {/* LEFT SIDE: Professional informational workspace layout */}
      <div className="max-w-md space-y-5 flex-1 p-2">
        <div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
            Smart City Platform
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-slate-800 dark:text-slate-100">
            MetroConnect Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 lines-relaxed leading-relaxed">
            A Clean & Minimalist platform for smart city services. Connect utility meters, process secured digital payments, inspect real-time transit grids, and report safety hazards to the municipal dispatchers.
          </p>
        </div>

        {/* Sandbox controls panel */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sandbox Controls</h3>
          
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-355">
            {/* Skin Selector */}
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-slate-400">Device Interface:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setOsSkin('iOS')}
                  className={`py-1 px-3 rounded-lg font-bold transition-all text-[11px] ${osSkin === 'iOS' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                >
                  iOS Classic
                </button>
                <button
                  onClick={() => setOsSkin('Android')}
                  className={`py-1 px-3 rounded-lg font-bold transition-all text-[11px] ${osSkin === 'Android' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                >
                  Android
                </button>
              </div>
            </div>

            {/* Device Colors */}
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-slate-400">Chassis Color:</span>
              <div className="flex gap-1.5">
                {[
                  { key: 'slate', color: 'bg-slate-700' },
                  { key: 'gold', color: 'bg-amber-100' },
                  { key: 'silver', color: 'bg-slate-200' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setDeviceColor(item.key as any)}
                    className={`w-5 h-5 rounded-full border-2 ${item.color} ${deviceColor === item.key ? 'border-blue-600' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-slate-400">Sandbox Theme:</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 hover:dark:bg-slate-700 transition flex items-center gap-1 font-bold text-[10px]"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>LIGHT MINIMAL</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-500" />
                    <span>DARK SLATE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sandbox Status Quick Stats Tracker widget */}
        <div className="p-3.5 bg-blue-50/55 dark:bg-slate-900/60 rounded-3xl border border-blue-105 dark:border-slate-800 text-blue-900 dark:text-slate-300 text-xs flex justify-between space-x-3 items-center shadow-xs">
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Durable Cache Active</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Transactions & meter records persist automatically in the virtual sandbox state.</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
        </div>
      </div>

      {/* RIGHT SIDE: Gorgeous Interactive Mobile Device Simulator Frame */}
      <div className="flex-1 max-w-sm flex justify-center py-2 relative">
        <div 
          className={`relative border-8 ${
            deviceColor === 'gold' ? 'border-amber-250 bg-amber-250 bg-opacity-70 ring-amber-300 shadow-amber-400/25' : 
            deviceColor === 'silver' ? 'border-gray-200 bg-gray-200 ring-gray-150 shadow-gray-250/25' : 
            'border-slate-800 bg-slate-800 ring-slate-750 shadow-slate-900/30'
          } rounded-[48px] w-full aspect-[9/19] max-w-[365px] h-[760px] ring-4 shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        >
          {/* Simulated Outer Device Speaker Grill and notch details */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-40 h-5 bg-black rounded-full z-45 flex items-center justify-center">
            {/* Notch dynamic sound indicator or dynamic island widget */}
            {systemAlert ? (
              <motion.div
                initial={{ width: '40%', scale: 0.8 }}
                animate={{ width: '92%', scale: 1 }}
                className="bg-black text-[9px] text-white py-1 px-3 rounded-full flex justify-between items-center gap-1 z-50 h-full overflow-hidden"
              >
                <div className="flex items-center space-x-1.5 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <span className="font-black tracking-tight truncate">{systemAlert.title}</span>
                </div>
                <span className="opacity-80 truncate text-[8px]">{systemAlert.desc}</span>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
              </div>
            )}
          </div>

          {/* SIMULATED DEVICE SCREEN CANVAS */}
          <div className={`flex-1 bg-white flex flex-col relative overflow-hidden ${osSkin === 'iOS' ? 'font-sans' : 'font-sans'}`}>
            
            {/* Common Status Bar Panel (Clock, Wifi, Cellular, Power) */}
            <div className="h-10 px-6 pt-3 flex justify-between items-center bg-white border-b border-gray-50 text-[11px] font-bold text-gray-800 shrink-0 select-none z-40">
              <span className="font-mono">{statusBarTime}</span>
              
              <div className="flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-gray-800" />
                <span className="text-[10px] font-sans tracking-tight">5G</span>
                <div className="flex items-center">
                  <Battery className="w-4 h-4 text-gray-800" />
                  <span className="text-[9px] ml-0.5 relative -top-0.5">84%</span>
                </div>
              </div>
            </div>

            {/* SCREEN VIEW SWITCHER */}
            {!profile ? (
              <LoginScreen onLogin={handleLogin} />
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Switch Rendered Tab */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                  <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="flex-1 flex flex-col overflow-hidden"
                      >
                        <HomeTab
                          profile={profile}
                          onSelectService={(srv) => {
                            setActiveService(srv);
                          }}
                          walletBalance={profile.balance}
                          unreadCount={unreadNotifsCount}
                          onNotificationClick={() => setShowNotificationsModal(true)}
                          bills={bills}
                          onPayBill={handlePayBill}
                          onTopUpWallet={handleTopUpWallet}
                          requests={requests}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'dashboard' && (
                      <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="flex-1 flex flex-col overflow-hidden"
                      >
                        <DashboardTab
                          bills={bills}
                          requests={requests}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'activity' && (
                      <motion.div
                        key="activity"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="flex-1 flex flex-col overflow-hidden"
                      >
                        <ActivityTab
                          requests={requests}
                          onCancelRequest={handleCancelRequest}
                          onSelectService={(srv) => {
                            setActiveService(srv);
                          }}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'profile' && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="flex-1 flex flex-col overflow-hidden"
                      >
                        <ProfileTab
                          profile={profile}
                          walletBalance={profile.balance}
                          onTopUpWallet={handleTopUpWallet}
                          onLogout={handleLogout}
                          onUpdateProfile={handleUpdateProfile}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ACTIVE OVERLAY: SERVICE SECTORS POPUP SHEET */}
                <AnimatePresence>
                  {activeService && (
                    <ServicePanels
                      serviceType={activeService}
                      onClose={() => setActiveService(null)}
                      bills={bills}
                      onPayBill={handlePayBill}
                      walletBalance={profile.balance}
                      onTopUpWallet={handleTopUpWallet}
                      onSubmitRequest={handleSubmitRequest}
                    />
                  )}
                </AnimatePresence>

                {/* BOTTOM SMARTPHONE IN-APP NAVIGATION RAIL */}
                <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-1 shadow-md shrink-0 z-20 select-none">
                  
                  <button
                    onClick={() => { setActiveTab('home'); setActiveService(null); }}
                    id="nav_btn_home"
                    className="flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer"
                  >
                    <div className={`p-1 px-3.5 rounded-full transition-all duration-200 ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-650 shadow-3xs border border-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Home className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 transition-colors duration-200 ${activeTab === 'home' ? 'text-indigo-700 font-black' : 'text-slate-400'}`}>Home</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('dashboard'); setActiveService(null); }}
                    id="nav_btn_dashboard"
                    className="flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer"
                  >
                    <div className={`p-1 px-3.5 rounded-full transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-650 shadow-3xs border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
                      <BarChart3 className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>Stats</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('activity'); setActiveService(null); }}
                    id="nav_btn_activity"
                    className="flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer"
                  >
                    <div className={`p-1 px-3.5 rounded-full transition-all duration-200 relative ${activeTab === 'activity' ? 'bg-blue-50 text-blue-650 shadow-3xs border border-blue-100' : 'text-slate-400 hover:text-slate-600'}`}>
                      <History className="w-4.5 h-4.5" />
                      {requests.filter(r => r.status === 'Pending').length > 0 && (
                        <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 transition-colors duration-200 ${activeTab === 'activity' ? 'text-blue-700 font-black' : 'text-slate-400'}`}>Activity</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('profile'); setActiveService(null); }}
                    id="nav_btn_profile"
                    className="flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer"
                  >
                    <div className={`p-1 px-3.5 rounded-full transition-all duration-200 ${activeTab === 'profile' ? 'bg-purple-50 text-purple-650 shadow-3xs border border-purple-100' : 'text-slate-400 hover:text-slate-600'}`}>
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 transition-colors duration-200 ${activeTab === 'profile' ? 'text-purple-700 font-black' : 'text-slate-400'}`}>Profile</span>
                  </button>

                </div>

                {/* NATIVE OPERATIVE SWIPE BAR (iOS Frame Sweep) */}
                {osSkin === 'iOS' ? (
                  <div className="h-4 bg-white flex justify-center items-center shrink-0 w-full z-20">
                    <div className="w-28 h-1 bg-gray-300 rounded-full"></div>
                  </div>
                ) : (
                  /* Android softkeys simulation */
                  <div className="h-6 bg-black text-gray-400 flex justify-around items-center shrink-0 w-full z-20 font-mono text-[10px] select-none">
                    <button onClick={() => { setActiveService(null); }} className="p-1 font-bold">◁</button>
                    <button onClick={() => { setActiveTab('home'); setActiveService(null); }} className="w-2.5 h-2.5 rounded-full border border-gray-400"></button>
                    <button onClick={() => { setActiveTab('dashboard'); }} className="w-2.5 h-2.5 border border-gray-400 rounded-sm"></button>
                  </div>
                )}

              </div>
            )}

            {/* NOTIFICATIONS BOARD MODAL SYSTEM */}
            <AnimatePresence>
              {showNotificationsModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end"
                >
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="bg-white rounded-t-2xl max-h-[80%] flex flex-col overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-xs font-bold text-slate-805">Municipal Inbox Alerts</h3>
                        <p className="text-[9px] text-slate-500 font-mono">Total of {notifications.length} alerts</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { handleMarkNotificationsRead(); triggerSystemAlert('Marked Read', 'Inbox fully cleared.'); }}
                          id="btn_read_all_notifs"
                          className="text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          Mark Read
                        </button>
                        <button
                          onClick={() => setShowNotificationsModal(false)}
                          className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 space-y-1 ${!n.isRead ? 'bg-blue-50/30' : 'bg-white'}`}>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                            <span className="text-[9px] font-mono text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">{n.body}</p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="p-8 text-center text-xs text-gray-400">
                          Municipal alert streams are currently empty.
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 bg-white border-t border-gray-100 text-center shrink-0">
                        <button
                          onClick={handleClearNotifications}
                          id="btn_clear_notifs"
                          className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-lg"
                        >
                          Clear Alert Logs
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

    </div>
  );
}
