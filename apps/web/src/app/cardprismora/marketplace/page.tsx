'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@super-prismora/ui';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  condition: string;
  seller: { id: string; name: string; rating: number };
  listedDate: string;
}

export default function CardPrismoraMarketplace() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | '0-50' | '50-100' | '100-500' | '500+'>('all');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cardprismora/marketplace');
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
      title: '1986-87 Fleer Michael Jordan #57 PSA 8',
      description: 'Iconic rookie card in excellent condition. Slabbed and graded.',
      imageUrl: '/placeholder-card-1.jpg',
      price: 1500.00,
      condition: 'PSA 8',
      seller: { id: 'seller1', name: 'CardGraderPro', rating: 4.9 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '2',
      title: '1952 Topps Mickey Mantle #311',
      description: 'Historic card, VG condition. Centering issue but great for collector.',
      imageUrl: '/placeholder-card-2.jpg',
      price: 15000.00,
      condition: 'VG 3',
      seller: { id: 'seller2', name: 'VintageCards', rating: 4.8 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '3',
      title: '2018 Panini Prizm Luka Doncic #280',
      description: 'Rookie card in Near Mint condition. Great investment piece.',
      imageUrl: '/placeholder-card-3.jpg',
      price: 350.00,
      condition: 'Near Mint',
      seller: { id: 'seller3', name: 'NBAFan', rating: 4.7 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '4',
      title: '1989 Upper Deck Ken Griffey Jr. #1',
      description: 'The iconic Griffey Jr. rookie card. Excellent condition.',
      imageUrl: '/placeholder-card-4.jpg',
      price: 250.00,
      condition: 'Excellent',
      seller: { id: 'seller4', name: 'BaseballKing', rating: 4.8 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '5',
      title: '2003-04 Upper Deck Exquisite LeBron James #78',
      description: 'True rookie auto patch. BGS 9.5. Investment grade card.',
      imageUrl: '/placeholder-card-5.jpg',
      price: 12000.00,
      condition: 'BGS 9.5',
      seller: { id: 'seller5', name: 'HighEndCards', rating: 4.9 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '6',
      title: '2004-05 UD Exquisite Collection #83',
      description: 'Limited print numbered card. Great collection piece.',
      imageUrl: '/placeholder-card-6.jpg',
      price: 85.00,
      condition: 'Near Mint',
      seller: { id: 'seller6', name: 'CardCollector', rating: 4.6 },
      listedDate: new Date().toISOString(),
    },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === '0-50' && listing.price <= 50) ||
      (priceRange === '50-100' && listing.price > 50 && listing.price <= 100) ||
      (priceRange === '100-500' && listing.price > 100 && listing.price <= 500) ||
      (priceRange === '500+' && listing.price > 500);

    return matchesSearch && matchesPrice;
  });

  const handleListingClick = (id: string) => router.push(`/cardprismora/marketplace/${id}`);
  const handleCreateListing = () => router.push('/cardprismora/marketplace/create');

  const getConditionBadge = (condition: string) => {
    if (condition.includes('PSA') || condition.includes('BGS') || condition.includes('SGC')) return <Badge variant="success">{condition}</Badge>;
    if (condition === 'Near Mint' || condition === 'Excellent') return <Badge variant="success">{condition}</Badge>;
    if (condition === 'VG' || condition === 'Very Good') return <Badge variant="warning">{condition}</Badge>;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-violet-900/20 py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-violet-900/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 mb-4">
            Card Marketplace
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Buy and sell rare sports cards with confidence</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => router.push('/cardprismora/scan')} variant="secondary" className="flex-1 min-w-[150px]">Scan Cards</Button>
          <Button onClick={() => router.push('/cardprismora/portfolio')} variant="secondary" className="flex-1 min-w-[150px]">View Portfolio</Button>
          <Button onClick={handleCreateListing} variant="primary" className="flex-1 min-w-[150px]">List Your Cards</Button>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Search</label>
                <Input type="text" placeholder="Search cards..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Price Range</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as any)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  <option value="all">All Prices</option>
                  <option value="0-50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500+">$500+</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 text-neutral-600 dark:text-neutral-400">Showing {filteredListings.length} of {listings.length} listings</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleListingClick(listing.id)}
            >
              <div className="relative">
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 rounded-t-lg flex items-center justify-center">
                  <div className="text-6xl">🃏</div>
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
