import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, X, Phone, Mail } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// Interface BookingsManagerProps is removed.
export function BookingsManager({ chefData }) {
  const [bookingFilter, setBookingFilter] = useState('upcoming');

  // Mock bookings data
  const mockBookings = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      date: '2025-10-15',
      time: '19:00',
      guests: 8,
      location: 'Camps Bay, Cape Town',
      mealType: 'Dinner',
      coursePreference: 'Starters, mains & desserts',
      drinkPairings: true,
      status: 'confirmed',
      totalAmount: 5200,
      clientEmail: 'sarah.j@email.com',
      clientPhone: '+27 82 123 4567',
      dietaryRequirements: ['Vegetarian', 'Gluten-free']
    },
    {
      id: '2',
      clientName: 'Michael Chen',
      clientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date: '2025-10-18',
      time: '18:30',
      guests: 6,
      location: 'Constantia, Cape Town',
      mealType: 'Dinner',
      coursePreference: 'Mains & desserts',
      drinkPairings: false,
      status: 'pending',
      totalAmount: 3600,
      clientEmail: 'michael.c@email.com',
      clientPhone: '+27 83 987 6543',
      dietaryRequirements: []
    },
    {
      id: '3',
      clientName: 'Lisa van der Berg',
      clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      date: '2025-10-12',
      time: '12:00',
      guests: 4,
      location: 'Sea Point, Cape Town',
      mealType: 'Lunch',
      coursePreference: 'Starters & mains',
      drinkPairings: true,
      status: 'completed',
      totalAmount: 2400,
      clientEmail: 'lisa.vdb@email.com',
      clientPhone: '+27 81 456 7890',
      dietaryRequirements: ['Halaal']
    }
  ];

  // Type annotation removed from the status argument
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    if (bookingFilter === 'upcoming') {
      return booking.status === 'confirmed' || booking.status === 'pending';
    } else if (bookingFilter === 'pending') {
      return booking.status === 'pending';
    } else if (bookingFilter === 'completed') {
      return booking.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Manage bookings</h2>
        <Tabs value={bookingFilter} onValueChange={setBookingFilter}>
          <TabsList className="bg-white/5">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="p-6 rounded-3xl border-border/40">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Client Info */}
              <div className="flex items-start gap-4">
                <ImageWithFallback
                  src={booking.clientImage}
                  alt={booking.clientName}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{booking.clientName}</h3>
                    <Badge className={`rounded-xl ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {booking.clientEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {booking.clientPhone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(booking.date).toLocaleDateString('en-GB', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.time} • {booking.mealType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.guests} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.location}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Course:</span>
                    <p className="mt-1">{booking.coursePreference}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Drink pairings:</span>
                    <p className="mt-1">{booking.drinkPairings ? 'Yes' : 'No'}</p>
                  </div>
                  {booking.dietaryRequirements.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Dietary:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.dietaryRequirements.map((req) => (
                          <Badge key={req} variant="secondary" className="rounded-xl text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <p className="mt-1 font-semibold">R{booking.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {booking.status === 'pending' && (
                <div className="flex lg:flex-col gap-2">
                  <Button
                    className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredBookings.length === 0 && (
          <Card className="p-12 rounded-3xl border-border/40 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg mb-2">No {bookingFilter} bookings</h3>
            <p className="text-muted-foreground">
              You don't have any {bookingFilter} bookings at the moment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}