import { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Heart, X, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Interface ChefCardProps and the `chef` type are removed.
// The component is redefined to accept plain JavaScript objects as props.

export function ChefCard({ chef, onLike, onPass, onContact, onViewReviews }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef(null);

  const handleAction = (action) => {
    setIsAnimating(true);
    setAnimationDirection(action === 'like' ? 'right' : 'left');
    
    setTimeout(() => {
      if (action === 'like') {
        onLike(chef.id);
      } else {
        onPass(chef.id);
      }
    }, 300);
  };

  // Auto-scroll gallery
  useEffect(() => {
    if (!chef.gallery || chef.gallery.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        // Use a conditional check for animationDirection type if necessary in JS, 
        // but here we rely on standard JS null checks and string literal comparison
        const newPosition = scrollPosition >= maxScroll ? 0 : scrollPosition + 120;
        
        scrollRef.current.scrollTo({
          left: newPosition,
          behavior: 'smooth'
        });
        
        setScrollPosition(newPosition);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scrollPosition, chef.gallery]);

  // Reset scroll position when chef changes
  useEffect(() => {
    setScrollPosition(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0 });
    }
  }, [chef.id]);

  return (
    <div 
      className={`relative w-full max-w-sm mx-auto bg-gradient-to-br from-card/95 to-card rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-sm border border-white/5 transition-all duration-500 ${
        isAnimating 
          ? animationDirection === 'right' 
            ? 'transform rotate-12 translate-x-full opacity-0' 
            : 'transform -rotate-12 -translate-x-full opacity-0'
          : 'transform rotate-0 translate-x-0 opacity-100 hover:shadow-[0_25px_70px_-10px_rgba(255,255,255,0.15)] hover:scale-[1.03] hover:-translate-y-1'
      }`}
    >
      {/* Chef Image */}
      <div className="relative h-80 sm:h-96 overflow-hidden">
        <ImageWithFallback
          src={chef.image}
          alt={`Chef ${chef.name} ${chef.surname}`}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/10" />
        
        {/* Chef Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-3xl mb-2">{chef.name} {chef.surname}</h3>
          <div className="flex items-center gap-2 text-white/90 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{chef.location}</span>
          </div>
          
          {/* Rating and Reviews - Below Location */}
          {chef.reviewCount >= 5 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white">{chef.rating.toFixed(1)}</span>
              </div>
              {onViewReviews && (
                <button 
                  onClick={() => onViewReviews(chef.id)}
                  className="text-sm text-white/80 hover:text-white transition-colors hover:underline"
                >
                  {chef.reviewCount} reviews
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chef Details */}
      <div className="p-6 space-y-4">
        {/* Bio */}
        <p className="text-muted-foreground leading-relaxed line-clamp-2">{chef.bio}</p>
        
        {/* Contact Button or Qualifications */}
        <div className="py-2">
          {onContact ? (
            <Button
              variant="outline"
              onClick={() => onContact(chef.id)}
              className="w-full rounded-2xl border-2 border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 hover:border-pink-500/50 transition-all duration-300 hover:scale-[1.02] text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Chef
            </Button>
          ) : chef.qualifications && chef.qualifications.length > 0 ? (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/90">Qualifications:</span>
              </div>
              <p className="line-clamp-2">{chef.qualifications.join(' • ')}</p>
            </div>
          ) : null}
        </div>
        
        {/* Specialties */}
        <div className="flex flex-wrap gap-2">
          {chef.specialties.slice(0, 3).map((specialty, index) => (
            <Badge 
              key={index} 
              className="rounded-xl px-3 py-1 bg-white/5 hover:bg-white/10 transition-colors duration-200 text-white border-transparent"
            >
              {specialty}
            </Badge>
          ))}
          {chef.specialties.length > 3 && (
            <Badge 
              className="rounded-xl px-3 py-1 border-white/20 text-white bg-transparent"
            >
              +{chef.specialties.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price Range */}
        <div className="pt-2">
          <span className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
            {chef.priceRange.replace('pp', 'per person').replace(/R(\d+)-(\d+)/, 'R$1 - R$2')}
          </span>
        </div>

        {/* Gallery Carousel */}
        {chef.gallery && chef.gallery.length > 0 && (
          <div className="pt-2">
            <div 
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Duplicate gallery for infinite effect */}
              {[...chef.gallery, ...chef.gallery].map((image, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-md hover:scale-105 transition-transform duration-300"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${chef.name}'s dish ${(index % chef.gallery.length) + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 p-6 pt-0">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-2xl border-2 border-destructive/50 bg-transparent hover:bg-destructive/10 hover:border-destructive hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={() => handleAction('pass')}
          disabled={isAnimating}
        >
          <X className="w-5 h-5 text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-2xl border-2 border-pink-500 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 hover:border-pink-400 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={() => handleAction('like')}
          disabled={isAnimating}
        >
          <Heart className="w-5 h-5 text-pink-500" />
        </Button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}