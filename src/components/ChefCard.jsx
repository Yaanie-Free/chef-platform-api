import { useState } from 'react';
import { Star, MapPin, Heart, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import ImageWithFallback from './ui/ImageWithFallback';

function ChefCard({ chef, onLike, onPass }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null);

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

  return (
    <div 
      className={`relative w-full max-w-sm mx-auto bg-card rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isAnimating 
          ? animationDirection === 'right' 
            ? 'transform rotate-12 translate-x-full opacity-0' 
            : 'transform -rotate-12 -translate-x-full opacity-0'
          : 'transform rotate-0 translate-x-0 opacity-100'
      }`}
    >
      {/* Chef Image */}
      <div className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src={chef.image}
          alt={`Chef ${chef.name} ${chef.surname}`}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Rating Badge */}
        {chef.reviewCount >= 5 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm">{chef.rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Chef Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl mb-2">{chef.name} {chef.surname}</h3>
          <div className="flex items-center gap-2 mb-3 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{chef.location}</span>
          </div>
        </div>
      </div>

      {/* Chef Details */}
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground leading-relaxed line-clamp-3">{chef.bio}</p>
        
        {/* Specialties */}
        <div className="flex flex-wrap gap-2">
          {chef.specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="rounded-xl px-3 py-1">
              {specialty}
            </Badge>
          ))}
          {chef.specialties.length > 3 && (
            <Badge variant="outline" className="rounded-xl px-3 py-1">
              +{chef.specialties.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price Range */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg text-primary">{chef.priceRange}</span>
          {chef.reviewCount >= 5 && (
            <span className="text-sm text-muted-foreground">
              {chef.reviewCount} reviews
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 p-6 pt-0">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-2xl border-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
          onClick={() => handleAction('pass')}
          disabled={isAnimating}
        >
          <X className="w-5 h-5 text-destructive" />
        </Button>
        <Button
          size="lg"
          className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-0 transition-all duration-200 transform hover:scale-105"
          onClick={() => handleAction('like')}
          disabled={isAnimating}
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

export default ChefCard;