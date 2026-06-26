/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, Search, Loader2, CheckCircle2, AlertTriangle, Clock, XCircle, 
  Trash2, ChevronRight, MapPin, Tag, Plus, Filter, FileText
} from 'lucide-react';
import { ServiceRequest, ServiceType } from '../types';

interface ActivityTabProps {
  requests: ServiceRequest[];
  onCancelRequest: (requestId: string) => void;
  onSelectService: (type: ServiceType) => void;
}

export default function ActivityTab({
  requests,
  onCancelRequest,
  onSelectService,
}: ActivityTabProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Filter requests based on status and search query
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4 font-sans relative">
      
      {/* Tab Header Banner */}
      <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-800">Filing History & Trackers</h2>
        </div>
        <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold font-mono">
          {requests.length} FILINGS
        </span>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, title or type..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Categories tags filters */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((status) => (
            <button
               key={status}
               onClick={() => setFilterStatus(status)}
               className={`py-1 px-3 rounded-full text-[10px] font-bold border transition ${filterStatus === status ? 'bg-blue-600 text-white border-transparent shadow-xs' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Request Cards Container */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-700 font-bold">No filings matched your filters.</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Submit a utility meter scan, parking bay lock, or municipal emergency to get started.</p>
            </div>
            <button
              onClick={() => onSelectService('safety')}
              id="empty_grid_trigger_safety"
              className="px-4 py-1.5 bg-blue-600 text-white font-bold text-[10px] rounded-xl hover:bg-blue-700 transition"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className="bg-white rounded-2xl p-4.5 shadow-sm border border-slate-150 cursor-pointer hover:border-blue-500/35 hover:bg-blue-50/10 transition-all duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-mono">
                      {request.referenceNo}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-800 line-clamp-1">{request.title}</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{request.description}</p>
                </div>
                
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full shrink-0 border uppercase tracking-wider ${request.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-3xs' : request.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-650 border-indigo-200'}`}>
                  {request.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <div className="flex items-center space-x-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{request.date}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                  <span className={`w-1.5 h-1.5 rounded-full ${request.urgency === 'High' ? 'bg-red-500 animate-pulse' : request.urgency === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider font-mono">{request.urgency} Priority</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expanded Filing Details Modal bottom sheet */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4">
            <motion.div
              initial={{ y: 250 }}
              animate={{ y: 0 }}
              exit={{ y: 250 }}
              className="bg-white w-full max-w-sm rounded-t-3xl p-5 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              {/* Sheet Title */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-blue-600 font-mono tracking-wider uppercase">Filing Dispatch</h4>
                  <p className="text-[10px] text-slate-400">Reference: {selectedRequest.referenceNo}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-500 rounded-lg"
                >
                  Close
                </button>
              </div>

              {/* Core Info */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-800">{selectedRequest.title}</h3>
                <p className="text-[11px] text-slate-655 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Details timelines */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Filing Parameters</h4>
                
                <div className="text-[10px] space-y-1.5 font-mono text-slate-600 divide-y divide-slate-150">
                  <div className="flex justify-between py-1">
                    <span>Category:</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedRequest.serviceType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Submitted On:</span>
                    <span className="font-bold text-slate-800">{selectedRequest.date}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Dispatch Urgency:</span>
                    <span className="font-bold text-slate-800 uppercase">{selectedRequest.urgency}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Filing Status:</span>
                    <span className={`font-bold ${selectedRequest.status === 'Completed' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {selectedRequest.status}
                    </span>
                  </div>

                  {/* Render service specific keys dynamically */}
                  {selectedRequest.specificDetails && Object.entries(selectedRequest.specificDetails).map(([key, val]) => {
                    if (key === 'Attached Photo') {
                      return (
                        <div key={key} className="py-2 space-y-1">
                          <span className="text-slate-400">Attached Field Evidence:</span>
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-3xs max-w-xs mx-auto aspect-video">
                            <img 
                              src={val.toString()} 
                              alt="Camera Capture Evidence" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="flex justify-between py-1">
                        <span>{key}:</span>
                        <span className="font-bold text-slate-800">{val.toString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons list */}
              <div className="space-y-2 pt-2">
                {selectedRequest.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      onCancelRequest(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    id={`btn_cancel_request_${selectedRequest.id}`}
                    className="w-full py-2 bg-red-50 text-red-600 border border-red-150 hover:bg-red-100 transition text-xs font-bold rounded-xl flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Retract/Cancel Filing</span>
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full py-2 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition text-xs font-bold rounded-xl"
                >
                  Dismiss Overlay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
