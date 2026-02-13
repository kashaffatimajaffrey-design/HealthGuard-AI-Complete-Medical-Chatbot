
import React from 'react';

export const TableSkeleton: React.FC = () => (
  <div className="w-full animate-pulse space-y-4">
    <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
        <div className="flex-1 h-8 bg-slate-50 rounded-lg"></div>
        <div className="w-24 h-8 bg-slate-50 rounded-lg"></div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 animate-pulse space-y-4">
    <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
  </div>
);

export const WorkflowSkeleton: React.FC = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-6">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded w-32"></div>
        <div className="h-2 bg-slate-800 rounded w-20"></div>
      </div>
      <div className="w-12 h-7 bg-slate-800 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-12 bg-slate-800 rounded-xl"></div>
      <div className="h-12 bg-slate-800 rounded-xl"></div>
    </div>
  </div>
);
