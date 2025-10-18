"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Utensils, DollarSign, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PaymentForm } from '../payment/PaymentForm';
import { usePayment } from '../payment/PaymentProvider';

const steps = [
  { id: 'details', title: 'Event Details', icon: Calendar },
  { id: 'menu', title: 'Menu Selection', icon: Utensils },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'payment', title: 'Payment', icon: DollarSign },
  { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
];

export function BookingFlow({ chef, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    chefId: chef?.id,
    chefName: chef?.name,
    eventDate: '',
    eventTime: '',
    partySize: 1,
    dietaryRequirements: [],
    specialRequests: '',
    eventLocation: {
      street: '',
      suburb: '',
      city: '',
      postalCode: ''
    },
    menuSelection: {
      courseType: '',
      cuisineType: '',
      drinkPairings: false,
      customerSuppliesTools: false
    },
    subtotal: 0
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { calculateFees } = usePayment();

  useEffect(() => {
    if (bookingData.eventDate) {
      loadAvailableTimes(bookingData.eventDate);
    }
  }, [bookingData.eventDate]);

  useEffect(() => {
    // Calculate subtotal based on party size and chef's base rate
    const subtotal = bookingData.partySize * (chef?.baseRate || 500);
    setBookingData(prev => ({ ...prev, subtotal }));
  }, [bookingData.partySize, chef?.baseRate]);

  const loadAvailableTimes = async (date) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chefs/${chef.id}/availability?date=${date}`);
      const data = await response.json();
      setAvailableTimes(data.availableTimes || []);
    } catch (error) {
      console.error('Error loading available times:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStep(steps.length - 1);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Event Date</label>
              <Input
                type="date"
                value={bookingData.eventDate}
                onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-2xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Event Time</label>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={bookingData.eventTime === time ? "default" : "outline"}
                    onClick={() => setBookingData({ ...bookingData, eventTime: time })}
                    className="rounded-2xl"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Party Size</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={bookingData.partySize}
                onChange={(e) => setBookingData({ ...bookingData, partySize: parseInt(e.target.value) })}
                className="rounded-2xl"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Course Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Starters & Mains', 'Mains & Desserts', 'Full 3-Course', 'Tasting Menu'].map((type) => (
                  <Button
                    key={type}
                    variant={bookingData.menuSelection.courseType === type ? "default" : "outline"}
                    onClick={() => setBookingData({
                      ...bookingData,
                      menuSelection: { ...bookingData.menuSelection, courseType: type }
                    })}
                    className="rounded-2xl"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cuisine Type</label>
              <div className="flex flex-wrap gap-2">
                {chef.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={bookingData.menuSelection.cuisineType === specialty ? "default" : "outline"}
                    className="cursor-pointer rounded-xl"
                    onClick={() => setBookingData({
                      ...bookingData,
                      menuSelection: { ...bookingData.menuSelection, cuisineType: specialty }
                    })}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.menuSelection.drinkPairings}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    menuSelection: { ...bookingData.menuSelection, drinkPairings: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Include drink pairings (+R150 per person)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.menuSelection.customerSuppliesTools}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    menuSelection: { ...bookingData.menuSelection, customerSuppliesTools: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="text-sm">I will supply cooking tools and equipment</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Street Address</label>
              <Input
                value={bookingData.eventLocation.street}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  eventLocation: { ...bookingData.eventLocation, street: e.target.value }
                })}
                className="rounded-2xl"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Suburb</label>
                <Input
                  value={bookingData.eventLocation.suburb}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    eventLocation: { ...bookingData.eventLocation, suburb: e.target.value }
                  })}
                  className="rounded-2xl"
                  placeholder="Camps Bay"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  value={bookingData.eventLocation.city}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    eventLocation: { ...bookingData.eventLocation, city: e.target.value }
                  })}
                  className="rounded-2xl"
                  placeholder="Cape Town"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Postal Code</label>
              <Input
                value={bookingData.eventLocation.postalCode}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  eventLocation: { ...bookingData.eventLocation, postalCode: e.target.value }
                })}
                className="rounded-2xl"
                placeholder="8005"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Special Requests</label>
              <Textarea
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                className="rounded-2xl"
                placeholder="Any special dietary requirements or preferences..."
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <PaymentForm
            bookingData={bookingData}
            onSuccess={() => setCurrentStep(steps.length - 1)}
            onError={(error) => console.error('Payment error:', error)}
          />
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your booking with {chef.name} has been confirmed. You'll receive a confirmation email shortly.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-left">
              <h4 className="font-semibold mb-2">Booking Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{bookingData.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{bookingData.eventTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingData.partySize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>R{calculateFees(bookingData.subtotal).total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-border/40">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Book {chef?.name}</h2>
              <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <Button variant="ghost" onClick={onClose} className="rounded-2xl">
              ×
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                      : 'bg-white/10 text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="rounded-2xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={currentStep === steps.length - 2 ? handleSubmit : handleNext}
                disabled={isLoading}
                className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500"
              >
                {isLoading ? 'Processing...' : currentStep === steps.length - 2 ? 'Complete Booking' : 'Next'}
                {currentStep < steps.length - 2 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}