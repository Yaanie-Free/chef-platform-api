"use client";
import React, { useState } from 'react';
import { Star, Heart, ThumbsUp, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function ReviewsManager({ chefData, totalLikes }) {
  const [sortOrder, setSortOrder] = useState('newest');

  const mockReviews = [
    { id: '1', clientName: 'Emma Thompson', clientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', rating: 5, date: '2025-10-05', comment: 'Absolutely incredible experience! The food was exquisite and the presentation was stunning. Marco truly brought Italy to our dining table. Highly recommend!', bookingDetails: 'Dinner for 8 • Italian Fine Dining', helpful: 12, liked: true },
    { id: '2', clientName: 'David Lee', clientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rating: 5, date: '2025-09-28', comment: 'Professional, creative, and absolutely delicious. The pasta was handmade and the flavours were authentic. Will definitely book again!', bookingDetails: 'Dinner for 6 • Mediterranean', helpful: 8, liked: true },
    { id: '3', clientName: 'Sophia Martinez', clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rating: 4, date: '2025-09-20', comment: 'Great experience overall. The food was delicious and well-presented. Only minor issue was timing between courses, but otherwise excellent!', bookingDetails: 'Lunch for 4 • Italian', helpful: 5, liked: false },
    { id: '4', clientName: 'James Wilson', clientImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', rating: 5, date: '2025-09-15', comment: "Outstanding culinary experience! Marco's attention to detail and passion for food really shines through. The wine pairings were perfect.", bookingDetails: 'Dinner for 10 • Fine Dining', helpful: 15, liked: true },
    { id: '5', clientName: 'Olivia Brown', clientImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', rating: 5, date: '2025-09-08', comment: 'Made our anniversary truly special. Every dish was a work of art. Thank you for an unforgettable evening!', bookingDetails: 'Dinner for 2 • Italian Romance', helpful: 20, liked: true }
  ];

  const sortedReviews = [...mockReviews].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortOrder === 'highest') return b.rating - a.rating;
    if (sortOrder === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: mockReviews.filter((r) => r.rating === rating).length,
    percentage: (mockReviews.filter((r) => r.rating === rating).length / mockReviews.length) * 100,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl mb-2">Reviews & likes</h2>
          <p className="text-muted-foreground">{mockReviews.length} reviews • {totalLikes} total likes</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px] rounded-2xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest rating</SelectItem>
              <SelectItem value="lowest">Lowest rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-3xl border-border/40 col-span-1">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 fill-yellow-500 text-yellow-500" />
              <span className="text-4xl font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground">Average rating</p>
            <p className="text-sm text-muted-foreground mt-1">Based on {mockReviews.length} reviews</p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-border/40 col-span-1 lg:col-span-2">
          <h3 className="mb-4">Rating distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map((dist) => (
              <div key={dist.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{dist.rating}</span>
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${dist.percentage}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{dist.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id} className="p-6 rounded-3xl border-border/40">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-4">
                <ImageWithFallback src={review.clientImage} alt={review.clientName} className="w-12 h-12 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4>{review.clientName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-none text-muted-foreground'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{review.bookingDetails}</p>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm leading-relaxed" style={{ color: 'white' }}>{review.comment}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Button variant="ghost" size="sm" className="rounded-2xl text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="w-3 h-3 mr-2" />
                    Helpful ({review.helpful})
                  </Button>
                  {review.liked && (
                    <Badge className="rounded-xl bg-pink-500/10 text-pink-500 border-none">
                      <Heart className="w-3 h-3 mr-1 fill-pink-500" />
                      Liked your profile
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
