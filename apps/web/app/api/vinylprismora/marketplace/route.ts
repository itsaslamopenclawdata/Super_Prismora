import { NextResponse } from 'next/server';

const mockListings = [
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

export async function GET() {
  return NextResponse.json({
    success: true,
    listings: mockListings,
  });
}
