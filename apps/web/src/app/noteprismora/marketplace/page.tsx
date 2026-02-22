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

export default function NotePrismoraMarketplace() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | '0-25' | '25-50' | '50-100' | '100+'>('all');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/noteprismora/marketplace');
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
      title: '1935A $1 Silver Certificate Star Note',
      description: 'Rare star note in Fine condition. Great addition to any collection.',
      imageUrl: '/placeholder-note-1.jpg',
      price: 185.00,
      condition: 'Fine',
      seller: { id: 'seller1', name: 'CurrencyExpert', rating: 4.9 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '2',
      title: '1899 $5 Silver Certificate Chief Note',
      description: 'Historic Silver Certificate, VF condition. Features Indian Chief portrait.',
      imageUrl: '/placeholder-note-2.jpg',
      price: 850.00,
      condition: 'Very Fine',
      seller: { id: 'seller2', name: 'VintageNotes', rating: 4.8 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '3',
      title: '1950 $10 Federal Reserve Note',
      description: 'Crisp uncirculated note. Series 1950, great eye appeal.',
      imageUrl: '/placeholder-note-3.jpg',
      price: 45.00,
      condition: 'Uncirculated',
      seller: { id: 'seller3', name: 'PaperMoneyPro', rating: 4.7 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '4',
      title: '1914 $10 Federal Reserve Note Blue Seal',
      description: 'Large size note in Good condition. Great historical significance.',
      imageUrl: '/placeholder-note-4.jpg',
      price: 350.00,
      condition: 'Good',
      seller: { id: 'seller4', name: 'HistoryBuff', rating: 4.8 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '5',
      title: '1934A $500 Federal Reserve Note',
      description: 'High denomination note in VG condition. Rare find.',
      imageUrl: '/placeholder-note-5.jpg',
      price: 2500.00,
      condition: 'Very Good',
      seller: { id: 'seller5', name: 'HighEndCurrency', rating: 4.9 },
      listedDate: new Date().toISOString(),
    },
    {
      id: '6',
      title: '1923 $1 Silver Certificate',
      description: 'Small size note, VF condition. Educational series note.',
      imageUrl: '/placeholder-note-6.jpg',
      price: 75.00,
      condition: 'Very Fine',
      seller: { id: 'seller6', name: 'NoteCollector', rating: 4.6 },
      listedDate: new Date().toISOString(),
    },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === '0-25' && listing.price <= 25) ||
      (priceRange === '25-50' && listing.price > 25 && listing.price <= 50) ||
      (priceRange === '50-100' && listing.price > 50 && listing.price <= 100) ||
      (priceRange === '100+' && listing.price > 100);

    return matchesSearch && matchesPrice;
  });

  const handleListingClick = (id: string) => router.push(`/noteprismora/marketplace/${id}`);
  const handleCreateListing = () => router.push('/noteprismora/marketplace/create');

  const getConditionBadge = (condition: string) => {
    if (condition === 'Uncirculated') return <Badge variant="success">{condition}</Badge>;
    if (condition === 'Very Fine') return <Badge variant="success">{condition}</Badge>;
    if (condition === 'Fine' || condition === 'Very Good') return <Badge variant="warning">{condition}</Badge>;
    if (condition === 'Good') return <Badge variant="error">{condition}</Badge>;
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-neutral-900 dark:via-green-900/20 dark:to-teal-900/20 py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-neutral-900 dark:via-green-900/20 dark:to-teal-900/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 mb-4">
            Note Marketplace
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Buy and sell rare banknotes with confidence</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => router.push('/noteprismora/scan')} variant="secondary" className="flex-1 min-w-[150px]">Scan Notes</Button>
          <Button onClick={() => router.push('/noteprismora/portfolio')} variant="secondary" className="flex-1 min-w-[150px]">View Portfolio</Button>
          <Button onClick={handleCreateListing} variant="primary" className="flex-1 min-w-[150px]">List Your Notes</Button>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Search</label>
                <Input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Price Range</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as any)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  <option value="all">All Prices</option>
                  <option value="0-25">Under $25</option>
                  <option value="25-50">$25 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100+">$100+</option>
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
                <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-t-lg flex items-center justify-center">
                  <div className="text-6xl">💵</div>
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
