/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceType =
  | 'utilities'
  | 'meter'
  | 'payments'
  | 'waste'
  | 'transportation'
  | 'parking'
  | 'health'
  | 'housing'
  | 'safety';

export interface CitizenProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  citizenCardId: string;
  balance: number;
  avatarUrl: string;
  waterAccountNum: string;
  electricityAccountNum: string;
}

export interface ServiceRequest {
  id: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Action Required';
  date: string;
  urgency: 'Low' | 'Medium' | 'High';
  referenceNo: string;
  specificDetails?: Record<string, string | number | boolean>;
}

export interface BillRecord {
  id: string;
  title: string;
  type: 'Electricity' | 'Water' | 'Gas' | 'Municipal Tax';
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  usageVal: number;
  unit: string;
}

export interface TransitRoute {
  id: string;
  lineName: string;
  destination: string;
  minutesAway: number;
  type: 'bus' | 'metro' | 'rail';
  status: 'On Time' | 'Delayed' | 'Advisory';
}

export interface ParkingSpot {
  id: string;
  zone: string;
  location: string;
  available: number;
  total: number;
  ratePerHour: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  category: ServiceType | 'general';
}

export interface MeterReading {
  id: string;
  type: 'Water' | 'Electricity';
  value: number;
  date: string;
  status: 'Verified' | 'Pending Verification' | 'Rejected';
  reportedValue: number;
}
