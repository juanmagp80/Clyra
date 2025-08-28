'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
}

export default function CustomDatePicker({
  selected,
  onChange,
  placeholderText = "Seleccionar fecha",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  dateFormat = "dd/MM/yyyy",
  showTimeSelect = false,
  timeFormat = "HH:mm",
  timeIntervals = 15,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Estilos CSS globales para react-datepicker */}
      <style jsx global>{`
        .bonsai-datepicker-calendar {
          font-family: system-ui, -apple-system, sans-serif !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(16px) !important;
          background: rgba(255, 255, 255, 0.95) !important;
          overflow: hidden !important;
          min-width: 280px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-bottom: none !important;
          border-radius: 16px 16px 0 0 !important;
          padding: 20px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__current-month {
          color: white !important;
          font-weight: 700 !important;
          font-size: 1.1rem !important;
          margin-bottom: 8px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__navigation {
          top: 22px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__navigation--previous {
          left: 20px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__navigation--next {
          right: 20px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__navigation:hover *::before {
          border-color: white !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day-names {
          background: rgba(102, 126, 234, 0.1) !important;
          margin: 0 !important;
          padding: 12px 0 !important;
          border-top: 1px solid rgba(102, 126, 234, 0.2) !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day-name {
          color: #4f46e5 !important;
          font-weight: 700 !important;
          font-size: 0.8rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          width: 36px !important;
          line-height: 20px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__month {
          margin: 0 !important;
          padding: 16px !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day {
          margin: 3px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          border-radius: 10px !important;
          color: #374151 !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          font-size: 0.9rem !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day--selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          font-weight: 700 !important;
          transform: scale(1.1) !important;
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          transform: scale(1.05) !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day--today {
          background: rgba(102, 126, 234, 0.15) !important;
          color: #4f46e5 !important;
          font-weight: 700 !important;
          border: 2px solid rgba(102, 126, 234, 0.3) !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day--outside-month {
          color: #cbd5e0 !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day--disabled {
          color: #e2e8f0 !important;
          cursor: not-allowed !important;
        }

        .bonsai-datepicker-calendar .react-datepicker__day--disabled:hover {
          background: transparent !important;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Animación de entrada */
        .bonsai-datepicker-calendar {
          animation: fadeInScale 0.2s ease-out !important;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div className="relative">
        <DatePicker
          selected={selected}
          onChange={(date) => {
            onChange(date);
            // Solo cerrar automáticamente si no tiene selector de tiempo
            if (!showTimeSelect) {
              setIsOpen(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onClickOutside={() => setIsOpen(false)}
          open={isOpen}
          placeholderText={placeholderText}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat={dateFormat}
          showTimeSelect={showTimeSelect}
          timeFormat={timeFormat}
          timeIntervals={timeIntervals}
          timeCaption="Hora"
          className={`
            w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-slate-300 transition-colors duration-200
            bg-white text-slate-900 placeholder-slate-400
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}
          `}
          calendarClassName={`bonsai-datepicker-calendar ${showTimeSelect ? 'with-time-select' : ''}`}
          popperClassName="z-[99999]"
          wrapperClassName="w-full relative"
          popperPlacement="bottom-start"
          shouldCloseOnSelect={!showTimeSelect}
        />
        
        {/* Icono de calendario */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </>
  );
}
