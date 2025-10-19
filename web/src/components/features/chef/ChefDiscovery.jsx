import { useState, useEffect } from 'react';
import { ChefCard } from './ChefCard';
import { RotateCcw, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Mock chef data with gallery
const mockChefs = [
  {
    id: '1',
    name: 'Marco',
    surname: 'Pellegrini',
    bio: 'Passionate Italian chef specialising in authentic regional cuisine. Trained in Tuscany and bringing traditional flavours to modern South African dining.',
    location: 'Cape Town, Western Cape',
    specialties: ['Italian', 'Mediterranean', 'Fine Dining'],
    rating: 4.8,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R450-650 pp',
    qualifications: ['Le Cordon Bleu Paris', 'Michelin Experience'],
    gallery: [
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
      'https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=400',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400'
    ]
  },
  {
    id: '2',
    name: 'Amara',
    surname: 'Johnson',
    bio: 'Creative fusion chef combining African flavours with international techniques. Award-winning culinary artist with 10 years of fine dining experience.',
    location: 'Johannesburg, Gauteng',
    specialties: ['African Fusion', 'Vegan', 'Creative Plating'],
    rating: 4.9,
    reviewCount: 31,
    image: 'https://images.unsplash.com/photo-1719329466199-f18fb7f6972e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjaGVmJTIwcG9ydHJhaXQlMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTg0MTM2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R380-520 pp',
    qualifications: ['Culinary Arts Degree', 'James Beard Nominee'],
    gallery: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
      'https://images.unsplash.com/photo-1497534547324-0ebb3f052e88?w=400'
    ]
  },
  {
    id: '3',
    name: 'Jean-Luc',
    surname: 'Dubois',
    bio: 'French-trained pastry chef and culinary expert. Specialising in elegant French cuisine and exquisite dessert presentations.',
    location: 'Stellenbosch, Western Cape',
    specialties: ['French', 'Pastry', 'Wine Pairing'],
    rating: 4.7,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1718939043990-83078968ae7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxmaW5lJTIwZGluaW5nJTIwcGxhdGVkJTIwZm9vZCUyMGVsZWdhbnR8ZW58MXx8fHwxNzU4NDEzNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R520-780 pp',
    qualifications: ['École Ritz Escoffier', 'Master Pastry Chef'],
    gallery: [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'
    ]
  },
  {
    id: '4',
    name: 'Thandiwe',
    surname: 'Mthembu',
    bio: 'Traditional South African cuisine expert with modern presentation. Grandmother\'s recipes meet contemporary culinary artistry.',
    location: 'Durban, KwaZulu-Natal',
    specialties: ['South African', 'Traditional', 'Comfort Food'],
    rating: 4.6,
    reviewCount: 27,
    image: 'https://images.unsplash.com/photo-1622001635931-3874528bd099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwY29va2luZyUyMGdvdXJtZXQlMjBmb29kfGVufDF8fHx8MTc1ODQxMzU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    priceRange: 'R290-420 pp',
    qualifications: ['Institute of Culinary Arts SA', 'Heritage Cuisine Specialist'],
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
    ]
  }
];

// Interface ChefDiscoveryProps is removed.
export function ChefDiscovery({ filters }) {
  // Type annotations removed from useState calls
  const [currentChefs, setCurrentChefs] = useState(mockChefs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedChefs, setLikedChefs] = useState([]);
  const [passedChefs, setPassedChefs] = useState([]);

  const currentChef = currentChefs[currentIndex];

  // Type annotations removed from function arguments
  const handleLike = (chefId) => {
    setLikedChefs(prev => [...prev, chefId]);
    moveToNext();
  };

  // Type annotations removed from function arguments
  const handlePass = (chefId) => {
    setPassedChefs(prev => [...prev, chefId]);
    moveToNext();
  };

  // Type annotations removed from function arguments
  const handleContact = (chefId) => {
    console.log('Contact chef:', chefId);
    // This would open the chat modal or navigate to messaging
  };

  // Type annotations removed from function arguments
  const handleViewReviews = (chefId) => {
    console.log('View reviews for chef:', chefId);
    // This would open a reviews modal or navigate to reviews section
  };

  const moveToNext = () => {
    if (currentIndex < currentChefs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const resetDiscovery = () => {
    setCurrentIndex(0);
    setLikedChefs([]);
    setPassedChefs([]);
  };

  if (!currentChef) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Users className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl">All caught up!</h3>
          <p className="text-muted-foreground max-w-sm">
            You've seen all the chefs in your area. Check back later for new profiles or adjust your filters to see more options.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={resetDiscovery}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          
          {likedChefs.length > 0 && (
            <Button variant="outline" className="rounded-2xl">
              <Users className="w-4 h-4 mr-2" />
              View Matches ({likedChefs.length})
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="relative mb-6">
        <ChefCard
          chef={currentChef}
          onLike={handleLike}
          onPass={handlePass}
          onContact={handleContact}
          onViewReviews={handleViewReviews}
        />
        
        {/* Progress indicator */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentIndex + 1} of {currentChefs.length}</span>
        </div>
      </div>

      {/* Liked chefs counter */}
      {likedChefs.length > 0 && (
        <Card className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-200/20">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
            <span>{likedChefs.length} chef{likedChefs.length !== 1 ? 's' : ''} liked</span>
          </div>
        </Card>
      )}
    </div>
  );
}