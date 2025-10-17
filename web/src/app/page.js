import React from "react";
import { DashboardStats } from "@/components/chef/DashboardStats";
import { BookingsManager } from "@/components/chef/BookingsManager";
import { MessagesPanel } from "@/components/chef/MessagesPanel";

export default function Home() {
  const chefData = {};
  const stats = {
    totalLikes: 712,
    totalReviews: 128,
    averageRating: 4.8,
    totalBookings: 342,
    upcomingBookings: 5,
    completedBookings: 337,
    totalRevenue: 845200,
    monthlyRevenue: 43200,
    totalPosts: 57,
    profileViews: 12890,
  };

  return (
    <div className="px-6 py-10 space-y-12 max-w-7xl mx-auto">
      <DashboardStats data={stats} />
      <BookingsManager chefData={chefData} />
      <MessagesPanel chefData={chefData} />
    </div>
  );
}
