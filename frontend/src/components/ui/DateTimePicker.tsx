import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import { CalendarDays, Clock } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  dateFormat?: string;
  required?: boolean;
}

export const DateTimePicker = ({
  label,
  selected,
  onChange,
  placeholderText,
  minDate,
  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeIntervals = 30,
  dateFormat,
  required,
}: DatePickerProps) => {
  const isTimeOnly = showTimeSelectOnly;
  const resolvedFormat = dateFormat ?? (isTimeOnly ? 'h:mm aa' : showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy');
  const Icon = isTimeOnly ? Clock : CalendarDays;

  return (
    <div className="w-full">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1.5">
          <Icon className="h-3.5 w-3.5 text-indigo-400" />
          {label}
        </label>
      )}
      <div className="rdp-input-wrapper rdp-dark relative">
        {/* Icon inside input */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className="h-4 w-4 text-zinc-500" />
        </div>
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholderText ?? (isTimeOnly ? 'Select time' : 'Select date')}
          minDate={minDate}
          showTimeSelect={showTimeSelect || showTimeSelectOnly}
          showTimeSelectOnly={showTimeSelectOnly}
          timeIntervals={timeIntervals}
          dateFormat={resolvedFormat}
          required={required}
          popperClassName="rdp-dark"
          calendarClassName="rdp-dark"
          timeCaption="Time"
          autoComplete="off"
        />
        {/* Chevron / dropdown icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
