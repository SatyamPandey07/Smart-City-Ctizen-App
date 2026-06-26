/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Droplet, Flame, FileText, CreditCard, CheckCircle2, AlertTriangle, 
  Trash2, Calendar, Bus, MapPin, Tag, ShieldAlert, HeartPulse, Sparkles,
  Building2, Camera, Compass, Plus, Clock, Info, Check, Shield, CircleDot, AlertOctagon, X,
  Mic, MicOff
} from 'lucide-react';
import { BillRecord, ServiceType, ServiceRequest, ParkingSpot, TransitRoute } from '../types';

interface ServicePanelsProps {
  onClose: () => void;
  serviceType: ServiceType;
  bills: BillRecord[];
  onPayBill: (billId: string) => void;
  walletBalance: number;
  onTopUpWallet: (amount: number) => void;
  onSubmitRequest: (request: Partial<ServiceRequest>) => void;
}

export default function ServicePanels({
  onClose,
  serviceType,
  bills,
  onPayBill,
  walletBalance,
  onTopUpWallet,
  onSubmitRequest,
}: ServicePanelsProps) {
  // State for different interactive panels
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Meter Reading State
  const [meterType, setMeterType] = useState<'Water' | 'Electricity'>('Electricity');
  const [meterVal, setMeterVal] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  // Payments / Pay Modal State
  const [payingBill, setPayingBill] = useState<BillRecord | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('25');

  // Waste Management State
  const [wasteType, setWasteType] = useState('Missed Trash Collection');
  const [wasteNotes, setWasteNotes] = useState('');
  const [wastePhoto, setWastePhoto] = useState<string | null>(null);

  // Transit Pass State
  const [transitLines] = useState<TransitRoute[]>([
    { id: 't1', lineName: 'Metro Blue Line 3', destination: 'City Center Terminal', minutesAway: 4, type: 'metro', status: 'On Time' },
    { id: 't2', lineName: 'City Bus 42', destination: 'Westside Medical District', minutesAway: 9, type: 'bus', status: 'Delayed' },
    { id: 't3', lineName: 'Electric Tram 9', destination: 'Waterfront Plaza', minutesAway: 12, type: 'rail', status: 'On Time' },
    { id: 't4', lineName: 'Airport Shuttle Express', destination: 'Terminal 2 Arrivals', minutesAway: 21, type: 'bus', status: 'Advisory' },
  ]);
  const [transitCart, setTransitCart] = useState<'single' | 'day' | 'weekly' | null>(null);

  // Parking Space Booking State
  const [parkingPlazaList] = useState<ParkingSpot[]>([
    { id: 'p1', zone: 'Sector 4-A', location: 'City Hall Underground Parking', available: 14, total: 120, ratePerHour: 2.5 },
    { id: 'p2', zone: 'Sector 2-C', location: 'Tech Plaza Multi-level Garage', available: 2, total: 300, ratePerHour: 1.8 },
    { id: 'p3', zone: 'Commercial St.', location: 'On-Street Smart Bay #45', available: 1, total: 5, ratePerHour: 4.0 },
    { id: 'p4', zone: 'Health Center', location: 'Oakridge Clinic surface lot', available: 22, total: 80, ratePerHour: 1.5 },
  ]);
  const [selectedPlaza, setSelectedPlaza] = useState<ParkingSpot | null>(null);
  const [parkingHours, setParkingHours] = useState<number>(2);
  const [plateNumber, setPlateNumber] = useState('');

  // Health Booking State
  const [selectedClinic, setSelectedClinic] = useState('Central Public Health Clinic #3');
  const [clinicalDoc, setClinicalDoc] = useState('General Practitioner / Checkup');
  const [bookingDate, setBookingDate] = useState('2026-06-25');
  const [bookingTime, setBookingTime] = useState('10:00 AM');

  // Social Housing State
  const [housingType, setHousingType] = useState('Affordable Studio Apartment');
  const [hasInquiries, setHasInquiries] = useState(false);
  const [familySalaryBracket, setFamilySalaryBracket] = useState('Under ₹35,000 / Year');

  // Safety & Emergency State
  const [safetyCategory, setSafetyCategory] = useState('Pothole / Road Damage');
  const [safetyUrgency, setSafetyUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [safetyDescription, setSafetyDescription] = useState('');
  const [coordinates, setCoordinates] = useState('Pin: Sector 5, Grid Coord 34x89');
  const [safetyPhoto, setSafetyPhoto] = useState<string | null>(null);

  // Camera System States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'waste' | 'safety' | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedTempPhoto, setCapturedTempPhoto] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Bind video stream on modal open
  React.useEffect(() => {
    if (cameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraOpen, cameraStream]);

  // Cleanup camera tracks and voice simulation interval on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
      }
    };
  }, [cameraStream]);

  const startCamera = async (target: 'waste' | 'safety') => {
    setCameraTarget(target);
    setCameraOpen(true);
    setCapturedTempPhoto(null);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
    } catch (err: any) {
      console.warn("Camera hardware access denied or unavailable, enabling fallback presets/upload.", err);
      setCameraError(err.message || 'Camera access not permitted by browser sandbox.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
    setCameraTarget(null);
    setCapturedTempPhoto(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedTempPhoto(dataUrl);
          triggerToast("Field photo captured successfully!");
        }
      } catch (err) {
        console.error("Failed to capture photo frame", err);
        setCapturedTempPhoto(getMockPhotoForTarget());
      }
    } else {
      setCapturedTempPhoto(getMockPhotoForTarget());
    }
  };

  const saveCapturedPhoto = () => {
    if (capturedTempPhoto) {
      if (cameraTarget === 'waste') {
        setWastePhoto(capturedTempPhoto);
      } else if (cameraTarget === 'safety') {
        setSafetyPhoto(capturedTempPhoto);
      }
      triggerToast("Photo attached to service request!");
    }
    stopCamera();
  };

  const getMockPhotos = (target: 'waste' | 'safety') => {
    if (target === 'waste') {
      return [
        { id: 'w_overflow', label: 'Overflowing Bin', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop' },
        { id: 'w_dump', label: 'Illegal Street Litter', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=600&auto=format&fit=crop' },
        { id: 'w_e_waste', label: 'Discarded Electronics', url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop' }
      ];
    } else {
      return [
        { id: 's_pothole', label: 'Pothole & Asphalt Crack', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop' },
        { id: 's_lamp', label: 'Defective Streetlight', url: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=600&auto=format&fit=crop' },
        { id: 's_wire', label: 'Exposed Electrical Hazard', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop' }
      ];
    }
  };

  const getMockPhotoForTarget = () => {
    const presets = getMockPhotos(cameraTarget || 'waste');
    return presets[0].url;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedTempPhoto(reader.result as string);
        triggerToast("Photo imported successfully from storage!");
      };
      reader.onerror = () => {
        triggerError("Failed to parse the selected file.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Input (Microphone Accessibility) State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<'waste' | 'safety' | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const voiceIntervalRef = React.useRef<any>(null);

  const startVoiceInput = (target: 'waste' | 'safety') => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
        voiceIntervalRef.current = null;
      }
      setIsRecording(false);
      setRecordingTarget(null);
      return;
    }

    setIsRecording(true);
    setRecordingTarget(target);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("Speech recognition started...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (target === 'waste') {
            setWasteNotes((prev) => (prev ? prev + ' ' + transcript : transcript));
          } else {
            setSafetyDescription((prev) => (prev ? prev + ' ' + transcript : transcript));
          }
          triggerToast(`Captured: "${transcript.slice(0, 30)}..."`);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        // Fall back to typing simulation on blocked or failed speech capture
        simulateVoiceInput(target);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingTarget(null);
      };

      try {
        recognition.start();
      } catch (err) {
        console.warn("Failed starting web-speech API:", err);
        simulateVoiceInput(target);
      }
    } else {
      simulateVoiceInput(target);
    }
  };

  const simulateVoiceInput = (target: 'waste' | 'safety') => {
    let mockPhrases: string[] = [];
    if (target === 'waste') {
      mockPhrases = [
        "Overflowing public trash can on Sector 5 main crossing needs urgent clearance.",
        "Missed recycling collection this morning at Oakridge Avenue.",
        "Report of illegal electronic waste dumping near the municipal library."
      ];
    } else {
      mockPhrases = [
        "Pothole spotted causing traffic slowdowns at Sector 4 intersection.",
        "Intermittent sparking from the commercial street light pole #102.",
        "Missing pedestrian safety crossing sign near the primary school zone."
      ];
    }

    const selectedPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    
    // Simulate real-time typing/dictation
    let index = 0;
    if (target === 'waste') {
      setWasteNotes('');
    } else {
      setSafetyDescription('');
    }

    if (voiceIntervalRef.current) {
      clearInterval(voiceIntervalRef.current);
    }

    const interval = setInterval(() => {
      if (index < selectedPhrase.length) {
        const nextChar = selectedPhrase.charAt(index);
        if (target === 'waste') {
          setWasteNotes((prev) => prev + nextChar);
        } else {
          setSafetyDescription((prev) => prev + nextChar);
        }
        index++;
      } else {
        clearInterval(interval);
        voiceIntervalRef.current = null;
        setIsRecording(false);
        setRecordingTarget(null);
        triggerToast("Voice dictation transcription finished.");
      }
    }, 45);
    voiceIntervalRef.current = interval;
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4500);
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg(null);
    }, 4500);
  };

  const handleMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meterVal || isNaN(Number(meterVal))) {
      triggerError('Please enter a valid numeric reading.');
      return;
    }
    onSubmitRequest({
      serviceType: 'meter',
      title: `${meterType} Meter Reading Verification`,
      description: `Citizen self-reported current reading of ${meterVal}. Status pending municipal visual verification.`,
      urgency: 'Low',
      specificDetails: {
        'Meter Type': meterType,
        'Reading Value': parseFloat(meterVal),
        'Reporting Method': 'Camera OCR Simulation'
      }
    });
    triggerToast(`Smart ${meterType} reading (${meterVal}) submitted successfully for verification.`);
    setMeterVal('');
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setMeterVal('');
    setTimeout(() => {
      const randomReading = meterType === 'Electricity' 
        ? Math.floor(18420 + Math.random() * 320)
        : Math.floor(3450 + Math.random() * 85);
      setMeterVal(randomReading.toString());
      setIsScanning(false);
      triggerToast('AI Smart Scan completed successfully from image bounds!');
    }, 1800);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseFloat(topUpAmount);
    if (isNaN(cleanAmt) || cleanAmt <= 0) return;
    onTopUpWallet(cleanAmt);
    setTopUpOpen(false);
    triggerToast(`₹${cleanAmt.toFixed(2)} topped up safely using Digital Wallet Integration.`);
  };

  const handlePayBillConfirm = () => {
    if (!payingBill) return;
    if (walletBalance < payingBill.amount) {
      triggerError('Insufficient wallet balance. Please top-up first or pay directly using a simulated card.');
      return;
    }
    onPayBill(payingBill.id);
    onSubmitRequest({
      serviceType: 'payments',
      title: `Utility Bill Payment: ${payingBill.title}`,
      description: `Paid ₹${payingBill.amount.toFixed(2)} for ${payingBill.type} usage (${payingBill.usageVal} ${payingBill.unit}).`,
      urgency: 'Low',
      status: 'Completed',
    });
    setPayingBill(null);
    triggerToast(`Payment of ₹${payingBill.amount.toFixed(2)} processed successfully!`);
  };

  const handleWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      serviceType: 'waste',
      title: `${wasteType} Request`,
      description: wasteNotes || `Requested action for: ${wasteType}. Pickup requested soon.`,
      urgency: 'Medium',
      specificDetails: {
        'Incident Category': wasteType,
        'Photos Attached': wastePhoto ? 'Yes (1 camera frame)' : 'None',
        ...(wastePhoto ? { 'Attached Photo': wastePhoto } : {})
      }
    });
    triggerToast('Waste request submitted successfully. Check active status in activity.');
    setWasteNotes('');
    setWastePhoto(null);
  };

  const handleBuyTicket = (type: 'single' | 'day' | 'weekly', price: number) => {
    if (walletBalance < price) {
      triggerError(`Insufficient funds. Need ₹${price.toFixed(2)} to purchase transit pass.`);
      return;
    }
    onTopUpWallet(-price);
    onSubmitRequest({
      serviceType: 'transportation',
      title: `Municipal Transit ${type === 'single' ? 'Single Ticket' : type === 'day' ? 'All-Day Pass' : '7-Day Transit Pass'}`,
      description: `Purchased a virtual ticket. Valid on City buses and Light Rail corridors. Pass ID: TX-${Math.floor(100000 + Math.random() * 900000)}`,
      urgency: 'Low',
      status: 'Completed',
    });
    setTransitCart(null);
    triggerToast(`Virtual ${type} transit pass purchased successfully! QR Code generated.`);
  };

  const handleParkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      triggerError('Please fill out your plate number.');
      return;
    }
    if (!selectedPlaza) return;
    const totalCost = selectedPlaza.ratePerHour * parkingHours;
    if (walletBalance < totalCost) {
      triggerError(`You need ₹${totalCost.toFixed(2)} to reserve this spot, please top up.`);
      return;
    }
    onTopUpWallet(-totalCost);
    onSubmitRequest({
      serviceType: 'parking',
      title: `Parking Bay Reserved: ${selectedPlaza.zone}`,
      description: `Saved bay layout at ${selectedPlaza.location} for vehicle ${plateNumber.toUpperCase()} for ${parkingHours} hours.`,
      urgency: 'Low',
      status: 'Completed',
      specificDetails: {
        'Vehicle Plate': plateNumber.toUpperCase(),
        'Duration Hours': parkingHours,
        'Rate Per Hour': `₹${selectedPlaza.ratePerHour.toFixed(2)}`,
        'Total Reserved Fee': `₹${totalCost.toFixed(2)}`
      }
    });
    setSelectedPlaza(null);
    triggerToast(`Parking reservation success. Active parking timer activated for ${plateNumber.toUpperCase()}`);
    setPlateNumber('');
  };

  const handleHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      serviceType: 'health',
      title: `Clinic Consultation: ${clinicalDoc}`,
      description: `Appointment confirmed at ${selectedClinic} on ${bookingDate} at ${bookingTime}.`,
      urgency: 'Low',
      status: 'Completed',
      specificDetails: {
        'Healthcare Center': selectedClinic,
        'Medical Specialty': clinicalDoc,
        'Assigned Time': `${bookingDate} at ${bookingTime}`
      }
    });
    triggerToast(`Aesthetic consultation booked successfully at ${selectedClinic}.`);
  };

  const handleHousingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      serviceType: 'housing',
      title: `Housing Lottery Selection: ${housingType}`,
      description: `Submitted eligibility documentation for the smart city public social housing waiting list. Bracket: ${familySalaryBracket}.`,
      urgency: 'Low',
      specificDetails: {
        'Apt Type': housingType,
        'Income Verification': familySalaryBracket,
        'Voucher Status': 'Pending Housing Authority Auditing'
      }
    });
    triggerToast('Housing inquiry application submitted. A municipal review agent has been assigned.');
    setHasInquiries(true);
  };

  const handleSafetySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyDescription.trim()) {
      triggerError('Please explain the issue or concern.');
      return;
    }
    onSubmitRequest({
      serviceType: 'safety',
      title: `Safety Hazard: ${safetyCategory}`,
      description: safetyDescription,
      urgency: safetyUrgency,
      specificDetails: {
        'Region': coordinates,
        'Impact Rating': safetyUrgency,
        'Verification Beacon': 'Active GPS Tagged',
        ...(safetyPhoto ? { 'Attached Photo': safetyPhoto } : {})
      }
    });
    triggerToast('Public safety report dispatch initialized. Dispatch status viewable in activity log.');
    setSafetyDescription('');
    setSafetyPhoto(null);
  };

  const activeBills = bills.filter(b => !b.isPaid);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="absolute inset-x-0 bottom-0 top-14 bg-slate-50 flex flex-col z-30 overflow-hidden font-sans"
    >
      {/* Toast Notification Container */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 inset-x-4 bg-blue-600 text-white rounded-2xl p-3 shadow-lg z-50 text-xs font-bold flex items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="flex-1">{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 inset-x-4 bg-rose-600 text-white rounded-2xl p-3 shadow-lg z-50 text-xs font-bold flex items-center space-x-2"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center space-x-2">
          {serviceType === 'utilities' && <Zap className="w-5 h-5 text-amber-500" />}
          {serviceType === 'meter' && <Camera className="w-5 h-5 text-indigo-500" />}
          {serviceType === 'payments' && <CreditCard className="w-5 h-5 text-emerald-500" />}
          {serviceType === 'waste' && <Trash2 className="w-5 h-5 text-teal-500" />}
          {serviceType === 'transportation' && <Bus className="w-5 h-5 text-blue-500" />}
          {serviceType === 'parking' && <MapPin className="w-5 h-5 text-red-500" />}
          {serviceType === 'health' && <HeartPulse className="w-5 h-5 text-rose-500" />}
          {serviceType === 'housing' && <Building2 className="w-5 h-5 text-orange-500" />}
          {serviceType === 'safety' && <ShieldAlert className="w-5 h-5 text-red-600" />}
          
          <h2 className="text-sm font-semibold capitalize text-gray-800">
            {serviceType === 'waste' ? 'Waste Management' : serviceType === 'safety' ? 'Safety & Security' : serviceType === 'housing' ? 'Housing Facilities' : serviceType}
          </h2>
        </div>
        <button 
          onClick={onClose}
          id="btn_close_service_panel"
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 1. UTILITIES PANEL */}
        {serviceType === 'utilities' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Connected Accounts</h3>
              <div className="divide-y divide-gray-100">
                <div className="py-2.5 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-800">Smart Power Grid</h4>
                      <p className="text-[10px] text-gray-500">Acct: #E-94827-01</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-800">Clean Water Supply</h4>
                      <p className="text-[10px] text-gray-500">Acct: #W-38291-72</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-800">Natural Gas Grid</h4>
                      <p className="text-[10px] text-gray-500">Acct: #G-10294-55</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">PENDING AUDIT</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-550 to-purple-600 rounded-xl p-4 text-white shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xs font-semibold opacity-90">Eco-Saver Program</h4>
                  <p className="text-[10px] opacity-75">Connect sensors & save up to 15% on taxes.</p>
                </div>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <button
                onClick={() => {
                  onSubmitRequest({
                    serviceType: 'utilities',
                    title: 'Eco-Saver Smart Enrollment',
                    description: 'Enrolling in municipal dynamic-tier water and power rate plan. A smart plug-in terminal setup is being shipped.',
                    urgency: 'Low',
                  });
                  triggerToast('Eco-Saver enrollment application initiated.');
                }}
                id="btn_enroll_eco"
                className="w-full py-2 bg-white text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Enroll in Smart Plan
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Request Assistance</h3>
              <p className="text-[11px] text-gray-500 mb-3">Need to dispute your latest reading, request custom meter recalibration, or schedule a temporary disconnect utility service?</p>
              <button
                onClick={() => {
                  onSubmitRequest({
                    serviceType: 'utilities',
                    title: 'Utility Service Maintenance Ticket',
                    description: 'Citizen requested water valve visual review and flow test.',
                    urgency: 'Medium',
                  });
                  triggerToast('Utility request submitted successfully!');
                }}
                id="btn_request_utility_sub"
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
              >
                Schedule Technical Inspection
              </button>
            </div>
          </div>
        )}

        {/* 2. METER PANEL */}
        {serviceType === 'meter' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium mb-3">Report your monthly smart grid meter usage to avoid standardized estimation fees.</p>
              
              <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setMeterType('Electricity')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${meterType === 'Electricity' ? 'bg-white shadow-xs text-indigo-700' : 'text-gray-500'}`}
                >
                  Electricity Meter
                </button>
                <button
                  type="button"
                  onClick={() => setMeterType('Water')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${meterType === 'Water' ? 'bg-white shadow-xs text-indigo-700' : 'text-gray-500'}`}
                >
                  Water Meter
                </button>
              </div>

              {/* Camera Scanner Simulation viewport */}
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-950 aspect-video flex flex-col items-center justify-center text-white overflow-hidden p-4 mb-4">
                {isScanning ? (
                  <div className="text-center space-y-2">
                    <motion.div 
                      className="w-12 h-12 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin mx-auto"
                    />
                    <p className="text-xs font-mono text-indigo-300">Parsing meter digits...</p>
                  </div>
                ) : meterVal ? (
                  <div className="text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                    <p className="text-[10px] text-gray-400 font-mono">SCANNED READING (99.8% Confidence)</p>
                    <p className="text-2xl font-mono tracking-widest text-emerald-400 font-bold">{meterVal}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 cursor-pointer" onClick={handleSimulateScan}>
                    <Camera className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-xs font-semibold text-gray-200">Align meter dials in scanner box</p>
                    <p className="text-[10px] text-gray-500 bg-gray-900 px-2 py-1 rounded">Simulate Camera Scanner</p>
                  </div>
                )}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-500 opacity-20 pointer-events-none animate-pulse"></div>
              </div>

              <form onSubmit={handleMeterSubmit} className="space-y-3 text-left">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Manual Entry / Dial Digits</label>
                  <input
                    type="number"
                    value={meterVal}
                    onChange={(e) => setMeterVal(e.target.value)}
                    placeholder={meterType === 'Electricity' ? 'e.g. 18545' : 'e.g. 3492'}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  id="btn_submit_meter"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Submit Verified Reading</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. PAYMENTS PANEL */}
        {serviceType === 'payments' && (
          <div className="space-y-4">
            
            {/* Wallet Quick Balance Display */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400 font-mono">CITIZEN PAY WALLET</p>
                <p className="text-xl font-extrabold text-gray-800">₹{walletBalance.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setTopUpOpen(!topUpOpen)}
                id="btn_open_topup"
                className="py-1.5 px-3 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg hover:bg-emerald-100 transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top-Up</span>
              </button>
            </div>

            {/* Quick-Top-up card popup */}
            {topUpOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleTopUpSubmit}
                className="bg-gray-100 p-3 rounded-lg space-y-3"
              >
                <div className="flex space-x-2">
                  {['10', '25', '50', '100'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-md border ${topUpAmount === amt ? 'bg-emerald-600 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs"
                  />
                  <button
                    type="submit"
                    id="btn_wallet_load"
                    className="px-4 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                  >
                    Load Wallet
                  </button>
                </div>
              </motion.form>
            )}

            {/* Bills Section */}
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mt-2 pl-0.5">Pending Municipal Bills</h3>
            {activeBills.length === 0 ? (
              <div className="bg-white rounded-xl p-5 border border-gray-100 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-gray-600 font-semibold">All bills fully paid! Great job.</p>
                <p className="text-[10px] text-gray-400">Thank you for supporting city maintenance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBills.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        {b.type === 'Electricity' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        {b.type === 'Water' && <Droplet className="w-3.5 h-3.5 text-blue-500" />}
                        {b.type === 'Gas' && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                        <h4 className="text-xs font-bold text-gray-800">{b.title}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400">Due: {b.dueDate} • Usage: {b.usageVal} {b.unit}</p>
                    </div>
                    <div className="text-right space-y-1.5">
                      <p className="text-xs font-bold text-red-600">₹{b.amount.toFixed(2)}</p>
                      <button
                        onClick={() => setPayingBill(b)}
                        id={`btn_pay_bill_${b.id}`}
                        className="px-2.5 py-1 bg-indigo-600 text-[10px] font-bold text-white rounded hover:bg-indigo-700 transition"
                      >
                        Pay Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bill Checkout Modal Simulation */}
            <AnimatePresence>
              {payingBill && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4"
                >
                  <motion.div
                    initial={{ y: 150 }}
                    animate={{ y: 0 }}
                    exit={{ y: 150 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="bg-white w-full max-w-sm rounded-t-2xl p-4 space-y-4 shadow-2xl relative"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <h3 className="text-xs font-bold text-gray-850">Pay Bill Receipt Verification</h3>
                      <button onClick={() => setPayingBill(null)} className="text-gray-400 text-xs font-semibold p-1">Close</button>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">{payingBill.title}</h4>
                        <p className="text-[10px] text-gray-500">Service Fee Breakdown</p>
                      </div>
                      <span className="text-sm font-extrabold text-indigo-700">₹{payingBill.amount.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Method</label>
                      <div className="flex items-center space-x-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-emerald-800">Citizen Wallet Balance</p>
                          <p className="text-[10px] text-emerald-600">Available: ₹{walletBalance.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {walletBalance < payingBill.amount && (
                      <div className="p-2.5 bg-red-50 text-red-650 rounded-lg text-[10px] font-medium flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Wallet short by ₹{(payingBill.amount - walletBalance).toFixed(2)}. Please load wallet funds.</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setPayingBill(null)}
                        className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handlePayBillConfirm}
                        id="btn_confirm_pay_flow"
                        disabled={walletBalance < payingBill.amount}
                        className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700"
                      >
                        Verify & Pay
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 4. WASTE MANAGEMENT PANEL */}
        {serviceType === 'waste' && (
          <form onSubmit={handleWasteSubmit} className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-xs font-extrabold text-gray-600">CITIZEN SANITATION REPORTING</h3>
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Incident Type</label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-250 rounded-lg text-xs"
                >
                  <option value="Missed Trash Collection">Missed Household Collection</option>
                  <option value="Illegal Dump Dumping">Illegal Waste Dumping Spot</option>
                  <option value="Broken Public Dumpster">Overflowing Public Trash Bin</option>
                  <option value="Hazardous Electronics Pickup">Special Hazardous/Electronics Request</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center bg-transparent mt-0.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Provide details</label>
                  <button
                    type="button"
                    id="btn_mic_waste"
                    onClick={() => startVoiceInput('waste')}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase transition-all duration-200 cursor-pointer ${
                      isRecording && recordingTarget === 'waste'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-indigo-50 text-indigo-750 hover:bg-slate-100 border border-indigo-100'
                    }`}
                  >
                    {isRecording && recordingTarget === 'waste' ? (
                      <>
                        <MicOff className="w-3 h-3 animate-bounce" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-indigo-600" />
                        <span>Voice Assist</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  placeholder="e.g. My recycling blue bin was completely missed in Sector 5 block B today."
                  rows={3}
                  className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-250 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Add Image Evidence</label>
                <div className="space-y-2">
                  {wastePhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 flex items-center space-x-3">
                      <img 
                        src={wastePhoto} 
                        alt="Attached Evidence" 
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200/60" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">Evidence_Photo.jpg</p>
                        <p className="text-[9px] text-slate-400 font-mono">Captured via Cam-Dispatch</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWastePhoto(null)}
                        className="p-1 px-2.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCamera('waste')}
                      className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/15 rounded-xl text-xs font-semibold text-slate-600 bg-white transition flex items-center justify-center space-x-2"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span>Use Device Camera</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn_submit_waste"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Dispatch Pick-up Request
                </button>
              </div>
            </div>

            {/* Waste Collection Schedule Checklist */}
            <div className="bg-teal-50 border border-teal-150 rounded-lg p-3 text-teal-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 font-bold text-teal-900 border-b border-teal-100 pb-1">
                <Calendar className="w-4 h-4" />
                <span>Sanitation Schedule: Sector 4</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside">
                <li>General Trash: <span className="font-bold text-teal-900">Every Tuesday at 7:00 AM</span></li>
                <li>Recyclables: <span className="font-bold text-teal-900">Alternating Thursdays (Next: June 25)</span></li>
                <li>Composting Green bins: <span className="font-bold text-teal-900">Every Friday morning</span></li>
              </ul>
            </div>
          </form>
        )}

        {/* 5. TRANSPORTATION PANEL */}
        {serviceType === 'transportation' && (
          <div className="space-y-4">
            
            {/* Transit Passes */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Buy Bus & Light-Rail Tickets</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div onClick={() => setTransitCart('single')} className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${transitCart === 'single' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <p className="text-[10px] font-bold text-gray-400">SINGLE RIDE</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">₹2.25</p>
                </div>
                <div onClick={() => setTransitCart('day')} className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${transitCart === 'day' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <p className="text-[10px] font-bold text-gray-400">ALL-DAY PASS</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">₹5.00</p>
                </div>
                <div onClick={() => setTransitCart('weekly')} className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${transitCart === 'weekly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <p className="text-[10px] font-bold text-gray-400 font-mono">7-DAY PASS</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">₹22.00</p>
                </div>
              </div>

              {transitCart && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center animate-fade-in text-xs text-blue-800">
                  <span>Confirm virtual cart ticket ({transitCart} pass)?</span>
                  <button
                    onClick={() => handleBuyTicket(
                      transitCart, 
                      transitCart === 'single' ? 2.25 : transitCart === 'day' ? 5.00 : 22.00
                    )}
                    id="btn_confirm_ticket"
                    className="px-3 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
                  >
                    Confirm & Deduct Balance
                  </button>
                </div>
              )}
            </div>

            {/* Smart Transit Tracking Board */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Real-time Station Board</h3>
                <span className="text-[10px] text-gray-400 italic">Sector 4 central station</span>
              </div>

              <div className="space-y-2.5 divide-y divide-gray-50">
                {transitLines.map((line) => (
                  <div key={line.id} className="pt-2 flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded ${line.type === 'metro' ? 'bg-indigo-50 text-indigo-600' : line.type === 'rail' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Bus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">{line.lineName}</h4>
                        <p className="text-[10px] text-gray-500">To: {line.destination}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-700 block font-mono">{line.minutesAway} mins</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${line.status === 'On Time' ? 'bg-emerald-50 text-emerald-600' : line.status === 'Delayed' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                        {line.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. PARKING PANEL */}
        {serviceType === 'parking' && (
          <div className="space-y-4">
            
            {/* Find Parking Area list */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Select Municipal Smart Parking Garage</h3>
              
              <div className="space-y-2">
                {parkingPlazaList.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedPlaza(spot)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${selectedPlaza?.id === spot.id ? 'border-red-500 bg-red-25/50' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase font-mono">{spot.zone}</span>
                        <h4 className="text-xs font-bold text-gray-800">{spot.location}</h4>
                      </div>
                      <p className="text-[10px] text-gray-500">Rate: ₹{spot.ratePerHour.toFixed(2)}/hour • Total caps: {spot.total}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold block ${spot.available <= 2 ? 'text-red-500 font-bold' : 'text-emerald-600'}`}>
                        {spot.available} Left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parking space booking interface */}
            <AnimatePresence>
              {selectedPlaza && (
                <motion.form
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleParkingSubmit}
                  className="bg-white rounded-xl p-4 border border-red-100 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">Reserve Spot: {selectedPlaza.zone}</h4>
                      <p className="text-[10px] text-gray-500">{selectedPlaza.location}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-700">₹{(selectedPlaza.ratePerHour * parkingHours).toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">License Plate Number</label>
                      <input
                        type="text"
                        required
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="e.g. 7XYZ99"
                        className="w-full px-2 py-1.5 border border-gray-250 rounded uppercase font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Booking Hours</label>
                      <select
                        value={parkingHours}
                        onChange={(e) => setParkingHours(Number(e.target.value))}
                        className="w-full px-1.5 py-1.5 border border-gray-250 bg-white rounded"
                      >
                        {[1, 2, 3, 4, 8, 12].map((hr) => (
                          <option key={hr} value={hr}>{hr} {hr === 1 ? 'Hour' : 'Hours'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      id="btn_reserve_parking"
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Confirm Booking & Pay
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 7. HEALTH PANEL */}
        {serviceType === 'health' && (
          <div className="space-y-4">
            
            {/* Air Quality Index Indicator */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center bg-emerald-50 text-emerald-800">
                <span className="text-xs font-black">34</span>
                <span className="text-[8px] font-bold relative -top-0.5 font-mono">AQI</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Sector Air Quality Excellent</h4>
                <p className="text-[10px] text-gray-500">Low particulate counting today. Perfect time for outdoor exercises & garden trails.</p>
              </div>
            </div>

            {/* Health Center Directory & Appointment booking */}
            <form onSubmit={handleHealthSubmit} className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 space-y-3">
              <h3 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider">Book Municipal Clinic Consultation</h3>
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Select Clinic Location</label>
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs"
                >
                  <option value="Central Public Health Clinic #3">Central Public Health Clinic #3 (Downtown)</option>
                  <option value="Eastside Children Clinic">Eastside Children & Maternal Hospital</option>
                  <option value="Oakridge City Health Post">Oakridge Smart Health Outpost (General)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Specialty Department</label>
                <select
                  value={clinicalDoc}
                  onChange={(e) => setClinicalDoc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs"
                >
                  <option value="General Practitioner / Checkup">General Health Checkup & Vitals</option>
                  <option value="Municipal Dentist Office">Dental Care Consultation</option>
                  <option value="Vaccination Center Dispatch">Seasonal Flu & Booster Vaccination</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 bg-white rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Select Hour</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 bg-white rounded text-xs"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn_book_health"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Confirm Free Consultation Slot
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 8. HOUSING FACILITIES PANEL */}
        {serviceType === 'housing' && (
          <div className="space-y-4">
            
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Municipal Rental Lottery</h3>
              <p className="text-[11px] text-gray-500 mb-3">Citizens with verified incomes can pre-apply or query placement status in municipal complexes, including water tax subsidization.</p>

              <form onSubmit={handleHousingSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Apartment Layout Preference</label>
                  <select
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs"
                  >
                    <option value="Affordable Studio Apartment">Affordable Studio (Downtown sector B)</option>
                    <option value="2-Bedroom Municipal Flat">2-Bedroom Family Apartment (Oakridge)</option>
                    <option value="Senior Citizen Assisted Housing">Senior Suite Complex (Level Ground Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Household Yearly Salary Bracket</label>
                  <select
                    value={familySalaryBracket}
                    onChange={(e) => setFamilySalaryBracket(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs"
                  >
                    <option value="Under ₹35,000 / Year">Under ₹35,000 / Year (Full Subsidy)</option>
                    <option value="Between ₹35,000 and ₹60,000">Between ₹35,000 and ₹60,000 (Partial Voucher)</option>
                    <option value="Over ₹60,000 / Year">Over ₹60,000 / Year (Standard Rent Cap)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  id="btn_apply_housing"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Submit Eligibility Inquiry
                </button>
              </form>
            </div>

            {/* Simulated Active waitlists */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">City Development Programs</h3>
              <div className="space-y-2 text-[11px] text-gray-600">
                <div className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">Eco-Block Community Housing</h4>
                    <p className="text-[9px] text-gray-400">Completion expected December 2026</p>
                  </div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">In Construction</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">First-Time Buyer Smart Grants</h4>
                    <p className="text-[9px] text-gray-400">Provides up to ₹15,000 down payment grant</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">OPEN</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. SAFETY & SECURITY PANEL */}
        {serviceType === 'safety' && (
          <div className="space-y-4">
            
            {/* Quick Emergency dispatch button */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center space-y-2">
              <AlertOctagon className="w-8 h-8 text-red-600 mx-auto animate-pulse" />
              <h3 className="text-xs font-black text-red-800">SOS Emergency Contact Line</h3>
              <p className="text-[10px] text-red-650">In case of an active crime, fire, or severe injury hazard, tap below to contact dispatch immediately.</p>
              <button
                type="button"
                onClick={() => {
                  triggerToast('Simulated SOS Dispatch Alert received. Coordinates transmitted instantly.');
                  onSubmitRequest({
                    serviceType: 'safety',
                    title: 'CRITICAL EMERGENCY BEACON ACTIVE',
                    description: 'SOS beacon clicked via citizen application. Local responders alert sent.',
                    urgency: 'High',
                    status: 'In Progress',
                  });
                }}
                className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 font-black text-xs rounded-xl transition shadow-md uppercase tracking-wider"
              >
                Trigger SOS Emergency Call
              </button>
            </div>

            {/* Standard Safety Reporter */}
            <form onSubmit={handleSafetySubmit} className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 space-y-3">
              <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded font-mono uppercase tracking-wider">MUNICIPAL DESPATCH SYSTEM</span>
              <h3 className="text-xs font-extrabold text-gray-700">Report Non-Emergency Safety Concern</h3>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Hazard Category</label>
                <select
                  value={safetyCategory}
                  onChange={(e) => setSafetyCategory(e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1"
                >
                  <option value="Pothole / Road Damage">Pothole / Severe Road Asphalt Damage</option>
                  <option value="Broken Streetlight / Security Blackout">Broken Streetlight / Security Blackout Area</option>
                  <option value="Exposed electrical wiring">Exposed Live Electrical Wiring Hazard</option>
                  <option value="Leaking hydrants">Severely Flooded Gutter / Leaking Fire Hydrant</option>
                  <option value="Suspicious Vehicle abandoned">Parked Suspicious Blockage Vehicle</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Select Dispatch Urgency</label>
                <div className="flex space-x-2">
                  {(['Low', 'Medium', 'High'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setSafetyUrgency(urg)}
                      className={`flex-1 py-1 text-xs font-bold rounded border uppercase ${safetyUrgency === urg ? 'bg-red-600 text-white border-transparent' : 'bg-white text-gray-650 hover:bg-gray-50 border-gray-200'}`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 block">Explain details</label>
                  <button
                    type="button"
                    id="btn_mic_safety"
                    onClick={() => startVoiceInput('safety')}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase transition-all duration-200 cursor-pointer ${
                      isRecording && recordingTarget === 'safety'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-indigo-50 text-indigo-755 hover:bg-slate-100 border border-indigo-100'
                    }`}
                  >
                    {isRecording && recordingTarget === 'safety' ? (
                      <>
                        <MicOff className="w-3 h-3 animate-bounce" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-indigo-600" />
                        <span>Voice Assist</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  required
                  value={safetyDescription}
                  onChange={(e) => setSafetyDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Street lamp #102 on Commercial Boulevard is sparking intermittently and is completely dark. High risk area."
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Add Image Evidence</label>
                <div className="space-y-2 mb-2">
                  {safetyPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 flex items-center space-x-3">
                      <img 
                        src={safetyPhoto} 
                        alt="Attached Evidence" 
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200/60" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">Hazard_Photo.jpg</p>
                        <p className="text-[9px] text-slate-400 font-mono">Captured via Cam-Dispatch</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSafetyPhoto(null)}
                        className="p-1 px-2.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCamera('safety')}
                      className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/15 rounded-xl text-xs font-semibold text-slate-600 bg-white transition flex items-center justify-center space-x-2"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span>Use Device Camera</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">GPS Positioning Tag</label>
                <p className="text-[10px] text-gray-500 font-mono italic bg-gray-50 p-2 rounded border border-gray-150 flex items-center justify-between">
                  <span>{coordinates}</span>
                  <Compass className="w-3.5 h-3.5 text-indigo-500 hover:scale-115 cursor-pointer" onClick={() => {
                    const lat = (40.7128 + (Math.random() - 0.5) * 0.01).toFixed(4);
                    const lng = (-74.0060 + (Math.random() - 0.5) * 0.01).toFixed(4);
                    setCoordinates(`Sector 4, GPS Coordinates: ${lat}° N, ${lng}° W`);
                  }} />
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn_submit_safety"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Send Report to Patrol Officers
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 10. DEVICE FIELD CAMERA MODAL OVERLAY */}
      <AnimatePresence>
        {cameraOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 text-slate-100 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col z-55"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-400 tracking-widest font-mono uppercase">CAM-DISPATCH v4.1</span>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder/Preview Section */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-850">
                {capturedTempPhoto ? (
                  <img
                    src={capturedTempPhoto}
                    alt="Captured Scene"
                    className="w-full h-full object-cover"
                  />
                ) : cameraError ? (
                  <div className="text-center p-4 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-300">Live Stream Blocked / Disabled</p>
                    <p className="text-[9px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Hardware block. Use the file selector or choose one of our smart city simulation presets below!
                    </p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}

                {/* Grid Overlay for Viewfinder */}
                {!capturedTempPhoto && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-30">
                    <div className="flex justify-between">
                      <div className="w-3 h-3 border-t-2 border-l-2 border-white" />
                      <div className="w-3 h-3 border-t-2 border-r-2 border-white" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-3 h-3 border-b-2 border-l-2 border-white" />
                      <div className="w-3 h-3 border-b-2 border-r-2 border-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Area */}
              <div className="p-4 space-y-4 bg-slate-900">
                {/* Captured State Options */}
                {capturedTempPhoto ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-mono text-center">Field Image Captured • Ready for Dispatch</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setCapturedTempPhoto(null)}
                        className="flex-1 py-2 bg-slate-850 text-slate-300 hover:bg-slate-755 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Retake Photo
                      </button>
                      <button
                        type="button"
                        onClick={saveCapturedPhoto}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-lg cursor-pointer"
                      >
                        Attach Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Trigger Capture Button */}
                    {!cameraError ? (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 border-4 border-slate-850 flex items-center justify-center transition shadow-lg text-white cursor-pointer"
                        >
                          <span className="w-5 h-5 rounded-full bg-white" />
                        </button>
                      </div>
                    ) : (
                      /* Fallback File Upload Selector */
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                          Option A: Import File From Storage
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="camera_fallback_file_input"
                          />
                          <label
                            htmlFor="camera_fallback_file_input"
                            className="w-full py-2 bg-slate-800 hover:bg-slate-755 text-slate-200 border border-slate-700 border-dashed rounded-xl text-xs font-semibold text-center cursor-pointer transition flex items-center justify-center space-x-2"
                          >
                            <span>Browse Device Library</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Presets Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        {cameraError ? 'Option B: Use Simulated Field Photo' : 'Or Simulate Field Photo Preset'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {getMockPhotos(cameraTarget || 'waste').map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setCapturedTempPhoto(preset.url);
                              triggerToast(`${preset.label} preset selected!`);
                            }}
                            className="border border-slate-800 hover:border-indigo-500 rounded-xl overflow-hidden cursor-pointer bg-slate-950 text-center transition"
                          >
                            <img src={preset.url} alt={preset.label} className="h-10 w-full object-cover" />
                            <div className="p-1">
                              <p className="text-[8px] font-bold text-slate-300 truncate">{preset.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
