/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Smartphone, Key, UserIcon, ArrowRight, Sparkles, Building2, Eye, EyeOff, Fingerprint, Loader2, Camera, CheckCircle2, Scan } from 'lucide-react';
import { CitizenProfile } from '../types';

interface LoginScreenProps {
  onLogin: (profile: CitizenProfile) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('citizen@smartcity.gov');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Jane Doe');
  const [address, setAddress] = useState('1402 Oakridge Ave, Sector 4');
  const [showPassword, setShowPassword] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Simulated FaceID scan states
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [faceScanMessage, setFaceScanMessage] = useState('');
  const [faceScanStep, setFaceScanStep] = useState(0); // 0: init, 1: scanning, 2: matching, 3: success

  const handleFaceIDTrigger = () => {
    if (isFaceScanning) return;
    setIsFaceScanning(true);
    setFaceScanStep(0);
    setFaceScanMessage('Connecting to secure FaceID hardware module...');

    setTimeout(() => {
      setFaceScanStep(1);
      setFaceScanMessage('Scanning 3D facial mesh vectors...');
      
      setTimeout(() => {
        setFaceScanStep(2);
        setFaceScanMessage('Verifying digital identity passport signature...');

        setTimeout(() => {
          setFaceScanStep(3);
          setFaceScanMessage('Authentication validated! Access granted.');

          setTimeout(() => {
            setIsFaceScanning(false);
            const mockProfile: CitizenProfile = {
              name: isRegister ? name : 'Satyam Pandey',
              email: email,
              phone: '+1 (555) 382-9011',
              address: isRegister ? address : '2405 Pine Boulevard, Sector 4-A',
              citizenCardId: 'CIT-78401-NY',
              balance: 45.50,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              waterAccountNum: 'W-38291-72',
              electricityAccountNum: 'E-94827-01'
            };
            onLogin(mockProfile);
          }, 800);
        }, 1200);
      }, 1200);
    }, 800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter your credentials.');
      return;
    }

    // Default mock citizen account
    const mockProfile: CitizenProfile = {
      name: isRegister ? name : 'Satyam Pandey',
      email: email,
      phone: '+1 (555) 382-9011',
      address: isRegister ? address : '2405 Pine Boulevard, Sector 4-A',
      citizenCardId: 'CIT-78401-NY',
      balance: 45.50,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      waterAccountNum: 'W-38291-72',
      electricityAccountNum: 'E-94827-01'
    };

    onLogin(mockProfile);
  };

  const loadDemoAdvisorAccount = () => {
    setEmail('advisor@municipality.org');
    onLogin({
      name: 'Dr. Timothy Vance',
      email: 'advisor@municipality.org',
      phone: '+1 (555) 728-1090',
      address: 'Suite 300, City Hall West Core',
      citizenCardId: 'CIT-40092-AD',
      balance: 150.00,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
      waterAccountNum: 'W-00948-22',
      electricityAccountNum: 'E-29175-18'
    });
  };

  const handleBiometricScan = () => {
    handleFaceIDTrigger();
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-between p-6 text-slate-900 font-sans overflow-y-auto">
      
      {/* Top Graphic Logo */}
      <div className="text-center mt-6 space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white font-bold text-xl shadow-sm border border-blue-500/10">
          M
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">MetroConnect</h1>
          <p className="text-[10px] text-slate-550 uppercase tracking-widest font-semibold">Smart City Citizen Portal</p>
        </div>
      </div>

      {/* Main Login / Register Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-5 my-6 space-y-4 shadow-sm"
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-bold text-slate-700">
            {isRegister ? 'Register Passport' : 'Secure Citizen Identity'}
          </h2>
          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>SSL SECURED</span>
          </span>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Full Legal Name</label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-805 tracking-tight focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Property Address (Utilities Mapping)</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 1402 Oakridge Ave"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-805 tracking-tight focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Citizen Pass ID / Email</label>
            <div className="relative mt-1">
              <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@smartcity.gov"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-805 tracking-tight focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {!isRegister && useBiometrics ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50/30 border border-dashed border-blue-200 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-55/5 pointer-events-none" />
              
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.15, 0.6] }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0 bg-blue-500/20 rounded-full border border-blue-300"
                    />
                  )}
                  {scanSuccess && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 0.3 }}
                      className="absolute inset-0 bg-emerald-500/20 rounded-full border border-emerald-300"
                    />
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={isScanning || scanSuccess}
                  className={`w-12 h-12 rounded-full relative flex items-center justify-center transition-all shadow-md ${
                    scanSuccess
                      ? 'bg-emerald-600 text-white'
                      : isScanning
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {isScanning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : scanSuccess ? (
                    <motion.svg
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-5 h-5 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <Fingerprint className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-800">
                  {isScanning ? 'Scanning Bio-ID...' : scanSuccess ? 'Scan Confirmed!' : 'Tap to scan biometric ID'}
                </p>
                <p className="text-[9px] text-slate-450 font-mono tracking-tight">
                  {isScanning ? 'Verifying secure hardware enclave...' : scanSuccess ? 'Simulated OAuth generated.' : 'Simulates secure FaceID / TouchID lock'}
                </p>
              </div>
            </motion.div>
          ) : (
            <div>
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">PIN / Secure Access Passcode</label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!useBiometrics}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-10 text-xs text-slate-805 tracking-tight focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-450 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Biometrics Toggle Option */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-2.5 mt-2 shadow-3xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-700">
                  {isRegister ? 'Link Biometric Pass' : 'Simulate Bio-Unlock'}
                </p>
                <p className="text-[8px] text-slate-450 uppercase tracking-widest font-bold font-mono">FaceID / TouchID</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUseBiometrics(!useBiometrics);
                if (isScanning) setIsScanning(false);
                if (scanSuccess) setScanSuccess(false);
              }}
              className="focus:outline-none"
            >
              {useBiometrics ? (
                <div className="w-8 h-4.5 bg-blue-600 rounded-full p-0.5 transition-all flex justify-end items-center cursor-pointer">
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-xs"></div>
                </div>
              ) : (
                <div className="w-8 h-4.5 bg-slate-200 rounded-full p-0.5 transition-all flex justify-start items-center cursor-pointer">
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-xs"></div>
                </div>
              )}
            </button>
          </div>

