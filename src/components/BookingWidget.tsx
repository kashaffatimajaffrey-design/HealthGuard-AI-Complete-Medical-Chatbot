
import React, { useState } from 'react';

interface BookingWidgetProps {
  onSelect: (slot: string) => void;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState('2023-11-20');
  const slots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '04:00 PM'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">Select an Appointment</span>
        <i className="fa-solid fa-calendar-day text-[#0EA5E9]"></i>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Available Dates</label>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { day: 'Mon', num: '20', full: '2023-11-20' },
              { day: 'Tue', num: '21', full: '2023-11-21' },
              { day: 'Wed', num: '22', full: '2023-11-22' },
              { day: 'Thu', num: '23', full: '2023-11-23' },
              { day: 'Fri', num: '24', full: '2023-11-24' }
            ].map(d => (
              <button
                key={d.full}
                onClick={() => setSelectedDate(d.full)}
                className={`
                  flex flex-col items-center min-w-[50px] p-2 rounded-lg border transition-all
                  ${selectedDate === d.full ? 'border-[#0EA5E9] bg-sky-50 text-[#0EA5E9]' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}
                `}
              >
                <span className="text-[10px] font-medium">{d.day}</span>
                <span className="text-sm font-bold">{d.num}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Available Time Slots</label>
          <div className="grid grid-cols-2 gap-2">
            {slots.map(slot => (
              <button
                key={slot}
                onClick={() => onSelect(`${selectedDate} at ${slot}`)}
                className="py-2 px-3 border border-slate-100 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 hover:border-[#0EA5E9] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        <span className="text-[10px] text-slate-500">Appointments are 30-min durations.</span>
      </div>
    </div>
  );
};

export default BookingWidget;
