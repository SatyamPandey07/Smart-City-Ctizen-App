/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, Droplet, Clock, TrendingUp, Sparkles, Building2, Trash2, 
  Leaf, Info, MapPin, Gauge, Flame, CheckCircle2
} from 'lucide-react';
import { BillRecord, ServiceRequest } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';

interface DashboardTabProps {
  bills: BillRecord[];
  requests: ServiceRequest[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-2xl shadow-xl text-[10px] space-y-1 font-mono">
        <p className="font-extrabold text-slate-350 uppercase tracking-widest">{label} Report</p>
        <div className="space-y-1.5 pt-1">
          {payload.map((entry: any) => {
            let unit = '';
            if (entry.name === 'Electricity') unit = ' kWh';
            else if (entry.name === 'Water') unit = ' L';
            else if (entry.name === 'Gas') unit = ' m³';
            return (
              <div key={entry.name} className="flex justify-between items-center gap-4">
                <span className="font-semibold" style={{ color: entry.stroke || entry.color }}>
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value}{unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardTab({ bills, requests }: DashboardTabProps) {
  const [hoveredBar, setHoveredBar] = useState<{ type: 'power' | 'water'; index: number } | null>(null);

  // Monthly trends state for Recharts line chart visualization (Electricity [kWh], Water [L], Gas [m³])
  const [monthlyTrends] = useState([
    { month: 'Jan', Electricity: 280, Water: 4800, Gas: 95 },
    { month: 'Feb', Electricity: 310, Water: 5200, Gas: 115 },
    { month: 'Mar', Electricity: 295, Water: 4900, Gas: 85 },
    { month: 'Apr', Electricity: 240, Water: 5300, Gas: 60 },
    { month: 'May', Electricity: 325, Water: 5900, Gas: 40 },
    { month: 'Jun', Electricity: 395, Water: 6400, Gas: 30 },
  ]);

  // Dynamic peak consumption pattern analysis
  const peakElectricity = Math.max(...monthlyTrends.map(t => t.Electricity));
  const peakWater = Math.max(...monthlyTrends.map(t => t.Water));
  const peakGas = Math.max(...monthlyTrends.map(t => t.Gas));

  const peakElecMonth = monthlyTrends.find(t => t.Electricity === peakElectricity)?.month || 'N/A';
  const peakWaterMonth = monthlyTrends.find(t => t.Water === peakWater)?.month || 'N/A';
  const peakGasMonth = monthlyTrends.find(t => t.Gas === peakGas)?.month || 'N/A';

  const [activeSeries, setActiveSeries] = useState({
    Electricity: true,
    Water: true,
    Gas: true,
  });

  // Simulated active parking countdown timer if a parking request is outstanding
  const activeParkingRequest = requests.find(
    (r) => r.serviceType === 'parking' && r.status === 'Completed'
  );

  const [parkingTimeSecs, setParkingTimeSecs] = useState<number>(3600 * 2); // 2 hours default

  useEffect(() => {
    if (activeParkingRequest) {
      // Pick custom hours if specified
      const customHours = activeParkingRequest.specificDetails?.['Duration Hours'] as number;
      if (customHours) {
        setParkingTimeSecs(customHours * 3600);
      }
    }
  }, [activeParkingRequest]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParkingTimeSecs((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSecs = (total: number) => {
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Electricity Usage Data (recent 5 days)
  const powerUsageHistory = [
    { label: 'Mon', kWh: 12.4, cost: 3.10 },
    { label: 'Tue', kWh: 14.8, cost: 3.70 },
    { label: 'Wed', kWh: 9.2, cost: 2.30 },
    { label: 'Thu', kWh: 11.5, cost: 2.87 },
    { label: 'Fri', kWh: 15.1, cost: 3.77 },
  ];

  // 2. Water Usage Data (recent 5 days)
  const waterUsageHistory = [
    { label: 'Mon', liters: 180, cost: 0.90 },
    { label: 'Tue', liters: 210, cost: 1.05 },
    { label: 'Wed', liters: 150, cost: 0.75 },
    { label: 'Thu', liters: 195, cost: 0.98 },
    { label: 'Fri', liters: 240, cost: 1.20 },
  ];

  const paidBillsCount = bills.filter((b) => b.isPaid).length;
  const totalBillsCount = bills.length;

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4 font-sans">
      
      {/* City Diagnostics Hub Title */}
      <div className="flex justify-between items-center bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-800">Smart Grid Diagnostics</h2>
        </div>
        <span className="text-[9px] bg-blue-50 text-blue-650 px-2 py-0.5 border border-blue-100 rounded-full font-bold font-mono">LIVE TELEMETRY</span>
      </div>

      {/* Dynamic Active Parking Reservation Box */}
      {activeParkingRequest ? (
        <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-150 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-red-800">
              <MapPin className="w-4 h-4" />
              <h4 className="text-xs font-black">Active Parking Session</h4>
            </div>
            <p className="text-[10px] text-red-650 font-mono">
              Vehicle: {activeParkingRequest.specificDetails?.['Vehicle Plate'] || 'ACTIVE'}
            </p>
            <p className="text-[10px] text-gray-500">
              Zone: {activeParkingRequest.title}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-[9px] font-bold text-red-500 tracking-wider">RESERVED TIME REMAINING</p>
            <span className="text-lg font-black text-red-700 font-mono block tracking-widest leading-none mt-1">
              {parkingTimeSecs > 0 ? formatSecs(parkingTimeSecs) : 'Lapsed'}
            </span>
          </div>
        </div>
      ) : null}

      {/* Double Row Smart Meter Statistics Widgets */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 text-amber-500 flex items-center justify-center mb-2 border border-amber-200 shadow-3xs">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Avg Daily Power</p>
          <p className="text-sm font-black text-slate-800 mt-1">12.6 kWh</p>
          <div className="text-[9px] text-emerald-600 font-bold font-mono mt-2 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-150 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-emerald-500 rotate-180" />
            <span>-3.2% vs last week</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 text-blue-500 flex items-center justify-center mb-2 border border-blue-200 shadow-3xs">
            <Droplet className="w-5 h-5" />
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Avg Daily Water</p>
          <p className="text-sm font-black text-slate-800 mt-1">195 Liters</p>
          <div className="text-[9px] text-rose-600 font-bold font-mono mt-2 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-150 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-rose-500" />
            <span>+1.5% vs last week</span>
          </div>
        </div>
      </div>

      {/* Recharts Monthly Utility Trends Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-650" />
              <span>Monthly Utility Consumption Trends</span>
            </h3>
            <p className="text-[9px] text-slate-400">Interactive historical statistics and load diagnostics</p>
          </div>
          <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-750 px-2 py-0.5 rounded-full font-bold font-mono font-sans tracking-wide uppercase">RECHARTS HUD</span>
        </div>

        {/* Interactive series toggles */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveSeries(prev => ({ ...prev, Electricity: !prev.Electricity }))}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
              activeSeries.Electricity 
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeSeries.Electricity ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
            <Zap className="w-3 h-3" />
            <span>Electricity (kWh)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSeries(prev => ({ ...prev, Water: !prev.Water }))}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
              activeSeries.Water 
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeSeries.Water ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
            <Droplet className="w-3 h-3" />
            <span>Water (Liters)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSeries(prev => ({ ...prev, Gas: !prev.Gas }))}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
              activeSeries.Gas 
                ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeSeries.Gas ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} />
            <Flame className="w-3 h-3" />
            <span>Gas (m³)</span>
          </button>
        </div>

        {/* Chart Window */}
        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrends}
              margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={6}
                className="font-mono font-semibold"
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                dx={-4}
                className="font-mono font-semibold"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                dx={4}
                className="font-mono font-semibold"
              />
              <RechartsTooltip content={<CustomTooltip />} />
              {activeSeries.Electricity && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Electricity"
                  name="Electricity"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#fbbf24', strokeWidth: 0 }}
                  activeDot={{ r: 6.5, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              )}
              {activeSeries.Water && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Water"
                  name="Water"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 6.5, stroke: '#2563eb', strokeWidth: 2 }}
                />
              )}
              {activeSeries.Gas && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Gas"
                  name="Gas"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#8b5cf6', strokeWidth: 0 }}
                  activeDot={{ r: 6.5, stroke: '#7c3aed', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metadata description bar */}
        <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-[9px] text-slate-500 font-mono">
          <div className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Left Axis: Elec/Gas | Right Axis: Water flow</span>
          </div>
          <span className="font-extrabold text-slate-450 uppercase">6-Month Trend</span>
        </div>

        {/* 6-Month Consumption Pattern Analytics Section */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-1.5 pb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono">Grid Pattern Analysis</h4>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Electricity Pattern */}
            <div className="bg-amber-50/40 border border-amber-100/70 rounded-2xl p-2.5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-amber-800 uppercase tracking-wider font-mono">Electricity Peak</span>
                <Zap className="w-3 h-3 text-amber-500" />
              </div>
              <p className="text-xs font-black text-slate-800">{peakElectricity} <span className="text-[8px] font-mono font-semibold text-slate-400">kWh</span></p>
              <p className="text-[8px] text-amber-700 font-bold font-mono">Spike: {peakElecMonth}</p>
              <div className="w-full h-1 bg-amber-100/50 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(peakElectricity / 450) * 100}%` }} />
              </div>
            </div>

            {/* Water Pattern */}
            <div className="bg-blue-50/40 border border-blue-100/70 rounded-2xl p-2.5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-blue-800 uppercase tracking-wider font-mono">Water Peak</span>
                <Droplet className="w-3 h-3 text-blue-500" />
              </div>
              <p className="text-xs font-black text-slate-800">{(peakWater / 1000).toFixed(1)}k <span className="text-[8px] font-mono font-semibold text-slate-400">L</span></p>
              <p className="text-[8px] text-blue-700 font-bold font-mono">Spike: {peakWaterMonth}</p>
              <div className="w-full h-1 bg-blue-100/50 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(peakWater / 8000) * 100}%` }} />
              </div>
            </div>

            {/* Gas Pattern */}
            <div className="bg-purple-50/40 border border-purple-100/70 rounded-2xl p-2.5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-purple-800 uppercase tracking-wider font-mono">Gas Peak</span>
                <Flame className="w-3 h-3 text-purple-500" />
              </div>
              <p className="text-xs font-black text-slate-800">{peakGas} <span className="text-[8px] font-mono font-semibold text-slate-400">m³</span></p>
              <p className="text-[8px] text-purple-700 font-bold font-mono">Spike: {peakGasMonth}</p>
              <div className="w-full h-1 bg-purple-100/50 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(peakGas / 150) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* AI Pattern Recommendations Panel */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-extrabold text-slate-800">Adaptive Smart-Grid Energy Pattern Insights</p>
              <p className="text-[9px] text-slate-500 leading-relaxed">
                Electricity and water reached peak levels concurrently in <strong className="text-indigo-650">{peakElecMonth}</strong>. 
                This points to high summer air-conditioning loads and peak cooling-tower usage. 
                We recommend enabling <span className="font-bold text-emerald-600">Smart-Eco Shading</span> in the afternoon to shave peak electricity demand by up to 14%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Electricity Chart (Pure Responsive Custom SVG) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Electricity Consumption</span>
            </h3>
            <p className="text-[9px] text-slate-400">Total reported usage (5-day cycle)</p>
          </div>
          <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold font-mono border border-amber-150">kWh</span>
        </div>

        {/* Custom SVG Bar Graph */}
        <div className="relative pt-4">
          <svg className="w-full h-36" viewBox="0 0 400 150" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1="55" x2="400" y2="55" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" strokeWidth="1.5" />

            {/* Bars */}
            {powerUsageHistory.map((item, index) => {
              const barWidth = 32;
              const xCoord = index * 80 + 35;
              const maxkWh = 20; 
              const valueHeight = (item.kWh / maxkWh) * 100;
              const yCoord = 120 - valueHeight;

              return (
                <g key={item.label} className="cursor-pointer">
                  {/* Hover visual highlight border */}
                  <rect
                    x={xCoord - 4}
                    y={yCoord - 4}
                    width={barWidth + 8}
                    height={valueHeight + 4}
                    fill="transparent"
                    onMouseEnter={() => setHoveredBar({ type: 'power', index })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {/* Actual solid bar */}
                  <rect
                    x={xCoord}
                    y={yCoord}
                    width={barWidth}
                    height={valueHeight}
                    rx="4"
                    fill={hoveredBar?.type === 'power' && hoveredBar.index === index ? '#f59e0b' : '#fbbf24'}
                    className="transition-colors duration-150"
                  />
                  {/* Floating index digits label */}
                  <text
                    x={xCoord + barWidth / 2}
                    y={yCoord - 6}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-gray-600 font-mono"
                  >
                    {item.kWh}
                  </text>
                  {/* Footer Labels */}
                  <text
                    x={xCoord + barWidth / 2}
                    y={138}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-500 uppercase font-sans"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
          
          <div className="pt-2"></div>
        </div>

        {/* Hover Tooltip display */}
        {hoveredBar?.type === 'power' && (
          <div className="bg-amber-50 p-2 border border-amber-200 rounded text-[10px] font-mono leading-none text-amber-800">
            {powerUsageHistory[hoveredBar.index].label} Grid Activity: {powerUsageHistory[hoveredBar.index].kWh} kWh (Est. cost: ₹{powerUsageHistory[hoveredBar.index].cost.toFixed(2)})
          </div>
        )}
      </div>

      {/* 2. Water Chart (Pure Responsive Custom SVG) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-805 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-blue-500" />
              <span>Water Utility Consumption</span>
            </h3>
            <p className="text-[9px] text-slate-400">Total reported usage (5-day cycle)</p>
          </div>
          <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-bold font-mono border border-blue-150">Liters</span>
        </div>

        {/* Custom SVG Bar Graph */}
        <div className="relative pt-4">
          <svg className="w-full h-36" viewBox="0 0 400 150" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1="55" x2="400" y2="55" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" strokeWidth="1.5" />

            {/* Bars */}
            {waterUsageHistory.map((item, index) => {
              const barWidth = 32;
              const xCoord = index * 80 + 35;
              const maxLiters = 300; 
              const valueHeight = (item.liters / maxLiters) * 100;
              const yCoord = 120 - valueHeight;

              return (
                <g key={item.label} className="cursor-pointer">
                  <rect
                    x={xCoord - 4}
                    y={yCoord - 4}
                    width={barWidth + 8}
                    height={valueHeight + 4}
                    fill="transparent"
                    onMouseEnter={() => setHoveredBar({ type: 'water', index })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <rect
                    x={xCoord}
                    y={yCoord}
                    width={barWidth}
                    height={valueHeight}
                    rx="4"
                    fill={hoveredBar?.type === 'water' && hoveredBar.index === index ? '#2563eb' : '#60a5fa'}
                    className="transition-colors duration-150"
                  />
                  <text
                    x={xCoord + barWidth / 2}
                    y={yCoord - 6}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-gray-600 font-mono"
                  >
                    {item.liters}L
                  </text>
                  <text
                    x={xCoord + barWidth / 2}
                    y={138}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-500 uppercase font-sans"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
          
          <div className="pt-2"></div>
        </div>

        {/* Hover Tooltip display */}
        {hoveredBar?.type === 'water' && (
          <div className="bg-blue-50 p-2 border border-blue-200 rounded text-[10px] font-mono leading-none text-blue-800">
            {waterUsageHistory[hoveredBar.index].label} Flow Activity: {waterUsageHistory[hoveredBar.index].liters} Liters (Est. cost: ₹{waterUsageHistory[hoveredBar.index].cost.toFixed(2)})
          </div>
        )}
      </div>

      {/* Sustainable Goals Progress */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sustainable City Scorecard</span>
          </h3>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono">ECO RANK: A+</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              <span>Recycle Separation</span>
              <span>78% achieved</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              <span>Smart Billing Cleared</span>
              <span>{paidBillsCount} of {totalBillsCount} Paid</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: totalBillsCount ? `${(paidBillsCount / totalBillsCount) * 100}%` : '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
