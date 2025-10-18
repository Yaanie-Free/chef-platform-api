import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Utensils, MapPin, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function BookingCalendar({ chef, onClose, onBookingConfirm }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [mealType, setMealType] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const totalSteps = 4;

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const todayForComparison = new Date();
      todayForComparison.setHours(0, 0, 0, 0);
      const currentDateForComparison = new Date(currentDate);
      currentDateForComparison.setHours(0, 0, 0, 0);
      const isPast = currentDateForComparison < todayForComparison;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && currentDate.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        isAvailable: isCurrentMonth && !isPast && Math.random() > 0.3 // Mock availability
      });
    }
    
    return days;
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', price: '150' },
    { value: 'lunch', label: 'Lunch', price: '280' },
    { value: 'dinner', label: 'Dinner', price: '450' },
    { value: 'brunch', label: 'Brunch', price: '220' }
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleDateSelect = (day) => {
    if (day.isAvailable) {
      setSelectedDate(day.date);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedDate !== null;
      case 2: return selectedTime !== '';
      case 3: return mealType !== '';
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBookingConfirm = () => {
    const bookingData = {
      chef: chef,
      date: selectedDate,
      time: selectedTime,
      guestCount: guestCount,
      mealType: mealType,
      specialRequests: specialRequests
    };
    onBookingConfirm(bookingData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Select a date</h3>
              <p className="text-muted-foreground">Choose when you'd like Chef {chef.name} to cook for you</p>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevMonth} className="rounded-2xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h4 className="text-lg">
                {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h4>
              <Button variant="outline" size="sm" onClick={nextMonth} className="rounded-2xl">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-sm text-muted-foreground">
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  disabled={!day.isAvailable}
                  className={`
                    p-2 text-sm rounded-xl transition-colors
                    ${!day.isCurrentMonth ? 'text-muted-foreground/40' : ''}
                    ${day.isPast || !day.isAvailable ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-accent'}
                    ${day.isToday ? 'bg-accent' : ''}
                    ${day.isSelected ? 'bg-white text-black' : ''}
                    ${day.isAvailable && day.isCurrentMonth ? 'font-medium' : ''}
                  `}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <p className="text-sm text-muted-foreground">Selected date</p>
                <p className="font-medium">{selectedDate.toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Choose a time</h3>
              <p className="text-muted-foreground">Select your preferred cooking time</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="rounded-2xl p-3 h-auto"
                  onClick={() => setSelectedTime(time)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {time}
                </Button>
              ))}
            </div>

            {selectedTime && (
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <p className="text-sm text-muted-foreground">Selected time</p>
                <p className="font-medium">{selectedTime}</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Meal details</h3>
              <p className="text-muted-foreground">Tell us about your dining preferences</p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4" />
                Meal type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {mealTypes.map((meal) => (
                  <Button
                    key={meal.value}
                    variant={mealType === meal.value ? "default" : "outline"}
                    className="rounded-2xl p-4 h-auto flex-col"
                    onClick={() => setMealType(meal.value)}
                  >
                    <span className="font-medium">{meal.label}</span>
                    <span className="text-sm text-muted-foreground">R{meal.price} pp</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                Number of guests
              </Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 rounded-full"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                >
                  -
                </Button>
                <span className="text-xl font-medium w-12 text-center">{guestCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 rounded-full"
                  onClick={() => setGuestCount(guestCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Final details</h3>
              <p className="text-muted-foreground">Add any special requests or dietary requirements</p>
            </div>

            {/* Booking Summary */}
            <Card className="p-4 rounded-2xl bg-white/5">
              <h4 className="font-medium mb-3">Booking summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Chef:</span>
                  <span>{chef.name} {chef.surname}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedDate?.toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{guestCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meal type:</span>
                  <span className="capitalize">{mealType}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span>Estimated total:</span>
                  <span>R{(parseInt(mealTypes.find(m => m.value === mealType)?.price || '0') * guestCount).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" />
                Special requests (optional)
              </Label>
              <Textarea
                placeholder="Any dietary requirements, allergies, or special requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="rounded-2xl"
                rows={4}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Final quote will be provided by the chef</p>
              <p>• 5% service fee applies to confirmed bookings</p>
              <p>• Free cancellation up to 24 hours before</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl">Book Chef {chef.name}</h2>
            <p className="text-sm text-muted-foreground">{chef.location}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-2xl">
            ×
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep} className="flex-1 rounded-2xl">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={nextStep} 
              disabled={!canProceed()}
              className="flex-1 rounded-2xl bg-white text-black hover:bg-white/90"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleBookingConfirm} 
              disabled={!canProceed()}
              className="flex-1 rounded-2xl bg-white text-black hover:bg-white/90"
            >
              Request booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}