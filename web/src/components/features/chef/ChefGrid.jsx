import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ChefGrid({ chefs, onChefLike, onChefSelect }) {
  const [likedChefs, setLikedChefs] = useState([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const scrollContainerRef = useRef(null);

  // Mock additional images for each chef
  const getChefImages = (chef) => [
    chef.image,
    "https://images.unsplash.com/photo-1718939043990-83078968ae7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcGxhdGVkJTIwZm9vZCUyMGVsZWdhbnR8ZW58MXx8fHwxNzU4NjY1Njg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1627207644206-a2040d60ecad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcGFzdGElMjBpdGFsaWFuJTIwY3Vpc2luZXxlbnwxfHx8fDE3NTg2NjU2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1653981608672-aea09b857b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZnVzaW9uJTIwY3Vpc2luZSUyMHBsYXRlZHxlbnwxfHx8fDE3NTg2NjU2OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODY2NTY4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleLike = (chefId, e) => {
    e.stopPropagation();
    if (!likedChefs.includes(chefId)) {
      setLikedChefs(prev => [...prev, chefId]);
      onChefLike(chefId);
    } else {
      setLikedChefs(prev => prev.filter(id => id !== chefId));
    }
  };

  const handleImageClick = (chefId, e) => {
    e.stopPropagation();
    const images = getChefImages(chefs.find(c => c.id === chefId));
    const currentIndex = currentImageIndexes[chefId] || 0;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentImageIndexes(prev => ({
      ...prev,
      [chefId]: nextIndex
    }));
  };

  const getCurrentImage = (chef) => {
    const images = getChefImages(chef);
    const currentIndex = currentImageIndexes[chef.id] || 0;
    return images[currentIndex];
  };

  const getCurrentImageIndex = (chef) => {
    return currentImageIndexes[chef.id] || 0;
  };

  if (!chefs || chefs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl mb-2">No chefs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more chefs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl mb-2">Discover your perfect chef</h2>
          <p className="text-muted-foreground">
            Browse through our curated selection of talented private chefs
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="rounded-2xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="rounded-2xl"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chef Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chefs.map((chef) => {
          const images = getChefImages(chef);
          const currentIndex = getCurrentImageIndex(chef);
          
          return (
            <Card
              key={chef.id}
              className="flex-shrink-0 w-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
              onClick={() => onChefSelect(chef)}
            >
              {/* Chef Image */}
              <div className="relative h-56 overflow-hidden">
                <div 
                  className="w-full h-full cursor-pointer relative"
                  onClick={(e) => handleImageClick(chef.id, e)}
                >
                  <ImageWithFallback
                    src={getCurrentImage(chef)}
                    alt={`Chef ${chef.name} ${chef.surname} - image ${currentIndex + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Image counter overlay */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-2xl px-2 py-1">
                    <div className="flex gap-1">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            index === currentIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Click hint */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-1 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view more
                  </div>
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-4 right-4 rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
                    likedChefs.includes(chef.id)
                      ? 'bg-white text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={(e) => handleLike(chef.id, e)}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      likedChefs.includes(chef.id) ? 'fill-current' : ''
                    }`} 
                  />
                </Button>
                
                {/* Rating Badge */}
                {chef.reviewCount >= 5 && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm">{chef.rating.toFixed(1)}</span>
                  </div>
                )}
                
                {/* Chef Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
                  <h3 className="text-xl mb-1">{chef.name} {chef.surname}</h3>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-3 h-3" />
                    <span className="text-sm">{chef.location}</span>
                  </div>
                </div>
              </div>

              {/* Chef Details */}
              <div className="p-5 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  {chef.bio}
                </p>
                
                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {chef.specialties.slice(0, 2).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="rounded-xl text-xs px-2 py-1">
                      {specialty}
                    </Badge>
                  ))}
                  {chef.specialties.length > 2 && (
                    <Badge variant="outline" className="rounded-xl text-xs px-2 py-1">
                      +{chef.specialties.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Price and Reviews */}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium text-lg text-primary">{chef.priceRange}</span>
                  {chef.reviewCount >= 5 && (
                    <span className="text-xs text-muted-foreground">
                      {chef.reviewCount} reviews
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Liked Chefs Counter */}
      {likedChefs.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Card className="px-4 py-2 rounded-2xl bg-white/10 border-white/20">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span>{likedChefs.length} chef{likedChefs.length !== 1 ? 's' : ''} liked</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 rounded-xl text-xs"
                onClick={() => {/* Handle view matches */}}
              >
                View matches
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}