          {/* Regular login triggers only when biometrics is not actively replacing it on login block */}
          {(!useBiometrics || isRegister) && (
            <button
              type="submit"
              id="btn_login_passport"
              className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <span>{isRegister ? 'Generate Digital Passport' : 'Unlock Smart Passport'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* FaceID Instant Authentication Trigger Button */}
          {!isRegister && (
            <button
              type="button"
              onClick={handleFaceIDTrigger}
              className="w-full mt-1.5 py-2.5 rounded-xl border border-indigo-150 bg-indigo-50/55 hover:bg-indigo-100/55 text-indigo-700 font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-3xs cursor-pointer active:scale-97"
            >
              <Fingerprint className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Instant FaceID Sign-In</span>
            </button>
          )}
        </form>

        <div className="text-center pt-1.5io">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[10px] text-blue-600 hover:underline font-bold tracking-tight transition-colors"
          >
            {isRegister ? 'Already registered? Sign In' : 'First-time citizen? Register here'}
          </button>
        </div>
      </motion.div>

      {/* Quick Demo Pre-seed access for testing */}
      <div className="space-y-2 mt-4 text-center shrink-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Quick Access Sandbox Credentials</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleLoginSubmit({ preventDefault: () => {} } as any)}
            className="flex-1 py-1.5 px-3 border border-slate-200 hover:bg-slate-100 bg-white text-[10px] rounded-lg text-slate-655 transition-all font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Demo Citizen</span>
          </button>
          <button
            onClick={loadDemoAdvisorAccount}
            className="flex-1 py-1.5 px-3 border border-slate-200 hover:bg-slate-100 bg-white text-[10px] rounded-lg text-slate-655 transition-all font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
          >
            <span>Demo Admin</span>
          </button>
        </div>
      </div>

      {/* High-Tech FaceID Biometric Scan Overlay */}
      <AnimatePresence>
        {isFaceScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-white"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Scanline Effect */}
              {faceScanStep < 3 && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['10%', '85%', '10%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"
                />
              )}

              {/* Header */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase font-mono bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-900/30">
                  BIOMETRIC GATEWAY v2.8
                </span>
                <h3 className="text-base font-black text-slate-100 tracking-tight mt-1.5">
                  Secure FaceID Verification
                </h3>
              </div>

              {/* Holographic Scanner Reticle */}
              <div className="relative w-32 h-32 flex items-center justify-center border-2 border-slate-800 rounded-3xl bg-slate-950/50 p-6 overflow-hidden">
                {/* Frame Corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br"></div>

                {/* Laser scan pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />

                {/* Pulsating Biometric Fingerprint Icon */}
                <motion.div
                  animate={faceScanStep === 3 ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { scale: [1, 1.05, 1] }}
                  transition={{ repeat: faceScanStep === 3 ? 0 : Infinity, duration: 1.5 }}
                  className={`p-4 rounded-full border ${
                    faceScanStep === 3
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                  }`}
                >
                  <Fingerprint className="w-12 h-12" />
                </motion.div>

                {/* Radar ring scanning */}
                {faceScanStep < 3 && (
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute w-20 h-20 rounded-full border border-blue-500/30"
                  />
                )}
              </div>

              {/* Core Loader state & message logs */}
              <div className="w-full space-y-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-850/50">
                <div className="flex items-center space-x-3">
                  {faceScanStep === 3 ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  ) : (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  <p className="text-xs font-bold text-slate-200 tracking-tight transition-all">
                    {faceScanMessage}
                  </p>
                </div>

                {/* Interactive checklist progress */}
                <div className="space-y-1.5 pt-2.5 border-t border-slate-800/60 text-[10px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hardware Setup</span>
                    <span className={faceScanStep >= 1 ? 'text-emerald-400 font-bold' : 'text-blue-400 animate-pulse'}>
                      {faceScanStep >= 1 ? 'OK' : 'CONNECTING...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">3D Face Geometry</span>
                    <span className={faceScanStep >= 2 ? 'text-emerald-400 font-bold' : faceScanStep >= 1 ? 'text-blue-400 animate-pulse' : 'text-slate-600'}>
                      {faceScanStep >= 2 ? 'VERIFIED' : faceScanStep >= 1 ? 'SCANNING...' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">OAuth Security Match</span>
                    <span className={faceScanStep >= 3 ? 'text-emerald-400 font-bold' : faceScanStep >= 2 ? 'text-blue-400 animate-pulse' : 'text-slate-600'}>
                      {faceScanStep >= 3 ? 'MATCHED' : faceScanStep >= 2 ? 'MATCHING...' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure note */}
              <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 tracking-tight bg-slate-950/30 px-3 py-1.5 rounded-xl border border-slate-850">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Encrypted with Smart-City hardware keys (eEDID-v4)</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
