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

export default function VinylPrismoraMarketplace() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | '0-20' | '20-50' | '50-100' | '100+'>('all');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vinylprismora/marketplace');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      } else {
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
      title: 'Pink Floyd - Dark Side of the Moon (Original Press)',
      description: 'Original 1973 UK press, Harvest label. Near Mint condition with original inner sleeve.',
      imageUrl: '/placeholder-vinyl-1.jpg',
      price: 150.00,
      condition: 'Near Mint',
      seller: { id: 'seller1', name: 'VinylVibes', rating: 4.9 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'The Beatles - Abbey Road',
      description: '1974 Apple press, gatefold cover. Very Good Plus condition.',
      imageUrl: '/placeholder-vinyl-2.jpg',
      price: 85.00,
      condition: 'Very Good Plus',
      seller: { id: 'seller2', name: 'BeatleMania', rating: 4.8 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Nirvana - Nevermind (Blue Vinyl)',
      description: 'Limited edition blue vinyl pressing, still sealed. New condition.',
      imageUrl: '/placeholder-vinyl-3.jpg',
      price: 75.00,
      condition: 'New',
      seller: { id: 'seller3', name: 'GrungeCollector', rating: 4.7 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'David Bowie - Ziggy Stardust',
      description: '1972 RCA original, VG condition. Classic glam rock album.',
      imageUrl: '/placeholder-vinyl-4.jpg',
      price: 200.00,
      condition: 'Very Good',
      seller: { id: 'seller4', name: 'SpaceOddity', rating: 4.9 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Daft Punk - Discovery (Colored Vinyl)',
      description: 'Yellow double vinyl, Near Mint. Electronic masterpiece.',
      imageUrl: '/placeholder-vinyl-5.jpg',
      price: 60.00,
      condition: 'Near Mint',
      seller: { id: 'seller5', name: 'ElectronicBeats', rating: 4.8 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Michael Jackson - Thriller',
      description: '1982 Epic press, VG+ condition with original poster.',
      imageUrl: '/placeholder-vinyl-6.jpg',
      price: 45.00,
      condition: 'Very Good Plus',
      seller: { id: 'seller6', name: 'PopKing', rating: 4.6 },
      listedDate: new Date().toISOString(),
    },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === '0-20' && listing.price <= 20) ||
      (priceRange === '20-50' && listing.price > 20 && listing.price <= 50) ||
      (priceRange === '50-100' && listing.price > 50 && listing.price <= 100) ||
      (priceRange === '100+' && listing.price > 100);

    return matchesSearch && matchesPrice;
  });

  const handleListingClick = (id: string) => {
    router.push(`/vinylprismora/marketplace/${id}`);
  };

  const handleCreateListing = () => {
    router.push('/vinylprismora/marketplace/create');
  };

  const getConditionBadge = (condition: string) => {
    if (condition === 'New') return <Badge variant="success">New</Badge>;
    if (condition === 'Near Mint') return <Badge variant="success">Near Mint</Badge>;
    if (condition === 'Very Good Plus') return <Badge variant="primary">VG+</Badge>;
    if (condition === 'Very Good') return <Badge variant="warning">VG</Badge>;
    return <Badge variant="secondary">{condition}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
        {hasHalfStar && <span className="text-yellow-400">★</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-neutral-300 dark:text-neutral-600">★</span>)}
        <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">({rating})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-neutral-900 dark:via-purple-900/20 dark:to-pink-900/20 py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-neutral-900 dark:via-purple-900/20 dark:to-pink-900/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
            Vinyl Marketplace
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Buy and sell rare vinyl records with confidence
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => router.push('/vinylprismora/scan')} variant="secondary" className="flex-1 min-w-[150px]">
            Scan Records
          </Button>
          <Button onClick={() => router.push('/vinylprismora/portfolio')} variant="secondary" className="flex-1 min-w-[150px]">
            View Portfolio
          </Button>
          <Button onClick={handleCreateListing} variant="primary" className="flex-1 min-w-[150px]">
            List Your Records
          </Button>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Search</label>
                <Input type="text" placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Price Range</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as any)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  <option value="all">All Prices</option>
                  <option value="0-20">Under $20</option>
                  <option value="20-50">$20 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100+">$100+</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 text-neutral-600 dark:text-neutral-400">
          Showing {filteredListings.length} of {listings.length} listings
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleListingClick(listing.id)}
            >
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-lg flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 shadow-2xl flex items-center justify-center text-white text-4xl">💿</div>
                </div>
                <div className="absolute top-2 right-2">{getConditionBadge(listing.condition)}</div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">{listing.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">{listing.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">${listing.price.toFixed(2)}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{listing.condition}</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{listing.seller.name}</span>
                    {getRatingStars(listing.seller.rating)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">No listings found</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearchQuery(''); setPriceRange('all'); }} variant="primary">Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
