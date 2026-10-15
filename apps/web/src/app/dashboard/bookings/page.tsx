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
  const { bookings, services, staff, customers, addBooking, createInvoice, canAccess, addToast } = useApp();
  const availableStaff = staff && staff.length > 0 ? staff : mockStaff;
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(availableStaff[0]?.id || '');
  const [bookingTime, setBookingTime] = useState('Tomorrow 11:00 AM');
  const [notes, setNotes] = useState('');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const srv = services.find((s) => s.id === selectedServiceId) || services[0];
    const stf = availableStaff.find((s) => s.id === selectedStaffId) || availableStaff[0];

    if (!cust || !srv) {
      addToast({ type: 'warning', title: 'Missing Details', message: 'Please select a customer and service.' });
      return;
    }

    try {
      await addBooking({
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        serviceId: srv.id,
        serviceName: srv.name,
        staffId: stf.id,
        staffName: stf.name,
        totalAmount: srv.price,
        notes: notes || bookingTime,
      });

      setIsBookingModalOpen(false);
    } catch {
      // Conflict or failure toast notification handled in addBooking
    }
  };

  const handleGeneratePaymentLink = (customerName: string, amount: number) => {
    createInvoice(customerName, amount);
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white">Smart Bookings & Staff Scheduling</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Manage appointment calendars, staff rosters, service catalog, and Razorpay payment links.</p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('bookings:write') ? (
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-400 font-mono px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* Service Catalog & Staff Rosters Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Catalog */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Active Service Offerings</h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{services.length} Services</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((srv) => (
              <div key={srv.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{srv.name}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{srv.price}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">{srv.description}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {srv.durationMinutes} mins</span>
                  <span className="font-mono">{srv.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Members Roster */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Staff Roster & Capacity</h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{availableStaff.length} On Duty</span>
          </div>

          <div className="space-y-2.5">
            {availableStaff.map((staff) => (
              <div key={staff.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{staff.name}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{staff.role} · {staff.phone}</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Schedule List */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Scheduled Appointments ({bookings.length})</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Live Roster</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 uppercase">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                    {bk.customerName}
                    <span className="block text-[10px] text-zinc-400 font-normal">{bk.customerPhone}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">{bk.serviceName}</td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">{bk.staffName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {bk.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-display">₹{bk.totalAmount}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleGeneratePaymentLink(bk.customerName, bk.totalAmount)}
                      className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-[10px] font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                    >
                      Issue Payment Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Schedule New Appointment</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Select Service Offering</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₹{s.price} ({s.durationMinutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assigned Staff Member</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {availableStaff.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.name} ({stf.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Appointment Slot Time</label>
                <input
                  type="text"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Tomorrow 3:00 PM"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Special Client Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Add specific preferences or instructions..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
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
