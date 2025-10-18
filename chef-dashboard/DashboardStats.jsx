import { Heart, Star, Calendar, DollarSign, TrendingUp, Users, Eye } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

// The interface DashboardStatsProps is removed.

export function DashboardStats({ data }) {
  const stats = [
    {
      label: 'Profile views',
      // Type annotation removed from value property
      value: data.profileViews.toLocaleString(),
      icon: Eye,
      change: '+12%',
      positive: true,
      color: 'text-blue-500'
    },
    {
      label: 'Total likes',
      value: data.totalLikes.toLocaleString(),
      icon: Heart,
      change: '+8%',
      positive: true,
      color: 'text-pink-500'
    },
    {
      label: 'Average rating',
      value: data.averageRating.toFixed(1),
      icon: Star,
      change: '+0.2',
      positive: true,
      color: 'text-yellow-500'
    },
    {
      label: 'Total bookings',
      value: data.totalBookings.toLocaleString(),
      icon: Calendar,
      change: '+15%',
      positive: true,
      color: 'text-purple-500'
    },
    {
      label: 'Total revenue',
      value: `R${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+22%',
      positive: true,
      color: 'text-green-500'
    },
    {
      label: 'This month',
      value: `R${data.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      change: '+18%',
      positive: true,
      color: 'text-emerald-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          // Type annotation is not strictly needed here, but can be written as:
          // const Icon = stat.icon;
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 rounded-3xl border-border/40 hover:border-border transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Badge
                  variant="secondary"
                  className={`rounded-xl ${
                    stat.positive
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 rounded-3xl border-border/40">
          <h3 className="text-lg mb-4">Booking summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <span className="text-muted-foreground">Upcoming</span>
              <span className="font-semibold">{data.upcomingBookings}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold">{data.completedBookings}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{data.totalBookings}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-border/40">
          <h3 className="text-lg mb-4">Engagement</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <span className="text-muted-foreground">Reviews</span>
              <span className="font-semibold">{data.totalReviews}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <span className="text-muted-foreground">Posts</span>
              <span className="font-semibold">{data.totalPosts}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <span className="text-muted-foreground">Avg. rating</span>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{data.averageRating}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}