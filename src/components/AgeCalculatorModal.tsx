import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { JobNotification } from '../types/job';

interface AgeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetJob?: JobNotification | null;
  onSelectJob?: (job: JobNotification) => void;
}

export const AgeCalculatorModal: React.FC<AgeCalculatorModalProps> = ({
  isOpen,
  onClose,
  presetJob,
  onSelectJob,
}) => {
  const [dob, setDob] = useState('2000-05-15');
  const [asOfDate, setAsOfDate] = useState('2026-08-01');
  const [category, setCategory] = useState<'UR' | 'OBC' | 'SC_ST' | 'PwBD'>('UR');

  if (!isOpen) return null;

  const calculateAge = () => {
    if (!dob || !asOfDate) return null;
    const birthDate = new Date(dob);
    const targetDate = new Date(asOfDate);

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime()) || birthDate > targetDate) {
      return null;
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
  };

  const ageResult = calculateAge();

  const getRelaxationYears = () => {
    switch (category) {
      case 'OBC':
        return 3;
      case 'SC_ST':
        return 5;
      case 'PwBD':
        return 10;
      default:
        return 0;
    }
  };

  const checkEligibility = (minAge: number, maxAge: number) => {
    if (!ageResult) return false;
    const effectiveMaxAge = maxAge + getRelaxationYears();
    const candidateAge = ageResult.years + ageResult.months / 12 + ageResult.days / 365;
    return candidateAge >= minAge && candidateAge <= effectiveMaxAge;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-2.5 sm:p-6">
        <div className="relative bg-white w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Govt Job Age Calculator
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Calculate exact age on cut-off date with category relaxation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Input form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth (DOB)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age As On (Cut-off Date)
                </label>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reservation Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                >
                  <option value="UR">General / UR / EWS (No relax.)</option>
                  <option value="OBC">OBC (+3 Years)</option>
                  <option value="SC_ST">SC / ST (+5 Years)</option>
                  <option value="PwBD">PwBD / PH (+10 Years)</option>
                </select>
              </div>
            </div>

            {/* Calculated Result Card */}
            {ageResult ? (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                  Calculated Age on Cut-off Date
                </span>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {ageResult.years}
                  </span>
                  <span className="text-slate-600 font-medium text-sm">Years,</span>
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {ageResult.months}
                  </span>
                  <span className="text-slate-600 font-medium text-sm">Months,</span>
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {ageResult.days}
                  </span>
                  <span className="text-slate-600 font-medium text-sm">Days</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  <span>Total Days: <strong className="tabular-nums text-slate-700">{ageResult.totalDays.toLocaleString()}</strong></span>
                  <span>·</span>
                  <span>Relaxation Applied: <strong className="text-amber-700">+{getRelaxationYears()} Years</strong></span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs">
                Please enter a valid Date of Birth that is earlier than the cut-off date.
              </div>
            )}

            {/* If presetJob was passed from JobDetailModal */}
            {presetJob && ageResult && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Verification for: {presetJob.title}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-slate-700">
                    <p>Required Age Bracket: <strong>{presetJob.ageLimit.min} to {presetJob.ageLimit.max} Years</strong></p>
                    <p className="text-slate-500 mt-0.5">Your effective maximum limit: <strong>{presetJob.ageLimit.max + getRelaxationYears()} Years</strong></p>
                  </div>
                  {checkEligibility(presetJob.ageLimit.min, presetJob.ageLimit.max) ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Eligible by Age</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>Not Eligible by Age</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Popular Exam Eligibility Matrix */}
            {ageResult && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-100 font-bold text-xs text-slate-800">
                  Eligibility Quick Status for Major Exams
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { name: 'UPSC Civil Services (IAS/IPS)', min: 21, max: 32 },
                    { name: 'SSC CGL (Group B & C)', min: 18, max: 30 },
                    { name: 'RRB NTPC (Graduate Posts)', min: 18, max: 33 },
                    { name: 'SBI / IBPS Probationary Officer (PO)', min: 21, max: 30 },
                    { name: 'SSC GD Constable', min: 18, max: 23 },
                  ].map((exam, idx) => {
                    const isEligible = checkEligibility(exam.min, exam.max);
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-900">{exam.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Age Limit: {exam.min}–{exam.max} yrs (Max for your category: {exam.max + getRelaxationYears()} yrs)
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            isEligible
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {isEligible ? 'Eligible' : 'Age Barred'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
