import { NextResponse } from 'next/server';

// Mock marketplace listings
const mockListings = [
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

export async function GET() {
  return NextResponse.json({
    success: true,
    listings: mockListings,
  });
}
