"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Clock, Users, Heart, X } from 'lucide-react';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalInput from '@/components/ui/UniversalInput';
import UniversalCard from '@/components/ui/UniversalCard';
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const ChefDiscovery = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [priceRange, setPriceRange] = useState([100, 1000]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [likedChefs, setLikedChefs] = useState(new Set());
  const [passedChefs, setPassedChefs] = useState(new Set());

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const regions = [
    'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Pietermaritzburg', 'Nelspruit', 'Polokwane'
  ];

  const specialties = [
    'Italian', 'French', 'Asian', 'Mediterranean', 'Indian', 'Mexican',
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Halal'
  ];

  useEffect(() => {
    fetchChefs();
  }, [searchTerm, selectedRegion, selectedSpecialty, priceRange, sortBy, sortOrder]);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRegion && { region: selectedRegion }),
        ...(selectedSpecialty && { specialty: selectedSpecialty }),
        min_rate: priceRange[0].toString(),
        max_rate: priceRange[1].toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      const response = await fetch(`/api/chefs?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setChefs(data.chefs || []);
      } else {
        console.error('Failed to fetch chefs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (chefId) => {
    setLikedChefs(prev => new Set([...prev, chefId]));
    setPassedChefs(prev => {
      const newSet = new Set(prev);
      newSet.delete(chefId);
      return newSet;
    });
  };

  const handlePass = (chefId) => {
    setPassedChefs(prev => new Set([...prev, chefId]));
    setLikedChefs(prev => {
      const newSet = new Set(prev);
      newSet.delete(chefId);
      return newSet;
    });
  };

  const handleBook = (chef) => {
    // Navigate to booking page or open booking modal
    console.log('Book chef:', chef);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSpecialty('');
    setPriceRange([100, 1000]);
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const filteredChefs = chefs.filter(chef => 
    !likedChefs.has(chef.id) && !passedChefs.has(chef.id)
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <ResponsiveLayout>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={cn(
            'font-bold text-foreground mb-4',
            isMobile ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl lg:text-6xl'
          )}>
            Discover Amazing Chefs
          </h2>
          <p className={cn(
            'text-muted-foreground max-w-2xl mx-auto',
            isMobile ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
          )}>
            Browse through our curated selection of professional chefs ready to create unforgettable dining experiences.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <UniversalInput
                placeholder="Search chefs, cuisines, specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <UniversalButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </UniversalButton>
          </div>

          {/* Filters Panel */}
          {(showFilters || !isMobile) && (
            <div className={cn(
              'bg-card border border-border rounded-lg p-6',
              isMobile && showFilters ? 'block' : 'hidden lg:block'
            )}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">All Regions</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Range: R{priceRange[0]} - R{priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${sortBy}_${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('_');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="created_at_desc">Newest First</option>
                    <option value="created_at_asc">Oldest First</option>
                    <option value="base_rate_asc">Price: Low to High</option>
                    <option value="base_rate_desc">Price: High to Low</option>
                    <option value="average_rating_desc">Highest Rated</option>
                    <option value="average_rating_asc">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <UniversalButton
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </UniversalButton>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <UniversalCard key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </UniversalCard>
            ))}
          </div>
        ) : filteredChefs.length > 0 ? (
          <ResponsiveGrid
            cols={{ mobile: 1, tablet: 2, laptop: 3, desktop: 4 }}
            gap="responsive"
          >
            {filteredChefs.map((chef) => (
              <ChefCard
                key={chef.id}
                chef={chef}
                onLike={handleLike}
                onPass={handlePass}
                onBook={handleBook}
                isLiked={likedChefs.has(chef.id)}
                isPassed={passedChefs.has(chef.id)}
              />
            ))}
          </ResponsiveGrid>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No chefs found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <UniversalButton
              variant="outline"
              onClick={clearFilters}
            >
              Clear Filters
            </UniversalButton>
          </div>
        )}

        {/* Load More */}
        {filteredChefs.length > 0 && (
          <div className="text-center mt-12">
            <UniversalButton
              variant="outline"
              size="lg"
              onClick={fetchChefs}
            >
              Load More Chefs
            </UniversalButton>
          </div>
        )}
      </ResponsiveLayout>
    </section>
  );
};

// Chef Card Component
const ChefCard = ({ chef, onLike, onPass, onBook, isLiked, isPassed }) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null);

  const handleAction = (action) => {
    setIsAnimating(true);
    setAnimationDirection(action === 'like' ? 'right' : 'left');
    
    setTimeout(() => {
      if (action === 'like') onLike?.(chef.id);
      if (action === 'pass') onPass?.(chef.id);
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  if (isPassed) return null;

  return (
    <UniversalCard
      className={cn(
        'relative overflow-hidden group cursor-pointer',
        isAnimating && animationDirection === 'right' && 'transform translate-x-full opacity-0',
        isAnimating && animationDirection === 'left' && 'transform -translate-x-full opacity-0',
        'transition-all duration-300 ease-in-out',
        isLiked && 'ring-2 ring-pink-500'
      )}
      hover={true}
    >
      {/* Chef Image */}
      <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl">
        <img
          src={chef.profile_images?.[0]?.url || '/placeholder-chef.jpg'}
          alt={`${chef.first_name} ${chef.last_name}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <UniversalButton
            size="icon"
            variant="destructive"
            onClick={() => handleAction('pass')}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4" />
          </UniversalButton>
          <UniversalButton
            size="icon"
            variant="gradient"
            onClick={() => handleAction('like')}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Heart className="h-4 w-4" />
          </UniversalButton>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs sm:text-sm font-medium">
            {chef.average_rating?.toFixed(1) || '4.5'}
          </span>
        </div>

        {/* Verified Badge */}
        {chef.is_verified && (
          <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full p-1">
            <Star className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Chef Info */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className={cn(
              'font-semibold text-foreground',
              isMobile ? 'text-lg' : 'text-xl'
            )}>
              {chef.first_name} {chef.last_name}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm">
                {chef.regions_served?.[0] || 'Cape Town'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className={cn(
          'text-muted-foreground mb-4 line-clamp-2',
          isMobile ? 'text-sm' : 'text-base'
        )}>
          {chef.bio}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-4">
          {chef.dietary_specialties?.slice(0, isMobile ? 2 : 3).map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs"
            >
              {specialty}
            </span>
          ))}
          {chef.dietary_specialties?.length > (isMobile ? 2 : 3) && (
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              +{chef.dietary_specialties.length - (isMobile ? 2 : 3)}
            </span>
          )}
        </div>

        {/* Pricing & Availability */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Up to 50km</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Available</span>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              'font-bold text-foreground',
              isMobile ? 'text-lg' : 'text-xl'
            )}>
              R{chef.base_rate || 500}
            </div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <UniversalButton
            variant="outline"
            size={isMobile ? 'responsive' : 'sm'}
            className="flex-1"
            onClick={() => handleAction('pass')}
          >
            Pass
          </UniversalButton>
          <UniversalButton
            variant="gradient"
            size={isMobile ? 'responsive' : 'sm'}
            className="flex-1"
            onClick={() => onBook?.(chef)}
          >
            Book Now
          </UniversalButton>
        </div>
      </div>
    </UniversalCard>
  );
};

export default ChefDiscovery;