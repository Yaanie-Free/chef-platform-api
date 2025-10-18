import { useState } from 'react';
import { Filter, MapPin, DollarSign, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { SearchBar } from './SearchBar';

export function FilterBar({ onFiltersChange, onSearchChange }) {
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [0, 1000],
    rating: 0,
    specialties: []
  });

  const [activeFilters, setActiveFilters] = useState(0);

  const specialties = [
    'Italian', 'French', 'Asian', 'Mediterranean', 'Vegan', 'Gluten-free',
    'BBQ', 'Seafood', 'Desserts', 'Breakfast', 'Fine dining', 'Comfort food',
    'African fusion', 'Spanish', 'Indian', 'Traditional', 'Pastry', 'Wine pairing'
  ];

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.location) count++;
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 1000) count++;
    if (newFilters.rating > 0) count++;
    if (newFilters.specialties.length > 0) count++;
    
    setActiveFilters(count);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      priceRange: [0, 1000],
      rating: 0,
      specialties: []
    };
    updateFilters(clearedFilters);
  };

  const handleSearch = (searchQuery) => {
    onSearchChange(searchQuery);
  };

  const handleQuickFilter = (type, value) => {
    switch (type) {
      case 'location':
        updateFilters({ ...filters, location: value });
        break;
      case 'specialty':
        const newSpecialties = filters.specialties.includes(value)
          ? filters.specialties.filter(s => s !== value)
          : [...filters.specialties, value];
        updateFilters({ ...filters, specialties: newSpecialties });
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Search Bar Section */}
        <div className="py-4 flex justify-center">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for a chef by name (e.g., Marco, Amara)..."
          />
        </div>
        
        {/* Filter Section */}
        <div className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {/* Main Filter Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-2xl flex items-center gap-2 whitespace-nowrap relative">
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilters > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-white text-black">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-6 rounded-3xl" align="start">
                <div className="space-y-6">
                  {/* Location */}
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <input 
                      type="text"
                      placeholder="Enter city or region"
                      className="w-full p-3 rounded-2xl bg-input border border-border"
                      value={filters.location}
                      onChange={(e) => updateFilters({...filters, location: e.target.value})}
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4" />
                      Budget range (R{filters.priceRange[0]} - R{filters.priceRange[1]})
                    </Label>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilters({...filters, priceRange: value})}
                      max={1000}
                      step={50}
                      className="mt-2"
                    />
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4" />
                      Minimum rating
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={filters.rating >= rating ? "default" : "outline"}
                          size="sm"
                          className="rounded-xl"
                          onClick={() => updateFilters({...filters, rating: rating})}
                        >
                          {rating}★
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <Label className="mb-3 block">Specialities</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={filters.specialties.includes(specialty)}
                            onCheckedChange={(checked) => {
                              const newSpecialties = checked
                                ? [...filters.specialties, specialty]
                                : filters.specialties.filter(s => s !== specialty);
                              updateFilters({...filters, specialties: newSpecialties});
                            }}
                          />
                          <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFilters > 0 && (
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick Filter Pills */}
            <div className="flex gap-2 overflow-x-auto">
              <Button 
                variant={filters.location.includes('Cape Town') ? "default" : "outline"}
                size="sm" 
                className="rounded-2xl whitespace-nowrap"
                onClick={() => handleQuickFilter('location', 'Cape Town')}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Cape Town
              </Button>
              <Button 
                variant={filters.location.includes('Johannesburg') ? "default" : "outline"}
                size="sm" 
                className="rounded-2xl whitespace-nowrap"
                onClick={() => handleQuickFilter('location', 'Johannesburg')}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Johannesburg
              </Button>
              <Button 
                variant={filters.specialties.includes('Italian') ? "default" : "outline"}
                size="sm" 
                className="rounded-2xl whitespace-nowrap"
                onClick={() => handleQuickFilter('specialty', 'Italian')}
              >
                Italian
              </Button>
              <Button 
                variant={filters.specialties.includes('Vegan') ? "default" : "outline"}
                size="sm" 
                className="rounded-2xl whitespace-nowrap"
                onClick={() => handleQuickFilter('specialty', 'Vegan')}
              >
                Vegan
              </Button>
            </div>
          </div>

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="rounded-2xl text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}