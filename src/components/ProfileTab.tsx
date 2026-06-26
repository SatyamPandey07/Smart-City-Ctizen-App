/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, Smartphone, CreditCard, LogOut, CheckCircle2, 
  MapPin, Bell, Eye, EyeOff, Contact, ToggleLeft, ToggleRight, Sparkles,
  Wifi, HelpCircle, Mail, Phone, RefreshCw, Zap, Droplet
} from 'lucide-react';
import { CitizenProfile } from '../types';

interface ProfileTabProps {
  profile: CitizenProfile;
  walletBalance: number;
  onTopUpWallet: (amount: number) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<CitizenProfile>) => void;
}

export default function ProfileTab({
  profile,
  walletBalance,
  onTopUpWallet,
  onLogout,
  onUpdateProfile,
}: ProfileTabProps) {
  const [success, setSuccess] = useState<string | null>(null);
  
  // App settings state
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [biometricSec, setBiometricSec] = useState(true);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile.name);
  const [newPhone, setNewPhone] = useState(profile.phone);
  const [newAddress, setNewAddress] = useState(profile.address);

  const triggerProfileToast = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: newName,
      phone: newPhone,
      address: newAddress
    });
    setIsEditing(false);
    triggerProfileToast('Legal passport parameters updated successfully!');
  };

  const simulateNfcScan = () => {
    triggerProfileToast('Simulated NFC Digital Wave: Reader Beeps (Smart Gate opens!) 🔊');
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4 font-sans">
      
      {/* Toast Alert */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 inset-x-4 bg-blue-600 text-white rounded-2xl p-3 shadow-md z-50 text-xs font-bold flex items-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Profile Details Edit Form/Card */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-4 border border-slate-200 space-y-3.5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700">Modify Passport Parameters</h3>
          
          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Legal Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs mt-1 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Contact Phone</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs mt-1 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Property Address</label>
              <input
                type="text"
                required
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs mt-1 text-slate-800"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save_profile_btn"
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <img
              src={profile.avatarUrl}
              alt="Citizen Avatar"
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-850">{profile.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono">{profile.email}</p>
              <p className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="line-clamp-1">{profile.address}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            id="edit_profile_btn"
            className="text-[10px] text-blue-600 hover:underline font-bold"
          >
            Edit Info
          </button>
        </div>
      )}

      {/* Digital NFC Smart City Pass Card representation */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={simulateNfcScan}
        className="bg-blue-600 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-650 text-white rounded-3xl p-5 shadow-sm cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-4 -translate-y-4"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full transform -translate-x-4 translate-y-4"></div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
            <span className="text-[8px] font-mono tracking-widest text-blue-100 uppercase">OFFICIAL CITIZEN ID</span>
          </div>
          <Wifi className="w-4 h-4 text-blue-200 relative rotate-90" />
        </div>

        <div className="text-base font-bold tracking-tight mb-4 font-mono">
          {profile.name} / CIT-78401
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] opacity-70 font-mono">SECURE WALLET PASSPORT CARD</p>
            <p className="text-[10px] font-bold">SMART DIGITAL MUNICIPAL PASS</p>
          </div>
          {/* Custom vector QR Code illustration */}
          <div className="bg-white p-1 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="6" height="6" fill="black" />
              <rect x="18" width="6" height="6" fill="black" />
              <rect y="18" width="6" height="6" fill="black" />
              <rect x="8" y="8" width="8" height="8" fill="black" opacity="0.8" />
              <rect x="20" y="20" width="4" height="4" fill="black" />
              <rect x="2" y="10" width="2" height="2" fill="black" />
              <rect x="14" y="2" width="2" height="2" fill="black" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Meter Subscriptions accounts linking */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5 font-mono">Registered Utility Meters</h4>
        <div className="divide-y divide-slate-100 text-xs text-slate-700">
          <div className="py-2.5 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-550" />
              <span className="font-medium text-slate-655">Electricity Multi-Grid:</span>
            </div>
            <span className="font-mono font-bold text-slate-800">{profile.electricityAccountNum}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-655">Sewerage & Clean Water:</span>
            </div>
            <span className="font-mono font-bold text-slate-800">{profile.waterAccountNum}</span>
          </div>
        </div>
      </div>

      {/* App preferences settings switches */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5 font-mono">Notification Toggles</h4>

        <div className="divide-y divide-slate-100 text-slate-700">
          <div className="py-2.5 flex justify-between items-center">
            <div className="space-y-0.5">
              <h5 className="font-bold text-slate-800">Real-time Push Alerts</h5>
              <p className="text-[10px] text-slate-400">Receive meter reminders & parking slips</p>
            </div>
            <button onClick={() => setPushNotifs(!pushNotifs)} className="text-slate-400">
              {pushNotifs 
                ? <ToggleRight className="w-7 h-7 text-blue-600 transition-all" /> 
                : <ToggleLeft className="w-7 h-7 text-slate-200 transition-all" />}
            </button>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div className="space-y-0.5">
              <h5 className="font-bold text-slate-800">Emergency SMS Broadcast</h5>
              <p className="text-[10px] text-slate-400">Government hazard alerts on SMS</p>
            </div>
            <button onClick={() => setSmsNotifs(!smsNotifs)} className="text-slate-400">
              {smsNotifs 
                ? <ToggleRight className="w-7 h-7 text-blue-600 transition-all" /> 
                : <ToggleLeft className="w-7 h-7 text-slate-200 transition-all" />}
            </button>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div className="space-y-0.5">
              <h5 className="font-bold text-slate-800">Active Haptic Simulations</h5>
              <p className="text-[10px] text-slate-400">Trigger mock phone vibrations on scanning</p>
            </div>
            <button onClick={() => setHapticFeedback(!hapticFeedback)} className="text-slate-400">
              {hapticFeedback 
                ? <ToggleRight className="w-7 h-7 text-blue-600 transition-all" /> 
                : <ToggleLeft className="w-7 h-7 text-slate-200 transition-all" />}
            </button>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div className="space-y-0.5">
               <h5 className="font-bold text-slate-800">Biometric ID Fingerprint</h5>
               <p className="text-[10px] text-slate-400">Use FaceID / TouchID simulated unlock</p>
            </div>
            <button onClick={() => setBiometricSec(!biometricSec)} className="text-slate-400">
              {biometricSec 
                ? <ToggleRight className="w-7 h-7 text-blue-600 transition-all" /> 
                : <ToggleLeft className="w-7 h-7 text-slate-200 transition-all" />}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Logout action */}
      <button
        onClick={onLogout}
        id="btn_logout_action"
        className="w-full py-2.5 rounded-2xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs font-mono tracking-wider transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>LOCK & EVACUATE PASSPORT ID</span>
      </button>

    </div>
  );
}
