'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
} from '@super-prismora/ui';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  condition: string;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  listedDate: string;
}

export default function CoinPrismoraMarketplace() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pennies' | 'nickels' | 'dimes' | 'quarters' | 'halves' | 'dollars'>('all');
  const [priceRange, setPriceRange] = useState<'all' | '0-10' | '10-50' | '50-100' | '100+'>('all');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/coinprismora/marketplace');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      } else {
        // Use mock data as fallback
        setListings(getMockListings());
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings(getMockListings());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockListings = (): MarketplaceListing[] => [
    {
      id: '1',
      title: '1921 Morgan Silver Dollar',
      description: 'Beautiful uncirculated condition, stunning luster. Original cartwheel effect visible.',
      imageUrl: '/placeholder-coin-1.jpg',
      price: 250.00,
      condition: 'Uncirculated (MS60)',
      seller: {
        id: 'seller1',
        name: 'CoinCollector2024',
        rating: 4.8,
      },
      listedDate: new Date().toISOString(),
    },
    {
      id: '2',
      title: '1916-D Mercury Dime',
      description: 'Rare key date, VF condition. Great coin for any collection.',
      imageUrl: '/placeholder-coin-2.jpg',
      price: 850.00,
      condition: 'Very Fine (VF30)',
      seller: {
        id: 'seller2',
        name: 'NumismaticExpert',
        rating: 4.9,
      },
      listedDate: new Date().toISOString(),
    },
    {
      id: '3',
      title: '1969-S Doubled Die Lincoln Cent',
      description: 'FS-101, AU condition. Classic doubled die variety.',
      imageUrl: '/placeholder-coin-3.jpg',
      price: 45.00,
      condition: 'About Uncirculated (AU50)',
      seller: {
        id: 'seller3',
        name: 'PennyPincher',
        rating: 4.7,
      },
      listedDate: new Date().toISOString(),
    },
    {
      id: '4',
      title: '1932-D Washington Quarter',
      description: 'Key date quarter, Good condition. Solid details remaining.',
      imageUrl: '/placeholder-coin-4.jpg',
      price: 125.00,
      condition: 'Good (G4)',
      seller: {
        id: 'seller4',
        name: 'QuarterMaster',
        rating: 4.6,
      },
      listedDate: new Date().toISOString(),
    },
    {
      id: '5',
      title: '2000 Sacagawea Dollar - Cheerios Variety',
      description: 'Rare variety, MS65 condition. Excellent toning.',
      imageUrl: '/placeholder-coin-5.jpg',
      price: 1200.00,
      condition: 'Gem Uncirculated (MS65)',
      seller: {
        id: 'seller5',
        name: 'ModernRarities',
        rating: 4.9,
      },
      listedDate: new Date().toISOString(),
    },
    {
      id: '6',
      title: '1909-S VDB Lincoln Cent',
      description: 'The classic Lincoln cent, Fine condition. One of the most famous key dates.',
      imageUrl: '/placeholder-coin-6.jpg',
      price: 850.00,
      condition: 'Fine (F12)',
      seller: {
        id: 'seller6',
        name: 'LincolnLover',
        rating: 4.8,
      },
      listedDate: new Date().toISOString(),
    },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === '0-10' && listing.price <= 10) ||
      (priceRange === '10-50' && listing.price > 10 && listing.price <= 50) ||
      (priceRange === '50-100' && listing.price > 50 && listing.price <= 100) ||
      (priceRange === '100+' && listing.price > 100);

    return matchesSearch && matchesPrice;
  });

  const handleListingClick = (id: string) => {
    router.push(`/coinprismora/marketplace/${id}`);
  };

  const handleCreateListing = () => {
    router.push('/coinprismora/marketplace/create');
  };

  const getConditionBadge = (condition: string) => {
    if (condition.includes('Uncirculated') || condition.includes('MS')) return <Badge variant="success">Uncirculated</Badge>;
    if (condition.includes('AU')) return <Badge variant="primary">About Uncirc</Badge>;
    if (condition.includes('EF') || condition.includes('XF')) return <Badge variant="success">Extremely Fine</Badge>;
    if (condition.includes('VF')) return <Badge variant="warning">Very Fine</Badge>;
    if (condition.includes('F')) return <Badge variant="warning">Fine</Badge>;
    if (condition.includes('VG')) return <Badge variant="error">Very Good</Badge>;
    if (condition.includes('G')) return <Badge variant="error">Good</Badge>;
    return <Badge variant="secondary">{condition}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-neutral-300 dark:text-neutral-600">★</span>
        ))}
        <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">({rating})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 mb-4">
            Coin Marketplace
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Buy and sell rare coins with confidence
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => router.push('/coinprismora/scan')}
            variant="secondary"
            className="flex-1 min-w-[150px]"
          >
            Scan Coins
          </Button>
          <Button
            onClick={() => router.push('/coinprismora/portfolio')}
            variant="secondary"
            className="flex-1 min-w-[150px]"
          >
            View Portfolio
          </Button>
          <Button
            onClick={handleCreateListing}
            variant="primary"
            className="flex-1 min-w-[150px]"
          >
            List Your Coins
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search coins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                >
                  <option value="all">All Categories</option>
                  <option value="pennies">Pennies</option>
                  <option value="nickels">Nickels</option>
                  <option value="dimes">Dimes</option>
                  <option value="quarters">Quarters</option>
                  <option value="halves">Half Dollars</option>
                  <option value="dollars">Dollars</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                >
                  <option value="all">All Prices</option>
                  <option value="0-10">Under $10</option>
                  <option value="10-50">$10 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100+">$100+</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-neutral-600 dark:text-neutral-400">
          Showing {filteredListings.length} of {listings.length} listings
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleListingClick(listing.id)}
            >
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-t-lg flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-2xl flex items-center justify-center text-white text-4xl">
                    🪙
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  {getConditionBadge(listing.condition)}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  {listing.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                  {listing.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${listing.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {listing.condition}
                  </span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {listing.seller.name}
                    </span>
                    {getRatingStars(listing.seller.rating)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              No listings found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => { setSearchQuery(''); setPriceRange('all'); }} variant="primary">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
