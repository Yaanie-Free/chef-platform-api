import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export default function BookingCalendar({ 
  selectedDate,
  availableDates = [],
  onSelect = () => {},
  minDate = new Date(),
  maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date) => {
    return availableDates.some(d => 
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  const isDateInRange = (date) => {
    return date >= minDate && date <= maxDate;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();
      const isAvailable = isDateAvailable(date) && isDateInRange(date);
      
      days.push(
        <button
          key={day}
          onClick={() => isAvailable && onSelect(date)}
          disabled={!isAvailable}
          className={`
            p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center
            transition-colors duration-200
            ${isSelected 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : isAvailable
                ? 'hover:bg-emerald-50 text-gray-900'
                : 'text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrevMonth}
            disabled={new Date(currentDate.getFullYear(), currentDate.getMonth()) <= minDate}
            className="p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            variant="outline"
            onClick={handleNextMonth}
            disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1) > maxDate}
            className="p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {days.map(day => (
          <div key={day} className="text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {renderCalendarDays()}
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <span>Unavailable</span>
        </div>
      </div>
    </Card>
  );
};
  )
}
