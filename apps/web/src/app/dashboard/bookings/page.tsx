'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
  Phone,
} from 'lucide-react';
import { mockStaff } from '@businessos/database';

export default function BookingsPage() {
  const { bookings, services, customers, addBooking, createInvoice, canAccess, addToast } = useApp();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(mockStaff[0]?.id || '');
  const [bookingTime, setBookingTime] = useState('Tomorrow 11:00 AM');
  const [notes, setNotes] = useState('');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const srv = services.find((s) => s.id === selectedServiceId) || services[0];
    const stf = mockStaff.find((s) => s.id === selectedStaffId) || mockStaff[0];

    addBooking({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      serviceId: srv.id,
      serviceName: srv.name,
      staffId: stf.id,
      staffName: stf.name,
      totalAmount: srv.price,
      notes,
    });

    setIsBookingModalOpen(false);
  };

  const handleGeneratePaymentLink = (customerName: string, amount: number) => {
    createInvoice(customerName, amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Bookings & Staff Scheduling</h1>
          <p className="text-xs text-slate-500 mt-1">Manage appointment calendars, staff rosters, service catalog, and Razorpay payment links.</p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('bookings:write') ? (
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-mono px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* Service Catalog & Staff Rosters Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Catalog */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Active Service Offerings</h3>
            <span className="text-xs text-slate-500">{services.length} Services</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((srv) => (
              <div key={srv.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{srv.name}</span>
                    <span className="text-xs font-bold text-blue-600">₹{srv.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{srv.description}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Duration: {srv.durationMinutes} mins</span>
                  <span className="text-slate-600 font-medium">{srv.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Roster */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Staff Availability</h3>
            <span className="text-xs text-emerald-600 font-bold">3 Active</span>
          </div>

          <div className="space-y-3">
            {mockStaff.map((stf) => (
              <div key={stf.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={stf.avatarUrl} alt={stf.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{stf.name}</h4>
                    <p className="text-[10px] text-slate-500">{stf.role}</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Appointments Schedule</h3>
          <span className="text-xs text-slate-500">{bookings.length} Bookings</span>
        </div>

        <div className="divide-y divide-slate-100">
          {bookings.map((bk) => (
            <div key={bk.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {bk.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{bk.customerName}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{bk.serviceName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assigned Staff: {bk.staffName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹{bk.totalAmount}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      bk.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {bk.paymentStatus}
                  </span>
                </div>

                {bk.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => handleGeneratePaymentLink(bk.customerName, bk.totalAmount)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    <span>Issue Razorpay Link</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Schedule Appointment</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Service</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Specialist Staff</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {mockStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Special Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Sensitive skin organic lotion requested"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
