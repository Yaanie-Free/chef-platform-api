import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ChefGrid } from './components/ChefGrid';
import { ChefDetailModal } from './components/ChefDetailModal';
import { SignupFlow } from './components/SignupFlow';
import { BookingCalendar } from './components/BookingCalendar';
import { Button } from './components/ui/button';
import { UserPlus } from 'lucide-react';

// Mock chef data
const mockChefs = [
  {
    id: '1',
    name: 'Marco',
    surname: 'Pellegrini',
    bio: 'Passionate Italian chef specialising in authentic regional cuisine. Trained in Tuscany and bringing traditional flavours to modern South African dining.',
    location: 'Cape Town, Western Cape',
    specialties: ['Italian', 'Mediterranean', 'Fine dining'],
    rating: 4.8,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R450-650 pp'
  },
  {
    id: '2',
    name: 'Amara',
    surname: 'Johnson',
    bio: 'Creative fusion chef combining African flavours with international techniques. Award-winning culinary artist with 10 years of fine dining experience.',
    location: 'Johannesburg, Gauteng',
    specialties: ['African fusion', 'Vegan', 'Creative plating'],
    rating: 4.9,
    reviewCount: 31,
    image: 'https://images.unsplash.com/photo-1719329466199-f18fb7f6972e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwcG9ydHJhaXQlMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTg0MTM2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R380-520 pp'
  },
  {
    id: '3',
    name: 'Jean-Luc',
    surname: 'Dubois',
    bio: 'French-trained pastry chef and culinary expert. Specialising in elegant French cuisine and exquisite dessert presentations.',
    location: 'Stellenbosch, Western Cape',
    specialties: ['French', 'Pastry', 'Wine pairing'],
    rating: 4.7,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1718939043990-83078968ae7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcGxhdGVkJTIwZm9vZCUyMGVsZWdhbnR8ZW58MXx8fHwxNzU4NDEzNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R520-780 pp'
  },
  {
    id: '4',
    name: 'Thandiwe',
    surname: 'Mthembu',
    bio: 'Traditional South African cuisine expert with modern presentation. Grandmother\'s recipes meet contemporary culinary artistry.',
    location: 'Durban, KwaZulu-Natal',
    specialties: ['South African', 'Traditional', 'Comfort food'],
    rating: 4.6,
    reviewCount: 27,
    image: 'https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R290-420 pp'
  },
  {
    id: '5',
    name: 'Sofia',
    surname: 'Rodriguez',
    bio: 'Spanish culinary expert bringing authentic tapas and paella traditions to South Africa. Trained in Barcelona\'s finest establishments.',
    location: 'Cape Town, Western Cape',
    specialties: ['Spanish', 'Tapas', 'Seafood'],
    rating: 4.8,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1719329466199-f18fb7f6972e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwcG9ydHJhaXQlMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTg0MTM2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R420-600 pp'
  },
  {
    id: '6',
    name: 'Raj',
    surname: 'Patel',
    bio: 'Master of authentic Indian cuisine with modern presentation. Specialising in regional dishes from across the subcontinent.',
    location: 'Johannesburg, Gauteng',
    specialties: ['Indian', 'Curry', 'Spice blends'],
    rating: 4.7,
    reviewCount: 22,
    image: 'https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R350-480 pp'
  },
  {
    id: '7',
    name: 'Isabella',
    surname: 'Romano',
    bio: 'Authentic Italian chef specialising in handmade pasta and traditional wood-fired cooking. Brings the heart of Italy to every dish.',
    location: 'Cape Town, Western Cape',
    specialties: ['Italian', 'Pasta', 'Wood-fired'],
    rating: 4.9,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1719329466199-f18fb7f6972e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwcG9ydHJhaXQlMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTg0MTM2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R480-680 pp'
  },
  {
    id: '8',
    name: 'Ahmed',
    surname: 'Hassan',
    bio: 'Master of Middle Eastern and Halaal cuisine. Creates aromatic dishes that transport you to the bustling markets of Morocco and Lebanon.',
    location: 'Johannesburg, Gauteng',
    specialties: ['Middle Eastern', 'Halaal', 'Spices'],
    rating: 4.8,
    reviewCount: 25,
    image: 'https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R390-550 pp'
  }
];

