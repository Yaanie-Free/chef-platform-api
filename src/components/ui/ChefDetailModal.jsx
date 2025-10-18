import { useState } from 'react';
import { X, MapPin, Star, Clock, Heart, MessageCircle, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogClose } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ChefDetailModal({ chef, isOpen, onClose, onBookNow, onSendMessage }) {
  const [isLiked, setIsLiked] = useState(false);

  if (!chef) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Mock additional data for demo
  const mockReviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      comment: "Absolutely incredible experience! Marco's authentic Italian cuisine was perfection.",
      date: "2 weeks ago"
    },
    {
      id: 2,
      author: "David L.",
      rating: 5,
      comment: "Professional, creative, and delicious. Highly recommend for special occasions.",
      date: "1 month ago"
    }
  ];

  const mockGallery = [
    "https://images.unsplash.com/photo-1718939043990-83078968ae7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcGxhdGVkJTIwZm9vZCUyMGVsZWdhbnR8ZW58MXx8fHwxNzU4NDEzNjI5fDA&ixlib=rb-4.1.0&q=80&w=400",
    "https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=400",
    "https://images.unsplash.com/photo-1719329466199-f18fb7f6972e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwcG9ydHJhaXQlMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTg0MTM2MjZ8MA&ixlib=rb-4.1.0&q=80&w=400"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-0">
        <div className="relative">
          {/* Hero Section */}
          <div className="relative h-80 overflow-hidden rounded-t-3xl">
            <ImageWithFallback
              src={chef.image}
              alt={`Chef ${chef.name} ${chef.surname}`}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Close Button */}
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 rounded-full p-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>

            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-4 right-16 rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
                isLiked
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            
            {/* Rating Badge */}
            {chef.reviewCount >= 5 && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-sm">{chef.rating.toFixed(1)}</span>
              </div>
            )}
            
            {/* Chef Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl mb-2">{chef.name} {chef.surname}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{chef.location}</span>
                </div>
                {chef.reviewCount >= 5 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{chef.rating.toFixed(1)} ({chef.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-2xl bg-white text-black hover:bg-white/90"
                onClick={() => onBookNow(chef)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book now
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => onSendMessage(chef)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>

            {/* Price Range */}
            <Card className="p-4 rounded-2xl bg-white/5 border-white/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                <p className="text-2xl text-primary">{chef.priceRange}</p>
                <p className="text-xs text-muted-foreground">Final quote provided after consultation</p>
              </div>
            </Card>

            {/* Bio */}
            <div>
              <h3 className="text-lg mb-3">About {chef.name}</h3>
              <p className="text-muted-foreground leading-relaxed">{chef.bio}</p>
            </div>

            {/* Specialties */}
            <div>
              <h3 className="text-lg mb-3">Specialities</h3>
              <div className="flex flex-wrap gap-2">
                {chef.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="rounded-xl px-3 py-1">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-lg mb-3">Gallery</h3>
              <div className="grid grid-cols-3 gap-3">
                {mockGallery.map((image, index) => (
                  <div key={index} className="aspect-square rounded-2xl overflow-hidden">
                    <ImageWithFallback
                      src={image}
                      alt={`${chef.name}'s work ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {chef.reviewCount >= 5 && (
              <div>
                <h3 className="text-lg mb-3">Recent reviews</h3>
                <div className="space-y-4">
                  {mockReviews.map((review, index) => (
                    <Card key={review.id} className="p-4 rounded-2xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.author}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}