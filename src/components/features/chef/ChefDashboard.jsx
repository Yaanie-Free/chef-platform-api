"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Settings, BarChart3, Users, Star, DollarSign, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DashboardStats } from './DashboardStats';
import { BookingsManager } from './BookingsManager';
import { MessagesPanel } from './MessagesPanel';
import { PostsManager } from './PostsManager';
import { ProfileSettings } from './ProfileSettings';
import { ReviewsManager } from './ReviewsManager';

export function ChefDashboard({ chefData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalReviews: 0,
    averageRating: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPosts: 0,
    profileViews: 0
  });

  useEffect(() => {
    // Load chef stats
    loadChefStats();
  }, []);

  const loadChefStats = async () => {
    try {
      const response = await fetch('/api/chefs/stats', {
        headers: {
          'Authorization': `Bearer ${chefData.token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading chef stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'New Booking',
      description: 'View pending booking requests',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      action: () => setActiveTab('bookings')
    },
    {
      title: 'Messages',
      description: 'Check customer messages',
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: () => setActiveTab('messages')
    },
    {
      title: 'Create Post',
      description: 'Share your latest work',
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      action: () => setActiveTab('posts')
    },
    {
      title: 'Update Profile',
      description: 'Manage your profile settings',
      icon: Settings,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      action: () => setActiveTab('profile')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chef Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {chefData?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge className="bg-green-500/10 text-green-500 border-green-200">
                  Available
                </Badge>
              </div>
              <Button variant="outline" className="rounded-2xl">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="p-6 rounded-3xl border-border/40 hover:border-border transition-all duration-200 cursor-pointer group"
                  onClick={action.action}
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/5 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-xl">Bookings</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-xl">Messages</TabsTrigger>
            <TabsTrigger value="posts" className="rounded-xl">Posts</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl">Reviews</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats data={stats} />
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-3xl border-border/40">
                <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {[
                    { client: 'Sarah Johnson', date: '2025-10-15', time: '19:00', status: 'confirmed' },
                    { client: 'Michael Chen', date: '2025-10-18', time: '18:30', status: 'pending' },
                    { client: 'Lisa van der Berg', date: '2025-10-12', time: '12:00', status: 'completed' }
                  ].map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.client}</p>
                          <p className="text-sm text-muted-foreground">{booking.date} at {booking.time}</p>
                        </div>
                      </div>
                      <Badge className={`rounded-xl ${
                        booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                        booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-border/40">
                <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
                <div className="space-y-4">
                  {[
                    { client: 'Sarah Johnson', message: 'Thank you so much! Looking forward to it.', time: '2 hours ago' },
                    { client: 'Michael Chen', message: 'Can we discuss the menu options?', time: '5 hours ago' },
                    { client: 'Lisa van der Berg', message: 'Perfect! See you on Saturday.', time: '1 day ago' }
                  ].map((message, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{message.client}</p>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManager chefData={chefData} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesPanel chefData={chefData} />
          </TabsContent>

          <TabsContent value="posts">
            <PostsManager chefData={chefData} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManager chefData={chefData} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSettings chefData={chefData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}