export default function App() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const [isChefModalOpen, setIsChefModalOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Set dark mode by default
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter chefs based on search query and filters
  const filteredChefs = useMemo(() => {
    let filtered = mockChefs;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chef => 
        chef.name.toLowerCase().includes(query) ||
        chef.surname.toLowerCase().includes(query) ||
        `${chef.name} ${chef.surname}`.toLowerCase().includes(query) ||
        chef.specialties.some(specialty => specialty.toLowerCase().includes(query)) ||
        chef.location.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.location) {
      filtered = filtered.filter(chef => 
        chef.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(chef => chef.rating >= filters.rating);
    }

    if (filters.specialties && filters.specialties.length > 0) {
      filtered = filtered.filter(chef => 
        filters.specialties.some(specialty => 
          chef.specialties.includes(specialty)
        )
      );
    }

    if (filters.priceRange) {
      // Basic price filtering - in a real app, you'd parse the price range properly
      const [minPrice, maxPrice] = filters.priceRange;
      if (minPrice > 0 || maxPrice < 1000) {
        // For demo purposes, we'll keep all chefs as we don't have exact pricing
        // In production, you'd parse the price range from chef.priceRange
      }
    }

    return filtered;
  }, [searchQuery, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSignupComplete = (userData) => {
    setCurrentUser(userData);
    setIsSignupOpen(false);
    console.log('User signed up:', userData);
  };

  const handleChefLike = (chefId) => {
    console.log('Chef liked:', chefId);
  };

  const handleChefSelect = (chef) => {
    setSelectedChef(chef);
    setIsChefModalOpen(true);
  };

  const handleBookNow = (chef) => {
    if (!currentUser) {
      setIsSignupOpen(true);
    } else {
      setSelectedChef(chef);
      setIsChefModalOpen(false);
      setIsBookingOpen(true);
    }
  };

  const handleSendMessage = (chef) => {
    if (!currentUser) {
      setIsSignupOpen(true);
    } else {
      console.log('Messaging chef:', chef.id);
      // Handle messaging
    }
  };

  const handleBookingConfirm = (bookingData) => {
    console.log('Booking confirmed:', bookingData);
    setIsBookingOpen(false);
    // Handle booking confirmation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground relative">
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.02] pointer-events-none" />
      
      <div className="relative z-10">
        <Header 
          userName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Guest"}
          notificationCount={3}
          messageCount={2}
        />
        
        <main>
          <FilterBar 
            onFiltersChange={handleFiltersChange} 
            onSearchChange={handleSearchChange}
          />
          
          <div className="container mx-auto px-4 py-8">
            {!currentUser && (
              <div className="mb-8 text-center">
                <div className="mb-4">
                  <h1 className="text-4xl mb-4">Welcome to Table & Plate</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    From our chefs hands to your table.<br />
                    Luxury made personal.
                  </p>
                </div>
                <Button
                  onClick={() => setIsSignupOpen(true)}
                  className="rounded-2xl bg-white text-black hover:bg-white/90 px-8 py-3 text-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Get started
                </Button>
              </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6 text-center">
                <p className="text-muted-foreground">
                  {filteredChefs.length > 0 
                    ? `Showing ${filteredChefs.length} chef${filteredChefs.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `No chefs found for "${searchQuery}"`
                  }
                </p>
              </div>
            )}
            
            <ChefGrid
              chefs={filteredChefs}
              onChefLike={handleChefLike}
              onChefSelect={handleChefSelect}
            />
          </div>
        </main>
      </div>

      {/* Signup Flow Modal */}
      {isSignupOpen && (
        <SignupFlow
          onComplete={handleSignupComplete}
          onClose={() => setIsSignupOpen(false)}
        />
      )}

      {/* Chef Detail Modal */}
      <ChefDetailModal
        chef={selectedChef}
        isOpen={isChefModalOpen}
        onClose={() => setIsChefModalOpen(false)}
        onBookNow={handleBookNow}
        onSendMessage={handleSendMessage}
      />

      {/* Booking Calendar Modal */}
      {isBookingOpen && selectedChef && (
        <BookingCalendar
          chef={selectedChef}
          onClose={() => setIsBookingOpen(false)}
          onBookingConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
}